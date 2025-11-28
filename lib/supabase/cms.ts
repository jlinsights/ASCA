import { ensureSupabase } from '../supabase'
import type { 
  Notice, 
  Exhibition, 
  Event, 
  NoticeComment,
  SearchFilters,
  PaginationParams,
  PaginatedResponse,
  NoticeFormData,
  ExhibitionFormData,
  EventFormData
} from '@/types/cms'

// Notice functions
export async function getNotices(
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<Notice>> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  let query = supabase
    .from('notices')
    .select('*', { count: 'exact' })
    .eq('is_published', true)

  // Apply filters
  if (filters.query) {
    query = query.textSearch('search_vector', filters.query)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.pinned !== undefined) {
    query = query.eq('is_pinned', filters.pinned)
  }
  if (filters.dateFrom) {
    query = query.gte('published_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('published_at', filters.dateTo)
  }

  // Apply sorting
  const sortBy = pagination.sortBy || 'published_at'
  const sortOrder = pagination.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count || 0) / pagination.limit)
  }
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Increment view count
  await supabase.rpc('increment_notice_views', { notice_uuid: id })

  return data
}

export async function createNotice(data: NoticeFormData): Promise<Notice> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: notice, error } = await supabase
    .from('notices')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return notice
}

export async function updateNotice(id: string, data: Partial<NoticeFormData>): Promise<Notice> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: notice, error } = await supabase
    .from('notices')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return notice
}

export async function deleteNotice(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Exhibition functions
export async function getExhibitions(
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<Exhibition>> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  let query = supabase
    .from('exhibitions')
    .select('*', { count: 'exact' })
    .eq('is_published', true)

  // Apply filters
  if (filters.query) {
    query = query.textSearch('search_vector', filters.query)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.featured !== undefined) {
    query = query.eq('is_featured', filters.featured)
  }
  if (filters.dateFrom) {
    query = query.gte('start_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('end_date', filters.dateTo)
  }

  // Apply sorting
  const sortBy = pagination.sortBy || 'start_date'
  const sortOrder = pagination.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count || 0) / pagination.limit)
  }
}

export async function getExhibitionById(id: string): Promise<Exhibition | null> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Increment view count
  await supabase.rpc('increment_exhibition_views', { exhibition_uuid: id })

  return data
}

export async function createExhibition(data: ExhibitionFormData): Promise<Exhibition> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return exhibition
}

export async function updateExhibition(id: string, data: Partial<ExhibitionFormData>): Promise<Exhibition> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return exhibition
}

export async function deleteExhibition(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { error } = await supabase
    .from('exhibitions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Event functions
export async function getEvents(
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<Event>> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('is_published', true)

  // Apply filters
  if (filters.query) {
    query = query.textSearch('search_vector', filters.query)
  }
  if (filters.type) {
    query = query.eq('event_type', filters.type)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.featured !== undefined) {
    query = query.eq('is_featured', filters.featured)
  }
  if (filters.dateFrom) {
    query = query.gte('event_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('event_date', filters.dateTo)
  }

  // Apply sorting
  const sortBy = pagination.sortBy || 'event_date'
  const sortOrder = pagination.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  const from = (pagination.page - 1) * pagination.limit
  const to = from + pagination.limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil((count || 0) / pagination.limit)
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Increment view count
  await supabase.rpc('increment_event_views', { event_uuid: id })

  return data
}

export async function createEvent(data: EventFormData): Promise<Event> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: event, error } = await supabase
    .from('events')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return event
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<Event> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return event
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Comment functions
export async function getNoticeComments(noticeId: string): Promise<NoticeComment[]> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('notice_comments')
    .select('*')
    .eq('notice_id', noticeId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createNoticeComment(data: {
  notice_id: string
  author_name: string
  author_email?: string
  content: string
}): Promise<NoticeComment> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data: comment, error } = await supabase
    .from('notice_comments')
    .insert([{
      ...data,
      is_approved: false // 댓글은 관리자 승인 후 공개
    }])
    .select()
    .single()

  if (error) throw error
  return comment
}

// Utility functions
export async function getFeaturedContent() {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const [notices, exhibitions, events] = await Promise.all([
    supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .eq('is_pinned', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('exhibitions')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('start_date', { ascending: false })
      .limit(3),
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('start_date', { ascending: false })
      .limit(3)
  ])

  return {
    notices: notices.data || [],
    exhibitions: exhibitions.data || [],
    events: events.data || []
  }
}

export async function updateContentStatus() {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  await Promise.all([
    supabase.rpc('update_exhibition_status'),
    supabase.rpc('update_event_status')
  ])
}

// Additional utility functions for detail pages
export async function incrementNoticeViews(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  await supabase.rpc('increment_notice_views', { notice_uuid: id })
}

export async function incrementExhibitionViews(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  await supabase.rpc('increment_exhibition_views', { exhibition_uuid: id })
}

export async function incrementEventViews(id: string): Promise<void> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  await supabase.rpc('increment_event_views', { event_uuid: id })
}

export async function getRelatedNotices(noticeId: string, category: string, limit: number = 5): Promise<Notice[]> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('id', noticeId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getRelatedExhibitions(exhibitionId: string, limit: number = 5): Promise<Exhibition[]> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('is_published', true)
    .neq('id', exhibitionId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getRelatedEvents(eventId: string, eventType: string, limit: number = 5): Promise<Event[]> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('event_type', eventType)
    .neq('id', eventId)
    .order('start_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
} 