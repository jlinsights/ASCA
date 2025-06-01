import { NextResponse } from 'next/server'
import { ensureSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = ensureSupabase()

    // 각 테이블의 데이터 수 조회
    const [
      { count: noticesCount },
      { count: exhibitionsCount }, 
      { count: eventsCount },
      { count: artistsCount },
      { count: artworksCount },
      { count: filesCount }
    ] = await Promise.all([
      supabase.from('notices').select('*', { count: 'exact', head: true }),
      supabase.from('exhibitions').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
      supabase.from('artworks').select('*', { count: 'exact', head: true }),
      supabase.from('files').select('*', { count: 'exact', head: true })
    ])

    // 최근 활동 조회 (예: 최근 생성된 데이터들)
    const { data: recentArtists } = await supabase
      .from('artists')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(2)

    const { data: recentArtworks } = await supabase
      .from('artworks') 
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(2)

    const { data: recentExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(1)

    // 최근 활동 데이터 구성
    const recentActivity = []
    
    if (recentExhibitions?.[0]) {
      recentActivity.push({
        id: `exhibition-${recentExhibitions[0].id}`,
        type: 'exhibition',
        action: 'created',
        title: recentExhibitions[0].title,
        timestamp: recentExhibitions[0].created_at,
        user: '관리자'
      })
    }

    if (recentArtists?.[0]) {
      recentActivity.push({
        id: `artist-${recentArtists[0].id}`,
        type: 'artist', 
        action: 'created',
        title: recentArtists[0].name,
        timestamp: recentArtists[0].created_at,
        user: '관리자'
      })
    }

    if (recentArtworks?.[0]) {
      recentActivity.push({
        id: `artwork-${recentArtworks[0].id}`,
        type: 'artwork',
        action: 'created', 
        title: recentArtworks[0].title,
        timestamp: recentArtworks[0].created_at,
        user: '관리자'
      })
    }

    if (recentArtists?.[1]) {
      recentActivity.push({
        id: `artist-${recentArtists[1].id}`,
        type: 'artist',
        action: 'created',
        title: recentArtists[1].name,
        timestamp: recentArtists[1].created_at,
        user: '관리자'
      })
    }

    if (recentArtworks?.[1]) {
      recentActivity.push({
        id: `artwork-${recentArtworks[1].id}`,
        type: 'artwork',
        action: 'created',
        title: recentArtworks[1].title, 
        timestamp: recentArtworks[1].created_at,
        user: '관리자'
      })
    }

    // 시간순으로 정렬
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const stats = {
      totalNotices: noticesCount || 0,
      totalExhibitions: exhibitionsCount || 0,
      totalEvents: eventsCount || 0,
      totalArtists: artistsCount || 0,
      totalArtworks: artworksCount || 0,
      totalFiles: filesCount || 0, // 실제 files 테이블의 파일 수
      totalViews: 0, // 조회수는 별도 구현이 필요하므로 임시로 0
      recentActivity: recentActivity.slice(0, 5) // 최대 5개만 표시
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('통계 조회 오류:', error)
    return NextResponse.json(
      { error: '통계 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 