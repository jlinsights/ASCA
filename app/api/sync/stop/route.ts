import { NextResponse } from 'next/server'
import { syncEngine } from '@/lib/sync-engine'

export async function POST() {
  try {
    // 동기화 엔진 중지
    syncEngine.stop()

    return NextResponse.json({
      success: true,
      message: '동기화 엔진이 중지되었습니다.'
    })

  } catch (error) {
    
    return NextResponse.json(
      { 
        success: false,
        error: '동기화 엔진 중지에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST 요청으로 동기화 엔진을 중지하세요.'
  })
} 