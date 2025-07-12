import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 강화된 동기화 시작 API
 * - 관리자 권한 필수
 * - 동기화 간격 검증
 * - 모든 작업 감사 로깅
 */
async function secureSyncStartHandler({ user, request }: SecureAPIContext) {
  try {
    const body = await request.json().catch(() => ({}))
    const { intervalMs = 60000 } = body

    // 동기화 간격 검증 (1분 ~ 1시간)
    if (intervalMs < 60000 || intervalMs > 3600000) {
      auditLogger.logSuspiciousActivity(request, 'Invalid sync interval attempted', {
        userId: user?.id,
        requestedInterval: intervalMs,
        validRange: '60000-3600000ms'
      })

      return NextResponse.json({
        success: false,
        message: 'Invalid sync interval. Must be between 1 minute and 1 hour.',
        code: 'INVALID_SYNC_INTERVAL'
      }, { status: 400 })
    }

    // 관리자 액션 로깅
    auditLogger.logAdminAction(
      request,
      user!,
      'SYNC_ENGINE_START',
      `Sync engine started with ${intervalMs}ms interval`
    )

    // 동기화 엔진 시작
    const { syncEngine } = await import('@/lib/sync-engine')
    await syncEngine.start(intervalMs)

    return NextResponse.json({
      success: true,
      message: 'Sync engine started successfully with enhanced security',
      data: {
        interval: intervalMs,
        startedBy: user?.email,
        timestamp: new Date().toISOString(),
        status: 'running'
      }
    })

  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Sync engine start failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      success: false,
      message: 'Failed to start sync engine',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SYNC_START_FAILED'
    }, { status: 500 })
  }
}

async function syncStartInfoHandler({ user, request }: SecureAPIContext) {
  return NextResponse.json({
    message: 'Secure sync engine control endpoint',
    usage: {
      method: 'POST',
      body: { intervalMs: 60000 },
      authentication: 'Required (Admin role)',
      permissions: ['admin']
    },
    validIntervals: {
      minimum: '60000ms (1 minute)',
      maximum: '3600000ms (1 hour)',
      recommended: '300000ms (5 minutes)'
    }
  })
}

// 관리자 전용 API로 래핑
export const POST = createAdminAPI(secureSyncStartHandler)
export const GET = createAdminAPI(syncStartInfoHandler)