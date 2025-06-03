import { NextRequest, NextResponse } from 'next/server'
import { getArtist } from '@/lib/api/artists'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params
    const artist = await getArtist(resolvedParams.id)

    if (!artist) {
      return NextResponse.json(
        {
          success: false,
          message: 'Artist not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      artist
    })

  } catch (error) {
    console.error('Error fetching artist:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch artist'
      },
      { status: 500 }
    )
  }
} 