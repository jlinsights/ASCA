// 커뮤니티 게시판 — 입력 검사, 읽는 칸, 작성자 표시, 본문 링크 나누기. 서버·화면 공용(DB 접근 없음).
import { z } from 'zod'

export const TITLE_MAX = 120
export const BODY_MAX = 10000
export const HIDE_REASON_MAX = 500
export const FEED_LIMIT = 60
/** 글 하나에 붙일 수 있는 사진 */
export const IMAGES_MAX = 4
/** 브라우저가 줄여 보낸 파일 한도 — Vercel 요청 한도(4.5MB) 아래 */
export const IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024

/** 읽는 칸 — 숨김·삭제 정보와 처리자는 공개 읽기에 싣지 않는다 */
export const THREAD_COLUMNS = 'id,author_id,title,body,created_at,updated_at'

const text = (max: number) => z.string().trim().min(1).max(max)

export const threadCreateSchema = z.object({
  title: text(TITLE_MAX),
  body: text(BODY_MAX),
  /** 미리 올려 둔 사진(대기) — 이 순서대로 붙는다. 고치기(PATCH)에서는 쓰지 않는다 */
  imageIds: z.array(z.string().uuid()).max(IMAGES_MAX).default([]),
})
export type ThreadCreate = z.infer<typeof threadCreateSchema>

export const threadModerationSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('hide'),
    reason: z.string().trim().max(HIDE_REASON_MAX).optional(),
  }),
  z.object({ action: z.literal('restore') }),
])
export type ThreadModeration = z.infer<typeof threadModerationSchema>

export interface ThreadRow {
  id: string
  author_id: string | null
  title: string
  body: string
  created_at: string
  updated_at: string
}

/** 글 사진 — 파일은 비공개라 항상 imageSrc 경로(서버가 글이 보이는지 확인)로만 연다 */
export interface ThreadImage {
  id: string
  width: number
  height: number
}

export const imageSrc = (id: string) => `/api/community/images/${id}`

/** 작성자 표시. 공개 작가 페이지와 이어진 계정이면 작가 이름·사진·회원 구분, 아니면 표시 이름만 */
export interface ThreadAuthor {
  kind: 'artist' | 'member' | 'deleted'
  name: string | null
  role: string | null
  image: string | null
  href: string | null
}

/**
 * 화면으로 보내는 글 — 작성자 계정 ID 는 싣지 않는다(페이지 데이터로 누구에게나 보이므로).
 * 보는 사람이 쓴 글인지만 `mine` 으로 알린다.
 */
export interface ThreadView extends Omit<ThreadRow, 'author_id'> {
  author: ThreadAuthor
  edited: boolean
  mine: boolean
  /** 글 화면에서만 채운다(목록에는 없음) */
  images?: ThreadImage[]
}

/** 관리자 화면에만 넘기는 숨김 상태 */
export interface ThreadModerationState {
  hiddenAt: string | null
  hiddenReason: string | null
}

export interface PublicArtistLink {
  id: string
  slug: string | null
  name: string
  profile_image: string | null
  membership_type: string | null
  claimed_by_user_id: string | null
}

export const DELETED_AUTHOR: ThreadAuthor = {
  kind: 'deleted',
  name: null,
  role: null,
  image: null,
  href: null,
}

/** 회원 구분이 여러 개면("초대작가, 이사") 첫 번째만 보인다 */
function primaryRole(membershipType: string | null): string | null {
  const first = membershipType?.split(',')[0]?.trim()
  return first || null
}

export function resolveAuthor(
  authorId: string | null,
  displayNames: ReadonlyMap<string, string>,
  publicArtists: ReadonlyMap<string, PublicArtistLink>
): ThreadAuthor {
  if (!authorId) return DELETED_AUTHOR
  const artist = publicArtists.get(authorId)
  if (artist)
    return {
      kind: 'artist',
      name: artist.name,
      role: primaryRole(artist.membership_type),
      image: artist.profile_image,
      href: `/artists/${artist.slug ?? artist.id}`,
    }
  const name = displayNames.get(authorId)?.trim()
  return { kind: 'member', name: name || null, role: null, image: null, href: null }
}

export function toThreadView(
  row: ThreadRow,
  displayNames: ReadonlyMap<string, string>,
  publicArtists: ReadonlyMap<string, PublicArtistLink>,
  viewerId: string | null = null
): ThreadView {
  const { author_id: authorId, ...rest } = row
  return {
    ...rest,
    author: resolveAuthor(authorId, displayNames, publicArtists),
    mine: Boolean(viewerId) && authorId === viewerId,
    // 저장 직후 트리거가 updated_at 을 조금 늦게 찍을 수 있어 1분 넘게 차이 날 때만 "수정됨"
    edited: Date.parse(row.updated_at) - Date.parse(row.created_at) > 60_000,
  }
}

export type BodySegment = { kind: 'text'; value: string } | { kind: 'link'; value: string }

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"」』》〉、。]+$/

/** 평문 본문에서 http(s) 주소만 링크로 떼어 낸다. 다른 스킴(javascript: 등)은 글자 그대로 둔다 */
export function splitLinks(body: string): BodySegment[] {
  const segments: BodySegment[] = []
  let last = 0
  for (const match of body.matchAll(URL_PATTERN)) {
    const raw = match[0]
    const url = raw.replace(TRAILING_PUNCTUATION, '')
    const start = match.index ?? 0
    if (!isHttpUrl(url)) continue
    if (start > last) segments.push({ kind: 'text', value: body.slice(last, start) })
    segments.push({ kind: 'link', value: url })
    last = start + url.length
  }
  if (last < body.length) segments.push({ kind: 'text', value: body.slice(last) })
  return segments
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** 목록 카드용 미리보기 — 줄바꿈은 살리고 길이만 자른다 */
export function excerpt(body: string, max = 280): { text: string; truncated: boolean } {
  const trimmed = body.trim()
  if (trimmed.length <= max) return { text: trimmed, truncated: false }
  return { text: `${trimmed.slice(0, max).trimEnd()}…`, truncated: true }
}
