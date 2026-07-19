import { NextResponse } from 'next/server'
import { createSystemAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { getFirstOrNull } from '@/lib/migration/http-migration-guard'

const POSSIBLE_TABLE_NAMES = [
  'Artists',
  'Artworks',
  'Exhibitions',
  'Events',
  'Notices',
  'Artist',
  'Artwork',
  'Exhibition',
  'Event',
  'Notice',
  '작가',
  '작품',
  '전시',
  '행사',
  '공지',
  '작가들',
  '작품들',
  '전시회',
  '행사들',
  '공지사항',
  'Members',
  'Gallery',
  'Paintings',
  'Calligraphy',
  'tblArtists',
  'tblArtworks',
  'tblExhibitions',
  'Table 1',
  'Table 2',
  'Table 3',
  'Table 4',
  'Table 5',
] as const

/**
 * 시스템 관리자 전용 Airtable 테이블 탐지.
 * - 전체 `.all()` 카운트는 비용·레이트리밋 위험이 커서 생략
 * - 존재 여부 + 샘플 필드명만 반환
 */
async function secureDetectTablesHandler({ user, request }: SecureAPIContext) {
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

    auditLogger.logAdminAction(
      request,
      user,
      'MIGRATION_DETECT_TABLES',
      'Airtable table probe requested'
    )

    const Airtable = (await import('airtable')).default
    const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    const base = airtable.base(process.env.AIRTABLE_BASE_ID)

    const foundTables: Array<{ name: string; sampleFields: string[]; hasRecords: boolean }> = []
    const errors: Array<{ table: string; error: string }> = []

    for (const tableName of POSSIBLE_TABLE_NAMES) {
      try {
        const records = await base(tableName)
          .select({ maxRecords: 1 })
          .firstPage()

        const first = getFirstOrNull(records)
        foundTables.push({
          name: tableName,
          sampleFields: first ? Object.keys(first.fields) : [],
          hasRecords: Boolean(first),
        })
      } catch (error: unknown) {
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined
        const message = error instanceof Error ? error.message : String(error)

        // 404 = 테이블 없음 → 무시
        if (statusCode !== 404) {
          errors.push({ table: tableName, error: message })
        }
      }
    }

    return NextResponse.json({
      success: true,
      foundTables,
      totalTables: foundTables.length,
      note: 'Full record counts are omitted. Use CLI scripts for inventory.',
      errors: errors.length > 0 ? errors : undefined,
      checkedBy: user.email,
      timestamp: new Date().toISOString(),
    })
  } catch {
    auditLogger.logSuspiciousActivity(request, 'Migration detect-tables failed', {
      userId: user?.id,
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to detect tables',
        code: 'MIGRATION_DETECT_FAILED',
      },
      { status: 500 }
    )
  }
}

export const GET = createSystemAPI(secureDetectTablesHandler)
