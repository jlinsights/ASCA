/**
 * Admin Logs API
 *
 * 구조화된 로그 조회 및 관리
 *
 * GET /api/admin/logs
 * POST /api/admin/logs/query
 *
 * Query parameters:
 * - level: 로그 레벨 (DEBUG, INFO, WARN, ERROR, FATAL)
 * - message: 메시지 검색
 * - tags: 태그 필터 (쉼표로 구분)
 * - since: 시작 시간 (ISO string or timestamp)
 * - until: 종료 시간 (ISO string or timestamp)
 * - limit: 결과 개수 제한 (기본: 100)
 * - offset: 페이지네이션 오프셋 (기본: 0)
 * - format: 출력 형식 (json, text, csv)
 *
 * @module app/api/admin/logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { withPermission } from '@/lib/middleware/admin-middleware'
import { Permission } from '@/lib/admin/permissions'
import { LogLevel, LOG_LEVEL_NAMES, error as logError } from '@/lib/logging/structured-logger'
import type { LogEntry } from '@/lib/logging/structured-logger'

// 메모리에 로그 저장 (실제 프로덕션에서는 데이터베이스 사용)
const logStorage: LogEntry[] = []
const MAX_LOGS = 10000

/**
 * 로그 저장 (내부 사용)
 */
function storeLog(entry: LogEntry): void {
  logStorage.push(entry)

  // 최대 개수 제한
  if (logStorage.length > MAX_LOGS) {
    logStorage.shift()
  }
}

/**
 * GET /api/admin/logs
 *
 * 로그 조회
 */
export const GET = withPermission(Permission.ADMIN_AUDIT_LOGS, async (request, auth) => {
  try {
    const { searchParams } = new URL(request.url)

    // 필터 파라미터 파싱
    const filter = {
      level: parseLogLevel(searchParams.get('level')),
      message: searchParams.get('message'),
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      since: parseTimestamp(searchParams.get('since')),
      until: parseTimestamp(searchParams.get('until')),
    }

    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const format = searchParams.get('format') || 'json'

    // 로그 필터링
    const filtered = filterLogs(logStorage, filter)

    // 정렬 (최신순)
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    // 페이지네이션
    const total = filtered.length
    const paginatedLogs = filtered.slice(offset, offset + limit)

    // 통계 계산
    const stats = calculateLogStats(filtered)

    // 포맷에 따라 응답
    switch (format) {
      case 'csv':
        return new NextResponse(exportCSV(paginatedLogs), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="logs-${Date.now()}.csv"`,
          },
        })

      case 'text':
        return new NextResponse(exportText(paginatedLogs), {
          headers: {
            'Content-Type': 'text/plain',
          },
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            logs: paginatedLogs,
            pagination: {
              total,
              limit,
              offset,
              hasMore: offset + limit < total,
            },
            stats,
          },
        })
    }
  } catch (error) {
    logError('Logs API error', error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/logs/query
 *
 * 고급 로그 쿼리 (복잡한 필터링)
 */
export async function POST(request: NextRequest) {
  return withPermission(Permission.ADMIN_AUDIT_LOGS, async (req, auth) => {
    try {
      const body = await req.json()

      const {
        level,
        levels,
        message,
        messageRegex,
        tags,
        tagsAny,
        tagsAll,
        context,
        hasError,
        since,
        until,
        limit = 100,
        offset = 0,
        sortBy = 'timestamp',
        sortOrder = 'desc',
      } = body

      // 복잡한 필터링
      let filtered = [...logStorage]

      // 로그 레벨 필터
      if (level !== undefined) {
        const levelValue = parseLogLevel(level)
        if (levelValue !== undefined) {
          filtered = filtered.filter(log => log.level === levelValue)
        }
      }

      // 여러 로그 레벨 필터
      if (levels && Array.isArray(levels)) {
        const levelValues = levels.map(l => parseLogLevel(l)).filter(l => l !== undefined)
        filtered = filtered.filter(log => levelValues.includes(log.level))
      }

      // 메시지 검색 (부분 일치)
      if (message) {
        filtered = filtered.filter(log => log.message.toLowerCase().includes(message.toLowerCase()))
      }

      // 메시지 정규식 검색
      if (messageRegex) {
        const regex = new RegExp(messageRegex, 'i')
        filtered = filtered.filter(log => regex.test(log.message))
      }

      // 태그 필터 (OR)
      if (tagsAny && Array.isArray(tagsAny)) {
        filtered = filtered.filter(log => log.tags && tagsAny.some(tag => log.tags!.includes(tag)))
      }

      // 태그 필터 (AND)
      if (tagsAll && Array.isArray(tagsAll)) {
        filtered = filtered.filter(log => log.tags && tagsAll.every(tag => log.tags!.includes(tag)))
      }

      // 컨텍스트 필터
      if (context && typeof context === 'object') {
        filtered = filtered.filter(log => {
          if (!log.context) return false
          return Object.entries(context).every(([key, value]) => log.context![key] === value)
        })
      }

      // 에러 필터
      if (hasError !== undefined) {
        filtered = filtered.filter(log =>
          hasError ? log.error !== undefined : log.error === undefined
        )
      }

      // 시간 범위 필터
      if (since) {
        const sinceTime = parseTimestamp(since)
        if (sinceTime) {
          filtered = filtered.filter(log => log.timestamp >= sinceTime)
        }
      }

      if (until) {
        const untilTime = parseTimestamp(until)
        if (untilTime) {
          filtered = filtered.filter(log => log.timestamp <= untilTime)
        }
      }

      // 정렬
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortBy) {
          case 'level':
            aValue = a.level
            bValue = b.level
            break
          case 'message':
            aValue = a.message
            bValue = b.message
            break
          default:
            aValue = a.timestamp
            bValue = b.timestamp
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      // 페이지네이션
      const total = filtered.length
      const paginatedLogs = filtered.slice(offset, offset + limit)

      // 통계
      const stats = calculateLogStats(filtered)

      return NextResponse.json({
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
          stats,
        },
      })
    } catch (error) {
      logError('Logs query API error', error instanceof Error ? error : undefined)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to query logs',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * 로그 레벨 파싱
 */
function parseLogLevel(level: string | null): LogLevel | undefined {
  if (!level) return undefined

  const upperLevel = level.toUpperCase()
  const entry = Object.entries(LOG_LEVEL_NAMES).find(([, name]) => name === upperLevel)

  return entry ? (parseInt(entry[0], 10) as LogLevel) : undefined
}

/**
 * 타임스탬프 파싱
 */
function parseTimestamp(value: string | null): number | undefined {
  if (!value) return undefined

  // 숫자인 경우 그대로 사용
  const num = Number(value)
  if (!isNaN(num)) return num

  // ISO 문자열인 경우 파싱
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date.getTime()
}

/**
 * 로그 필터링
 */
function filterLogs(
  logs: LogEntry[],
  filter: {
    level?: LogLevel
    message?: string | null
    tags?: string[]
    since?: number
    until?: number
  }
): LogEntry[] {
  let filtered = [...logs]

  if (filter.level !== undefined) {
    filtered = filtered.filter(log => log.level >= filter.level!)
  }

  if (filter.message) {
    filtered = filtered.filter(log =>
      log.message.toLowerCase().includes(filter.message!.toLowerCase())
    )
  }

  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter(log => log.tags && filter.tags!.some(tag => log.tags!.includes(tag)))
  }

  if (filter.since) {
    filtered = filtered.filter(log => log.timestamp >= filter.since!)
  }

  if (filter.until) {
    filtered = filtered.filter(log => log.timestamp <= filter.until!)
  }

  return filtered
}

/**
 * 로그 통계 계산
 */
function calculateLogStats(logs: LogEntry[]) {
  const byLevel: Record<string, number> = {}
  const byTag: Record<string, number> = {}
  let errorCount = 0

  for (const log of logs) {
    byLevel[log.levelName] = (byLevel[log.levelName] || 0) + 1

    if (log.tags) {
      for (const tag of log.tags) {
        byTag[tag] = (byTag[tag] || 0) + 1
      }
    }

    if (log.error) {
      errorCount++
    }
  }

  return {
    total: logs.length,
    byLevel,
    byTag,
    errorCount,
    timeRange:
      logs.length > 0
        ? {
            oldest: Math.min(...logs.map(l => l.timestamp)),
            newest: Math.max(...logs.map(l => l.timestamp)),
          }
        : null,
  }
}

/**
 * CSV 내보내기
 */
function exportCSV(logs: LogEntry[]): string {
  const headers = ['timestamp', 'level', 'message', 'tags', 'has_error']
  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.levelName,
    `"${log.message.replace(/"/g, '""')}"`,
    log.tags ? `"${log.tags.join(',')}"` : '',
    log.error ? 'true' : 'false',
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * 텍스트 내보내기
 */
function exportText(logs: LogEntry[]): string {
  return logs
    .map(log => {
      const timestamp = new Date(log.timestamp).toISOString()
      const level = log.levelName.padEnd(5)
      let line = `[${timestamp}] ${level} ${log.message}`

      if (log.tags && log.tags.length > 0) {
        line += ` [${log.tags.join(', ')}]`
      }

      if (log.error) {
        line += `\n  Error: ${log.error.name}: ${log.error.message}`
      }

      return line
    })
    .join('\n\n')
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
