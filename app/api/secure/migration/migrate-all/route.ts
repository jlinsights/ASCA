import { createSystemAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 강화된 전체 마이그레이션 API
 * - 시스템 관리자 권한 필수
 * - 엄격한 Rate Limiting (1분에 5회)
 * - 모든 작업 감사 로깅
 * - CSRF 토큰 검증
 */
async function secureMigrationHandler({ user, request }: SecureAPIContext) {
  try {
    // 환경 검증
    if (process.env.NODE_ENV === 'production' && !process.env.AIRTABLE_API_KEY) {
      auditLogger.logSuspiciousActivity(request, 'Migration attempted without configuration', {
        userId: user?.id,
        environment: process.env.NODE_ENV,
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Migration service not configured in production',
          code: 'MIGRATION_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    // 추가 권한 검증 (마이그레이션은 매우 민감한 작업)
    if (!user?.permissions?.includes('system') && !user?.permissions?.includes('migration')) {
      auditLogger.logSuspiciousActivity(request, 'Unauthorized migration attempt', {
        userId: user?.id,
        userPermissions: user?.permissions,
        requiredPermissions: ['system', 'migration'],
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions for migration operations',
          code: 'MIGRATION_PERMISSION_DENIED',
        },
        { status: 403 }
      )
    }

    // 관리자 액션 로깅
    auditLogger.logAdminAction(
      request,
      user!,
      'FULL_MIGRATION_START',
      'All tables migration initiated'
    )

    // 마이그레이션 실행
    const { AirtableMigration } = await import('@/lib/airtable-migration')
    const result = await AirtableMigration.migrateAll()

    // 성공 로깅
    auditLogger.logAdminAction(
      request,
      user!,
      'FULL_MIGRATION_COMPLETE',
      `Migration completed: ${result.artists.success + result.artworks.success + result.exhibitions.success + result.events.success + result.notices.success} items processed`
    )

    return NextResponse.json({
      success: true,
      message: `Secure migration completed successfully!`,
      summary: {
        totalProcessed:
          result.artists.total +
          result.artworks.total +
          result.exhibitions.total +
          result.events.total +
          result.notices.total,
        totalSuccessful:
          result.artists.success +
          result.artworks.success +
          result.exhibitions.success +
          result.events.success +
          result.notices.success,
        totalFailed:
          result.artists.failed +
          result.artworks.failed +
          result.exhibitions.failed +
          result.events.failed +
          result.notices.failed,
        executedBy: user?.email,
        timestamp: new Date().toISOString(),
      },
      results: result,
    })
  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Migration operation failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Migration operation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'MIGRATION_FAILED',
      },
      { status: 500 }
    )
  }
}

// 시스템 관리자 전용 API로 래핑 (가장 엄격한 보안 설정)
export const POST = createSystemAPI(secureMigrationHandler)
