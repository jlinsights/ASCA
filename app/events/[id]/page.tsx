'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { getEventById, incrementEventViews, getRelatedEvents } from '@/lib/supabase/cms'
import type { Event } from '@/lib/types/cms-legacy'
import { EventDetailBody } from './_components/event-detail-body'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 행사 데이터 로드
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        // 행사 상세 정보 가져오기
        const eventData = await getEventById(eventId)
        if (!eventData) {
          throw new Error('행사를 찾을 수 없습니다.')
        }

        setEvent(eventData)

        // 조회수 증가
        await incrementEventViews(eventId)

        // 관련 행사 가져오기
        const relatedData = await getRelatedEvents(eventId, eventData.event_type)
        setRelatedEvents(relatedData)
      } catch (err) {
        setError('행사를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  if (loading) {
    return (
      <div className='min-h-screen bg-transparent'>
        <main className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center py-12'>
            <div className='flex items-center gap-3'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='text-lg'>행사를 불러오는 중...</span>
            </div>
          </div>
        </main>
        <LayoutFooter />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className='min-h-screen bg-transparent'>
        <main className='container mx-auto px-4 py-8'>
          <div className='text-center py-12'>
            <AlertCircle className='h-16 w-16 text-red-600 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>오류가 발생했습니다</h3>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Link href='/events'>
              <Button variant='outline'>목록으로 돌아가기</Button>
            </Link>
          </div>
        </main>
        <LayoutFooter />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <main className='container mx-auto px-4 py-8'>
        {/* 네비게이션 */}
        <div className='flex items-center gap-4 mb-8'>
          <Link href='/events'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              목록으로
            </Button>
          </Link>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Link href='/' className='hover:text-foreground'>
              홈
            </Link>
            <span>/</span>
            <Link href='/events' className='hover:text-foreground'>
              행사
            </Link>
            <span>/</span>
            <span className='text-foreground'>{event.title}</span>
          </div>
        </div>

        <EventDetailBody event={event} relatedEvents={relatedEvents} />
      </main>

      <LayoutFooter />
    </div>
  )
}
