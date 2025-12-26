// Artist Profile API functions

import { getSupabaseClient } from '@/lib/supabase'
import type { ArtistProfile, ArtistProfileFormData, PortfolioConfigFormData, PublicPortfolio, ArtistStats } from '@/types/profile'

/**
 * Fetch artist profile by ID
 */
export async function fetchArtistProfile(id: string): Promise<{ data: ArtistProfile | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { data: null, error }
  }
  
  return { data: data as ArtistProfile, error: null }
}

/**
 * Fetch public artist profile (increments view count)
 */
export async function fetchPublicArtistProfile(id: string): Promise<{ data: ArtistProfile | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase
    .from('public_artist_profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { data: null, error }
  }
  
  // Increment profile views
  await supabase.rpc('increment_profile_views', { artist_id_param: id })
  
  return { data: data as ArtistProfile, error: null }
}

/**
 * Fetch public portfolio with featured artworks
 */
export async function fetchPublicPortfolio(id: string): Promise<{ data: PublicPortfolio | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Fetch profile
  const { data: profile, error: profileError } = await fetchPublicArtistProfile(id)
  
  if (profileError || !profile) {
    return { data: null, error: profileError }
  }
  
  // Fetch featured artworks if configured
  let featuredArtworks: any[] = []
  if (profile.portfolioConfig?.featuredArtworkIds?.length) {
    const { data: artworks } = await supabase
      .from('artworks')
      .select('*')
      .in('id', profile.portfolioConfig.featuredArtworkIds)
      .eq('status', 'published')
    
    if (artworks) {
      featuredArtworks = artworks
    }
  } else {
    // If no featured artworks, fetch latest published artworks
    const { data: artworks } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12)
    
    if (artworks) {
      featuredArtworks = artworks
    }
  }
  
  // Fetch stats
  const stats = await getArtistStats(id)
  
  // Increment portfolio views
  await supabase.rpc('increment_portfolio_views', { artist_id_param: id })
  
  return {
    data: {
      profile,
      featuredArtworks,
      stats: stats.data || {
        totalArtworks: 0,
        totalExhibitions: 0,
        totalAwards: 0,
        profileViews: 0,
        portfolioViews: 0
      }
    },
    error: null
  }
}

/**
 * Update artist profile
 */
export async function updateArtistProfile(
  id: string,
  updates: Partial<ArtistProfileFormData>
): Promise<{ data: ArtistProfile | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase
    .from('artists')
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
 * Update portfolio configuration
 */
export async function updatePortfolioConfig(
  id: string,
  config: PortfolioConfigFormData
): Promise<{ data: ArtistProfile | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase
    .from('artists')
    .update({
      portfolio_config: config,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Get artist statistics
 */
export async function getArtistStats(artistId: string): Promise<{ data: ArtistStats | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Get profile views
  const { data: profile } = await supabase
    .from('artists')
    .select('profile_views, portfolio_views')
    .eq('id', artistId)
    .single()
  
  // Count artworks
  const { count: artworkCount } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artistId)
    .eq('status', 'published')
  
  const stats: ArtistStats = {
    totalArtworks: artworkCount || 0,
    totalExhibitions: 0, // TODO: implement when exhibitions are linked
    totalAwards: 0, // TODO: implement career timeline
    profileViews: profile?.profile_views || 0,
    portfolioViews: profile?.portfolio_views || 0
  }
  
  return { data: stats, error: null }
}

/**
 * Toggle profile public visibility
 */
export async function toggleProfileVisibility(id: string): Promise<{ data: ArtistProfile | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Fetch current status
  const { data: current, error: fetchError } = await supabase
    .from('artists')
    .select('is_public')
    .eq('id', id)
    .single()
  
  if (fetchError) {
    return { data: null, error: fetchError }
  }
  
  // Toggle visibility
  const { data, error } = await supabase
    .from('artists')
    .update({ 
      is_public: !current.is_public,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(
  artistId: string,
  file: File
): Promise<{ data: { url: string } | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${artistId}-${Date.now()}.${fileExt}`
  const filePath = `profiles/${fileName}`
  
  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('artist-images')
    .upload(filePath, file)
  
  if (uploadError) {
    return { data: null, error: uploadError }
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('artist-images')
    .getPublicUrl(filePath)
  
  // Update profile with new image URL
  await supabase
    .from('artists')
    .update({ profile_image: publicUrl })
    .eq('id', artistId)
  
  return { data: { url: publicUrl }, error: null }
}
