// Contest Management API Functions
// Phase 3: Contest Management System

import { getSupabaseClient } from '@/lib/supabase'
import type {
  Contest,
  ContestApplication,
  ContestWithStats,
  ContestApplicationWithDetails,
  ContestFormData,
  ApplicationFormData,
  ContestFilters,
  ApplicationFilters,
  ArtistApplicationSummary
} from '@/types/contest-new'

// ==================================================================
// CONTEST CRUD OPERATIONS
// ==================================================================

/**
 * Fetch contests with optional filters
 */
export async function fetchContests(filters?: ContestFilters) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  let query = supabase
    .from('contests')
    .select('*')
    .order('end_date', { ascending: false })

  // Apply filters
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters?.category) {
    if (Array.isArray(filters.category)) {
      query = query.in('category', filters.category)
    } else {
      query = query.eq('category', filters.category)
    }
  }

  if (filters?.contestType) {
    query = query.eq('contest_type', filters.contestType)
  }

  if (filters?.featured !== undefined) {
    query = query.eq('is_featured', filters.featured)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,organizer.ilike.%${filters.search}%`)
  }

  if (filters?.startDate?.from) {
    query = query.gte('start_date', filters.startDate.from)
  }

  if (filters?.startDate?.to) {
    query = query.lte('start_date', filters.startDate.to)
  }

  if (filters?.endDate?.from) {
    query = query.gte('end_date', filters.endDate.from)
  }

  if (filters?.endDate?.to) {
    query = query.lte('end_date', filters.endDate.to)
  }

  const { data, error } = await query

  return { data: data as Contest[] | null, error }
}

/**
 * Fetch single contest by ID with statistics
 */
export async function fetchContestById(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('contests')
    .select(`
      *,
      contest_applications(count)
    `)
    .eq('id', id)
    .single()

  return { data: data as ContestWithStats | null, error }
}

/**
 * Create new contest (admin only)
 */
export async function createContest(contestData: ContestFormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('contests')
    .insert({
      ...contestData,
      contest_type: contestData.contestType,
      title_en: contestData.titleEn,
      description_en: contestData.descriptionEn,
      announcement_date: contestData.announcementDate,
      start_date: contestData.startDate,
      end_date: contestData.endDate,
      result_date: contestData.resultDate,
      exhibition_date: contestData.exhibitionDate,
      contact_email: contestData.contactEmail,
      contact_phone: contestData.contactPhone,
      website_url: contestData.websiteUrl,
      artwork_requirements: contestData.artworkRequirements,
      max_submissions: contestData.maxSubmissions,
      total_prize_amount: contestData.totalPrizeAmount,
      entry_fee: contestData.entryFee,
      payment_methods: contestData.paymentMethods,
      poster_image_url: contestData.posterImageUrl,
      gallery_images: contestData.galleryImages,
      is_featured: contestData.isFeatured,
      created_by: user.id
    })
    .select()
    .single()

  return { data: data as Contest | null, error }
}

/**
 * Update contest (admin only)
 */
export async function updateContest(id: string, contestData: Partial<ContestFormData>) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const updateData: any = { ...contestData }
  
  // Map camelCase to snake_case for database
  if (contestData.contestType) updateData.contest_type = contestData.contestType
  if (contestData.titleEn) updateData.title_en = contestData.titleEn
  if (contestData.descriptionEn) updateData.description_en = contestData.descriptionEn
  if (contestData.announcementDate !== undefined) updateData.announcement_date = contestData.announcementDate
  if (contestData.startDate) updateData.start_date = contestData.startDate
  if (contestData.endDate) updateData.end_date = contestData.endDate
  if (contestData.resultDate !== undefined) updateData.result_date = contestData.resultDate
  if (contestData.exhibitionDate !== undefined) updateData.exhibition_date = contestData.exhibitionDate
  if (contestData.contactEmail !== undefined) updateData.contact_email = contestData.contactEmail
  if (contestData.contactPhone !== undefined) updateData.contact_phone = contestData.contactPhone
  if (contestData.websiteUrl !== undefined) updateData.website_url = contestData.websiteUrl
  if (contestData.artworkRequirements !== undefined) updateData.artwork_requirements = contestData.artworkRequirements
  if (contestData.maxSubmissions) updateData.max_submissions = contestData.maxSubmissions
  if (contestData.totalPrizeAmount !== undefined) updateData.total_prize_amount = contestData.totalPrizeAmount
  if (contestData.entryFee !== undefined) updateData.entry_fee = contestData.entryFee
  if (contestData.paymentMethods !== undefined) updateData.payment_methods = contestData.paymentMethods
  if (contestData.posterImageUrl !== undefined) updateData.poster_image_url = contestData.posterImageUrl
  if (contestData.galleryImages !== undefined) updateData.gallery_images = contestData.galleryImages
  if (contestData.isFeatured !== undefined) updateData.is_featured = contestData.isFeatured

  // Remove camelCase versions
  delete updateData.contestType
  delete updateData.titleEn
  delete updateData.descriptionEn
  delete updateData.announcementDate
  delete updateData.startDate
  delete updateData.endDate
  delete updateData.resultDate
  delete updateData.exhibitionDate
  delete updateData.contactEmail
  delete updateData.contactPhone
  delete updateData.websiteUrl
  delete updateData.artworkRequirements
  delete updateData.maxSubmissions
  delete updateData.totalPrizeAmount
  delete updateData.entryFee
  delete updateData.paymentMethods
  delete updateData.posterImageUrl
  delete updateData.galleryImages
  delete updateData.isFeatured

  const { data, error } = await supabase
    .from('contests')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Contest | null, error }
}

/**
 * Delete contest (admin only)
 */
export async function deleteContest(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { error: 'Supabase client not available' }
  }

  const { error } = await supabase
    .from('contests')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Increment contest view count
 */
export async function incrementContestViews(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { error: 'Supabase client not available' }
  }

  const { error } = await supabase.rpc('increment', {
    table_name: 'contests',
    row_id: id,
    column_name: 'view_count'
  })

  // Fallback if RPC doesn't exist
  if (error) {
    const { data: contest } = await supabase
      .from('contests')
      .select('view_count')
      .eq('id', id)
      .single()

    if (contest) {
      await supabase
        .from('contests')
        .update({ view_count: (contest.view_count || 0) + 1 })
        .eq('id', id)
    }
  }

  return { error: null }
}

// ==================================================================
// APPLICATION CRUD OPERATIONS
// ==================================================================

/**
 * Submit contest application
 */
export async function submitContestApplication(applicationData: ApplicationFormData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Check if contest is still open
  const { data: contest } = await supabase
    .from('contests')
    .select('status, end_date')
    .eq('id', applicationData.contestId)
    .single()

  if (!contest || contest.status !== 'open') {
    return { data: null, error: 'Contest is not accepting applications' }
  }

  if (new Date(contest.end_date) < new Date()) {
    return { data: null, error: 'Contest deadline has passed' }
  }

  const { data, error } = await supabase
    .from('contest_applications')
    .insert({
      contest_id: applicationData.contestId,
      artist_id: user.id,
      artwork_ids: applicationData.artworkIds,
      artist_name: applicationData.artistName,
      artist_email: applicationData.artistEmail,
      artist_phone: applicationData.artistPhone,
      artist_address: applicationData.artistAddress,
      artist_statement: applicationData.artistStatement,
      notes: applicationData.notes,
      payment_status: applicationData.paymentStatus || 'pending',
      payment_receipt_url: applicationData.paymentReceiptUrl
    })
    .select()
    .single()

  return { data: data as ContestApplication | null, error }
}

/**
 * Fetch artist's applications
 */
export async function fetchMyApplications(artistId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('contest_applications')
    .select(`
      *,
      contests(*)
    `)
    .eq('artist_id', artistId)
    .order('submitted_at', { ascending: false })

  return { data: data as ContestApplicationWithDetails[] | null, error }
}

/**
 * Fetch single application by ID
 */
export async function fetchApplicationById(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('contest_applications')
    .select(`
      *,
      contests(*)
    `)
    .eq('id', id)
    .single()

  return { data: data as ContestApplicationWithDetails | null, error }
}

/**
 * Update application (artist can only update if status is 'submitted')
 */
export async function updateApplication(id: string, applicationData: Partial<ApplicationFormData>) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const updateData: any = {}
  
  if (applicationData.artworkIds) updateData.artwork_ids = applicationData.artworkIds
  if (applicationData.artistName) updateData.artist_name = applicationData.artistName
  if (applicationData.artistEmail) updateData.artist_email = applicationData.artistEmail
  if (applicationData.artistPhone !== undefined) updateData.artist_phone = applicationData.artistPhone
  if (applicationData.artistAddress !== undefined) updateData.artist_address = applicationData.artistAddress
  if (applicationData.artistStatement !== undefined) updateData.artist_statement = applicationData.artistStatement
  if (applicationData.notes !== undefined) updateData.notes = applicationData.notes
  if (applicationData.paymentStatus) updateData.payment_status = applicationData.paymentStatus
  if (applicationData.paymentReceiptUrl !== undefined) updateData.payment_receipt_url = applicationData.paymentReceiptUrl

  const { data, error } = await supabase
    .from('contest_applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return { data: data as ContestApplication | null, error }
}

/**
 * Withdraw application (deletes it)
 */
export async function withdrawApplication(id: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { error: 'Supabase client not available' }
  }

  const { error } = await supabase
    .from('contest_applications')
    .delete()
    .eq('id', id)

  return { error }
}

// ==================================================================
// ADMIN OPERATIONS
// ==================================================================

/**
 * Fetch all applications for a contest (admin only)
 */
export async function fetchContestApplications(contestId: string, filters?: ApplicationFilters) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  let query = supabase
    .from('contest_applications')
    .select('*')
    .eq('contest_id', contestId)
    .order('submitted_at', { ascending: false })

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters?.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus)
  }

  const { data, error } = await query

  return { data: data as ContestApplication[] | null, error }
}

/**
 * Review application (admin only)
 */
export async function reviewApplication(
  id: string,
  review: {
    status: string
    result?: string
    judgeNotes?: string
  }
) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('contest_applications')
    .update({
      status: review.status,
      result: review.result,
      judge_notes: review.judgeNotes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  return { data: data as ContestApplication | null, error }
}

/**
 * Get artist application summary
 */
export async function getArtistApplicationSummary(artistId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase.rpc('get_artist_application_summary', {
    artist_uuid: artistId
  })

  if (error || !data) {
    // Fallback: manual calculation
    const { data: applications } = await supabase
      .from('contest_applications')
      .select('status')
      .eq('artist_id', artistId)

    if (applications) {
      const summary: ArtistApplicationSummary = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => 
          a.status === 'submitted' || a.status === 'under_review'
        ).length,
        acceptedApplications: applications.filter(a => a.status === 'accepted').length,
        winnerCount: applications.filter(a => a.status === 'winner').length
      }
      return { data: summary, error: null }
    }
  }

  return { data: data?.[0] as ArtistApplicationSummary | null, error }
}
