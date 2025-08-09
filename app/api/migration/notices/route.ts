import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, AppError } from '@/lib/utils/error-handler'
import { log } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    // 환경변수 확인
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable credentials not configured' },
        { status: 400 }
      )
    }

    const { AirtableMigration } = await import('@/lib/airtable-migration')
    
    const result = await AirtableMigration.migrateNotices()

    return NextResponse.json({
      success: true,
      message: `Notices migration completed! ${result.success}/${result.success + result.failed} records migrated successfully`,
      results: {
        notices: {
          success: result.success,
          failed: result.failed,
          total: result.success + result.failed
        }
      }
    })

  } catch (error) {
    log.error('POST /api/migration/notices error', error)
    const errRes = handleApiError(error)
    return NextResponse.json(errRes, { status: errRes.statusCode || 500 })
  }
} 