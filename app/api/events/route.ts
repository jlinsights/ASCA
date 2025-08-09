import { NextRequest, NextResponse } from 'next/server'
import { getEvents } from '@/lib/supabase/cms'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const filters = {
      category: category || undefined,
      status: status || undefined,
      search: search || undefined,
    }

    const pagination = {
      page,
      limit,
    }

    const result = await getEvents(filters, pagination)

    return NextResponse.json(result)
  } catch (error) {

    return NextResponse.json(
      { error: '이벤트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 