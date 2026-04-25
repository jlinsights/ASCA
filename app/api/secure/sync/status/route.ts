import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 강화된 동기화 상태 조회 API
 * - 관리자 권한 필수
 * - 상세한 동기화 상태 정보 제공
 * - 접근 로깅
 */
async function secureSyncStatusHandler({ user, request }: SecureAPIContext) {
  try {
    // 관리자 액션 로깅 (상태 조회)
    auditLogger.logAdminAction(request, user!, 'SYNC_STATUS_CHECK', 'Sync engine status requested')

    // 동기화 엔진 상태 조회
    const { getSyncEngine } = await import('@/lib/sync-engine')
    const engine = getSyncEngine()
    const status = (engine as any).getStatus
      ? (engine as any).getStatus()
      : { active: false, message: 'Status not available' }

    return NextResponse.json({
      success: true,
      message: 'Sync engine status retrieved successfully',
      data: {
        ...status,
        checkedBy: user?.email,
        timestamp: new Date().toISOString(),
        security: {
          authenticated: true,
          userRole: user?.role,
          accessLevel: 'admin',
        },
      },
    })
  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Sync status check failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve sync engine status',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'SYNC_STATUS_FAILED',
      },
      { status: 500 }
    )
  }
}

// 관리자 전용 API로 래핑
export const GET = createAdminAPI(secureSyncStatusHandler)
