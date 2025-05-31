import { supabase } from '../supabase';

// 통합 검색 결과 타입 (작가와 작품 포함)
export interface SearchResult {
  id: string;
  title: string;
  contentType: 'notice' | 'exhibition' | 'event' | 'artist' | 'artwork';
  excerpt: string;
  url: string;
  createdAt: string;
  rank: number;
}

// 고급 검색 필터
export interface AdvancedSearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  contentTypes?: ('notice' | 'exhibition' | 'event' | 'artist' | 'artwork')[];
}

// 작가 검색 필터
export interface ArtistSearchFilters {
  query?: string;
  nationality?: string;
  artistType?: string;
  membershipType?: string;
}

// 작품 검색 필터
export interface ArtworkSearchFilters {
  query?: string;
  category?: string;
  style?: string;
  availability?: string;
  artistId?: string;
  yearFrom?: number;
  yearTo?: number;
}

// 공지사항 고급 검색
export async function searchNotices(filters: AdvancedSearchFilters) {
  try {
    const { data, error } = await supabase.rpc('search_notices', {
      search_query: filters.query || null,
      category_filter: filters.category || null,
      status_filter: filters.status || null,
      date_from: filters.dateFrom?.toISOString().split('T')[0] || null,
      date_to: filters.dateTo?.toISOString().split('T')[0] || null,
      limit_count: 20,
      offset_count: 0,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching notices:', error);
    return { data: [], error };
  }
}

// 전시회 고급 검색
export async function searchExhibitions(filters: AdvancedSearchFilters) {
  try {
    const { data, error } = await supabase.rpc('search_exhibitions', {
      search_query: filters.query || null,
      status_filter: filters.status || null,
      date_from: filters.dateFrom?.toISOString().split('T')[0] || null,
      date_to: filters.dateTo?.toISOString().split('T')[0] || null,
      limit_count: 20,
      offset_count: 0,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching exhibitions:', error);
    return { data: [], error };
  }
}

// 행사 고급 검색
export async function searchEvents(filters: AdvancedSearchFilters) {
  try {
    const { data, error } = await supabase.rpc('search_events', {
      search_query: filters.query || null,
      category_filter: filters.category || null,
      status_filter: filters.status || null,
      date_from: filters.dateFrom?.toISOString().split('T')[0] || null,
      date_to: filters.dateTo?.toISOString().split('T')[0] || null,
      limit_count: 20,
      offset_count: 0,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching events:', error);
    return { data: [], error };
  }
}

// 작가 검색
export async function searchArtists(filters: ArtistSearchFilters) {
  try {
    const { data, error } = await supabase.rpc('search_artists', {
      search_query: filters.query || null,
      nationality_filter: filters.nationality || null,
      artist_type_filter: filters.artistType || null,
      membership_type_filter: filters.membershipType || null,
      limit_count: 20,
      offset_count: 0,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching artists:', error);
    return { data: [], error };
  }
}

// 작품 검색
export async function searchArtworks(filters: ArtworkSearchFilters) {
  try {
    const { data, error } = await supabase.rpc('search_artworks', {
      search_query: filters.query || null,
      category_filter: filters.category || null,
      style_filter: filters.style || null,
      availability_filter: filters.availability || null,
      artist_id_filter: filters.artistId || null,
      year_from: filters.yearFrom || null,
      year_to: filters.yearTo || null,
      limit_count: 20,
      offset_count: 0,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching artworks:', error);
    return { data: [], error };
  }
}

// 통합 검색 (모든 콘텐츠 타입 - 작가와 작품 포함)
export async function searchAllContent(query: string, limit = 20) {
  try {
    const { data, error } = await supabase.rpc('search_all_content', {
      search_query: query,
      limit_count: limit,
    });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching all content:', error);
    return { data: [], error };
  }
}

// 간단한 텍스트 검색 (기존 방식과 호환)
export async function simpleSearch(
  table: 'notices' | 'exhibitions' | 'events' | 'artists' | 'artworks',
  query: string,
  limit = 20
) {
  try {
    let searchQuery = supabase
      .from(table)
      .select('*')
      .limit(limit);

    // 상태 필터링 (해당하는 테이블만)
    if (table === 'notices' || table === 'exhibitions' || table === 'events') {
      searchQuery = searchQuery.eq('status', 'published');
    }

    // 작품의 경우 구매 가능한 것만
    if (table === 'artworks') {
      searchQuery = searchQuery.eq('availability', 'available');
    }

    if (query) {
      searchQuery = searchQuery.textSearch('search_vector', query);
    }

    const { data, error } = await searchQuery;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error searching ${table}:`, error);
    return { data: [], error };
  }
}

// 작가별 작품 검색
export async function searchArtworksByArtist(artistId: string, query?: string, limit = 20) {
  try {
    const filters: ArtworkSearchFilters = {
      artistId,
      query,
    };
    
    return await searchArtworks(filters);
  } catch (error) {
    console.error('Error searching artworks by artist:', error);
    return { data: [], error };
  }
}

// 인기 검색어 (추후 구현을 위한 스켈레톤)
export async function getPopularSearchTerms(limit = 10) {
  // TODO: 검색 로그 테이블을 만들어서 인기 검색어 추적
  return { data: [], error: null };
}

// 검색 제안 (추후 구현을 위한 스켈레톤)
export async function getSearchSuggestions(query: string, limit = 5) {
  // TODO: 자동완성 기능 구현
  return { data: [], error: null };
}