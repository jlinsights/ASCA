import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Supabase 연결
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 최근 동기화 로그 조회
    const { data: recentLogs, error: logsError } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      
    }

    // 동기화 통계
    const { data: stats, error: statsError } = await supabase
      .from('sync_logs')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 최근 24시간

    if (statsError) {
      
    }

    // 통계 집계
    const syncStats = {
      total: stats?.length || 0,
      success: stats?.filter(log => log.status === 'success').length || 0,
      failed: stats?.filter(log => log.status === 'failed').length || 0,
      pending: stats?.filter(log => log.status === 'pending').length || 0
    }

    // 테이블별 레코드 수 확인
    const { count: artistsCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    const { count: artworksCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      sync_status: {
        last_24h: syncStats,
        recent_logs: recentLogs || [],
      },
      data_counts: {
        artists: artistsCount || 0,
        artworks: artworksCount || 0
      },
      engine_info: {
        message: '동기화 엔진 상태 정보',
        available_endpoints: [
          'POST /api/sync/start - 동기화 시작',
          'POST /api/sync/stop - 동기화 중지',
          'POST /api/sync/force-sync - 강제 동기화',
          'GET /api/sync/logs - 동기화 로그 조회'
        ]
      }
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false,
        error: '동기화 상태 확인에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 