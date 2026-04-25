import { createAdminAPI, type SecureAPIContext } from '@/lib/security/secure-api'
import { auditLogger } from '@/lib/security/audit-logger'
import { ensureSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * 🔐 보안 강화된 관리자 통계 API
 * - 관리자 권한 필수
 * - 민감한 정보 필터링
 * - 접근 로깅 및 모니터링
 */
async function secureAdminStatsHandler({ user, request }: SecureAPIContext) {
  try {
    // 관리자 액션 로깅
    auditLogger.logAdminAction(request, user!, 'ADMIN_STATS_ACCESS', 'Admin statistics accessed')

    const supabase = ensureSupabase()
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // 데이터베이스 연결 확인
    const { error: connectionError } = await supabase.from('artists').select('id').limit(1)
    if (connectionError) {
      throw new Error('Database connection failed')
    }

    // 각 테이블의 데이터 수 조회 (병렬 처리)
    const [
      { count: noticesCount },
      { count: exhibitionsCount },
      { count: eventsCount },
      { count: artistsCount },
      { count: artworksCount },
      { count: filesCount },
    ] = await Promise.all([
      supabase.from('notices').select('*', { count: 'exact', head: true }),
      supabase.from('exhibitions').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('artists').select('*', { count: 'exact', head: true }),
      supabase.from('artworks').select('*', { count: 'exact', head: true }),
      supabase.from('files').select('*', { count: 'exact', head: true }),
    ])

    // 최근 활동 조회 (민감한 정보 제외)
    const { data: recentArtists } = await supabase
      .from('artists')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    const { data: recentArtworks } = await supabase
      .from('artworks')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    const { data: recentExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(2)

    // 보안 감사 통계 추가
    const securityStats = auditLogger.getStats()

    // 최근 활동 데이터 구성 (개선된 버전)
    const recentActivity: any[] = []

    // 전시회 활동
    recentExhibitions?.forEach(exhibition => {
      recentActivity.push({
        id: `exhibition-${exhibition.id}`,
        type: 'exhibition',
        action: 'created',
        title: exhibition.title,
        timestamp: exhibition.created_at,
        category: 'content',
      })
    })

    // 작가 활동
    recentArtists?.forEach((artist, index) => {
      if (index < 2) {
        // 최대 2개만
        recentActivity.push({
          id: `artist-${artist.id}`,
          type: 'artist',
          action: 'created',
          title: artist.name,
          timestamp: artist.created_at,
          category: 'content',
        })
      }
    })

    // 작품 활동
    recentArtworks?.forEach((artwork, index) => {
      if (index < 2) {
        // 최대 2개만
        recentActivity.push({
          id: `artwork-${artwork.id}`,
          type: 'artwork',
          action: 'created',
          title: artwork.title,
          timestamp: artwork.created_at,
          category: 'content',
        })
      }
    })

    // 시간순으로 정렬하고 최대 5개 선택
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const enhancedStats = {
      // 기본 통계
      counts: {
        totalNotices: noticesCount || 0,
        totalExhibitions: exhibitionsCount || 0,
        totalEvents: eventsCount || 0,
        totalArtists: artistsCount || 0,
        totalArtworks: artworksCount || 0,
        totalFiles: filesCount || 0,
      },

      // 최근 활동
      recentActivity: recentActivity.slice(0, 5),

      // 보안 통계 (관리자용)
      security: {
        authEvents: securityStats.byType,
        criticalEvents: securityStats.bySeverity.critical || 0,
        recentEvents: securityStats.lastHour,
        topIPs: securityStats.topIPs.slice(0, 3), // 상위 3개 IP만
      },

      // 시스템 정보
      system: {
        accessedBy: user?.email,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        permissions: user?.permissions,
      },
    }

    return NextResponse.json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: enhancedStats,
    })
  } catch (error) {
    // 에러 감사 로깅
    auditLogger.logSuspiciousActivity(request, 'Admin stats access failed', {
      userId: user?.id,
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve admin statistics',
        error: error instanceof Error ? error.message : 'Database error',
        code: 'ADMIN_STATS_FAILED',
      },
      { status: 500 }
    )
  }
}

// 관리자 전용 API로 래핑
export const GET = createAdminAPI(secureAdminStatsHandler)
