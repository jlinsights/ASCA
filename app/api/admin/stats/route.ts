import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/auth/middleware'
import { supabase } from '@/lib/supabase'

const developmentStats = {
  totalMembers: 156,
  activeMembers: 142,
  newMembersThisMonth: 12,
  membershipLevels: {
    honorary: 3,
    certified: 8,
    advanced: 25,
    students: 89,
    institutional: 18,
    international: 13,
  },
  recentActivity: {
    newRegistrations: 5,
    levelUpgrades: 3,
    achievements: 12,
  },
}

// GET /api/admin/stats - 관리자 통계 조회
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const adminUser = await requireAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Supabase 클라이언트 확인
    if (!supabase) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, stats: developmentStats })
      }

      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      { count: totalMembers, error: totalError },
      { count: activeMembers, error: activeError },
      { count: newMembersThisMonth, error: recentError },
      { data: membershipRows, error: membershipError },
    ] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('membership_status', 'active'),
      supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('members').select('membership_level_id'),
    ])

    const queryError = totalError || activeError || recentError || membershipError
    if (queryError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch admin stats' },
        { status: 500 }
      )
    }

    const membershipLevels =
      membershipRows?.reduce(
        (acc, row) => {
          const key = row.membership_level_id || 'unassigned'
          acc[key] = (acc[key] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ) || {}

    return NextResponse.json({
      success: true,
      stats: {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        newMembersThisMonth: newMembersThisMonth || 0,
        membershipLevels,
        recentActivity: {
          newRegistrations: newMembersThisMonth || 0,
          levelUpgrades: 0,
          achievements: 0,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
