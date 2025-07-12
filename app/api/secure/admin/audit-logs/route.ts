import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { createPermissionChecker, Permission } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 감사 로그 조회 API
 * - 고급 관리자 권한 필수
 * - 보안 이벤트 조회 및 분석
 * - 접근 자체도 감사 로깅
 */
async function secureAuditLogsHandler({ user, request }: SecureAPIContext) {
  try {
    // 권한 검사
    const permissionChecker = createPermissionChecker(user!)
    if (!permissionChecker.hasPermission(Permission.VIEW_AUDIT_LOGS)) {
      auditLogger.logSuspiciousActivity(request, 'Unauthorized audit log access attempt', {
        userId: user?.id,
        userRole: user?.role,
        userPermissions: user?.permissions
      })
      
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to view audit logs',
        code: 'AUDIT_LOG_PERMISSION_DENIED'
      }, { status: 403 })
    }

    // 감사 로그 접근 기록
    auditLogger.logAdminAction(
      request,
      user!,
      'AUDIT_LOG_ACCESS',
      'Security audit logs accessed'
    )

    // 쿼리 파라미터 파싱
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000) // 최대 1000개
    const type = url.searchParams.get('type') as any
    const severity = url.searchParams.get('severity') as any
    const ip = url.searchParams.get('ip')
    const userId = url.searchParams.get('userId')

    // 감사 로그 조회
    let events = auditLogger.getRecentEvents(limit)

    // 필터링
    if (type) {
      events = events.filter(event => event.type === type)
    }
    
    if (severity) {
      events = events.filter(event => event.severity === severity)
    }
    
    if (ip) {
      events = events.filter(event => event.source.ip === ip)
    }
    
    if (userId) {
      events = events.filter(event => event.user?.id === userId)
    }

    // 통계 정보
    const stats = auditLogger.getStats()

    return NextResponse.json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        events: events.map(event => ({
          ...event,
          // 민감한 정보 제거/마스킹
          source: {
            ...event.source,
            userAgent: event.source.userAgent.substring(0, 50) + '...'
          }
        })),
        stats,
        filters: {
          limit,
          type,
          severity,
          ip,
          userId
        },
        metadata: {
          retrievedBy: user?.email,
          timestamp: new Date().toISOString(),
          totalEvents: events.length
        }
      }
    })

  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Audit log retrieval failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve audit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'AUDIT_LOG_RETRIEVAL_FAILED'
    }, { status: 500 })
  }
}

// 고급 관리자 전용 API로 래핑
export const GET = createAdminAPI(secureAuditLogsHandler)