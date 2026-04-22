/**
 * Admin Metrics API
 *
 * 성능 메트릭 및 쿼리 모니터링 데이터 조회
 *
 * GET /api/admin/metrics
 * GET /api/admin/metrics/performance
 * GET /api/admin/metrics/queries
 * GET /api/admin/metrics/aggregated
 * GET /api/admin/metrics/export
 *
 * Query parameters:
 * - type: 'performance' | 'queries' | 'aggregated' | 'all'
 * - format: 'json' | 'csv' | 'prometheus'
 * - metric: 특정 메트릭 이름
 * - window: 시간 윈도우 (1m, 5m, 15m, 1h, 24h)
 * - limit: 결과 개수 제한
 *
 * @module app/api/admin/metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withPermission } from '@/lib/middleware/admin-middleware'
import { Permission } from '@/lib/admin/permissions'
import { performanceMonitor } from '@/lib/monitoring/performance-monitor'
import { metricsCollector, TimeWindow } from '@/lib/monitoring/metrics-collector'
import { error as logError } from '@/lib/logging'
import { slowQueryDetector, getSlowQueryReport } from '@/lib/monitoring/slow-query-detector'

/**
 * GET /api/admin/metrics
 *
 * 메트릭 데이터 조회
 */
export const GET = withPermission(Permission.ADMIN_ANALYTICS, async (request, auth) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const format = searchParams.get('format') || 'json'
    const metric = searchParams.get('metric')
    const window = searchParams.get('window')
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const data: any = {}

    // 타입에 따라 데이터 수집
    if (type === 'all' || type === 'performance') {
      data.performance = getPerformanceMetrics(metric, limit)
    }

    if (type === 'all' || type === 'queries') {
      data.queries = getQueryMetrics(limit)
    }

    if (type === 'all' || type === 'aggregated') {
      data.aggregated = getAggregatedMetrics(metric, window)
    }

    // 시스템 상태 추가
    if (type === 'all') {
      data.systemStatus = {
        performance: performanceMonitor.getSystemStatus(),
        metricsCollector: metricsCollector.getStats(),
        queryDetector: slowQueryDetector.getStats(),
      }
    }

    // 포맷에 따라 응답
    switch (format) {
      case 'csv':
        return new NextResponse(exportCSV(data), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="metrics-${Date.now()}.csv"`,
          },
        })

      case 'prometheus':
        return new NextResponse(exportPrometheus(data), {
          headers: {
            'Content-Type': 'text/plain; version=0.0.4',
          },
        })

      default:
        return NextResponse.json({
          success: true,
          data,
          timestamp: new Date(),
        })
    }
  } catch (error) {
    logError('Metrics API error', error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/metrics/reset
 *
 * 메트릭 데이터 초기화
 */
export async function POST(request: NextRequest) {
  return withPermission(Permission.ADMIN_SETTINGS, async (req, auth) => {
    try {
      const { searchParams } = new URL(req.url)
      const action = searchParams.get('action')

      switch (action) {
        case 'reset':
          // 메트릭 초기화
          performanceMonitor.clearAlerts()
          metricsCollector.cleanup(0)
          slowQueryDetector.cleanup(0)

          return NextResponse.json({
            success: true,
            message: 'Metrics reset successfully',
          })

        case 'cleanup':
          // 오래된 데이터 정리
          const olderThan = parseInt(searchParams.get('olderThan') || '0', 10)
          metricsCollector.cleanup(olderThan)
          slowQueryDetector.cleanup(olderThan)

          return NextResponse.json({
            success: true,
            message: 'Metrics cleanup completed',
          })

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action',
            },
            { status: 400 }
          )
      }
    } catch (error) {
      logError('Metrics action error', error instanceof Error ? error : undefined)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to perform action',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * 성능 메트릭 조회
 */
function getPerformanceMetrics(metricName?: string | null, limit?: number) {
  const metrics = performanceMonitor.getMetrics(metricName || undefined)
  const limitedMetrics = limit ? metrics.slice(0, limit) : metrics

  const stats = metricName ? performanceMonitor.getMetricStats(metricName) : null

  return {
    metrics: limitedMetrics,
    stats,
    alerts: performanceMonitor.getAlerts(),
    systemStatus: performanceMonitor.getSystemStatus(),
  }
}

/**
 * 쿼리 메트릭 조회
 */
function getQueryMetrics(limit?: number) {
  return {
    slowQueries: slowQueryDetector.getSlowQueries(limit),
    patternStats: slowQueryDetector.getPatternStats(),
    nPlusOneDetections: slowQueryDetector.detectNPlusOne(),
    queryHistory: slowQueryDetector.getQueryHistory(limit),
    stats: slowQueryDetector.getStats(),
  }
}

/**
 * 집계된 메트릭 조회
 */
function getAggregatedMetrics(metricName?: string | null, windowStr?: string | null) {
  let window: TimeWindow | undefined

  // 시간 윈도우 파싱
  if (windowStr) {
    switch (windowStr) {
      case '1m':
        window = TimeWindow.ONE_MINUTE
        break
      case '5m':
        window = TimeWindow.FIVE_MINUTES
        break
      case '15m':
        window = TimeWindow.FIFTEEN_MINUTES
        break
      case '1h':
        window = TimeWindow.ONE_HOUR
        break
      case '6h':
        window = TimeWindow.SIX_HOURS
        break
      case '24h':
        window = TimeWindow.TWENTY_FOUR_HOURS
        break
    }
  }

  const metrics = metricsCollector.getAggregatedMetrics(metricName || undefined, window)

  const trends = metricName
    ? metricsCollector.analyzeTrend(metricName, window || TimeWindow.ONE_HOUR)
    : null

  const anomalies = metricsCollector.getAnomalies(metricName || undefined)

  return {
    metrics,
    trends,
    anomalies,
    stats: metricsCollector.getStats(),
  }
}

/**
 * CSV 포맷으로 내보내기
 */
function exportCSV(data: any): string {
  const sections: string[] = []

  // 성능 메트릭
  if (data.performance?.metrics) {
    sections.push('# Performance Metrics')
    sections.push('timestamp,name,value,unit')

    for (const metric of data.performance.metrics) {
      sections.push(
        `${new Date(metric.timestamp).toISOString()},${metric.name},${metric.value},${metric.unit}`
      )
    }

    sections.push('')
  }

  // 느린 쿼리
  if (data.queries?.slowQueries) {
    sections.push('# Slow Queries')
    sections.push('timestamp,query,executionTime,severity')

    for (const query of data.queries.slowQueries) {
      const queryPreview = query.query.substring(0, 100).replace(/,/g, ';')
      sections.push(
        `${new Date(query.timestamp).toISOString()},"${queryPreview}",${query.executionTime},${query.severity}`
      )
    }

    sections.push('')
  }

  // 집계된 메트릭
  if (data.aggregated?.metrics) {
    sections.push('# Aggregated Metrics')
    sections.push('name,window,avg,min,max,p95,p99,count,rate')

    for (const metric of data.aggregated.metrics) {
      sections.push(
        `${metric.name},${metric.window},${metric.avg.toFixed(2)},${metric.min.toFixed(2)},${metric.max.toFixed(2)},${metric.p95.toFixed(2)},${metric.p99.toFixed(2)},${metric.count},${metric.rate.toFixed(2)}`
      )
    }
  }

  return sections.join('\n')
}

/**
 * Prometheus 포맷으로 내보내기
 */
function exportPrometheus(data: any): string {
  const lines: string[] = []

  // 성능 메트릭
  if (data.performance?.metrics) {
    for (const metric of data.performance.metrics) {
      const name = metric.name.replace(/[^a-zA-Z0-9_]/g, '_')
      const labels = metric.tags
        ? Object.entries(metric.tags)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',')
        : ''

      lines.push(`# TYPE ${name} gauge`)
      lines.push(`${name}${labels ? `{${labels}}` : ''} ${metric.value} ${metric.timestamp}`)
    }
  }

  // 집계된 메트릭
  if (data.aggregated?.metrics) {
    for (const metric of data.aggregated.metrics) {
      const name = metric.name.replace(/[^a-zA-Z0-9_]/g, '_')

      lines.push(`# TYPE ${name}_avg gauge`)
      lines.push(`${name}_avg ${metric.avg}`)

      lines.push(`# TYPE ${name}_p95 gauge`)
      lines.push(`${name}_p95 ${metric.p95}`)

      lines.push(`# TYPE ${name}_p99 gauge`)
      lines.push(`${name}_p99 ${metric.p99}`)

      lines.push(`# TYPE ${name}_count counter`)
      lines.push(`${name}_count ${metric.count}`)

      lines.push(`# TYPE ${name}_rate gauge`)
      lines.push(`${name}_rate ${metric.rate}`)
    }
  }

  // 쿼리 통계
  if (data.queries?.stats) {
    const stats = data.queries.stats

    lines.push('# TYPE database_total_queries counter')
    lines.push(`database_total_queries ${stats.totalQueries}`)

    lines.push('# TYPE database_slow_queries counter')
    lines.push(`database_slow_queries ${stats.slowQueries}`)

    lines.push('# TYPE database_critical_queries counter')
    lines.push(`database_critical_queries ${stats.criticalQueries}`)

    lines.push('# TYPE database_avg_execution_time gauge')
    lines.push(`database_avg_execution_time ${stats.avgExecutionTime.toFixed(2)}`)
  }

  return lines.join('\n') + '\n'
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
