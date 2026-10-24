// Artist Profile API functions

import { getSupabaseClient } from '@/lib/supabase'
import type { ArtistProfile, PublicPortfolio, ArtistStats } from '@/lib/types/profile-legacy'

import type { ArtistProfileEditorData, ArtistProfileUpdates } from '@/lib/types/profile-editor'

async function profileRequest(
  id: string,
  updates?: ArtistProfileUpdates
): Promise<{
  data: ArtistProfileEditorData | null
  error: { message: string; code?: string; status?: number } | null
}> {
  try {
    const response = await fetch(`/api/profile/artists/${encodeURIComponent(id)}`, {
      method: updates ? 'PATCH' : 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      ...(updates
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }
        : {}),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.data)
      return {
        data: null,
        error: {
          message: result?.error || 'Profile request failed',
          code: result?.code,
          status: response.status,
        },
      }
    return { data: result.data, error: null }
  } catch {
    return { data: null, error: { message: 'Profile request failed', code: 'PROFILE_UNAVAILABLE' } }
  }
}

/** Private editor read: ownership is checked by the server, including hidden artists. */
export function fetchArtistProfile(id: string) {
  return profileRequest(id)
}

/** Self-service writes always use the authenticated server whitelist. */
export function updateArtistProfile(id: string, updates: ArtistProfileUpdates) {
  return profileRequest(id, updates)
}

/**
 * Fetch public artist profile (increments view count)
 */
export async function fetchPublicArtistProfile(
  id: string
): Promise<{ data: ArtistProfile | null; error: any }> {
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
export async function fetchPublicPortfolio(
  id: string
): Promise<{ data: PublicPortfolio | null; error: any }> {
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
        portfolioViews: 0,
      },
    },
    error: null,
  }
}

/**
 * Get artist statistics
 */
export async function getArtistStats(
  artistId: string
): Promise<{ data: ArtistStats | null; error: any }> {
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
    portfolioViews: profile?.portfolio_views || 0,
  }

  return { data: stats, error: null }
}
