import { NextResponse } from 'next/server'
import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'

/**
 * 관리자 전용 Airtable 마이그레이션 상태 조회.
 * - admin 권한 필수
 * - 레코드 수만 반환 (본문/PII 미포함)
 */
async function secureCheckStatusHandler({ user, request }: SecureAPIContext) {
  try {
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        {
          success: false,
          message: 'Migration service not configured',
          code: 'MIGRATION_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    auditLogger.logAdminAction(request, user, 'MIGRATION_STATUS_CHECK', 'Airtable status requested')

    const { AirtableService } = await import('@/lib/airtable')

    const [artists, artworks, exhibitions, events, notices] = await Promise.all([
      AirtableService.getAllArtists().catch(() => []),
      AirtableService.getAllArtworks().catch(() => []),
      AirtableService.getAllExhibitions().catch(() => []),
      AirtableService.getAllEvents().catch(() => []),
      AirtableService.getAllNotices().catch(() => []),
    ])

    const totalRecords =
      artists.length + artworks.length + exhibitions.length + events.length + notices.length
    const estimatedMinutes = Math.ceil(totalRecords * 0.1)

    return NextResponse.json({
      success: true,
      airtable: {
        artists: artists.length,
        artworks: artworks.length,
        exhibitions: exhibitions.length,
        events: events.length,
        notices: notices.length,
      },
      details: {
        artists_status: artists.length > 0 ? 'data_available' : 'empty',
        artworks_status: artworks.length > 0 ? 'data_available' : 'empty',
        exhibitions_status: exhibitions.length > 0 ? 'data_available' : 'empty',
        events_status: events.length > 0 ? 'data_available' : 'empty',
        notices_status: notices.length > 0 ? 'data_available' : 'empty',
      },
      estimated_time: totalRecords > 0 ? `약 ${estimatedMinutes}분` : '즉시 완료',
      checkedBy: user.email,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    auditLogger.logSuspiciousActivity(request, 'Migration status check failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Airtable',
        code: 'MIGRATION_STATUS_FAILED',
      },
      { status: 500 }
    )
  }
}

export const GET = createAdminAPI(secureCheckStatusHandler)
