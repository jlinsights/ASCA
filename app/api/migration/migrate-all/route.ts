import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { createArtist, createArtwork } from '@/lib/admin-api'
import { createExhibition } from '@/lib/supabase/cms'
import { AirtableMigration } from '@/lib/airtable-migration'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Airtable migration...')

    // 전체 마이그레이션 실행
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