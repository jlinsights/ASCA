import { NextRequest, NextResponse } from 'next/server'
import { syncEngine } from '@/lib/sync-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { intervalMs = 60000 } = body

    // 동기화 엔진 시작
    await syncEngine.start(intervalMs)

    return NextResponse.json({
      success: true,
      message: '동기화 엔진이 성공적으로 시작되었습니다.',
      interval: intervalMs
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false,
        error: '동기화 엔진 시작에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST 요청으로 동기화 엔진을 시작하세요.',
    example: {
      method: 'POST',
      body: { intervalMs: 60000 }
    }
  })
} 