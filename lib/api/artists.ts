import { PUBLIC_ARTIST_COLUMNS } from './public-artist-columns'
import { ensureSupabase, type ArtistRow, type ArtistInsert, type ArtistUpdate } from '../supabase'
import { AppError } from '@/lib/utils/error-handler'
import { log } from '@/lib/utils/logger'
import { toPublicArtist, type ArtistDbRow, type PublicArtist } from './artist-mapper'

type Artist = ArtistRow

export interface ArtistFilters {
  search?: string
  title?: string[]
  membershipType?: string[]
  artistType?: string[]
  nationality?: string[]
  specialties?: string[]
  hasArtworks?: boolean
  birthYearRange?: {
    min: number
    max: number
  }
}

export interface ArtistSortOptions {
  field: 'name' | 'created_at' | 'birth_year' | 'artworks_count'
  direction: 'asc' | 'desc'
}

const WITHDRAWN = '탈퇴'
export const MAX_ARTISTS_PAGE_SIZE = 60

/** 1-based page/limit → PostgREST range(from, to). limit 은 1..MAX 로 자른다. */
export function pageRange(page: number, limit: number): { from: number; to: number } {
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 1, 1), MAX_ARTISTS_PAGE_SIZE)
  const safePage = Math.max(Math.trunc(page) || 1, 1)
  const from = (safePage - 1) * safeLimit
  return { from, to: from + safeLimit - 1 }
}

/**
 * 검색어를 PostgREST or() 필터에 넣을 수 있게 정리한다.
 * 쉼표·괄호·마침표는 필터 구문을, %·* 는 와일드카드를 깨뜨리므로 지운다.
 */
export function sanitizeSearchTerm(raw: string | undefined): string {
  return (raw ?? '')
    .replace(/[,().%*\\:"']/g, ' ')
    .trim()
    .slice(0, 50)
}

/**
 * 직함 원본이 '고 문'·'감 사'·'이 사 장' 처럼 글자 사이에 공백을 넣어 둔다.
 * '고문' 으로 골라도 맞도록 글자 사이에 % 를 끼운 ILIKE 패턴을 만든다.
 */
export function spacingTolerantPattern(term: string): string {
  const chars = [...term.replace(/[\s%_\\]/g, '')]
  return `%${chars.join('%')}%`
}

/**
 * 작가 목록 조회 (서버 페이지네이션)
 */
export async function getArtists(
  filters?: ArtistFilters,
  sort?: ArtistSortOptions,
  page: number = 1,
  limit: number = 12
): Promise<{ artists: PublicArtist[]; total: number }> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) {
      // Supabase가 설정되지 않았을 때 더미 데이터 반환
      log.warn('Supabase not configured, returning mock data')
      return {
        artists: [],
        total: 0,
      }
    }

    const { from, to } = pageRange(page, limit)
    // membership_type 은 '초대작가, 운영위원' 처럼 쉼표로 이어진 값이라 부분 일치로 거른다.
    // 탈퇴 회원은 공개 목록에서 뺀다.
    let query = supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS, { count: 'exact' })
      .or(`membership_type.is.null,membership_type.not.ilike.*${WITHDRAWN}*`)

    const search = sanitizeSearchTerm(filters?.search)
    if (search) {
      query = query.or(
        `name.ilike.*${search}*,name_zh.ilike.*${search}*,name_en.ilike.*${search}*,art_name_ko.ilike.*${search}*,art_name_hanja.ilike.*${search}*`
      )
    }
    const membership = filters?.membershipType?.[0]
    if (membership) query = query.ilike('membership_type', spacingTolerantPattern(membership))
    const artistType = filters?.artistType?.[0]
    if (artistType) query = query.eq('artist_type', artistType)
    const specialty = filters?.specialties?.[0]
    if (specialty) query = query.contains('specialties', [specialty])
    const title = filters?.title?.[0]
    if (title) query = query.ilike('title', spacingTolerantPattern(title))
    const nationality = filters?.nationality?.[0]
    if (nationality) query = query.eq('nationality', nationality)

    // 일괄 이관이라 created_at 이 대부분 같다 — 이름+id 로 정렬해야 페이지 경계가 흔들리지 않는다
    const {
      data: artistsData,
      error: artistsError,
      count,
    } = await query.order('name').order('id').range(from, to)
    if (artistsError) {
      log.error('getArtists error', artistsError)
      throw new AppError('작가 목록을 불러오는 데 실패했습니다.', 500, artistsError.code)
    }
    const rows = (artistsData ?? []) as unknown as ArtistDbRow[]
    return {
      artists: rows.map(toPublicArtist),
      total: count ?? rows.length,
    }
  } catch (error) {
    log.error('getArtists unexpected error', error)
    // 에러 발생 시 빈 배열 반환
    return {
      artists: [],
      total: 0,
    }
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export type ArtistKey =
  | { kind: 'id'; value: string }
  | { kind: 'slug'; value: string }
  | { kind: 'invalid' }

/**
 * 주소 조각이 uuid 인지 slug 인지 가른다. uuid 컬럼에 slug 를 그대로 넣으면 22P02 로 500 이 난다.
 * slug 는 DB 제약(artists_slug_format)과 같은 모양만 받는다 — 그 밖은 어떤 작가와도 맞지 않는다.
 */
export function parseArtistKey(raw: string): ArtistKey {
  if (UUID_PATTERN.test(raw)) return { kind: 'id', value: raw.toLowerCase() }
  const slug = raw.toLowerCase()
  if (SLUG_PATTERN.test(slug)) return { kind: 'slug', value: slug }
  return { kind: 'invalid' }
}

/**
 * 특정 작가 조회 — uuid, 대표 slug, 옛 주소(slug_aliases) 어느 것으로도 찾는다.
 * 비공개 작가는 RLS 가 가려 null 이 된다.
 */
export async function getArtist(idOrSlug: string): Promise<ArtistDbRow | null> {
  const key = parseArtistKey(idOrSlug)
  if (key.kind === 'invalid') return null
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const byColumn = (column: 'id' | 'slug') =>
      supabase.from('artists').select(PUBLIC_ARTIST_COLUMNS).eq(column, key.value).maybeSingle()
    const first = await byColumn(key.kind)
    if (first.error) {
      log.error('getArtist error', first.error)
      throw new AppError('작가 정보를 불러오는 데 실패했습니다.', 500, first.error.code)
    }
    if (first.data || key.kind === 'id') return (first.data as ArtistDbRow | null) ?? null

    const alias = await supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS)
      .contains('slug_aliases', [key.value])
      .limit(1)
    if (alias.error) {
      log.error('getArtist alias error', alias.error)
      throw new AppError('작가 정보를 불러오는 데 실패했습니다.', 500, alias.error.code)
    }
    return ((alias.data ?? [])[0] as ArtistDbRow | undefined) ?? null
  } catch (error) {
    log.error('getArtist unexpected error', error)
    throw error
  }
}

/**
 * 작가 생성
 */
export async function createArtist(artist: ArtistInsert): Promise<Artist> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { error: createArtistError } = await supabase.from('artists').insert([artist])
    if (createArtistError) {
      log.error('createArtist error', createArtistError)
      throw new AppError('작가 생성에 실패했습니다.', 500, createArtistError.code)
    }
    return artist as Artist
  } catch (error) {
    log.error('createArtist unexpected error', error)
    throw error
  }
}

/**
 * 작가 정보 업데이트
 */
export async function updateArtist(id: string, updates: ArtistUpdate): Promise<Artist> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: updatedArtistData, error: updateArtistError } = await supabase
      .from('artists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (updateArtistError) {
      log.error('updateArtist error', updateArtistError)
      throw new AppError('작가 정보 업데이트에 실패했습니다.', 500, updateArtistError.code)
    }
    return updatedArtistData
  } catch (error) {
    log.error('updateArtist unexpected error', error)
    throw error
  }
}

/**
 * 작가 삭제
 */
export async function deleteArtist(id: string): Promise<void> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: deletedArtistData, error: deleteArtistError } = await supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS)
      .eq('id', id)
      .single()
    if (deleteArtistError) {
      log.error('deleteArtist error', deleteArtistError)
      throw new AppError('작가 삭제에 실패했습니다.', 500, deleteArtistError.code)
    }
  } catch (error) {
    log.error('deleteArtist unexpected error', error)
    throw error
  }
}

/**
 * 작가명으로 검색
 */
export async function searchArtists(query: string, limit: number = 20): Promise<ArtistDbRow[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: searchedArtistsData, error: searchArtistsError } = await supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS)
      .or(`name.ilike.%${query}%,bio.ilike.%${query}%,nationality.ilike.%${query}%`)
      .limit(limit)
    if (searchArtistsError) {
      log.error('searchArtists error', searchArtistsError)
      throw new AppError('작가 검색에 실패했습니다.', 500, searchArtistsError.code)
    }
    return searchedArtistsData || []
  } catch (error) {
    log.error('searchArtists unexpected error', error)
    throw error
  }
}

/**
 * 국적별 작가 조회
 */
export async function getArtistsByNationality(nationality: string): Promise<ArtistDbRow[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: artistsByNationalityData, error: artistsByNationalityError } = await supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS)
      .eq('nationality', nationality)
      .order('name')
    if (artistsByNationalityError) {
      log.error('getArtistsByNationality error', artistsByNationalityError)
      throw new AppError('국적별 작가 조회에 실패했습니다.', 500, artistsByNationalityError.code)
    }
    return artistsByNationalityData || []
  } catch (error) {
    log.error('getArtistsByNationality unexpected error', error)
    throw error
  }
}

export async function getFeaturedArtists(limit: number = 6): Promise<ArtistDbRow[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: featuredArtistsData, error: featuredArtistsError } = await supabase
      .from('artists')
      .select(PUBLIC_ARTIST_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (featuredArtistsError) {
      log.error('getFeaturedArtists error', featuredArtistsError)
      throw new AppError('추천 작가를 불러오는 데 실패했습니다.', 500, featuredArtistsError.code)
    }
    return featuredArtistsData || []
  } catch (error) {
    log.error('getFeaturedArtists unexpected error', error)
    throw error
  }
}
