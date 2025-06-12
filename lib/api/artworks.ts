import { ensureSupabase, type Database } from '../supabase'

type Artwork = Database['public']['Tables']['artworks']['Row']
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert']
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update']

// 작품과 작가 정보를 함께 가져오는 타입
export type ArtworkWithArtist = Artwork & {
  artist: {
    id: string
    name: string
    name_en: string | null
    name_ja: string | null
    name_zh: string | null
    bio: string
    bio_en: string | null
    bio_ja: string | null
    bio_zh: string | null
    profile_image: string | null
    nationality: string | null
  }
}

export interface ArtworkFilters {
  category?: string[]
  style?: string[]
  priceRange?: {
    min: number
    max: number
  }
  yearRange?: {
    min: number
    max: number
  }
  availability?: string[]
  featured?: boolean
  artistId?: string
}

export interface ArtworkSortOptions {
  field: 'created_at' | 'title' | 'year' | 'price' | 'views' | 'likes'
  direction: 'asc' | 'desc'
}

/**
 * 작품 목록 조회 (필터링, 정렬, 페이지네이션 지원)
 */
export async function getArtworks(
  filters?: ArtworkFilters,
  sort?: ArtworkSortOptions,
  page: number = 1,
  limit: number = 12
): Promise<{ artworks: ArtworkWithArtist[]; total: number }> {
  const supabase = ensureSupabase()
  let query = supabase
    .from('artworks')
    .select(`
      *,
      artist:artists(
        id,
        name,
        name_en,
        name_ja,
        name_zh,
        bio,
        bio_en,
        bio_ja,
        bio_zh,
        profile_image,
        nationality
      )
    `, { count: 'exact' })

  // 필터 적용
  if (filters) {
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category)
    }
    if (filters.style && filters.style.length > 0) {
      query = query.in('style', filters.style)
    }
    if (filters.availability && filters.availability.length > 0) {
      query = query.in('availability', filters.availability)
    }
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }
    if (filters.artistId) {
      query = query.eq('artist_id', filters.artistId)
    }
    if (filters.yearRange) {
      query = query
        .gte('year', filters.yearRange.min)
        .lte('year', filters.yearRange.max)
    }
    // 가격 필터는 JSON 필드라서 별도 처리 필요
  }

  // 정렬 적용
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // 페이지네이션
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    
    throw new Error('작품 목록을 불러오는데 실패했습니다.')
  }

  return {
    artworks: (data as ArtworkWithArtist[]) || [],
    total: count || 0
  }
}

/**
 * 특정 작품 조회
 */
export async function getArtwork(id: string): Promise<ArtworkWithArtist | null> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists(
        id,
        name,
        name_en,
        name_ja,
        name_zh,
        bio,
        bio_en,
        bio_ja,
        bio_zh,
        profile_image,
        nationality
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    
    throw new Error('작품 정보를 불러오는데 실패했습니다.')
  }

  return data as ArtworkWithArtist
}

/**
 * 작품 생성
 */
export async function createArtwork(artwork: ArtworkInsert): Promise<Artwork> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .insert([artwork])
    .select()
    .single()

  if (error) {
    
    throw new Error('작품 생성에 실패했습니다.')
  }

  return data
}

/**
 * 작품 정보 업데이트
 */
export async function updateArtwork(id: string, updates: ArtworkUpdate): Promise<Artwork> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    
    throw new Error('작품 정보 업데이트에 실패했습니다.')
  }

  return data
}

/**
 * 작품 삭제
 */
export async function deleteArtwork(id: string): Promise<void> {
  const supabase = ensureSupabase()
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)

  if (error) {
    
    throw new Error('작품 삭제에 실패했습니다.')
  }
}

/**
 * 작품 검색
 */
export async function searchArtworks(
  query: string,
  limit: number = 20
): Promise<ArtworkWithArtist[]> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists(
        id,
        name,
        name_en,
        name_ja,
        name_zh,
        bio,
        bio_en,
        bio_ja,
        bio_zh,
        profile_image,
        nationality
      )
    `)
    .or(`title.ilike.%${query}%,title_en.ilike.%${query}%,title_ja.ilike.%${query}%,title_zh.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .limit(limit)

  if (error) {
    
    throw new Error('작품 검색에 실패했습니다.')
  }

  return (data as ArtworkWithArtist[]) || []
}

/**
 * 추천 작품 조회
 */
export async function getFeaturedArtworks(limit: number = 6): Promise<ArtworkWithArtist[]> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists(
        id,
        name,
        name_en,
        name_ja,
        name_zh,
        bio,
        bio_en,
        bio_ja,
        bio_zh,
        profile_image,
        nationality
      )
    `)
    .eq('featured', true)
    .limit(limit)

  if (error) {
    
    throw new Error('추천 작품을 불러오는데 실패했습니다.')
  }

  return (data as ArtworkWithArtist[]) || []
}

/**
 * 관련 작품 조회 (같은 작가, 같은 카테고리)
 */
export async function getRelatedArtworks(
  artworkId: string,
  artistId: string,
  category: string,
  limit: number = 4
): Promise<ArtworkWithArtist[]> {
  const supabase = ensureSupabase()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:artists(
        id,
        name,
        name_en,
        name_ja,
        name_zh,
        bio,
        bio_en,
        bio_ja,
        bio_zh,
        profile_image,
        nationality
      )
    `)
    .neq('id', artworkId)
    .or(`artist_id.eq.${artistId},category.eq.${category}`)
    .limit(limit)

  if (error) {
    
    throw new Error('관련 작품을 불러오는데 실패했습니다.')
  }

  return (data as ArtworkWithArtist[]) || []
}

/**
 * 작품 조회수 증가
 */
export async function incrementArtworkViews(id: string): Promise<void> {
  const supabase = ensureSupabase()
  const { error } = await supabase.rpc('increment_artwork_views', {
    artwork_uuid: id
  })

  if (error) {
    
  }
}

/**
 * 작품 좋아요 토글
 */
export async function toggleArtworkLike(id: string, userId?: string): Promise<boolean> {
  const supabase = ensureSupabase()
  const { error } = await supabase.rpc('toggle_artwork_like', {
    artwork_uuid: id,
    user_uuid: userId
  })

  if (error) {
    
    return false
  }
  return true
} 