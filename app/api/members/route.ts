import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { devAuth } from '@/lib/auth/dev-auth';
import { memberService } from '@/lib/services/member-service';
import { CreateMemberRequest } from '@/lib/types/membership';

/**
 * API Route Handler for /api/members
 *
 * Next.js 의존성 처리만 담당:
 * - Request/Response 처리
 * - Supabase client 생성 (cookies 의존)
 * - 인증 확인 (devAuth)
 *
 * 비즈니스 로직은 memberService로 위임
 */

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
  // Next.js 의존성 처리
  const { userId, isDev } = await checkAuth();
  const supabase = await supabaseServer.createClient();
  const { searchParams } = new URL(request.url);

  // 비즈니스 로직은 service layer에 위임
  const result = await memberService.getMembers({
    supabase,
    userId,
    searchParams,
    isDev,
  });

  // HTTP 응답 변환
  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

// POST /api/members - 회원 생성
export async function POST(request: NextRequest) {
  // Next.js 의존성 처리
  const { userId, isDev } = await checkAuth();
  const supabase = await supabaseServer.createClient();
  const data: CreateMemberRequest = await request.json();

  // 비즈니스 로직은 service layer에 위임
  const result = await memberService.createMember({
    supabase,
    userId,
    data,
    isDev,
  });

  // HTTP 응답 변환
  if (!result.success) {
    let status = 500;
    if (result.error === 'Unauthorized') status = 401;
    else if (result.error === '이메일은 필수입니다') status = 400;

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
} 