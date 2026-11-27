import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { getArtist } from '@/lib/api/artists'
import { getSupabaseClient } from '@/lib/supabase'
import { log } from '@/lib/utils/logger'
import { artNameLabel, type ArtistDbRow } from '@/lib/api/artist-mapper'
import { artistNativeName } from '@/lib/api/artist-name'
import { ArtistProfile } from './_components/artist-profile'
import { canonicalArtistPath } from './_components/canonical-artist-path'
import { loadRelatedArtists } from './_components/load-related-artists'
import {
  orderWorks,
  toArtistWork,
  type ArtistWork,
  type ArtworkRow,
} from './_components/artist-works'

/**
 * 작가 상세 — 서버에서 작가와 공개 작품을 읽어 한 번에 그린다.
 * 예전에는 클라이언트가 /api 두 번을 불러 그렸고, 검색 엔진에는 빈 화면만 보였다(2026-10-25).
 * 주소 조각은 uuid·slug·옛 주소(slug_aliases) 모두 받는다. 비공개 작가는 RLS 가 가려 404.
 * 대표 slug 가 있으면 uuid·옛 주소로 온 요청은 대표 주소(/artists/<slug>)로 307 한다 —
 * 목록 카드·옛 링크·북마크로 들어와도 주소창에 slug 가 보이게(2026-11-27).
 * 영구(308)로 두지 않는다: slug 는 바뀔 수 있어(scripts/set-artist-slug.mjs) A→B 를 캐시한 브라우저가
 * 되돌린 B→A 와 맞물려 무한 이동에 빠진다. 검색 엔진용 대표 주소는 canonical 이 맡는다.
 */

type PageProps = { params: Promise<{ id: string }> }

const loadArtist = cache(async (key: string): Promise<ArtistDbRow | null> => getArtist(key))

async function loadWorks(artistId: string): Promise<ArtistWork[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('artworks')
    .select('id,title,title_en,year_created,style,tags,images')
    .eq('artist_id', artistId)
    .eq('status', 'published')
  // 작품을 못 읽어도 작가 소개는 보여 준다
  if (error) {
    log.error('artist works load failed', error)
    return []
  }
  return orderWorks(((data ?? []) as ArtworkRow[]).map(toArtistWork))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const artist = await loadArtist(decodeURIComponent((await params).id))
  if (!artist) return { title: '작가를 찾을 수 없습니다 | 동양서예협회' }
  const name = artistNativeName({
    name: artist.name,
    nationality: artist.nationality,
    nameJa: artist.name_ja,
    nameZh: artist.name_zh,
  })
  const description =
    artist.bio?.replace(/\s+/g, ' ').trim().slice(0, 150) ||
    `${name} — 동양서예협회 ${artist.membership_type ?? '작가'}`
  // 아호로 찾는 사람이 많다 — '井巖 김형석'·'글꽃 이영희' 처럼 호를 이름 앞에
  const artName = artNameLabel(artist.art_name_ko, artist.art_name_hanja)
  return {
    title: `${artName ? `${artName} ` : ''}${name} | 동양서예협회`,
    description,
    alternates: artist.slug ? { canonical: `/artists/${artist.slug}` } : undefined,
    openGraph: artist.profile_image ? { images: [artist.profile_image] } : undefined,
  }
}

export default async function ArtistPage({ params }: PageProps) {
  const requested = decodeURIComponent((await params).id)
  const artist = await loadArtist(requested)
  if (!artist) notFound()
  const canonical = canonicalArtistPath(requested, artist.slug)
  if (canonical) redirect(canonical)
  const works = await loadWorks(artist.id)
  // 이 작가가 쓴 서체 — 같은 서체를 쓰는 작가를 함께 보는 작가로 건다
  const styles = [...new Set(works.flatMap(work => (work.style ? [work.style] : [])))]
  const related = await loadRelatedArtists(artist, styles)
  return <ArtistProfile artist={artist} works={works} related={related} />
}
