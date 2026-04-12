import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminAuth } from '@/lib/auth/middleware'

// POST /api/sync/start - 동기화 시작
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

    // 동기화 시작 로직 (구현 예정)
    return NextResponse.json({
      success: true,
      message: 'Sync started successfully',
      data: {
        status: 'running',
        startedAt: new Date().toISOString(),
        initiatedBy: adminUser.id,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/sync/start - 동기화 상태 확인
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
        status: 'idle',
        lastSync: null,
        nextSync: null,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
