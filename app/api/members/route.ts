import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { devAuth } from '@/lib/auth/dev-auth';
import { logger } from '@/lib/utils/logger';
import { 
  CreateMemberRequest, 
  UpdateMemberRequest, 
  MemberSearchParams,
  MemberProfile
} from '@/lib/types/membership';

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Basic Member type for API responses
interface Member {
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

// 개발 환경에서 인증 확인
async function checkAuth() {
  // 개발 환경에서 개발 인증 확인
  if (process.env.NODE_ENV === 'development') {
    const isAuthenticated = await devAuth.isAuthenticated();
    if (isAuthenticated) {
      const user = await devAuth.getCurrentUser();
      return { userId: user?.id, isDev: true };
    }
  }

  return { userId: null, isDev: false };
}

// GET /api/members - 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { userId, isDev } = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
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

    if (error) {
      logger.error('회원 조회 오류', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { success: false, error: '회원 조회 실패' },
        { status: 500 }
      );
    }

    // 개발 환경에서는 더미 데이터 제공
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

      return NextResponse.json({
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
      });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    logger.error('API 오류', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
}

// POST /api/members - 회원 생성
export async function POST(request: NextRequest) {
  try {
    const { userId, isDev } = await checkAuth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateMemberRequest = await request.json();
    const supabase = await createClient();

    // 필수 필드 검증
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: '이메일은 필수입니다' },
        { status: 400 }
      );
    }

    const memberData = {
      email: body.email,
      first_name_ko: body.first_name_ko,
      last_name_ko: body.last_name_ko,
      first_name_en: body.first_name_en,
      last_name_en: body.last_name_en,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      nationality: body.nationality,
      residence_country: body.residence_country,
      residence_city: body.residence_city,
      timezone: body.timezone || 'Asia/Seoul',
      preferred_language: body.preferred_language || 'ko',
      membership_level_id: body.membership_level_id,
      membership_status: body.membership_status || 'active',
    };

    const { data: member, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      logger.error('회원 생성 오류', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { success: false, error: '회원 생성 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    logger.error('API 오류', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
} 