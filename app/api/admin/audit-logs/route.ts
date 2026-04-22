/**
 * Admin Audit Logs API
 *
 * Provides access to audit logs.
 *
 * GET /api/admin/audit-logs
 *
 * Query parameters:
 * - userId: Filter by user ID
 * - action: Filter by action
 * - severity: Filter by severity (info, warning, error, critical)
 * - success: Filter by success status (true, false)
 * - startDate: Start date (ISO string)
 * - endDate: End date (ISO string)
 * - search: Search query
 * - limit: Max results (default: 100)
 * - offset: Pagination offset (default: 0)
 *
 * @module app/api/admin/audit-logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/middleware/admin-middleware';
import { Permission } from '@/lib/admin/permissions';
import { getAuditLogger, type AuditLogFilter } from '@/lib/admin/audit-logger';
import { error as logError } from '@/lib/logging';

/**
 * GET /api/admin/audit-logs
 *
 * Get audit logs with filtering
 */
export const GET = withPermission(
  Permission.ADMIN_AUDIT_LOGS,
  async (request, auth) => {
    try {
      const { searchParams } = new URL(request.url);

      // Parse filter parameters
      const filter: AuditLogFilter = {};

      if (searchParams.has('userId')) {
        filter.userId = searchParams.get('userId')!;
      }

      if (searchParams.has('action')) {
        filter.action = searchParams.get('action') as any;
      }

      if (searchParams.has('severity')) {
        filter.severity = searchParams.get('severity') as any;
      }

      if (searchParams.has('success')) {
        filter.success = searchParams.get('success') === 'true';
      }

      if (searchParams.has('startDate')) {
        filter.startDate = new Date(searchParams.get('startDate')!);
      }

      if (searchParams.has('endDate')) {
        filter.endDate = new Date(searchParams.get('endDate')!);
      }

      if (searchParams.has('search')) {
        filter.search = searchParams.get('search')!;
      }

      // Parse pagination
      const limit = parseInt(searchParams.get('limit') || '100', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);

      // Get audit logs
      const auditLogger = getAuditLogger();
      const allLogs = auditLogger.getLogs(filter);

      // Apply pagination
      const paginatedLogs = allLogs.slice(offset, offset + limit);

      // Get statistics
      const stats = auditLogger.getStats(filter);

      return NextResponse.json({
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            total: allLogs.length,
            limit,
            offset,
            hasMore: offset + limit < allLogs.length,
          },
          stats: {
            totalLogs: stats.totalLogs,
            successRate: stats.successRate,
            severityBreakdown: stats.severityCounts,
          },
        },
      });
    } catch (error) {
      logError('Audit logs API error', error instanceof Error ? error : undefined);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch audit logs',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Runtime configuration
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
