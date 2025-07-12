import { NextRequest, NextResponse } from 'next/server'
import { getArtists } from '@/lib/api/artists'
import { handleApiError, AppError } from '@/lib/utils/error-handler'
import { log } from '@/lib/utils/logger'

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
    log.error('GET /api/artists error', error, { url: request.url })
    const errRes = handleApiError(error)
    return NextResponse.json(errRes, { status: errRes.statusCode || 500 })
  }
} 