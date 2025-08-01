import { NextRequest, NextResponse } from 'next/server'

import { devAuth } from '@/lib/auth/dev-auth'

// POST /api/sync/stop - 동기화 중지
export async function POST(request: NextRequest) {
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

    // 동기화 중지 로직 (구현 예정)
    return NextResponse.json({
      success: true,
      message: 'Sync stopped successfully',
      data: {
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
        stoppedBy: userId
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/sync/stop - 동기화 상태 확인
export async function GET() {
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

    return NextResponse.json({
      success: true,
      message: 'Sync status retrieved',
      data: {
        status: 'stopped',
        lastSync: null,
        nextSync: null
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 