import { getArtist } from '@/lib/api/artists'
import { log } from '@/lib/utils/logger'
import { FEATURED_HOMEPAGES } from './featured-homepages'
import type { FeaturedArtist } from './featured-homepages-section'

/**
 * 홈페이지 작가의 이름·호·사진을 읽는다. getArtist 는 anon 클라이언트라 비공개 작가는 RLS 가 가린다.
 * 못 읽은 작가는 빼고 보여 준다 — 이 칸 때문에 작가 목록 전체가 죽지 않게.
 */
export async function loadFeaturedHomepages(): Promise<FeaturedArtist[]> {
  const rows = await Promise.all(
    FEATURED_HOMEPAGES.map(async entry => {
      try {
        const artist = await getArtist(entry.slug)
        return artist ? { entry, artist } : null
      } catch (error) {
        log.error('featured homepage artist load failed', error)
        return null
      }
    })
  )
  return rows.flatMap(row =>
    row
      ? [
          {
            slug: row.entry.slug,
            name: row.artist.name,
            nameEn: row.artist.name_en,
            artNameHanja: row.artist.art_name_hanja ?? null,
            profileImage: row.artist.profile_image,
            deathYear: row.artist.death_year,
            sites: row.entry.sites,
            role: row.entry.role ?? null,
            note: row.entry.note ?? null,
            story: row.entry.story ?? null,
          },
        ]
      : []
  )
}
