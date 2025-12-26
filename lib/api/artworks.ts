// Artwork API functions for CRUD operations

import { getSupabaseClient } from '@/lib/supabase'
import type {
  Artwork,
  ArtworkFormData,
  ArtworkFilters,
  ArtworkSortOptions,
  ArtworkStats,
  ArtworkStatus,
  ArtworkWithArtist,
  ArtworkCategory
} from '@/types/artwork'

// Re-export ArtworkWithArtist for convenience
export type { ArtworkWithArtist }

/**
 * Fetch artworks with optional filtering and sorting
 */
export async function fetchArtworks(
  filters?: ArtworkFilters,
  sort?: ArtworkSortOptions,
  limit?: number
): Promise<{ data: Artwork[] | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  let query = supabase
    .from('artworks')
    .select('*')
  
  // Apply filters
  if (filters) {
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category)
    }
    
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    
    if (filters.yearRange) {
      query = query
        .gte('year_created', filters.yearRange.start)
        .lte('year_created', filters.yearRange.end)
    }
    
    if (filters.isForSale !== undefined) {
      query = query.eq('is_for_sale', filters.isForSale)
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,medium.ilike.%${filters.searchTerm}%`)
    }
  }
  
  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === 'asc' })
  } else {
    // Default sort by created date descending
    query = query.order('created_at', { ascending: false })
  }
  
  // Apply limit
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Fetch a single artwork by ID
 */
export async function fetchArtworkById(id: string): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single()
  
  // Increment view count
  if (data && !error) {
    await supabase
      .from('artworks')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
  }
  
  return { data, error }
}

/**
 * Fetch artworks by artist ID
 */
export async function fetchArtworksByArtist(
  artistId: string,
  status?: ArtworkStatus[]
): Promise<{ data: Artwork[] | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  let query = supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', artistId)
  
  if (status && status.length > 0) {
    query = query.in('status', status)
  }
  
  query = query.order('created_at', { ascending: false })
  
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Fetch public artworks (published only)
 */
export async function fetchPublicArtworks(
  limit?: number,
  offset?: number
): Promise<{ data: Artwork[] | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  let query = supabase
    .from('public_artworks')
    .select('*')
    .order('published_at', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Fetch featured artworks
 */
export async function fetchFeaturedArtworks(
  limit = 10
): Promise<{ data: Artwork[] | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit)
  
  return { data, error }
}

/**
 * Create a new artwork
 */
export async function createArtwork(
  artworkData: ArtworkFormData,
  images: { main: any; additional?: any[] }
): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const artwork = {
    artist_id: user.id,
    ...artworkData,
    images,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('artworks')
    .insert(artwork)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Update an existing artwork
 */
export async function updateArtwork(
  id: string,
  updates: Partial<ArtworkFormData>
): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data, error } = await supabase
    .from('artworks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Update artwork status
 */
export async function updateArtworkStatus(
  id: string,
  status: ArtworkStatus
): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data, error } = await supabase
    .from('artworks')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Delete an artwork
 */
export async function deleteArtwork(id: string): Promise<{ error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { error: { message: "Supabase not configured" } }
  
  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)
  
  return { error }
}

/**
 * Bulk update artworks
 */
export async function bulkUpdateArtworks(
  ids: string[],
  updates: Partial<Artwork>
): Promise<{ data: Artwork[] | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data, error } = await supabase
    .from('artworks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)
    .select()
  
  return { data, error }
}

/**
 * Toggle artwork featured status
 */
export async function toggleFeatured(
  id: string
): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  // First fetch current status
  const { data: current, error: fetchError } = await supabase
    .from('artworks')
    .select('is_featured')
    .eq('id', id)
    .single()
  
  if (fetchError) {
    return { data: null, error: fetchError }
  }
  
  // Toggle the status
  const { data, error } = await supabase
    .from('artworks')
    .update({ 
      is_featured: !current.is_featured,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Get artwork statistics for an artist
 */
export async function getArtworkStats(artistId: string): Promise<{ data: ArtworkStats | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('category, status, price, views, likes, is_for_sale')
    .eq('artist_id', artistId)
  
  if (error || !artworks) {
    return { data: null, error }
  }
  
  const stats: ArtworkStats = {
    totalArtworks: artworks.length,
    publishedArtworks: artworks.filter(a => a.status === 'published').length,
    artworksByCategory: {} as any,
    totalViews: artworks.reduce((sum, a) => sum + (a.views || 0), 0),
    totalLikes: artworks.reduce((sum, a) => sum + (a.likes || 0), 0)
  }
  
  // Calculate artworks by category
  artworks.forEach(artwork => {
    const category = artwork.category as ArtworkCategory
    stats.artworksByCategory[category] =
      (stats.artworksByCategory[category] || 0) + 1
  })
  
  // Calculate average price for artworks that are for sale
  const forSaleArtworks = artworks.filter(a => a.is_for_sale && a.price)
  if (forSaleArtworks.length > 0) {
    stats.averagePrice = forSaleArtworks.reduce((sum, a) => sum + (a.price || 0), 0) / forSaleArtworks.length
  }
  
  return { data: stats, error: null }
}

/**
 * Increment artwork likes
 */
export async function incrementLikes(id: string): Promise<{ data: Artwork | null; error: any }> {
  const supabase = getSupabaseClient(); if (!supabase) return { data: null, error: { message: "Supabase not configured" } }
  
  // Fetch current likes count
  const { data: current, error: fetchError } = await supabase
    .from('artworks')
    .select('likes')
    .eq('id', id)
    .single()
  
  if (fetchError) {
    return { data: null, error: fetchError }
  }
  
  // Increment likes
  const { data, error } = await supabase
    .from('artworks')
    .update({ likes: (current.likes || 0) + 1 })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}