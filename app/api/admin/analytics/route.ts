/**
 * Admin Analytics API
 *
 * Provides detailed analytics and insights.
 *
 * GET /api/admin/analytics
 *
 * Query parameters:
 * - period: 'day' | 'week' | 'month' | 'year' (default: 'week')
 * - metric: Specific metric to retrieve (optional)
 *
 * @module app/api/admin/analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withPermission } from '@/lib/middleware/admin-middleware'
import { Permission } from '@/lib/admin/permissions'
import { getAuditLogger } from '@/lib/admin/audit-logger'
import { error as logError } from '@/lib/logging'

/**
 * GET /api/admin/analytics
 *
 * Get analytics data
 */
export const GET = withPermission(Permission.ADMIN_ANALYTICS, async (request, auth) => {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    const metric = searchParams.get('metric')

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date(now)

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get audit logs for period
    const auditLogger = getAuditLogger()
    const logs = auditLogger.getLogs({
      startDate,
      endDate: now,
    })

    // Calculate analytics
    const analytics = {
      period,
      startDate,
      endDate: now,
      totalActions: logs.length,
      successRate: logs.length > 0 ? (logs.filter(l => l.success).length / logs.length) * 100 : 0,

      // Action breakdown
      actionBreakdown: logs.reduce(
        (acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),

      // User activity
      topUsers: Array.from(
        logs
          .reduce((acc, log) => {
            acc.set(log.userId, (acc.get(log.userId) || 0) + 1)
            return acc
          }, new Map<string, number>())
          .entries()
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count })),

      // Daily activity (last 30 days)
      dailyActivity: generateDailyActivity(logs),

      // Hourly activity (last 24 hours)
      hourlyActivity: generateHourlyActivity(logs),

      // Error analysis
      errors: {
        total: logs.filter(l => !l.success).length,
        byAction: logs
          .filter(l => !l.success)
          .reduce(
            (acc, log) => {
              acc[log.action] = (acc[log.action] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          ),
      },
    }

    // Return specific metric if requested
    if (metric && metric in analytics) {
      return NextResponse.json({
        success: true,
        data: {
          metric,
          value: analytics[metric as keyof typeof analytics],
        },
      })
    }

    // Return all analytics
    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    logError('Analytics API error', error instanceof Error ? error : undefined)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * Generate daily activity data
 */
function generateDailyActivity(logs: any[]) {
  const dailyMap = new Map<string, number>()

  for (const log of logs) {
    const dateKey = log.timestamp.toISOString().split('T')[0]
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1)
  }

  return Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Generate hourly activity data
 */
function generateHourlyActivity(logs: any[]) {
  const hourlyMap = new Map<number, number>()

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  for (const log of logs) {
    if (log.timestamp < oneDayAgo) continue

    const hour = log.timestamp.getHours()
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
  }

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourlyMap.get(hour) || 0,
  }))
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
