import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { getArtist } from '@/lib/api/artists'
import { getSupabaseClient } from '@/lib/supabase'
import { log } from '@/lib/utils/logger'
import { artNameLabel, type ArtistDbRow } from '@/lib/api/artist-mapper'
import { ArtistProfile } from './_components/artist-profile'
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
  const description =
    artist.bio?.replace(/\s+/g, ' ').trim().slice(0, 150) ||
    `${artist.name} — 동양서예협회 ${artist.membership_type ?? '작가'}`
  // 아호로 찾는 사람이 많다 — '井巖 김형석'·'글꽃 이영희' 처럼 호를 이름 앞에
  const artName = artNameLabel(artist.art_name_ko, artist.art_name_hanja)
  return {
    title: `${artName ? `${artName} ` : ''}${artist.name} | 동양서예협회`,
    description,
    alternates: artist.slug ? { canonical: `/artists/${artist.slug}` } : undefined,
    openGraph: artist.profile_image ? { images: [artist.profile_image] } : undefined,
  }
}

export default async function ArtistPage({ params }: PageProps) {
  const artist = await loadArtist(decodeURIComponent((await params).id))
  if (!artist) notFound()
  const works = await loadWorks(artist.id)
  return <ArtistProfile artist={artist} works={works} />
}
