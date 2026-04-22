/**
 * Audit Logger
 *
 * Logs all admin actions for security and compliance.
 *
 * Features:
 * - Action logging with full context
 * - User activity tracking
 * - Search and filtering
 * - Export capabilities
 * - Retention policies
 *
 * @module lib/admin/audit-logger
 */

import { info } from '@/lib/logging'
import type { Permission, Role } from './permissions'

/**
 * Audit action types
 */
export enum AuditAction {
  // Authentication
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  LOGIN_FAILED = 'auth:login_failed',
  PASSWORD_CHANGED = 'auth:password_changed',

  // Member actions
  MEMBER_CREATED = 'member:created',
  MEMBER_UPDATED = 'member:updated',
  MEMBER_DELETED = 'member:deleted',
  MEMBER_APPROVED = 'member:approved',
  MEMBER_REJECTED = 'member:rejected',
  MEMBER_EXPORTED = 'member:exported',

  // Artist actions
  ARTIST_CREATED = 'artist:created',
  ARTIST_UPDATED = 'artist:updated',
  ARTIST_DELETED = 'artist:deleted',
  ARTIST_APPROVED = 'artist:approved',
  ARTIST_VERIFIED = 'artist:verified',

  // Artwork actions
  ARTWORK_CREATED = 'artwork:created',
  ARTWORK_UPDATED = 'artwork:updated',
  ARTWORK_DELETED = 'artwork:deleted',
  ARTWORK_APPROVED = 'artwork:approved',
  ARTWORK_REJECTED = 'artwork:rejected',
  ARTWORK_FEATURED = 'artwork:featured',

  // Exhibition actions
  EXHIBITION_CREATED = 'exhibition:created',
  EXHIBITION_UPDATED = 'exhibition:updated',
  EXHIBITION_DELETED = 'exhibition:deleted',
  EXHIBITION_PUBLISHED = 'exhibition:published',
  EXHIBITION_UNPUBLISHED = 'exhibition:unpublished',

  // Role/Permission changes
  ROLE_ASSIGNED = 'role:assigned',
  ROLE_REVOKED = 'role:revoked',
  PERMISSION_GRANTED = 'permission:granted',
  PERMISSION_REVOKED = 'permission:revoked',

  // System actions
  SETTINGS_UPDATED = 'system:settings_updated',
  CACHE_CLEARED = 'system:cache_cleared',
  DATABASE_BACKUP = 'system:database_backup',
  DATABASE_RESTORE = 'system:database_restore',
  SYSTEM_MAINTENANCE = 'system:maintenance',

  // Bulk actions
  BULK_DELETE = 'bulk:delete',
  BULK_UPDATE = 'bulk:update',
  BULK_APPROVE = 'bulk:approve',
  BULK_EXPORT = 'bulk:export',
}

/**
 * Audit severity levels
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string
  timestamp: Date
  action: AuditAction
  severity: AuditSeverity
  userId: string
  userEmail?: string
  userRole?: Role
  targetId?: string
  targetType?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Audit log filter
 */
export interface AuditLogFilter {
  userId?: string
  action?: AuditAction | AuditAction[]
  severity?: AuditSeverity
  startDate?: Date
  endDate?: Date
  success?: boolean
  targetId?: string
  targetType?: string
  search?: string
}

/**
 * Audit Logger
 *
 * Tracks all admin actions for compliance and security.
 */
export class AuditLogger {
  private logs: Map<string, AuditLog>
  private logCounter: number
  private maxLogs: number

  constructor(maxLogs: number = 10000) {
    this.logs = new Map()
    this.logCounter = 0
    this.maxLogs = maxLogs
  }

  /**
   * Log an action
   *
   * @param entry - Audit log entry (without id and timestamp)
   * @returns Created audit log
   */
  log(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const id = `audit_${Date.now()}_${++this.logCounter}`
    const timestamp = new Date()

    const auditLog: AuditLog = {
      id,
      timestamp,
      ...entry,
    }

    // Store log
    this.logs.set(id, auditLog)

    // Enforce max logs limit (remove oldest)
    if (this.logs.size > this.maxLogs) {
      const oldestKey = this.logs.keys().next().value
      if (oldestKey) {
        this.logs.delete(oldestKey)
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      info('[AUDIT]', {
        action: auditLog.action,
        userId: auditLog.userId,
        success: auditLog.success,
        details: auditLog.details,
      })
    }

    return auditLog
  }

  /**
   * Log a successful action
   *
   * @param action - Audit action
   * @param userId - User ID
   * @param details - Action details
   * @param metadata - Optional metadata
   * @returns Created audit log
   */
  logSuccess(
    action: AuditAction,
    userId: string,
    details: Record<string, any>,
    metadata?: {
      userEmail?: string
      userRole?: Role
      targetId?: string
      targetType?: string
      ipAddress?: string
      userAgent?: string
    }
  ): AuditLog {
    return this.log({
      action,
      severity: AuditSeverity.INFO,
      userId,
      success: true,
      details,
      ...metadata,
    })
  }

  /**
   * Log a failed action
   *
   * @param action - Audit action
   * @param userId - User ID
   * @param error - Error message
   * @param details - Action details
   * @param metadata - Optional metadata
   * @returns Created audit log
   */
  logError(
    action: AuditAction,
    userId: string,
    error: string,
    details: Record<string, any>,
    metadata?: {
      userEmail?: string
      severity?: AuditSeverity
      targetId?: string
      targetType?: string
      ipAddress?: string
      userAgent?: string
    }
  ): AuditLog {
    return this.log({
      action,
      severity: metadata?.severity || AuditSeverity.ERROR,
      userId,
      success: false,
      errorMessage: error,
      details,
      userEmail: metadata?.userEmail,
      targetId: metadata?.targetId,
      targetType: metadata?.targetType,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    })
  }

  /**
   * Get audit log by ID
   *
   * @param id - Log ID
   * @returns Audit log or undefined
   */
  getLog(id: string): AuditLog | undefined {
    return this.logs.get(id)
  }

  /**
   * Get all logs (with optional filter)
   *
   * @param filter - Optional filter
   * @returns Array of audit logs
   */
  getLogs(filter?: AuditLogFilter): AuditLog[] {
    let logs = Array.from(this.logs.values())

    if (!filter) {
      return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    // Apply filters
    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId)
    }

    if (filter.action) {
      const actions = Array.isArray(filter.action) ? filter.action : [filter.action]
      logs = logs.filter(log => actions.includes(log.action))
    }

    if (filter.severity) {
      logs = logs.filter(log => log.severity === filter.severity)
    }

    if (filter.success !== undefined) {
      logs = logs.filter(log => log.success === filter.success)
    }

    if (filter.targetId) {
      logs = logs.filter(log => log.targetId === filter.targetId)
    }

    if (filter.targetType) {
      logs = logs.filter(log => log.targetType === filter.targetType)
    }

    if (filter.startDate) {
      logs = logs.filter(log => log.timestamp >= filter.startDate!)
    }

    if (filter.endDate) {
      logs = logs.filter(log => log.timestamp <= filter.endDate!)
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      logs = logs.filter(log => {
        const searchableText = JSON.stringify({
          action: log.action,
          userId: log.userId,
          userEmail: log.userEmail,
          details: log.details,
          errorMessage: log.errorMessage,
        }).toLowerCase()

        return searchableText.includes(searchLower)
      })
    }

    // Sort by timestamp (newest first)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get user activity
   *
   * @param userId - User ID
   * @param limit - Max number of logs to return
   * @returns Array of audit logs
   */
  getUserActivity(userId: string, limit: number = 100): AuditLog[] {
    return this.getLogs({ userId }).slice(0, limit)
  }

  /**
   * Get recent failed actions
   *
   * @param limit - Max number of logs to return
   * @returns Array of failed audit logs
   */
  getRecentFailures(limit: number = 100): AuditLog[] {
    return this.getLogs({ success: false }).slice(0, limit)
  }

  /**
   * Get statistics
   *
   * @param filter - Optional filter
   * @returns Audit statistics
   */
  getStats(filter?: AuditLogFilter) {
    const logs = filter ? this.getLogs(filter) : Array.from(this.logs.values())

    const actionCounts: Record<string, number> = {}
    const severityCounts: Record<AuditSeverity, number> = {
      [AuditSeverity.INFO]: 0,
      [AuditSeverity.WARNING]: 0,
      [AuditSeverity.ERROR]: 0,
      [AuditSeverity.CRITICAL]: 0,
    }

    let successCount = 0
    let failureCount = 0
    const userActivity: Record<string, number> = {}

    for (const log of logs) {
      // Count by action
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

      // Count by severity
      severityCounts[log.severity]++

      // Count success/failure
      if (log.success) {
        successCount++
      } else {
        failureCount++
      }

      // Count by user
      userActivity[log.userId] = (userActivity[log.userId] || 0) + 1
    }

    return {
      totalLogs: logs.length,
      successCount,
      failureCount,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
      actionCounts,
      severityCounts,
      topUsers: Object.entries(userActivity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count })),
    }
  }

  /**
   * Clear logs older than a certain date
   *
   * @param beforeDate - Delete logs before this date
   * @returns Number of logs deleted
   */
  clearOldLogs(beforeDate: Date): number {
    let deletedCount = 0

    for (const [id, log] of this.logs) {
      if (log.timestamp < beforeDate) {
        this.logs.delete(id)
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * Export logs as JSON
   *
   * @param filter - Optional filter
   * @returns JSON string
   */
  exportLogs(filter?: AuditLogFilter): string {
    const logs = this.getLogs(filter)
    return JSON.stringify(logs, null, 2)
  }

  /**
   * Export logs as CSV
   *
   * @param filter - Optional filter
   * @returns CSV string
   */
  exportLogsCSV(filter?: AuditLogFilter): string {
    const logs = this.getLogs(filter)

    if (logs.length === 0) {
      return ''
    }

    // CSV header
    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'Severity',
      'User ID',
      'User Email',
      'Success',
      'Error Message',
      'Target ID',
      'Target Type',
      'Details',
    ]

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.action,
      log.severity,
      log.userId,
      log.userEmail || '',
      log.success.toString(),
      log.errorMessage || '',
      log.targetId || '',
      log.targetType || '',
      JSON.stringify(log.details),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    return csvContent
  }

  /**
   * Clear all logs
   */
  clearAll(): void {
    this.logs.clear()
    this.logCounter = 0
  }

  /**
   * Get log count
   *
   * @returns Number of logs
   */
  getCount(): number {
    return this.logs.size
  }
}

/**
 * Global audit logger instance (singleton)
 */
let globalAuditLogger: AuditLogger | null = null

/**
 * Get or create global audit logger instance
 *
 * @returns Global audit logger instance
 */
export function getAuditLogger(): AuditLogger {
  if (!globalAuditLogger) {
    globalAuditLogger = new AuditLogger()
  }
  return globalAuditLogger
}

/**
 * Create a new audit logger instance
 *
 * @param maxLogs - Maximum number of logs to keep
 * @returns New audit logger instance
 */
export function createAuditLogger(maxLogs?: number): AuditLogger {
  return new AuditLogger(maxLogs)
}

/**
 * Helper: Log admin action
 *
 * @param action - Audit action
 * @param userId - User ID
 * @param details - Action details
 * @param options - Optional metadata
 */
export function logAdminAction(
  action: AuditAction,
  userId: string,
  details: Record<string, any>,
  options?: {
    success?: boolean
    error?: string
    userEmail?: string
    targetId?: string
    targetType?: string
    severity?: AuditSeverity
  }
): void {
  const auditLogger = getAuditLogger()

  if (options?.success === false && options?.error) {
    auditLogger.logError(action, userId, options.error, details, {
      userEmail: options.userEmail,
      targetId: options.targetId,
      targetType: options.targetType,
      severity: options.severity,
    })
  } else {
    auditLogger.logSuccess(action, userId, details, {
      userEmail: options?.userEmail,
      targetId: options?.targetId,
      targetType: options?.targetType,
    })
  }
}
