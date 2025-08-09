import { NextRequest, NextResponse } from 'next/server'
import { getArtists } from '@/lib/api/artists'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const membershipType = searchParams.get('membershipType')
    const artistType = searchParams.get('artistType')
    const specialty = searchParams.get('specialty')
    const title = searchParams.get('title')

    // filters 객체 구성
    const filters = {
      membershipType: membershipType ? [membershipType] : undefined,
      artistType: artistType ? [artistType] : undefined,
      specialties: specialty ? [specialty] : undefined,
    }

    const result = await getArtists(
      filters,
      undefined, // sort
      page,
      limit
    )

    return NextResponse.json(result)
  } catch (error) {

    return NextResponse.json(
      { error: '작가 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 