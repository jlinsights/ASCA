import { cache } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Event } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'

/**
 * 행사 읽기(서버) — 공개 행사는 수십 건이라 한 번에 읽고 거르기·묶기는 화면에서 한다.
 * 익명 키로 public_events 뷰를 읽으므로 비공개 행사는 RLS·is_published 가 가린다.
 */

/** 한 번에 읽는 최대 건수 — 지금 26건, 넉넉히 */
const MAX_EVENTS = 500

export const listPublishedEvents = cache(async (): Promise<Event[]> => {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false })
    .limit(MAX_EVENTS)
  if (error) {
    log.error('events list load failed', error)
    throw new Error('행사 목록을 불러오지 못했습니다.')
  }
  return (data ?? []) as Event[]
})

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const getPublishedEvent = cache(async (id: string): Promise<Event | null> => {
  // uuid 가 아닌 주소는 묻지 않고 404 — PostgREST 가 uuid 형변환 오류(22P02)를 낸다
  if (!UUID.test(id)) return null
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error) {
    log.error('event load failed', error)
    throw new Error('행사를 불러오지 못했습니다.')
  }
  return (data as Event | null) ?? null
})
