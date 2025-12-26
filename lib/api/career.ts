// Career Timeline API functions

import { getSupabaseClient } from '@/lib/supabase'
import type { 
  CareerEntry,
  CareerEntryFormData,
  TimelineFilters,
  CareerEntryType
} from '@/types/career'

/**
 * Fetch career entries for an artist
 */
export async function fetchCareerEntries(
  artistId: string,
  filters?: TimelineFilters
): Promise<{ data: CareerEntry[] | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  let query = supabase
    .from('career_timeline')
    .select('*')
    .eq('artist_id', artistId)
  
  // Apply filters
  if (filters?.types && filters.types.length > 0) {
    query = query.in('type', filters.types)
  }
  
  if (filters?.yearRange) {
    query = query
      .gte('year', filters.yearRange.start)
      .lte('year', filters.yearRange.end)
  }
  
  if (filters?.isFeatured !== undefined) {
    query = query.eq('is_featured', filters.isFeatured)
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,organization.ilike.%${filters.search}%`)
  }
  
  // Order by year descending, then month
  query = query.order('year', { ascending: false })
    .order('month', { ascending: false, nullsFirst: false })
    .order('display_order', { ascending: true })
  
  const { data, error } = await query
  
  return { data, error }
}

/**
 * Fetch single career entry by ID
 */
export async function fetchCareerEntryById(
  id: string
): Promise<{ data: CareerEntry | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase
    .from('career_timeline')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

/**
 * Create a new career entry
 */
export async function createCareerEntry(
  artistId: string,
  entryData: CareerEntryFormData
): Promise<{ data: CareerEntry | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Prepare type-specific data
  const typeSpecificData: Record<string, any> = {}
  
  if (entryData.type === 'exhibition') {
    typeSpecificData.exhibitionType = entryData.exhibitionType
    typeSpecificData.venue = entryData.venue
    typeSpecificData.curator = entryData.curator
    typeSpecificData.artworkIds = entryData.artworkIds
  } else if (entryData.type === 'award') {
    typeSpecificData.awardType = entryData.awardType
    typeSpecificData.prizeAmount = entryData.prizeAmount
    typeSpecificData.currency = entryData.currency
  } else if (entryData.type === 'education') {
    typeSpecificData.degree = entryData.degree
    typeSpecificData.major = entryData.major
    typeSpecificData.graduationYear = entryData.graduationYear
  } else if (entryData.type === 'publication') {
    typeSpecificData.publicationType = entryData.publicationType
    typeSpecificData.publisher = entryData.publisher
    typeSpecificData.isbn = entryData.isbn
    typeSpecificData.pages = entryData.pages
  } else if (entryData.type === 'media') {
    typeSpecificData.mediaType = entryData.mediaType
    typeSpecificData.mediaOutlet = entryData.mediaOutlet
  }
  
  const { data, error } = await supabase
    .from('career_timeline')
    .insert({
      artist_id: artistId,
      type: entryData.type,
      title: entryData.title,
      title_en: entryData.titleEn,
      organization: entryData.organization,
      organization_en: entryData.organizationEn,
      year: entryData.year,
      month: entryData.month,
      start_date: entryData.startDate,
      end_date: entryData.endDate,
      description: entryData.description,
      description_en: entryData.descriptionEn,
      location: entryData.location,
      role: entryData.role,
      external_url: entryData.externalUrl,
      is_featured: entryData.isFeatured,
      type_specific_data: typeSpecificData
    })
    .select()
    .single()
  
  return { data, error }
}

/**
 * Update a career entry
 */
export async function updateCareerEntry(
  id: string,
  updates: Partial<CareerEntryFormData>
): Promise<{ data: CareerEntry | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Prepare type-specific data if type is being updated
  let typeSpecificData: Record<string, any> | undefined
  
  if (updates.type) {
    typeSpecificData = {}
    
    if (updates.type === 'exhibition') {
      typeSpecificData.exhibitionType = updates.exhibitionType
      typeSpecificData.venue = updates.venue
      typeSpecificData.curator = updates.curator
      typeSpecificData.artworkIds = updates.artworkIds
    } else if (updates.type === 'award') {
      typeSpecificData.awardType = updates.awardType
      typeSpecificData.prizeAmount = updates.prizeAmount
      typeSpecificData.currency = updates.currency
    } else if (updates.type === 'education') {
      typeSpecificData.degree = updates.degree
      typeSpecificData.major = updates.major
      typeSpecificData.graduationYear = updates.graduationYear
    } else if (updates.type === 'publication') {
      typeSpecificData.publicationType = updates.publicationType
      typeSpecificData.publisher = updates.publisher
      typeSpecificData.isbn = updates.isbn
      typeSpecificData.pages = updates.pages
    } else if (updates.type === 'media') {
      typeSpecificData.mediaType = updates.mediaType
      typeSpecificData.mediaOutlet = updates.mediaOutlet
    }
  }
  
  const updateData: Record<string, any> = {
    ...(updates.title && { title: updates.title }),
    ...(updates.titleEn && { title_en: updates.titleEn }),
    ...(updates.organization && { organization: updates.organization }),
    ...(updates.organizationEn && { organization_en: updates.organizationEn }),
    ...(updates.year && { year: updates.year }),
    ...(updates.month !== undefined && { month: updates.month }),
    ...(updates.startDate && { start_date: updates.startDate }),
    ...(updates.endDate && { end_date: updates.endDate }),
    ...(updates.description && { description: updates.description }),
    ...(updates.descriptionEn && { description_en: updates.descriptionEn }),
    ...(updates.location && { location: updates.location }),
    ...(updates.role && { role: updates.role }),
    ...(updates.externalUrl && { external_url: updates.externalUrl }),
    ...(updates.isFeatured !== undefined && { is_featured: updates.isFeatured }),
    ...(typeSpecificData && { type_specific_data: typeSpecificData })
  }
  
  const { data, error } = await supabase
    .from('career_timeline')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Delete a career entry
 */
export async function deleteCareerEntry(id: string): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { error } = await supabase
    .from('career_timeline')
    .delete()
    .eq('id', id)
  
  return { data: null, error }
}

/**
 * Toggle featured status
 */
export async function toggleCareerFeatured(id: string): Promise<{ data: CareerEntry | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Fetch current status
  const { data: current, error: fetchError } = await supabase
    .from('career_timeline')
    .select('is_featured')
    .eq('id', id)
    .single()
  
  if (fetchError) {
    return { data: null, error: fetchError }
  }
  
  // Toggle
  const { data, error } = await supabase
    .from('career_timeline')
    .update({ is_featured: !current.is_featured })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Get career summary for an artist
 */
export async function getCareerSummary(artistId: string): Promise<{ data: any | null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  const { data, error } = await supabase.rpc('get_career_summary', {
    artist_id_param: artistId
  })
  
  return { data, error }
}

/**
 * Bulk update display order
 */
export async function updateCareerDisplayOrder(
  updates: Array<{ id: string; order: number }>
): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  
  // Update each entry
  const promises = updates.map(({ id, order }) =>
    supabase
      .from('career_timeline')
      .update({ display_order: order })
      .eq('id', id)
  )
  
  const results = await Promise.all(promises)
  const firstError = results.find(r => r.error)?.error
  
  return { data: null, error: firstError || null }
}
