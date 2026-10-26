import 'server-only'
import { z } from 'zod'
import { archiveWriter } from '@/lib/archive/writer'
import {
  COMMENTS_LIMIT,
  COMMENT_COLUMNS,
  type CommentRow,
  type CommentView,
  type ReactionState,
} from './comments'
import { searchFilter } from './search'
import {
  FEED_LIMIT,
  THREAD_COLUMNS,
  resolveAuthor,
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

export interface ListOptions {
  limit?: number
  /** normalizeSearch 를 거친 검색어 — 제목·본문 부분 일치 */
  search?: string | null
}

export async function listThreads({
  limit = FEED_LIMIT,
  search = null,
}: ListOptions = {}): Promise<ThreadFeed> {
  const db = archiveWriter()
  let query = db
    .from('community_threads')
    .select(THREAD_COLUMNS, { count: 'exact' })
    .is('hidden_at', null)
    .is('deleted_at', null)
  if (search) query = query.or(searchFilter(search))
  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  const rows = (data ?? []) as ThreadRow[]
  return { threads: await withAuthors(db, rows), total: count ?? rows.length }
}

/** 내 글 목록에서는 사무국이 숨긴 글도 보이되, 숨김 표시를 단다 */
export interface MyThreadView extends ThreadView {
  hidden: boolean
}

/**
 * 내가 쓴 글 — 지운 글은 빼고, 사무국이 숨긴 글은 표시와 함께 넣는다(작성자가 사정을 알 수 있게).
 * 숨김 사유·처리자는 싣지 않는다.
 */
export async function listMyThreads(
  viewerId: string,
  { limit = FEED_LIMIT, search = null }: ListOptions = {}
): Promise<{ threads: MyThreadView[]; total: number }> {
  const db = archiveWriter()
  let query = db
    .from('community_threads')
    .select(`${THREAD_COLUMNS},hidden_at`, { count: 'exact' })
    .eq('author_id', viewerId)
    .is('deleted_at', null)
  if (search) query = query.or(searchFilter(search))
  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  const rows = (data ?? []) as (ThreadRow & { hidden_at: string | null })[]
  const views = await withAuthors(
    db,
    rows.map(({ hidden_at: _hidden, ...row }) => row),
    viewerId
  )
  return {
    threads: views.map((view, index) => ({ ...view, hidden: Boolean(rows[index]?.hidden_at) })),
    total: count ?? rows.length,
  }
}

/**
 * 글 하나. 숨김·삭제 글은 없는 글처럼 null — 관리자 화면에서만 숨김 글을 보여 줄 수 있다.
 * viewerId 를 주면 그 사람이 쓴 글인지(`mine`)를 함께 알린다.
 */
export async function getThread(
  id: string,
  {
    includeHidden = false,
    viewerId = null,
  }: { includeHidden?: boolean; viewerId?: string | null } = {}
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
  const [thread] = await withAuthors(db, [row], viewerId)
  if (!thread) return null
  return { thread, moderation: { hiddenAt, hiddenReason } }
}

interface AuthorMaps {
  names: Map<string, string>
  linked: Map<string, PublicArtistLink>
}

/** 작성자 표시에 쓸 이름·공개 작가 — 글과 댓글이 함께 쓴다 */
async function authorMaps(db: Db, authorIds: (string | null)[]): Promise<AuthorMaps> {
  const ids = [...new Set(authorIds.filter((id): id is string => !!id))]
  if (!ids.length) return { names: new Map(), linked: new Map() }
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
  return { names, linked }
}

async function withAuthors(
  db: Db,
  rows: ThreadRow[],
  viewerId: string | null = null
): Promise<ThreadView[]> {
  const { names, linked } = await authorMaps(
    db,
    rows.map(row => row.author_id)
  )
  return rows.map(row => toThreadView(row, names, linked, viewerId))
}

/**
 * 글의 댓글 — 숨김·삭제 댓글은 뺀다. 작성자 ID 는 내보내지 않고, 보는 사람 것인지만 표시한다.
 * 글 자체가 보이는지는 부르는 쪽(getThread)이 먼저 확인한다.
 */
export async function listComments(
  threadId: string,
  viewerId: string | null
): Promise<CommentView[]> {
  const db = archiveWriter()
  const { data, error } = await db
    .from('community_comments')
    .select(COMMENT_COLUMNS)
    .eq('thread_id', threadId)
    .is('hidden_at', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(COMMENTS_LIMIT)
  if (error) throw error
  const rows = (data ?? []) as CommentRow[]
  const { names, linked } = await authorMaps(
    db,
    rows.map(row => row.author_id)
  )
  return rows.map(row => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author: resolveAuthor(row.author_id, names, linked),
    mine: Boolean(viewerId) && row.author_id === viewerId,
  }))
}

/** 좋아요 수와 보는 사람이 눌렀는지 */
export async function getReactions(
  threadId: string,
  viewerId: string | null
): Promise<ReactionState> {
  const db = archiveWriter()
  const [total, own] = await Promise.all([
    db
      .from('community_reactions')
      .select('thread_id', { count: 'exact', head: true })
      .eq('thread_id', threadId),
    viewerId
      ? db
          .from('community_reactions')
          .select('thread_id')
          .eq('thread_id', threadId)
          .eq('account_id', viewerId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])
  if (total.error) throw total.error
  if (own.error) throw own.error
  return { count: total.count ?? 0, liked: Boolean(own.data) }
}

/** 댓글·좋아요를 받을 수 있는 글인지 — 숨김·삭제 글에는 쓰지 못한다 */
export async function isOpenThread(threadId: string): Promise<boolean> {
  const { data, error } = await archiveWriter()
    .from('community_threads')
    .select('id')
    .eq('id', threadId)
    .is('hidden_at', null)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}
