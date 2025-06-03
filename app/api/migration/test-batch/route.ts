import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { createArtist } from '@/lib/admin-api'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting test batch migration (10 artists)...')

    // 환경변수 확인
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({
        success: false,
        message: 'Airtable credentials not configured'
      }, { status: 400 })
    }

    // Airtable에서 처음 10명의 작가만 가져오기
    const { AirtableMigration } = await import('@/lib/airtable-migration')
    
    // 작은 배치로 테스트
    const result = await AirtableMigration.migrateArtistsInBatches(10)

    console.log('Test batch migration completed:', result)

    return NextResponse.json({
      success: true,
      message: `Test migration completed! Artists: ${result.success} success, ${result.failed} failed`,
      results: {
        artists: {
          success: result.success,
          failed: result.failed,
          total: result.success + result.failed
        }
      }
    })

  } catch (error) {
    console.error('Test batch migration failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Test migration failed',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
} 