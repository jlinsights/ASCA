import { NextRequest, NextResponse } from 'next/server'
import { getArtist } from '@/lib/api/artists'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: '작가 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const artist = await getArtist(id)
    
    if (!artist) {
      return NextResponse.json(
        { error: '작가를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(artist)
  } catch (error) {

    return NextResponse.json(
      { error: '작가 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 