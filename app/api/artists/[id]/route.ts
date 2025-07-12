import { NextRequest, NextResponse } from 'next/server'
import { getArtist } from '@/lib/api/artists'
import { handleApiError, AppError } from '@/lib/utils/error-handler'
import { log } from '@/lib/utils/logger'

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
    log.error('GET /api/artists/[id] error', error, { url: request.url })
    const errRes = handleApiError(error)
    return NextResponse.json(errRes, { status: errRes.statusCode || 500 })
  }
} 