import { getArtists } from '@/lib/api/artists'
import { toPublicArtist, type ArtistDbRow, type PublicArtist } from '@/lib/api/artist-mapper'
import { PUBLIC_ARTIST_COLUMNS } from '@/lib/api/public-artist-columns'
import { getSupabaseClient } from '@/lib/supabase'
import { log } from '@/lib/utils/logger'
import { regulationGrade, storedGradeValue } from '../../_components/artist-filter-options'
import {
  photoFirst,
  RAIL_MIN,
  RAIL_SIZE,
  type ArtistRail,
  type ArtistRailItem,
} from '../../_components/load-artist-rails'

const WITHDRAWN = '탈퇴'
/** PostgREST 한 번 응답 한도 — 이 크기로 끝까지 넘겨 읽는다 */
const STYLE_PAGE = 1000
/** 비정상적으로 커져도 작가 페이지 한 번에 이만큼만 읽는다(넘으면 기록) */
const STYLE_MAX_PAGES = 20
/** 작가 행을 읽어 볼 순위 상위 후보 — 탈퇴 작가를 뺀 뒤에 자른다(먼저 자르면 뒤 순위 적격 작가가 사라진다) */
const CANDIDATE_MAX = 100

interface StyleRow {
  artist_id: string | null
  style: string | null
}

/**
 * 서체가 겹치는 작가 순위 — 같은 서체 종류가 많을수록, 같으면 겹치는 작품이 많을수록 앞.
 * 자기 자신은 뺀다.
 */
export function rankByStyles(rows: StyleRow[], styles: string[], selfId: string): string[] {
  const wanted = new Set(styles)
  const score = new Map<string, { kinds: Set<string>; works: number }>()
  for (const row of rows) {
    const style = row.style?.trim()
    if (!row.artist_id || row.artist_id === selfId || !style || !wanted.has(style)) continue
    const entry = score.get(row.artist_id) ?? { kinds: new Set<string>(), works: 0 }
    entry.kinds.add(style)
    entry.works += 1
    score.set(row.artist_id, entry)
  }
  return [...score.entries()]
    .sort(([, a], [, b]) => b.kinds.size - a.kinds.size || b.works - a.works)
    .map(([id]) => id)
}

type Client = NonNullable<ReturnType<typeof getSupabaseClient>>

/** 같은 서체의 공개 작품을 id 순으로 끝까지 — 일부만 읽고 순위를 매기면 작가가 빠지거나 순위가 틀어진다 */
async function loadStyleRows(supabase: Client, styles: string[]): Promise<StyleRow[]> {
  const rows: StyleRow[] = []
  for (let page = 0; page < STYLE_MAX_PAGES; page += 1) {
    const from = page * STYLE_PAGE
    const { data, error } = await supabase
      .from('artworks')
      .select('artist_id,style')
      .eq('status', 'published')
      .in('style', styles)
      .order('id', { ascending: true })
      .range(from, from + STYLE_PAGE - 1)
    if (error) throw error
    const batch = (data ?? []) as StyleRow[]
    rows.push(...batch)
    if (batch.length < STYLE_PAGE) return rows
  }
  log.warn(`related artists: style scan stopped at ${STYLE_MAX_PAGES * STYLE_PAGE} works`)
  return rows
}

async function loadStyleMatches(styles: string[], selfId: string): Promise<PublicArtist[]> {
  if (styles.length === 0) return []
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const styleRows = await loadStyleRows(supabase, styles)
  const ids = rankByStyles(styleRows, styles, selfId).slice(0, CANDIDATE_MAX)
  if (ids.length === 0) return []

  // 공개 여부는 RLS(anon)가 거른다 — 비공개 작가는 행이 오지 않는다
  const { data: rows, error: artistsError } = await supabase
    .from('artists')
    .select(PUBLIC_ARTIST_COLUMNS)
    .in('id', ids)
  if (artistsError) throw artistsError
  const byId = new Map(
    ((rows ?? []) as unknown as ArtistDbRow[])
      .filter(row => !row.membership_type?.includes(WITHDRAWN))
      .map(row => [row.id, toPublicArtist(row)])
  )
  return ids.flatMap(id => {
    const artist = byId.get(id)
    return artist ? [artist] : []
  })
}

async function loadSameGrade(membershipType: string | null): Promise<PublicArtist[]> {
  const grade = regulationGrade(membershipType)
  if (!grade) return []
  const { artists } = await getArtists(
    { membershipType: [storedGradeValue(grade)] },
    undefined,
    1,
    60
  )
  return artists
}

/**
 * 함께 보는 작가 — 서체가 겹치는 작가를 먼저, 모자라면 같은 등급 작가(사진 있는 사람부터)로 채운다.
 * RAIL_MIN 명이 안 되거나 실패하면 null — 작가 페이지는 그대로 보인다.
 */
export async function loadRelatedArtists(
  artist: Pick<ArtistDbRow, 'id' | 'membership_type'>,
  styles: string[]
): Promise<ArtistRail | null> {
  try {
    const byStyle = await loadStyleMatches(styles, artist.id)
    const seen = new Set([artist.id, ...byStyle.map(item => item.id)])
    const fill =
      byStyle.length >= RAIL_SIZE
        ? []
        : (await loadSameGrade(artist.membership_type)).filter(item => !seen.has(item.id))

    const toItems = (list: PublicArtist[]): ArtistRailItem[] =>
      list.map(item => ({ artist: item, cover: null }))
    // 서체가 겹치는 작가가 늘 앞 — 각 무리 안에서만 사진 있는 사람을 앞으로
    const items = [...photoFirst(toItems(byStyle)), ...photoFirst(toItems(fill))].slice(
      0,
      RAIL_SIZE
    )
    if (items.length < RAIL_MIN) return null
    return { key: 'related', labelKey: 'adRelatedTitle', href: null, items }
  } catch (error) {
    log.error('related artists load failed', error)
    return null
  }
}
