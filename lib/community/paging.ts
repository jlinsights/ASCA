// 게시판 쪽 넘기기 — 마지막으로 본 글(작성 시각·ID)을 기준으로 그보다 오래된 글을 잇는다(keyset).
// 쪽 번호(offset)와 달리 새 글이 올라와도 글이 밀리거나 겹치지 않는다. 서버 전용(Buffer 사용).

const BOARD_PATH = '/community/board'
const CURSOR_MAX = 200
const SEP = '~'
// PostgREST 가 돌려주는 timestamptz 모양 그대로 — 마이크로초를 잃지 않게 Date 로 바꾸지 않는다
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface Cursor {
  createdAt: string
  id: string
}

/** 이 쪽의 마지막 글로 다음 쪽 표지를 만든다 */
export function encodeCursor(row: { created_at: string; id: string }): string {
  return Buffer.from(`${row.created_at}${SEP}${row.id}`).toString('base64url')
}

/** 주소의 ?before= 를 읽는다. 모양이 조금이라도 다르면 null(첫 쪽) */
export function decodeCursor(raw: string | string[] | undefined | null): Cursor | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value || value.length > CURSOR_MAX || !/^[A-Za-z0-9_-]+$/.test(value)) return null
  const [createdAt, id, ...rest] = Buffer.from(value, 'base64url').toString('utf8').split(SEP)
  if (rest.length || !createdAt || !id) return null
  if (!TIMESTAMP.test(createdAt) || !UUID.test(id)) return null
  return { createdAt, id }
}

/** PostgREST or() — 더 이른 시각이거나, 같은 시각이면 ID 가 더 작은 글 */
export function beforeFilter({ createdAt, id }: Cursor): string {
  return `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`
}

/** 탭·검색어를 유지한 게시판 주소. before 가 없으면 첫 쪽 */
export function pageHref({
  view,
  search,
  before = null,
}: {
  view: 'all' | 'mine'
  search: string | null
  before?: string | null
}): string {
  const params = new URLSearchParams()
  if (view === 'mine') params.set('view', 'mine')
  if (search) params.set('q', search)
  if (before) params.set('before', before)
  const query = params.toString()
  return query ? `${BOARD_PATH}?${query}` : BOARD_PATH
}
