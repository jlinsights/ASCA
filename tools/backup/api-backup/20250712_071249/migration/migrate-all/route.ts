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

    

    // 개발 환경에서만 실제 마이그레이션 실행
    const { AirtableMigration } = await import('@/lib/airtable-migration')
    
    
    const result = await AirtableMigration.migrateAll()

    

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully! Artists: ${result.artists.success}/${result.artists.total}, Artworks: ${result.artworks.success}/${result.artworks.total}, Exhibitions: ${result.exhibitions.success}/${result.exhibitions.total}, Events: ${result.events.success}/${result.events.total}, Notices: ${result.notices.success}/${result.notices.total}`,
      results: result,
      summary: {
        totalProcessed: result.artists.total + result.artworks.total + result.exhibitions.total + result.events.total + result.notices.total,
        totalSuccessful: result.artists.success + result.artworks.success + result.exhibitions.success + result.events.success + result.notices.success,
        totalFailed: result.artists.failed + result.artworks.failed + result.exhibitions.failed + result.events.failed + result.notices.failed
      }
    })

  } catch (error) {
    
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Large-scale migration failed',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
} 