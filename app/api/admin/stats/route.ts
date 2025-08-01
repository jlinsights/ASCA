import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { devAuth } from '@/lib/auth/dev-auth'

// GET /api/admin/stats - 관리자 통계 조회
export async function GET(request: NextRequest) {
  try {
    // 개발 모드에서 인증 확인
    let userId: string | null = null;
    let isAdmin = false;
    
    const devUser = await devAuth.getCurrentUser();
    if (devUser && devUser.role === 'admin') {
      userId = devUser.id;
      isAdmin = true;
    }

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Supabase 클라이언트 확인
    if (!supabase) {
      // 개발 모드에서 더미 데이터 반환
      return NextResponse.json({
        success: true,
        stats: {
          totalMembers: 156,
          activeMembers: 142,
          newMembersThisMonth: 12,
          membershipLevels: {
            honorary: 3,
            certified: 8,
            advanced: 25,
            students: 89,
            institutional: 18,
            international: 13
          },
          recentActivity: {
            newRegistrations: 5,
            levelUpgrades: 3,
            achievements: 12
          }
        }
      });
    }

    // 실제 Supabase 쿼리 (구현 예정)
    // const { data: members, error } = await supabase
    //   .from('members')
    //   .select('*');

    // 임시로 더미 데이터 반환
    return NextResponse.json({
      success: true,
      stats: {
        totalMembers: 156,
        activeMembers: 142,
        newMembersThisMonth: 12,
        membershipLevels: {
          honorary: 3,
          certified: 8,
          advanced: 25,
          students: 89,
          institutional: 18,
          international: 13
        },
        recentActivity: {
          newRegistrations: 5,
          levelUpgrades: 3,
          achievements: 12
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}