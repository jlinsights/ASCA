import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 빌드 시에는 간단한 응답 반환
    if (process.env.NODE_ENV === 'production' && !process.env.AIRTABLE_API_KEY) {
      return NextResponse.json({
        message: 'Migration service not configured in production',
        airtable: {
          artists: 0,
          artworks: 0,
          exhibitions: 0
        },
        estimated_time: '알 수 없음'
      })
    }

    // Airtable 환경변수 확인
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable credentials not configured' },
        { status: 400 }
      )
    }

    // 개발 환경에서만 실제 Airtable 데이터 확인
    const { AirtableService } = await import('@/lib/airtable')
    
    const [artists, artworks, exhibitions] = await Promise.all([
      AirtableService.getAllArtists().catch(() => []),
      AirtableService.getAllArtworks().catch(() => []),
      AirtableService.getAllExhibitions().catch(() => [])
    ])

    const totalRecords = artists.length + artworks.length + exhibitions.length
    const estimatedMinutes = Math.ceil(totalRecords * 0.1) // 레코드당 약 6초 추정

    return NextResponse.json({
      airtable: {
        artists: artists.length,
        artworks: artworks.length,
        exhibitions: exhibitions.length
      },
      details: {
        artists_status: artists.length > 0 ? 'data_available' : 'empty',
        artworks_status: artworks.length > 0 ? 'data_available' : 'empty',
        exhibitions_status: exhibitions.length > 0 ? 'data_available' : 'empty'
      },
      estimated_time: totalRecords > 0 ? `약 ${estimatedMinutes}분` : '즉시 완료',
      notes: {
        artists: artists.length > 0 ? `${artists.length}개 레코드 확인됨` : '테이블이 비어있음',
        artworks: artworks.length > 0 ? `${artworks.length}개 레코드 확인됨` : '테이블이 비어있음 (작품 데이터 없음)',
        exhibitions: exhibitions.length > 0 ? `${exhibitions.length}개 레코드 확인됨` : '테이블이 비어있음 (전시회 데이터 없음)'
      }
    })

  } catch (error) {
    console.error('Error checking Airtable status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to Airtable',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 