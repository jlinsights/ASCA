import { SupabaseClient } from '@supabase/supabase-js';
import { CreateMemberRequest, MemberSearchParams } from '../types/membership';

/**
 * Member Service
 *
 * 비즈니스 로직을 Next.js 의존성에서 분리한 순수 서비스 레이어
 * - Next.js runtime (cookies, headers 등) 의존성 없음
 * - 완전히 테스트 가능한 순수 함수
 * - Dependency Injection 패턴 사용
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  members: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Member Type
export interface Member {
  id: string;
  email: string;
  first_name_ko: string;
  last_name_ko: string;
  membership_status: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled';
  membership_level_id: string;
  timezone: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  joined_date: string;
  last_active: string;
  social_media?: Record<string, string>;
  is_verified: boolean;
  is_public: boolean;
}

// Service Parameters
export interface GetMembersParams {
  supabase: SupabaseClient;
  userId: string | null;
  searchParams: URLSearchParams;
  isDev?: boolean;
}

export interface CreateMemberParams {
  supabase: SupabaseClient;
  userId: string | null;
  data: CreateMemberRequest;
  isDev?: boolean;
}

/**
 * Member Service Class
 *
 * 모든 회원 관련 비즈니스 로직을 처리합니다.
 * Next.js 의존성이 없어 독립적으로 테스트 가능합니다.
 */
export class MemberService {
  /**
   * 회원 목록 조회
   *
   * @param params - Supabase client, userId, searchParams, isDev
   * @returns PaginatedResponse with members list
   */
  async getMembers(params: GetMembersParams): Promise<ApiResponse<PaginatedResponse<Member>>> {
    const { supabase, userId, searchParams, isDev = false } = params;

    // 인증 확인
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    try {
      // 검색 파라미터 파싱
      const query = searchParams.get('query');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const level = searchParams.get('level');
      const sortBy = searchParams.get('sortBy') || 'created_at';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      // 기본 쿼리 구성
      let supabaseQuery = supabase
        .from('members')
        .select(`
          *,
          membership_level:membership_levels(*)
        `);

      // 검색 조건 추가
      if (query) {
        supabaseQuery = supabaseQuery.or(`
          first_name_ko.ilike.%${query}%,
          last_name_ko.ilike.%${query}%,
          first_name_en.ilike.%${query}%,
          last_name_en.ilike.%${query}%,
          email.ilike.%${query}%
        `);
      }

      if (status) {
        supabaseQuery = supabaseQuery.eq('membership_status', status);
      }

      if (level) {
        supabaseQuery = supabaseQuery.eq('membership_level_id', level);
      }

      // 정렬 및 페이지네이션
      supabaseQuery = supabaseQuery
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      const { data: members, error, count } = await supabaseQuery;

      // 개발/테스트 환경에서 데이터베이스 오류 시 더미 데이터 제공
      if (error && isDev) {
        console.log('[Dev Mode] Supabase error, returning dummy data:', error.message);
        const dummyMembers: Member[] = [
          {
            id: 'dev-1',
            email: 'admin@dev.com',
            first_name_ko: '관리자',
            last_name_ko: '개발',
            membership_status: 'active',
            membership_level_id: 'honorary_master',
            timezone: 'Asia/Seoul',
            preferred_language: 'ko',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            joined_date: new Date().toISOString(),
            last_active: new Date().toISOString(),
            social_media: {},
            is_verified: true,
            is_public: true,
          },
          {
            id: 'dev-2',
            email: 'member@dev.com',
            first_name_ko: '회원',
            last_name_ko: '테스트',
            membership_status: 'active',
            membership_level_id: 'advanced_practitioner',
            timezone: 'Asia/Seoul',
            preferred_language: 'ko',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            joined_date: new Date().toISOString(),
            last_active: new Date().toISOString(),
            social_media: {},
            is_verified: true,
            is_public: true,
          },
        ];

        return {
          success: true,
          data: {
            members: dummyMembers,
            pagination: {
              page,
              limit,
              total: dummyMembers.length,
              totalPages: 1,
            },
          },
        };
      }

      if (error) {
        return {
          success: false,
          error: '회원 조회 실패',
        };
      }

      // 개발 환경에서는 빈 결과일 때도 더미 데이터 제공
      if (isDev && (!members || members.length === 0)) {
        const dummyMembers: Member[] = [
          {
            id: 'dev-1',
            email: 'admin@dev.com',
            first_name_ko: '관리자',
            last_name_ko: '개발',
            membership_status: 'active',
            membership_level_id: 'honorary_master',
            timezone: 'Asia/Seoul',
            preferred_language: 'ko',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            joined_date: new Date().toISOString(),
            last_active: new Date().toISOString(),
            social_media: {},
            is_verified: true,
            is_public: true,
          },
          {
            id: 'dev-2',
            email: 'member@dev.com',
            first_name_ko: '회원',
            last_name_ko: '테스트',
            membership_status: 'active',
            membership_level_id: 'advanced_practitioner',
            timezone: 'Asia/Seoul',
            preferred_language: 'ko',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            joined_date: new Date().toISOString(),
            last_active: new Date().toISOString(),
            social_media: {},
            is_verified: true,
            is_public: true,
          },
        ];

        return {
          success: true,
          data: {
            members: dummyMembers,
            pagination: {
              page,
              limit,
              total: dummyMembers.length,
              totalPages: 1,
            },
          },
        };
      }

      return {
        success: true,
        data: {
          members: members || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: '서버 오류',
      };
    }
  }

  /**
   * 회원 생성
   *
   * @param params - Supabase client, userId, data, isDev
   * @returns Created member data
   */
  async createMember(params: CreateMemberParams): Promise<ApiResponse<Member>> {
    const { supabase, userId, data, isDev = false } = params;

    // 인증 확인
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    try {
      // 필수 필드 검증
      if (!data.email) {
        return {
          success: false,
          error: '이메일은 필수입니다',
        };
      }

      const memberData = {
        email: data.email,
        first_name_ko: data.first_name_ko,
        last_name_ko: data.last_name_ko,
        first_name_en: data.first_name_en,
        last_name_en: data.last_name_en,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        nationality: data.nationality,
        residence_country: data.residence_country,
        residence_city: data.residence_city,
        timezone: data.timezone || 'Asia/Seoul',
        preferred_language: data.preferred_language || 'ko',
        membership_level_id: data.membership_level_id,
        membership_status: data.membership_status || 'active',
      };

      const { data: member, error } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single();

      // 개발/테스트 환경에서 데이터베이스 오류 시 모의 응답 제공
      if (error && isDev) {
        console.log('[Dev Mode] Supabase error on member creation, returning mock data:', error.message);
        const mockMember: Member = {
          id: `dev-${Date.now()}`,
          ...memberData,
          first_name_ko: memberData.first_name_ko || '홍',
          last_name_ko: memberData.last_name_ko || '길동',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          joined_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          social_media: {},
          is_verified: false,
          is_public: false,
        };

        return {
          success: true,
          data: mockMember,
          message: '[Dev Mode] Mock member created',
        };
      }

      if (error) {
        return {
          success: false,
          error: '회원 생성 실패',
        };
      }

      return {
        success: true,
        data: member,
      };
    } catch (error) {
      return {
        success: false,
        error: '서버 오류',
      };
    }
  }
}

// Singleton instance
export const memberService = new MemberService();
