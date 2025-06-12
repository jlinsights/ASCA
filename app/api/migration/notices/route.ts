import { NextRequest, NextResponse } from 'next/server'

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
    
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Notices migration failed',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
} 