import { NextRequest, NextResponse } from 'next/server'
import { getArtworks, type ArtworkFilters, type ArtworkSortOptions } from '@/lib/api/artworks'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const style = searchParams.get('style')
    const availability = searchParams.get('availability')
    const featured = searchParams.get('featured')
    const artistId = searchParams.get('artistId')
    const sortField = searchParams.get('sortField') as ArtworkSortOptions['field'] | null
    const sortDirection = searchParams.get('sortDirection') as ArtworkSortOptions['direction'] | null

    // 필터 객체 생성
    const filters: ArtworkFilters = {}
    if (category) filters.category = [category]
    if (style) filters.style = [style]
    if (availability) filters.availability = [availability]
    if (featured !== null) filters.featured = featured === 'true'
    if (artistId) filters.artistId = artistId

    // 정렬 객체 생성
    const sort: ArtworkSortOptions | undefined = sortField && sortDirection ? {
      field: sortField,
      direction: sortDirection
    } : undefined

    const result = await getArtworks(filters, sort, page, limit)

    return NextResponse.json(result)
  } catch (error) {

    return NextResponse.json(
      { error: '작품 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 