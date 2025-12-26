// Exhibition Management API functions

import { getSupabaseClient } from '@/lib/supabase'
import type {
  Exhibition,
  ExhibitionWithDetails,
  ExhibitionFormData,
  ExhibitionFilters,
  ExhibitionSummary,
  ArtworkOrderUpdate,
  ExhibitionArtistRole,
} from '@/types/exhibition'

/**
 * Fetch exhibitions with optional filters
 */
export async function fetchExhibitions(
  filters?: ExhibitionFilters
): Promise<{ data: Exhibition[] | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  let query = supabase
    .from('exhibitions')
    .select('*')
    .eq('is_published', true)

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.isFeatured !== undefined) {
    query = query.eq('is_featured', filters.isFeatured)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.startDateFrom) {
    query = query.gte('start_date', filters.startDateFrom)
  }

  if (filters?.startDateTo) {
    query = query.lte('start_date', filters.startDateTo)
  }

  // Order by start date descending
  query = query.order('start_date', { ascending: false })

  const { data, error } = await query

  return { data, error }
}

/**
 * Fetch single exhibition by ID with details
 */
export async function fetchExhibitionById(
  id: string
): Promise<{ data: ExhibitionWithDetails | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { data, error } = await supabase
    .from('exhibition_details')
    .select('*')
    .eq('id', id)
    .single()

  if (!error && data) {
    // Increment view count
    await supabase.rpc('increment_exhibition_views', {
      exhibition_uuid: id,
    })
  }

  return { data, error }
}

/**
 * Fetch exhibitions for a specific artist
 */
export async function fetchArtistExhibitions(
  artistId: string,
  filters?: { status?: string }
): Promise<{ data: Exhibition[] | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  let query = supabase
    .from('exhibitions')
    .select(`
      *,
      exhibition_artists!inner(artist_id)
    `)
    .eq('exhibition_artists.artist_id', artistId)
    .eq('is_published', true)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  query = query.order('start_date', { ascending: false })

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a new exhibition
 */
export async function createExhibition(
  formData: ExhibitionFormData
): Promise<{ data: Exhibition | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  // Create exhibition
  const { data: exhibition, error: exhibitionError } = await supabase
    .from('exhibitions')
    .insert({
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      content: formData.content,
      start_date: formData.startDate,
      end_date: formData.endDate,
      location: formData.location,
      venue: formData.venue,
      curator: formData.curator,
      featured_image_url: typeof formData.featuredImage === 'string' ? formData.featuredImage : null,
      is_featured: formData.isFeatured || false,
      is_published: formData.isPublished !== false,
      max_capacity: formData.maxCapacity,
      ticket_price: formData.ticketPrice,
    })
    .select()
    .single()

  if (exhibitionError) {
    return { data: null, error: exhibitionError }
  }

  // Add artworks if provided
  if (formData.artworkIds && formData.artworkIds.length > 0) {
    const artworkInserts = formData.artworkIds.map((artworkId, index) => ({
      exhibition_id: exhibition.id,
      artwork_id: artworkId,
      display_order: index,
    }))

    await supabase.from('exhibition_artworks').insert(artworkInserts)
  }

  // Add artists if provided
  if (formData.artistInvites && formData.artistInvites.length > 0) {
    const artistInserts = formData.artistInvites.map((invite, index) => ({
      exhibition_id: exhibition.id,
      artist_id: invite.artistId,
      role: invite.role,
      bio: invite.bio,
      display_order: index,
    }))

    await supabase.from('exhibition_artists').insert(artistInserts)
  }

  return { data: exhibition, error: null }
}

/**
 * Update an exhibition
 */
export async function updateExhibition(
  id: string,
  updates: Partial<ExhibitionFormData>
): Promise<{ data: Exhibition | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const updateData: Record<string, any> = {}

  if (updates.title) updateData.title = updates.title
  if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
  if (updates.description) updateData.description = updates.description
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.startDate) updateData.start_date = updates.startDate
  if (updates.endDate) updateData.end_date = updates.endDate
  if (updates.location !== undefined) updateData.location = updates.location
  if (updates.venue !== undefined) updateData.venue = updates.venue
  if (updates.curator !== undefined) updateData.curator = updates.curator
  if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured
  if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished
  if (updates.maxCapacity !== undefined) updateData.max_capacity = updates.maxCapacity
  if (updates.ticketPrice !== undefined) updateData.ticket_price = updates.ticketPrice
  if (typeof updates.featuredImage === 'string') {
    updateData.featured_image_url = updates.featuredImage
  }

  const { data, error } = await supabase
    .from('exhibitions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete an exhibition
 */
export async function deleteExhibition(id: string): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { error } = await supabase.from('exhibitions').delete().eq('id', id)

  return { data: null, error }
}

/**
 * Add artworks to an exhibition
 */
export async function addArtworksToExhibition(
  exhibitionId: string,
  artworkIds: string[]
): Promise<{ data: any | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  // Get current max display_order
  const { data: existing } = await supabase
    .from('exhibition_artworks')
    .select('display_order')
    .eq('exhibition_id', exhibitionId)
    .order('display_order', { ascending: false })
    .limit(1)

  const startOrder = existing && existing.length > 0 ? existing[0]?.display_order ?? -1 + 1 : 0

  const inserts = artworkIds.map((artworkId, index) => ({
    exhibition_id: exhibitionId,
    artwork_id: artworkId,
    display_order: startOrder + index,
  }))

  const { data, error } = await supabase
    .from('exhibition_artworks')
    .insert(inserts)
    .select()

  return { data, error }
}

/**
 * Remove artwork from exhibition
 */
export async function removeArtworkFromExhibition(
  exhibitionId: string,
  artworkId: string
): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { error } = await supabase
    .from('exhibition_artworks')
    .delete()
    .eq('exhibition_id', exhibitionId)
    .eq('artwork_id', artworkId)

  return { data: null, error }
}

/**
 * Update artwork display order in exhibition
 */
export async function updateArtworkOrder(
  exhibitionId: string,
  artworkOrder: ArtworkOrderUpdate[]
): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { error } = await supabase.rpc('update_exhibition_artwork_order', {
    exhibition_id_param: exhibitionId,
    artwork_order: artworkOrder,
  })

  return { data: null, error }
}

/**
 * Add artists to an exhibition
 */
export async function addArtistsToExhibition(
  exhibitionId: string,
  artists: Array<{
    artistId: string
    role: ExhibitionArtistRole
    bio?: string
  }>
): Promise<{ data: any | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const inserts = artists.map((artist, index) => ({
    exhibition_id: exhibitionId,
    artist_id: artist.artistId,
    role: artist.role,
    bio: artist.bio,
    display_order: index,
  }))

  const { data, error } = await supabase
    .from('exhibition_artists')
    .insert(inserts)
    .select()

  return { data, error }
}

/**
 * Remove artist from exhibition
 */
export async function removeArtistFromExhibition(
  exhibitionId: string,
  artistId: string
): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { error } = await supabase
    .from('exhibition_artists')
    .delete()
    .eq('exhibition_id', exhibitionId)
    .eq('artist_id', artistId)

  return { data: null, error }
}

/**
 * Get exhibition summary for an artist
 */
export async function getArtistExhibitionSummary(
  artistId: string
): Promise<{ data: ExhibitionSummary | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  const { data, error } = await supabase.rpc('get_artist_exhibition_summary', {
    artist_id_param: artistId,
  })

  if (error || !data || data.length === 0) {
    return { data: null, error }
  }

  return { data: data[0], error: null }
}

/**
 * Toggle featured status of an artwork in exhibition
 */
export async function toggleExhibitionArtworkFeatured(
  exhibitionId: string,
  artworkId: string
): Promise<{ data: any | null; error: any }> {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  // Get current status
  const { data: current, error: fetchError } = await supabase
    .from('exhibition_artworks')
    .select('is_featured')
    .eq('exhibition_id', exhibitionId)
    .eq('artwork_id', artworkId)
    .single()

  if (fetchError) {
    return { data: null, error: fetchError }
  }

  // Toggle
  const { data, error } = await supabase
    .from('exhibition_artworks')
    .update({ is_featured: !current.is_featured })
    .eq('exhibition_id', exhibitionId)
    .eq('artwork_id', artworkId)
    .select()
    .single()

  return { data, error }
}
