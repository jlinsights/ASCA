'use client'

import { useEffect, useRef } from 'react'
import { incrementEventViews } from '@/lib/supabase/cms'
import { log } from '@/lib/utils/logger'

/** 조회수를 방문당 한 번 올린다 — 화면은 서버가 그리고, 집계만 브라우저에서. 실패해도 화면에는 영향 없음 */
export function EventViewBeacon({ eventId }: { eventId: string }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    incrementEventViews(eventId).catch(err => log.error('event views increment failed', err))
  }, [eventId])
  return null
}
