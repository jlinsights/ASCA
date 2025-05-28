import { NextRequest, NextResponse } from 'next/server'

const CALCOM_API_KEY = process.env.CALCOM_API_KEY
const CALCOM_API_URL = process.env.CALCOM_API_URL || 'https://api.cal.com/v1'

// Cal.com API 헤더 설정
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${CALCOM_API_KEY}`
})

// GET: 예약 목록 조회
export async function GET(request: NextRequest) {
  if (!CALCOM_API_KEY) {
    return NextResponse.json(
      { error: 'Cal.com API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'confirmed'
    const limit = searchParams.get('limit') || '10'

    const response = await fetch(`${CALCOM_API_URL}/bookings?status=${status}&limit=${limit}`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error(`Cal.com API 에러: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      bookings: data.bookings || [],
      total: data.total || 0
    })

  } catch (error) {
    console.error('예약 목록 조회 실패:', error)
    return NextResponse.json(
      { error: '예약 목록을 불러오는데 실패했습니다.', details: error },
      { status: 500 }
    )
  }
}

// POST: 새로운 예약 생성
export async function POST(request: NextRequest) {
  if (!CALCOM_API_KEY) {
    return NextResponse.json(
      { error: 'Cal.com API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const bookingData = await request.json()
    
    // 필수 필드 검증
    const requiredFields = ['eventTypeId', 'start', 'end', 'attendee']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `필수 필드가 누락되었습니다: ${field}` },
          { status: 400 }
        )
      }
    }

    // Cal.com API로 예약 생성 요청
    const response = await fetch(`${CALCOM_API_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        eventTypeId: bookingData.eventTypeId,
        start: bookingData.start,
        end: bookingData.end,
        attendee: {
          name: bookingData.attendee.name,
          email: bookingData.attendee.email,
          timeZone: bookingData.attendee.timeZone || 'Asia/Seoul'
        },
        metadata: {
          source: 'familyoffice-website',
          notes: bookingData.notes || '',
          ...bookingData.metadata
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Cal.com API 에러: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const newBooking = await response.json()

    // 성공 응답
    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: '예약이 성공적으로 생성되었습니다.'
    })

  } catch (error) {
    console.error('예약 생성 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '예약 생성에 실패했습니다.', 
        details: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    )
  }
}

// PATCH: 예약 상태 업데이트
export async function PATCH(request: NextRequest) {
  if (!CALCOM_API_KEY) {
    return NextResponse.json(
      { error: 'Cal.com API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: '예약 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    const response = await fetch(`${CALCOM_API_URL}/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`Cal.com API 에러: ${response.status}`)
    }

    const updatedBooking = await response.json()

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: '예약이 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('예약 업데이트 실패:', error)
    return NextResponse.json(
      { error: '예약 업데이트에 실패했습니다.', details: error },
      { status: 500 }
    )
  }
} 