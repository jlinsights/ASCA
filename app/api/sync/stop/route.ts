import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/auth/middleware'

// POST /api/sync/stop - 동기화 중지
export async function POST(request: NextRequest) {
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

    // 동기화 중지 로직 (구현 예정)
    return NextResponse.json({
      success: true,
      message: 'Sync stopped successfully',
      data: {
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
        stoppedBy: adminUser.id,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/sync/stop - 동기화 상태 확인
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

    return NextResponse.json({
      success: true,
      message: 'Sync status retrieved',
      data: {
        status: 'stopped',
        lastSync: null,
        nextSync: null,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
