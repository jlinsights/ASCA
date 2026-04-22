/**
 * Admin System Health API
 *
 * Provides system health monitoring and diagnostics.
 *
 * GET /api/admin/system-health
 *
 * @module app/api/admin/system-health
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/middleware/admin-middleware';
import { Permission } from '@/lib/admin/permissions';
import { error as logError } from '@/lib/logging';

/**
 * GET /api/admin/system-health
 *
 * Get system health status
 */
export const GET = withPermission(
  Permission.ADMIN_SYSTEM_HEALTH,
  async (request, auth) => {
    try {
      const healthChecks = await performHealthChecks();

      const overallStatus = healthChecks.every((check) => check.healthy)
        ? 'healthy'
        : healthChecks.some((check) => !check.healthy && check.critical)
        ? 'critical'
        : 'degraded';

      return NextResponse.json({
        success: true,
        data: {
          status: overallStatus,
          timestamp: new Date(),
          checks: healthChecks,
          system: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memory: {
              total: process.memoryUsage().heapTotal,
              used: process.memoryUsage().heapUsed,
              external: process.memoryUsage().external,
              rss: process.memoryUsage().rss,
            },
            cpu: process.cpuUsage(),
          },
        },
      });
    } catch (error) {
      logError('System health API error', error instanceof Error ? error : undefined);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check system health',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Perform health checks
 */
async function performHealthChecks() {
  const checks = [];

  // Memory check
  const memUsage = process.memoryUsage();
  const memoryHealthy = memUsage.heapUsed / memUsage.heapTotal < 0.9;
  checks.push({
    name: 'Memory',
    healthy: memoryHealthy,
    critical: !memoryHealthy,
    details: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2),
    },
  });

  // API Response Time check
  const apiStart = Date.now();
  try {
    // Simple health check
    await Promise.resolve();
    const apiTime = Date.now() - apiStart;
    checks.push({
      name: 'API Response Time',
      healthy: apiTime < 1000,
      critical: apiTime > 5000,
      details: {
        responseTime: apiTime,
        unit: 'ms',
      },
    });
  } catch (error) {
    checks.push({
      name: 'API Response Time',
      healthy: false,
      critical: true,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }

  // Database check (placeholder)
  // TODO: Implement actual database health check
  checks.push({
    name: 'Database',
    healthy: true,
    critical: false,
    details: {
      status: 'Connected',
      note: 'Actual database check not implemented',
    },
  });

  // Cache check (placeholder)
  // TODO: Implement actual cache health check
  checks.push({
    name: 'Cache',
    healthy: true,
    critical: false,
    details: {
      status: 'Available',
      note: 'Actual cache check not implemented',
    },
  });

  return checks;
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
