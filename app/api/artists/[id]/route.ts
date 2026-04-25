import { NextRequest, NextResponse } from 'next/server'
import { EnhancedAdminAPI } from '@/lib/api/enhanced-admin-api'
import { requireAdminAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: '작가 ID가 필요합니다.' }, { status: 400 })
    }

    const artist = await EnhancedAdminAPI.getArtistById(id)

    if (!artist) {
      return NextResponse.json({ error: '작가를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(artist)
  } catch (error) {
    return NextResponse.json({ error: '작가 정보를 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 인증 확인
    const user = await requireAdminAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()

    const updatedArtist = await EnhancedAdminAPI.updateArtist(id, body)

    if (!updatedArtist) {
      throw new Error('Failed to update artist')
    }

    return NextResponse.json(updatedArtist)
  } catch (error) {
    return NextResponse.json({ error: '작가 정보 수정에 실패했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 인증 확인
    const user = await requireAdminAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    }

    const success = await EnhancedAdminAPI.deleteArtist(id)

    if (!success) {
      throw new Error('Failed to delete artist')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '작가 삭제에 실패했습니다.' }, { status: 500 })
  }
}
