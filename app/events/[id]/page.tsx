'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero, type HeroFact } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import { getEventById, incrementEventViews, getRelatedEvents } from '@/lib/supabase/cms'
import type { Event } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'
import { EventDetailBody } from './_components/event-detail-body'
import { formatEventDateTime } from './_components/event-detail-meta'

const NOT_FOUND = '주소가 바뀌었거나 공개되지 않은 행사입니다.'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 행사 데이터 로드 — 실패로 다루는 것은 행사 본문을 못 읽었을 때뿐이다.
  // 조회수·관련 행사는 곁가지라 실패해도 본문은 보여 준다(2026-10-25: 관련 행사 쿼리 400 이 페이지 전체를 오류로 만들었다)
  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true)
      setError(null)

      let eventData: Event | null
      try {
        eventData = await getEventById(eventId)
      } catch (err) {
        log.error('event load failed', err)
        setError('행사를 불러오는데 실패했습니다.')
        setLoading(false)
        return
      }
      if (!eventData) {
        setError(NOT_FOUND)
        setLoading(false)
        return
      }
      setEvent(eventData)
      setLoading(false)

      incrementEventViews(eventId).catch(err => log.error('event views increment failed', err))
      try {
        setRelatedEvents(await getRelatedEvents(eventId, eventData.event_type))
      } catch (err) {
        log.error('related events load failed', err)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const heroTitle = event?.title ?? '행사 상세'
  const heroFacts: HeroFact[] = [
    { label: '일시', value: event ? formatEventDateTime(event.event_date) : '—' },
    { label: '장소', value: !event ? '—' : event.venue || event.location || null },
  ]
  const hero = (
    <PageHero
      {...PAGE_HERO_MARKS.events}
      tier='band'
      title={heroTitle}
      crumbs={[{ label: '행사 목록', href: '/events' }, { label: heroTitle }]}
    >
      <HeroFacts facts={heroFacts} />
    </PageHero>
  )

  if (loading) {
    return (
      <div className='min-h-screen bg-transparent'>
        {hero}
        <main className='container mx-auto px-4 py-10 md:py-16'>
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
        {hero}
        <main className='container mx-auto px-4 py-10 md:py-16'>
          <div className='text-center py-12'>
            <AlertCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              {error === NOT_FOUND ? '행사를 찾을 수 없습니다' : '오류가 발생했습니다'}
            </h3>
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
      {hero}
      <main className='container mx-auto px-4 py-10 md:py-16'>
        <EventDetailBody event={event} relatedEvents={relatedEvents} />
      </main>

      <LayoutFooter />
    </div>
  )
}
