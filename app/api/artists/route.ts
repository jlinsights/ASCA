import { NextRequest, NextResponse } from 'next/server'
import { getArtists } from '@/lib/api/artists'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const result = await getArtists(undefined, undefined, page, limit)

    return NextResponse.json({
      success: true,
      artists: result.artists,
      total: result.total,
      page,
      limit
    })

  } catch (error) {
    
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch artists',
        artists: [],
        total: 0
      },
      { status: 500 }
    )
  }
} 