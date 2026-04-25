/**
 * Admin Dashboard API
 *
 * Provides dashboard statistics and overview data.
 *
 * GET /api/admin/dashboard
 *
 * @module app/api/admin/dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/admin-middleware'
import { getAuditLogger } from '@/lib/admin/audit-logger'
import { getRoleManager } from '@/lib/admin/role-manager'
import { getEventEmitter } from '@/lib/realtime/event-emitter'
import { getSubscriptionManager } from '@/lib/realtime/subscription-manager'
import { error as logError } from '@/lib/logging'

/**
 * GET /api/admin/dashboard
 *
 * Get dashboard statistics
 */
export const GET = withAdmin(async (request, auth) => {
  try {
    // Get various statistics
    const auditLogger = getAuditLogger()
    const roleManager = getRoleManager()
    const eventEmitter = getEventEmitter()
    const subscriptionManager = getSubscriptionManager()

    // Audit stats
    const auditStats = auditLogger.getStats()

    // Role stats
    const roleStats = roleManager.getStats()

    // Realtime stats
    const realtimeStats = subscriptionManager.getStats()

    // Event stats
    const eventStats = {
      activeListeners: eventEmitter.eventNames().length,
    }

    // Recent activity
    const recentActivity = auditLogger
      .getLogs()
      .slice(0, 10)
      .map(log => ({
        id: log.id,
        action: log.action,
        userId: log.userId,
        timestamp: log.timestamp,
        success: log.success,
      }))

    const response = {
      success: true,
      data: {
        overview: {
          totalUsers: roleStats.totalUsers,
          totalAuditLogs: auditStats.totalLogs,
          activeConnections: realtimeStats.total,
          successRate: auditStats.successRate,
        },
        audit: {
          total: auditStats.totalLogs,
          success: auditStats.successCount,
          failures: auditStats.failureCount,
          successRate: auditStats.successRate,
          severityBreakdown: auditStats.severityCounts,
        },
        users: {
          total: roleStats.totalUsers,
          byRole: roleStats.roleCount,
        },
        realtime: {
          totalConnections: realtimeStats.total,
          byConnectionType: realtimeStats.byConnectionType,
        },
        events: eventStats,
        recentActivity,
      },
      timestamp: new Date(),
    }

    return NextResponse.json(response)
  } catch (error) {
    logError('Dashboard API error', error instanceof Error ? error : undefined)

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
