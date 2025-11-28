import { ensureSupabase, type Database } from '../supabase'
import { AppError } from '@/lib/utils/error-handler'
import { log } from '@/lib/utils/logger'

type Artist = Database['public']['Tables']['artists']['Row']
type ArtistInsert = Database['public']['Tables']['artists']['Insert']
type ArtistUpdate = Database['public']['Tables']['artists']['Update']

export interface ArtistFilters {
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

/**
 * 모든 작가 조회
 */
export async function getArtists(
  filters?: ArtistFilters,
  sort?: ArtistSortOptions,
  page: number = 1,
  limit: number = 12
): Promise<{ artists: Artist[]; total: number }> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) {
      // Supabase가 설정되지 않았을 때 더미 데이터 반환
      log.warn('Supabase not configured, returning mock data')
      return {
        artists: [],
        total: 0
      }
    }
    
    const { data: artistsData, error: artistsError } = await supabase
      .from('artists')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    if (artistsError) {
      log.error('getArtists error', artistsError)
      throw new AppError('작가 목록을 불러오는 데 실패했습니다.', 500, artistsError.code)
    }
    return {
      artists: artistsData || [],
      total: artistsData?.length || 0
    }
  } catch (error) {
    log.error('getArtists unexpected error', error)
    // 에러 발생 시 빈 배열 반환
    return {
      artists: [],
      total: 0
    }
  }
}

/**
 * 특정 작가 조회
 */
export async function getArtist(id: string): Promise<Artist | null> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()
    if (artistError) {
      if (artistError.code === 'PGRST116') {
        return null
      }
      log.error('getArtist error', artistError)
      throw new AppError('작가 정보를 불러오는 데 실패했습니다.', 500, artistError.code)
    }
    return artistData
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
    const { error: createArtistError } = await supabase
      .from('artists')
      .insert([artist])
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
      .select('*')
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
export async function searchArtists(query: string, limit: number = 20): Promise<Artist[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: searchedArtistsData, error: searchArtistsError } = await supabase
      .from('artists')
      .select('*')
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
export async function getArtistsByNationality(nationality: string): Promise<Artist[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: artistsByNationalityData, error: artistsByNationalityError } = await supabase
      .from('artists')
      .select('*')
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

export async function getFeaturedArtists(limit: number = 6): Promise<Artist[]> {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    const { data: featuredArtistsData, error: featuredArtistsError } = await supabase
      .from('artists')
      .select('*')
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