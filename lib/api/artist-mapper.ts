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
  /** 주소용 로마자 이름 (/artists/<slug>). 없으면 null (2026-10-25 추가) */
  slug?: string | null
  /** 아호(雅號) 한글·한자. 둘 중 하나만 있을 수 있다 (2026-10-25 공개 화면 반영) */
  art_name_ko?: string | null
  art_name_hanja?: string | null
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
  /** 주소용 로마자 이름. 없으면 id 주소를 쓴다 */
  slug: string | null
  /** 아호 한글·한자. 없으면 null */
  artNameKo: string | null
  artNameHanja: string | null
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
    slug: row.slug ?? null,
    artNameKo: row.art_name_ko?.trim() || null,
    artNameHanja: row.art_name_hanja?.trim() || null,
  }
}

/**
 * 아호 표기 — 한자 아호는 한글 읽기 없이 한자 그대로('井巖'),
 * 한자가 없는 순우리말 아호('글꽃'·'강바람')는 한글 그대로. 둘을 나란히 쓰지 않는다.
 */
export function artNameLabel(
  ko: string | null | undefined,
  hanja: string | null | undefined
): string | null {
  return hanja?.trim() || ko?.trim() || null
}
