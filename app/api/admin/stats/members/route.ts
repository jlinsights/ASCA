import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { devAuth } from '@/lib/auth/dev-auth';

// GET /api/admin/stats/members - 회원 통계 조회
export async function GET(request: NextRequest) {
  try {
    // 개발 모드에서 인증 확인
    let userId: string | null = null;
    const devUser = await devAuth.getCurrentUser();
    if (devUser && devUser.role === 'admin') {
      userId = devUser.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Supabase 클라이언트 확인
    if (!supabase) {
      // 개발 모드에서 Supabase가 설정되지 않은 경우 더미 데이터 반환
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          data: {
            total: 156,
            active: 142,
            inactive: 8,
            suspended: 6,
            byLevel: {
              '1': 12, // Honorary Masters
              '2': 28, // Certified Masters
              '3': 45, // Advanced Practitioners
              '4': 52, // Students
              '5': 15, // Institutional Members
              '6': 4   // International Associates
            },
            recentJoiners: 23,
            byNationality: {
              'KR': 134,
              'US': 8,
              'JP': 6,
              'CN': 4,
              'Other': 4
            }
          }
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    // 전체 회원 수
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // 개발 모드에서 데이터가 없으면 더미 데이터 반환
    if (process.env.NODE_ENV === 'development' && (!totalMembers || totalMembers === 0)) {
      return NextResponse.json({
        success: true,
        data: {
          total: 156,
          active: 142,
          inactive: 8,
          suspended: 6,
          byLevel: {
            '1': 12, // Honorary Masters
            '2': 28, // Certified Masters
            '3': 45, // Advanced Practitioners
            '4': 52, // Students
            '5': 15, // Institutional Members
            '6': 4   // International Associates
          },
          recentJoiners: 23,
          byNationality: {
            'KR': 134,
            'US': 8,
            'JP': 6,
            'CN': 4,
            'Other': 4
          }
        }
      });
    }

    // 상태별 회원 수
    const { data: statusStats } = await supabase
      .from('members')
      .select('membership_status')
      .not('membership_status', 'is', null);

    const statusCounts = statusStats?.reduce((acc, member) => {
      const status = member.membership_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 등급별 회원 수
    const { data: levelStats } = await supabase
      .from('members')
      .select('membership_level_id')
      .not('membership_level_id', 'is', null);

    const levelCounts = levelStats?.reduce((acc, member) => {
      const levelId = member.membership_level_id;
      acc[levelId] = (acc[levelId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // 최근 30일 가입자 수
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentJoiners } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // 국적별 통계
    const { data: nationalityStats } = await supabase
      .from('members')
      .select('nationality')
      .not('nationality', 'is', null);

    const nationalityCounts = nationalityStats?.reduce((acc, member) => {
      const nationality = member.nationality;
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      success: true,
      data: {
        total: totalMembers || 0,
        active: statusCounts.active || 0,
        inactive: statusCounts.inactive || 0,
        suspended: statusCounts.suspended || 0,
        byLevel: levelCounts,
        recentJoiners: recentJoiners || 0,
        byNationality: nationalityCounts
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
} 