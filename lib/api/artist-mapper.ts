/**
 * Supabase `artists` 행(snake_case) → 화면용 작가(camelCase) 변환.
 *
 * supabase-js(PostgREST)는 컬럼명을 그대로 돌려준다. 예전에는 Drizzle 에서 추론한
 * camelCase 타입(ArtistRow)을 붙여 썼기 때문에 nameEn·birthYear·profileImage 가
 * 항상 undefined 였고, membership_type 같은 컬럼은 `as any` 로 읽어야 했다.
 * 컬럼 구성은 ASCA-2026 프로젝트(caxjyimsuvjnbmjoxfad)의 public.artists 기준.
 */

export interface ArtistDbRow {
  id: string
  name: string
  name_en: string | null
  name_ja: string | null
  name_zh: string | null
  bio: string | null
  bio_en: string | null
  bio_ja: string | null
  bio_zh: string | null
  birth_year: number | null
  death_year: number | null
  nationality: string | null
  specialties: string[] | null
  awards: string[] | null
  exhibitions: string[] | null
  profile_image: string | null
  membership_type: string | null
  artist_type: string | null
  title: string | null
  created_at: string | null
  updated_at: string | null
  airtable_id: string | null
}

export interface PublicArtist {
  id: string
  name: string
  nameEn: string | null
  nameJa: string | null
  nameZh: string | null
  bio: string | null
  birthYear: number | null
  /** 고인이면 사망 연도 (2026-10 추가) */
  deathYear: number | null
  nationality: string | null
  specialties: string[]
  awards: string[]
  profileImage: string | null
  membershipType: string | null
  artistType: string | null
  title: string | null
}

export function toPublicArtist(row: ArtistDbRow): PublicArtist {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? null,
    nameJa: row.name_ja ?? null,
    nameZh: row.name_zh ?? null,
    bio: row.bio ?? null,
    birthYear: row.birth_year ?? null,
    deathYear: row.death_year ?? null,
    nationality: row.nationality ?? null,
    specialties: row.specialties ?? [],
    awards: row.awards ?? [],
    profileImage: row.profile_image ?? null,
    membershipType: row.membership_type ?? null,
    artistType: row.artist_type ?? null,
    title: row.title ?? null,
  }
}
