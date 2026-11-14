import { getArtists, type ArtistFilters } from '@/lib/api/artists'
import { toPublicArtist, type ArtistDbRow, type PublicArtist } from '@/lib/api/artist-mapper'
import { PUBLIC_ARTIST_COLUMNS } from '@/lib/api/public-artist-columns'
import { getSupabaseClient } from '@/lib/supabase'
import { log } from '@/lib/utils/logger'
import { artistRankLinks } from '@/components/layout/site-menu'
import { toArtistWork, type ArtworkRow } from '../[id]/_components/artist-works'

/** 레일 한 칸 — 작가와, 있으면 그 작가의 최근 작품 한 점 */
export interface ArtistRailItem {
  artist: PublicArtist
  cover: { src: string; width: number | null; height: number | null } | null
}

export interface ArtistRail {
  key: string
  /** 제목 번역 키 — 직함·등급 레일은 메뉴와 같은 키를 쓴다 */
  labelKey: string
  /** '모두 보기' 주소. 없으면 링크를 달지 않는다 */
  href: string | null
  items: ArtistRailItem[]
}

export const RAIL_SIZE = 12
/** 이보다 적으면 한 줄로 세우기엔 허전하다 — 레일을 내리고 아래 전체 목록에 맡긴다 */
export const RAIL_MIN = 6
const WITHDRAWN = '탈퇴'
const RECENT_WORKS_SCAN = 300

/** 사진 있는 작가를 앞에 — 나머지 순서(이름·최근순)는 지킨다 */
export function photoFirst(items: ArtistRailItem[]): ArtistRailItem[] {
  return [...items].sort(
    (a, b) =>
      Number(Boolean(b.cover || b.artist.profileImage)) -
      Number(Boolean(a.cover || a.artist.profileImage))
  )
}

function finishRail(rail: ArtistRail): ArtistRail | null {
  if (rail.items.length < RAIL_MIN) return null
  return { ...rail, items: photoFirst(rail.items).slice(0, RAIL_SIZE) }
}

/** 메뉴 주소(/artists?title=고문)를 getArtists 조건으로 — 메뉴와 같은 조건이어야 '모두 보기'와 내용이 맞는다 */
export function filtersFromHref(href: string): ArtistFilters {
  const params = new URL(href, 'https://local').searchParams
  const membershipType = params.get('membershipType')
  const title = params.get('title')
  return {
    membershipType: membershipType ? [membershipType] : undefined,
    title: title ? [title] : undefined,
  }
}

async function loadRankRail(labelKey: string, href: string): Promise<ArtistRail | null> {
  // 사진 있는 작가를 고를 여유를 두고 한 쪽(최대 60명)을 받는다
  const { artists } = await getArtists(filtersFromHref(href), undefined, 1, 60)
  return finishRail({
    key: href,
    labelKey,
    href,
    items: artists.map(artist => ({ artist, cover: null })),
  })
}

/** 최근에 작품이 걸린 작가 — 공개 작가의 게시된 작품 중 이미지가 있는 것, 새것부터 작가당 한 점 */
async function loadRecentWorksRail(): Promise<ArtistRail | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data: works, error } = await supabase
    .from('artworks')
    .select('id,title,title_en,year_created,style,tags,images,artist_id,created_at')
    .eq('status', 'published')
    .not('artist_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(RECENT_WORKS_SCAN)
  if (error) throw error

  const covers = new Map<string, ArtistRailItem['cover']>()
  for (const row of (works ?? []) as (ArtworkRow & { artist_id: string })[]) {
    if (covers.has(row.artist_id)) continue
    const work = toArtistWork(row)
    if (!work.imageUrl) continue
    covers.set(row.artist_id, { src: work.imageUrl, width: work.width, height: work.height })
    if (covers.size >= RAIL_SIZE * 2) break
  }
  if (covers.size < RAIL_MIN) return null

  // 공개 여부는 RLS(anon)가 거른다 — 비공개 작가의 작품은 여기서 작가 행이 오지 않아 빠진다
  const { data: rows, error: artistsError } = await supabase
    .from('artists')
    .select(PUBLIC_ARTIST_COLUMNS)
    .in('id', [...covers.keys()])
  if (artistsError) throw artistsError

  const byId = new Map(
    ((rows ?? []) as unknown as ArtistDbRow[])
      .filter(row => !row.membership_type?.includes(WITHDRAWN))
      .map(row => [row.id, toPublicArtist(row)])
  )
  const items = [...covers.entries()].flatMap(([id, cover]) => {
    const artist = byId.get(id)
    return artist ? [{ artist, cover }] : []
  })
  return finishRail({ key: 'recent-works', labelKey: 'arRecentWorks', href: '/artworks', items })
}

async function settle(label: string, load: () => Promise<ArtistRail | null>) {
  try {
    return await load()
  } catch (error) {
    // 레일 하나가 실패해도 페이지와 아래 전체 목록은 그대로 보인다
    log.error(`artist rail load failed: ${label}`, error)
    return null
  }
}

/** 조건 없이 들어왔을 때 위에 거는 줄들. 실패한 줄·허전한 줄은 뺀다 */
export async function loadArtistRails(): Promise<ArtistRail[]> {
  const rails = await Promise.all([
    settle('recent-works', loadRecentWorksRail),
    ...artistRankLinks.map(link => settle(link.href, () => loadRankRail(link.labelKey, link.href))),
  ])
  return rails.filter((rail): rail is ArtistRail => rail !== null)
}
