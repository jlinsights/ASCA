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

    console.log('Starting large-scale Airtable migration (4049+ records)...')

    // 개발 환경에서만 실제 마이그레이션 실행
    const { AirtableMigration } = await import('@/lib/airtable-migration')
    
    console.log('Beginning batch migration process...')
    const result = await AirtableMigration.migrateAll()

    console.log('Large-scale migration completed successfully:', result)

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully! Artists: ${result.artists.success}/${result.artists.total}, Artworks: ${result.artworks.success}/${result.artworks.total}, Exhibitions: ${result.exhibitions.success}/${result.exhibitions.total}`,
      results: result,
      summary: {
        totalProcessed: result.artists.total + result.artworks.total + result.exhibitions.total,
        totalSuccessful: result.artists.success + result.artworks.success + result.exhibitions.success,
        totalFailed: result.artists.failed + result.artworks.failed + result.exhibitions.failed
      }
    })

  } catch (error) {
    console.error('Large-scale migration failed:', error)
    
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