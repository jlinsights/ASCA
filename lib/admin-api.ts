import { ensureSupabaseAdmin, type Database } from './supabase'

type Artist = Database['public']['Tables']['artists']['Row']
type ArtistInsert = Database['public']['Tables']['artists']['Insert']
type ArtistUpdate = Database['public']['Tables']['artists']['Update']

type Artwork = Database['public']['Tables']['artworks']['Row']
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert']
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update']

// ========== 작가 관련 API ==========

// 모든 작가 조회
export async function getAllArtists() {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artists:', error)
    throw error
  }

  return data
}

// 작가 단일 조회
export async function getArtistById(id: string) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching artist:', error)
    throw error
  }

  return data
}

// 작가 생성
export async function createArtist(artistData: ArtistInsert) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .insert([{
      ...artistData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating artist:', error)
    throw error
  }

  return data
}

// 작가 업데이트
export async function updateArtist(id: string, artistData: ArtistUpdate) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .update({
      ...artistData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating artist:', error)
    throw error
  }

  return data
}

// 작가 삭제
export async function deleteArtist(id: string) {
  const supabase = ensureSupabaseAdmin()
  const { error } = await supabase
    .from('artists')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting artist:', error)
    throw error
  }

  return true
}

// 작가 검색
export async function searchArtists(query: string) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%,nationality.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching artists:', error)
    throw error
  }

  return data
}

// ========== 작품 관련 API ==========

// 모든 작품 조회 (작가 정보 포함)
export async function getAllArtworks() {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artists (
        id,
        name,
        profile_image
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artworks:', error)
    throw error
  }

  return data
}

// 작품 단일 조회
export async function getArtworkById(id: string) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artists (
        id,
        name,
        profile_image
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching artwork:', error)
    throw error
  }

  return data
}

// 작품 생성
export async function createArtwork(artworkData: ArtworkInsert) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .insert([{
      ...artworkData,
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating artwork:', error)
    throw error
  }

  return data
}

// 작품 업데이트
export async function updateArtwork(id: string, artworkData: ArtworkUpdate) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .update({
      ...artworkData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating artwork:', error)
    throw error
  }

  return data
}

// 작품 삭제
export async function deleteArtwork(id: string) {
  const supabase = ensureSupabaseAdmin()
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting artwork:', error)
    throw error
  }

  return true
}

// 작품 검색
export async function searchArtworks(query: string) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artists (
        id,
        name,
        profile_image
      )
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,technique.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching artworks:', error)
    throw error
  }

  return data
}

// 특정 작가의 작품들 조회
export async function getArtworksByArtist(artistId: string) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artworks by artist:', error)
    throw error
  }

  return data
}

// ========== 통계 관련 API ==========

// 대시보드 통계 조회
export async function getDashboardStats() {
  const supabase = ensureSupabaseAdmin()
  try {
    // 총 작가 수
    const { count: artistCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    // 총 작품 수
    const { count: artworkCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })

    // 판매 가능한 작품 수
    const { count: availableCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('availability', 'available')

    // 이번 달 생성된 작품 수
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    return {
      totalArtists: artistCount || 0,
      totalArtworks: artworkCount || 0,
      availableArtworks: availableCount || 0,
      monthlyArtworks: monthlyCount || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// 최근 작가들 조회
export async function getRecentArtists(limit: number = 5) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent artists:', error)
    throw error
  }

  return data
}

// 최근 작품들 조회
export async function getRecentArtworks(limit: number = 5) {
  const supabase = ensureSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artists (
        id,
        name,
        profile_image
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent artworks:', error)
    throw error
  }

  return data
}

// ========== 이미지 업로드 관련 ==========

// 이미지 업로드 (Supabase Storage 사용)
export async function uploadImage(file: File, bucket: 'artists' | 'artworks' = 'artworks') {
  const supabase = ensureSupabaseAdmin()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
  const filePath = `${bucket}/${fileName}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  // 공개 URL 가져오기
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return {
    filePath,
    url: urlData.publicUrl
  }
}

// 이미지 삭제
export async function deleteImage(filePath: string) {
  const supabase = ensureSupabaseAdmin()
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath])

  if (error) {
    console.error('Error deleting image:', error)
    throw error
  }

  return true
}

// 타입 내보내기
export type { Artist, ArtistInsert, ArtistUpdate, Artwork, ArtworkInsert, ArtworkUpdate } 