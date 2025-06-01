import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    // Airtable 환경변수 확인
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable credentials not configured' },
        { status: 400 }
      )
    }

    // Airtable 데이터 개수 확인
    const [artists, artworks, exhibitions] = await Promise.all([
      AirtableService.getAllArtists(),
      AirtableService.getAllArtworks(),
      AirtableService.getAllExhibitions()
    ])

    const totalRecords = artists.length + artworks.length + exhibitions.length
    const estimatedMinutes = Math.ceil(totalRecords * 0.1) // 레코드당 약 6초 추정

    return NextResponse.json({
      airtable: {
        artists: artists.length,
        artworks: artworks.length,
        exhibitions: exhibitions.length
      },
      estimated_time: `약 ${estimatedMinutes}분`
    })

  } catch (error) {
    console.error('Error checking Airtable status:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Airtable' },
      { status: 500 }
    )
  }
} 