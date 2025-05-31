import { supabase, type Database } from '@/lib/supabase'

type Artist = Database['public']['Tables']['artists']['Row']
type ArtistInsert = Database['public']['Tables']['artists']['Insert']
type ArtistUpdate = Database['public']['Tables']['artists']['Update']

/**
 * 모든 작가 조회
 */
export async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching artists:', error)
    throw new Error('작가 목록을 불러오는데 실패했습니다.')
  }

  return data || []
}

/**
 * 특정 작가 조회
 */
export async function getArtist(id: string): Promise<Artist | null> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // 작가를 찾을 수 없음
    }
    console.error('Error fetching artist:', error)
    throw new Error('작가 정보를 불러오는데 실패했습니다.')
  }

  return data
}

/**
 * 작가 생성
 */
export async function createArtist(artist: ArtistInsert): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .insert([artist])
    .select()
    .single()

  if (error) {
    console.error('Error creating artist:', error)
    throw new Error('작가 생성에 실패했습니다.')
  }

  return data
}

/**
 * 작가 정보 업데이트
 */
export async function updateArtist(id: string, updates: ArtistUpdate): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating artist:', error)
    throw new Error('작가 정보 업데이트에 실패했습니다.')
  }

  return data
}

/**
 * 작가 삭제
 */
export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting artist:', error)
    throw new Error('작가 삭제에 실패했습니다.')
  }
}

/**
 * 작가명으로 검색
 */
export async function searchArtists(query: string): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%,name_ja.ilike.%${query}%,name_zh.ilike.%${query}%`)
    .order('name')

  if (error) {
    console.error('Error searching artists:', error)
    throw new Error('작가 검색에 실패했습니다.')
  }

  return data || []
}

/**
 * 국적별 작가 조회
 */
export async function getArtistsByNationality(nationality: string): Promise<Artist[]> {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('nationality', nationality)
    .order('name')

  if (error) {
    console.error('Error fetching artists by nationality:', error)
    throw new Error('국적별 작가 조회에 실패했습니다.')
  }

  return data || []
} 