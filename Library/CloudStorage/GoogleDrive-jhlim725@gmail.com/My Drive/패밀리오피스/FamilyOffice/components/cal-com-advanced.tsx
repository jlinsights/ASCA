'use client'

import { useState, useEffect } from 'react'

// Cal.com API를 활용한 고급 기능 예시
export function CalComAdvanced() {
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  // API 키가 있을 때만 실행되는 고급 기능들
  const calcomApiKey = process.env.CALCOM_API_KEY // 서버 사이드 전용
  const calcomApiUrl = process.env.NEXT_PUBLIC_CALCOM_API_URL || 'https://api.cal.com/v1'

  // 1. 사용 가능한 시간대 조회
  const fetchAvailableSlots = async (eventType: string, startDate: string, endDate: string) => {
    if (!calcomApiKey) return

    setLoading(true)
    try {
      const response = await fetch('/api/cal-com/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, startDate, endDate })
      })
      const slots = await response.json()
      setAvailableSlots(slots)
    } catch (error) {
      console.error('시간대 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 2. 예약 자동 생성
  const createBooking = async (bookingData: {
    name: string
    email: string
    eventType: string
    startTime: string
    timeZone: string
    notes?: string
  }) => {
    try {
      const response = await fetch('/api/cal-com/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      const booking = await response.json()
      
      if (booking.success) {
        alert('예약이 완료되었습니다!')
                 // Google Analytics 이벤트 트래킹
         if (typeof window !== 'undefined' && window.gtag) {
           window.gtag('event', 'booking_completed', {
             event_category: 'engagement',
             event_label: bookingData.eventType
           })
         }
      }
      return booking
    } catch (error) {
      console.error('예약 생성 실패:', error)
      throw error
    }
  }

  // 3. 예약 목록 조회 (관리자용)
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/cal-com/bookings')
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('예약 목록 조회 실패:', error)
    }
  }

  // 4. 예약 상태 업데이트
  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'rescheduled') => {
    try {
      const response = await fetch(`/api/cal-com/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      return await response.json()
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-brand-navy">Cal.com 고급 기능</h3>
      
      {/* API 키 상태 표시 */}
      <div className={`p-4 rounded-lg ${calcomApiKey ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <p className={`text-sm ${calcomApiKey ? 'text-green-700' : 'text-yellow-700'}`}>
          {calcomApiKey ? '✅ API 키 설정됨 - 고급 기능 사용 가능' : '⚠️ API 키 없음 - 기본 임베드만 사용 가능'}
        </p>
      </div>

      {/* 고급 기능 예시들 */}
      {calcomApiKey && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">📅 시간대 조회</h4>
            <p className="text-sm text-gray-600 mb-2">사용 가능한 예약 시간을 미리 표시</p>
            <button 
              onClick={() => fetchAvailableSlots('consultation', '2024-01-01', '2024-01-31')}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={loading}
            >
              {loading ? '조회 중...' : '시간대 조회'}
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">📝 예약 관리</h4>
            <p className="text-sm text-gray-600 mb-2">예약 생성, 수정, 취소</p>
            <button 
              onClick={fetchBookings}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              예약 목록 조회
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">🔄 자동화</h4>
            <p className="text-sm text-gray-600">웹훅, 이메일 자동화, CRM 연동</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">📊 분석</h4>
            <p className="text-sm text-gray-600">예약 통계, 고객 분석, 성과 측정</p>
          </div>
        </div>
      )}

      {/* 예약 목록 표시 */}
      {bookings.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-4">최근 예약 ({bookings.length}건)</h4>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{booking.attendees?.[0]?.name || '이름 없음'}</p>
                    <p className="text-sm text-gray-600">{booking.eventType?.title}</p>
                    <p className="text-sm text-gray-500">{new Date(booking.startTime).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 타입 정의
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
} 