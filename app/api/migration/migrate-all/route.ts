import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { createArtist, createArtwork } from '@/lib/admin-api'
import { createExhibition } from '@/lib/supabase/cms'

export async function POST(request: NextRequest) {
  try {
    // 빌드 시에는 간단한 응답 반환
    if (process.env.NODE_ENV === 'production' && !process.env.AIRTABLE_API_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Migration service not configured in production',
        results: {}
      })
    }

    console.log('Starting Airtable migration...')

    // 개발 환경에서만 실제 마이그레이션 실행
    const { AirtableMigration } = await import('@/lib/airtable-migration')
    const result = await AirtableMigration.migrateAll()

    console.log('Migration completed successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results: result
    })

  } catch (error) {
    console.error('Migration failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
} 