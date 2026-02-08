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

export async function POST(request: NextRequest) {
  try {
    // TODO: Admin Auth Check
    const body = await request.json()
    // TODO: Validate body with createArtistSchema
    
    // Use Enhanced Admin API which integrates with Agents and CQRS
    const { EnhancedAdminAPI } = await import('@/lib/api/enhanced-admin-api')
    const newArtist = await EnhancedAdminAPI.createArtist(body)

    if (!newArtist) {
      throw new Error('Failed to create artist via Agent')
    }

    return NextResponse.json(newArtist, { status: 201 })
  } catch (error) {
    console.error('Create Artist Error Details:', error)
    return NextResponse.json(
      { error: '작가 생성에 실패했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}