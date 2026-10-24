import { ensureSupabase } from '../supabase'
import { historyEvents } from '@/app/history/_data/history-events'
import type {
  Notice,
  Exhibition,
  Event,
  SearchFilters,
  PaginationParams,
} from '@/lib/types/cms-legacy'

// 통합 검색 결과 타입 (작가와 작품 포함)
export interface SearchResult {
  id: string
  title: string
  contentType: 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork'
  excerpt: string
  url: string
  createdAt: string
  rank: number
}

// 고급 검색 필터
export interface AdvancedSearchFilters {
  query?: string
  category?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  contentTypes?: ('notice' | 'exhibition' | 'event' | 'artist' | 'artwork')[]
}

// 작가 검색 필터
export interface ArtistSearchFilters {
  query?: string
  nationality?: string
  artistType?: string
  membershipType?: string
}

// 작품 검색 필터
export interface ArtworkSearchFilters {
  query?: string
  category?: string
  style?: string
  availability?: string
  artistId?: string
  yearFrom?: number
  yearTo?: number
}

export interface GlobalSearchParams {
  query: string
  categories?: string[]
  contentTypes?: ('notices' | 'exhibitions' | 'events' | 'artists' | 'artworks')[]
  dateRange?: {
    from?: string
    to?: string
  }
  limit?: number
}

export interface SearchResultItem {
  id: string
  title: string
  description: string
  content_type: 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork'
  url: string
  thumbnail?: string
  published_at?: string
  relevance_score?: number
}

export interface SearchResults {
  results: SearchResultItem[]
  total: number
  query: string
  facets: any
}

// 검색어를 PostgREST or() 필터에 안전하게 넣는다 — 구분자·와일드카드 문자는 지운다
export function toIlikeTerm(query: string): string {
  return query
    .replace(/[%_,()*\\:."']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Notice 검색 — 제목·본문 부분 일치 (ASCA-2026 에는 search_* RPC 가 없다)
export async function searchNotices(
  query: string,
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ data: Notice[]; total: number }> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const term = toIlikeTerm(query)
  if (!term) return { data: [], total: 0 }
  let request = supabase
    .from('notices')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
  if (filters.category) request = request.eq('category', filters.category)
  const from = (pagination.page - 1) * pagination.limit
  const { data, error, count } = await request
    .order('published_at', { ascending: false })
    .range(from, from + pagination.limit - 1)

  if (error) throw error
  return { data: (data ?? []) as Notice[], total: count ?? 0 }
}

// Exhibition 검색
export async function searchExhibitions(
  query: string,
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ data: Exhibition[]; total: number }> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase.rpc('search_exhibitions', {
    search_query: query,
    status_filter: filters.status,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    page_num: pagination.page,
    page_size: pagination.limit,
  })

  if (error) throw error
  return data
}

// Event 검색
export async function searchEvents(
  query: string,
  filters: any = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ data: Event[]; total: number }> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase.rpc('search_events', {
    search_query: query,
    event_type_filter: filters.eventType,
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    page_num: pagination.page,
    page_size: pagination.limit,
  })

  if (error) throw error
  return data
}

// Artist 검색
export async function searchArtists(
  query: string,
  filters: any = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ data: any[]; total: number }> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase.rpc('search_artists', {
    search_query: query,
    nationality_filter: filters.nationality,
    specialty_filter: filters.specialty,
    page_num: pagination.page,
    page_size: pagination.limit,
  })

  if (error) throw error
  return data
}

// Artwork 검색
export async function searchArtworks(
  query: string,
  filters: any = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<{ data: any[]; total: number }> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const { data, error } = await supabase.rpc('search_artworks', {
    search_query: query,
    category_filter: filters.category,
    style_filter: filters.style,
    artist_filter: filters.artist_id,
    page_num: pagination.page,
    page_size: pagination.limit,
  })

  if (error) throw error
  return data
}

// 전체 콘텐츠 통합 검색 — 공지·행사는 DB, 전시는 협회 연혁 기록에서 찾는다
export async function searchAllContent(
  query: string,
  params: GlobalSearchParams = { query }
): Promise<SearchResultItem[]> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  const term = toIlikeTerm(query)
  if (!term) return []
  const types = params.contentTypes ?? ['notices', 'exhibitions', 'events']
  const limit = params.limit ?? 20
  const pattern = `title.ilike.%${term}%,content.ilike.%${term}%`

  const [notices, events] = await Promise.all([
    types.includes('notices')
      ? supabase
          .from('notices')
          .select('id,title,excerpt,content,published_at')
          .eq('is_published', true)
          .or(pattern)
          .order('published_at', { ascending: false })
          .limit(limit)
      : null,
    types.includes('events')
      ? supabase
          .from('public_events')
          .select('id,title,description,event_date')
          .eq('is_published', true)
          .or(pattern)
          .order('event_date', { ascending: false })
          .limit(limit)
      : null,
  ])
  if (notices?.error) throw notices.error
  if (events?.error) throw events.error

  const needle = term.toLowerCase()
  const exhibitions = types.includes('exhibitions')
    ? historyEvents.filter(
        e =>
          e.type === 'exhibition' &&
          [e.title, e.subtitle, e.venue].some(v => v?.toLowerCase().includes(needle))
      )
    : []

  return [
    ...(notices?.data ?? []).map(n => ({
      id: n.id,
      title: n.title,
      description: n.excerpt ?? n.content.slice(0, 160),
      content_type: 'notice' as const,
      url: `/notice/${n.id}`,
      published_at: n.published_at ?? undefined,
    })),
    ...(events?.data ?? []).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      content_type: 'event' as const,
      url: `/events/${e.id}`,
      published_at: e.event_date,
    })),
    ...exhibitions.map(e => ({
      id: e.id,
      title: e.title,
      description: [e.subtitle, e.date, e.venue].filter(Boolean).join(' · '),
      content_type: 'exhibition' as const,
      url: '/exhibitions',
      published_at: `${e.year}-${String(e.month).padStart(2, '0')}-01`,
    })),
  ].slice(0, limit * 2)
}

// 간단한 텍스트 검색 (기존 방식과 호환)
export async function simpleSearch(
  table: 'notices' | 'exhibitions' | 'events' | 'artists' | 'artworks',
  query: string,
  limit = 20
) {
  try {
    const supabase = ensureSupabase()
    if (!supabase) throw new Error('Supabase client not available')
    let searchQuery = supabase.from(table).select('*').limit(limit)

    // 상태 필터링 (해당하는 테이블만)
    if (table === 'notices' || table === 'exhibitions' || table === 'events') {
      searchQuery = searchQuery.eq('status', 'published')
    }

    // 작품의 경우 구매 가능한 것만
    if (table === 'artworks') {
      searchQuery = searchQuery.eq('availability', 'available')
    }

    if (query) {
      searchQuery = searchQuery.textSearch('search_vector', query)
    }

    const { data, error } = await searchQuery
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    return { data: [], error }
  }
}

// 작가별 작품 검색
export async function searchArtworksByArtist(artistId: string, query?: string, limit = 20) {
  try {
    const filters = {
      artist_id: artistId,
    }

    return await searchArtworks(query || '', filters)
  } catch (error) {
    return { data: [], error }
  }
}

// 인기 검색어 (추후 구현을 위한 스켈레톤)
export async function getPopularSearchTerms(limit = 10) {
  // TODO: 검색 로그 테이블을 만들어서 인기 검색어 추적
  return { data: [], error: null }
}

// 검색 제안 (추후 구현을 위한 스켈레톤)
export async function getSearchSuggestions(query: string, limit = 5) {
  // TODO: 자동완성 기능 구현
  return { data: [], error: null }
}

// 고급 검색 (다중 테이블 조인)
export async function advancedSearch(params: GlobalSearchParams): Promise<SearchResults> {
  const supabase = ensureSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  let searchQuery = supabase
    .from('search_view') // 가상의 통합 검색 뷰
    .select('*')

  if (params.query) {
    searchQuery = searchQuery.textSearch('search_vector', params.query)
  }

  if (params.categories && params.categories.length > 0) {
    searchQuery = searchQuery.in('category', params.categories)
  }

  if (params.contentTypes && params.contentTypes.length > 0) {
    searchQuery = searchQuery.in('content_type', params.contentTypes)
  }

  if (params.dateRange?.from) {
    searchQuery = searchQuery.gte('created_at', params.dateRange.from)
  }

  if (params.dateRange?.to) {
    searchQuery = searchQuery.lte('created_at', params.dateRange.to)
  }

  const { data, error } = await searchQuery
    .order('relevance_score', { ascending: false })
    .limit(params.limit || 20)

  if (error) throw error

  return {
    results: data || [],
    total: data?.length || 0,
    query: params.query,
    facets: {}, // 추후 구현
  }
}
