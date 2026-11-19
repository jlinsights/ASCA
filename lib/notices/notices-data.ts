import { cache } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { Notice } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'

/**
 * 공지 읽기(서버) — 공개 공지는 수십 건이라 한 번에 읽고, 분류·검색·연도 묶기는 화면에서 한다(행사 목록과 같은 방식).
 * 익명 키로 읽으므로 비공개 공지는 RLS(notices_public_read)와 is_published 가 가린다.
 * 예전 목록은 브라우저에서 10건씩 읽고 그 안에서 고정 공지를 골라, 2쪽부터 고정 공지가 사라졌다.
 */

/** 한 번에 읽는 최대 건수 — 2026-11-03 기준 43건, 넉넉히 */
const MAX_NOTICES = 500

/** search_vector(tsvector)는 화면에 쓰지 않으니 받지 않는다 */
const NOTICE_COLUMNS =
  'id, title, content, excerpt, category, is_pinned, is_published, views, author_name, created_at, updated_at, published_at'

export const listPublishedNotices = cache(async (): Promise<Notice[]> => {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('notices')
    .select(NOTICE_COLUMNS)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(MAX_NOTICES)
  if (error) {
    log.error('notices list load failed', error)
    throw new Error('공지사항을 불러오지 못했습니다.')
  }
  return (data ?? []) as Notice[]
})

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const getPublishedNotice = cache(async (id: string): Promise<Notice | null> => {
  // uuid 가 아닌 주소는 묻지 않고 404 — PostgREST 가 uuid 형변환 오류(22P02)를 낸다
  if (!UUID.test(id)) return null
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notices')
    .select(NOTICE_COLUMNS)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error) {
    log.error('notice load failed', error)
    throw new Error('공지사항을 불러오지 못했습니다.')
  }
  return (data as Notice | null) ?? null
})
