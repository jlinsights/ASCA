import { ensureSupabase, type Database } from '../supabase'

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
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) {
    
    throw new Error('작가 목록을 불러오는데 실패했습니다.')
  }

  return {
    artists: data || [],
    total: data?.length || 0
  }
}

/**
 * 특정 작가 조회
 */
export async function getArtist(id: string): Promise<Artist | null> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 작가를 찾을 수 없음
    }
    
    throw new Error('작가 정보를 불러오는데 실패했습니다.')
  }

  return data
}

/**
 * 작가 생성
 */
export async function createArtist(artist: ArtistInsert): Promise<Artist> {
  const supabase = ensureSupabase()
  const { error } = await supabase
    .from('artists')
    .insert([artist])

  if (error) {
    
    throw new Error('작가 생성에 실패했습니다.')
  }

  return artist as Artist
}

/**
 * 작가 정보 업데이트
 */
export async function updateArtist(id: string, updates: ArtistUpdate): Promise<Artist> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    
    throw new Error('작가 정보 업데이트에 실패했습니다.')
  }

  return data
}

/**
 * 작가 삭제
 */
export async function deleteArtist(id: string): Promise<void> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    
    throw new Error('작가 삭제에 실패했습니다.')
  }
}

/**
 * 작가명으로 검색
 */
export async function searchArtists(query: string, limit: number = 20): Promise<Artist[]> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%,nationality.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    
    throw new Error('작가 검색에 실패했습니다.')
  }

  return data || []
}

/**
 * 국적별 작가 조회
 */
export async function getArtistsByNationality(nationality: string): Promise<Artist[]> {
  const { data, error } = await ensureSupabase()
    .from('artists')
    .select('*')
    .eq('nationality', nationality)
    .order('name')

  if (error) {
    
    throw new Error('국적별 작가 조회에 실패했습니다.')
  }

  return data || []
}

export async function getFeaturedArtists(limit: number = 6): Promise<Artist[]> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    
    throw new Error('추천 작가를 불러오는데 실패했습니다.')
  }

  return data || []
} 