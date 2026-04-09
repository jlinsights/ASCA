import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 강화된 동기화 중지 API
 * - 관리자 권한 필수
 * - 중지 이유 로깅
 * - 모든 작업 감사 로깅
 */
async function secureSyncStopHandler({ user, request }: SecureAPIContext) {
  try {
    const body = await request.json().catch(() => ({}))
    const { reason = 'Manual stop requested' } = body

    // 관리자 액션 로깅
    auditLogger.logAdminAction(
      request,
      user!,
      'SYNC_ENGINE_STOP',
      `Sync engine stopped. Reason: ${reason}`
    )

    // 동기화 엔진 중지
    const { getSyncEngine } = await import('@/lib/sync-engine')
    getSyncEngine().stop()

    return NextResponse.json({
      success: true,
      message: 'Sync engine stopped successfully with enhanced security',
      data: {
        stoppedBy: user?.email,
        timestamp: new Date().toISOString(),
        reason: reason,
        status: 'stopped'
      }
    })

  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Sync engine stop failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      success: false,
      message: 'Failed to stop sync engine',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SYNC_STOP_FAILED'
    }, { status: 500 })
  }
}

async function syncStopInfoHandler({ user, request }: SecureAPIContext) {
  return NextResponse.json({
    message: 'Secure sync engine stop endpoint',
    usage: {
      method: 'POST',
      body: { reason: 'Optional reason for stopping' },
      authentication: 'Required (Admin role)',
      permissions: ['admin']
    },
    warning: 'Stopping sync engine will halt data synchronization between Airtable and Supabase'
  })
}

// 관리자 전용 API로 래핑
export const POST = createAdminAPI(secureSyncStopHandler)
export const GET = createAdminAPI(syncStopInfoHandler)