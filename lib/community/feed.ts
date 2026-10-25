import 'server-only'
import { z } from 'zod'
import { archiveWriter } from '@/lib/archive/writer'
import {
  FEED_LIMIT,
  THREAD_COLUMNS,
  toThreadView,
  type PublicArtistLink,
  type ThreadModerationState,
  type ThreadRow,
  type ThreadView,
} from './threads'

/**
 * 게시판 읽기 — 표는 service_role 로만 읽히므로(RLS 우회) 여기서 반드시
 * 숨김·삭제 행을 거르고, 작성자 작가 정보도 공개(visibility='public') 행에서만 가져온다.
 * 준회원·공모작가는 트리거가 hidden 으로 강제하므로 이 조건 하나로 비공개 등급이 빠진다.
 */

type Db = ReturnType<typeof archiveWriter>

export interface ThreadFeed {
  threads: ThreadView[]
  total: number
}

export async function listThreads(limit = FEED_LIMIT): Promise<ThreadFeed> {
  const db = archiveWriter()
  const { data, error, count } = await db
    .from('community_threads')
    .select(THREAD_COLUMNS, { count: 'exact' })
    .is('hidden_at', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  const rows = (data ?? []) as ThreadRow[]
  return { threads: await withAuthors(db, rows), total: count ?? rows.length }
}

/**
 * 글 하나. 숨김·삭제 글은 없는 글처럼 null — 관리자 화면에서만 숨김 글을 보여 줄 수 있다.
 */
export async function getThread(
  id: string,
  { includeHidden = false }: { includeHidden?: boolean } = {}
): Promise<{ thread: ThreadView; moderation: ThreadModerationState } | null> {
  if (!z.string().uuid().safeParse(id).success) return null
  const db = archiveWriter()
  const { data, error } = await db
    .from('community_threads')
    .select(`${THREAD_COLUMNS},hidden_at,hidden_reason`)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const {
    hidden_at: hiddenAt,
    hidden_reason: hiddenReason,
    ...row
  } = data as ThreadRow & {
    hidden_at: string | null
    hidden_reason: string | null
  }
  if (hiddenAt && !includeHidden) return null
  const [thread] = await withAuthors(db, [row])
  if (!thread) return null
  return { thread, moderation: { hiddenAt, hiddenReason } }
}

async function withAuthors(db: Db, rows: ThreadRow[]): Promise<ThreadView[]> {
  const ids = [...new Set(rows.map(row => row.author_id).filter((id): id is string => !!id))]
  if (!ids.length) return rows.map(row => toThreadView(row, new Map(), new Map()))
  const [profiles, artists] = await Promise.all([
    db.from('account_profiles').select('id,display_name').in('id', ids),
    db
      .from('artists')
      .select('id,slug,name,profile_image,membership_type,claimed_by_user_id')
      .eq('visibility', 'public')
      .in('claimed_by_user_id', ids),
  ])
  if (profiles.error) throw profiles.error
  if (artists.error) throw artists.error
  const names = new Map((profiles.data ?? []).map(p => [p.id, p.display_name]))
  const linked = new Map<string, PublicArtistLink>()
  for (const artist of (artists.data ?? []) as PublicArtistLink[])
    if (artist.claimed_by_user_id && !linked.has(artist.claimed_by_user_id))
      linked.set(artist.claimed_by_user_id, artist)
  return rows.map(row => toThreadView(row, names, linked))
}
