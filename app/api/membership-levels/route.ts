import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { devAuth } from '@/lib/auth/dev-auth';
import { MembershipLevel, ApiResponse } from '@/types/membership';

// GET /api/membership-levels - 등급 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 개발 모드에서 인증 확인
    let userId: string | null = null;
    const devUser = await devAuth.getCurrentUser();
    if (devUser) {
      userId = devUser.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Supabase 클라이언트 확인
    if (!supabase) {
      // 개발 모드에서 Supabase가 설정되지 않은 경우 더미 데이터 반환
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          data: [
            {
              id: '1',
              name: 'honorary_master',
              display_name_ko: '명예 마스터',
              display_name_en: 'Honorary Master',
              description_ko: '한국 서예 문화 발전에 기여한 명예 회원',
              description_en: 'Honorary members who have contributed to Korean calligraphy culture',
              requirements_ko: '특별한 공헌과 인정',
              requirements_en: 'Special contributions and recognition',
              privileges_ko: '모든 권한, 명예 이사 자격',
              privileges_en: 'All privileges, honorary director status',
              annual_fee: 0,
              max_members: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'certified_master',
              display_name_ko: '인증 마스터',
              display_name_en: 'Certified Master',
              description_ko: '서예 분야에서 뛰어난 실력과 경험을 인정받은 마스터',
              description_en: 'Masters recognized for exceptional skill and experience in calligraphy',
              requirements_ko: '최소 15년 경력, 마스터 작품 제출',
              requirements_en: 'Minimum 15 years experience, master work submission',
              privileges_ko: '강의, 심사, 전시 참여',
              privileges_en: 'Teaching, judging, exhibition participation',
              annual_fee: 500000,
              max_members: 50,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'advanced_practitioner',
              display_name_ko: '고급 실습자',
              display_name_en: 'Advanced Practitioner',
              description_ko: '서예 실력이 뛰어나고 지속적으로 발전하는 실습자',
              description_en: 'Practitioners with excellent calligraphy skills and continuous development',
              requirements_ko: '최소 8년 경력, 정기 작품 제출',
              requirements_en: 'Minimum 8 years experience, regular work submission',
              privileges_ko: '전시 참여, 워크샵 참가',
              privileges_en: 'Exhibition participation, workshop attendance',
              annual_fee: 300000,
              max_members: 200,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '4',
              name: 'student',
              display_name_ko: '학습자',
              display_name_en: 'Student',
              description_ko: '서예를 배우고 있는 학생 및 초보자',
              description_en: 'Students and beginners learning calligraphy',
              requirements_ko: '서예 학습 의지, 기본 작품 제출',
              requirements_en: 'Willingness to learn calligraphy, basic work submission',
              privileges_ko: '기본 교육, 자료 접근',
              privileges_en: 'Basic education, material access',
              annual_fee: 150000,
              max_members: 1000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '5',
              name: 'institutional_member',
              display_name_ko: '기관 회원',
              display_name_en: 'Institutional Member',
              description_ko: '서예 관련 기관, 학교, 단체',
              description_en: 'Calligraphy-related institutions, schools, organizations',
              requirements_ko: '기관 인증, 서예 관련 활동',
              requirements_en: 'Institution certification, calligraphy-related activities',
              privileges_ko: '기관 협력, 공동 프로젝트',
              privileges_en: 'Institutional collaboration, joint projects',
              annual_fee: 1000000,
              max_members: 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: '6',
              name: 'international_associate',
              display_name_ko: '국제 협력자',
              display_name_en: 'International Associate',
              description_ko: '해외 서예가 및 문화 교류 기관',
              description_en: 'International calligraphers and cultural exchange institutions',
              requirements_ko: '해외 활동, 문화 교류 의지',
              requirements_en: 'International activities, cultural exchange willingness',
              privileges_ko: '국제 교류, 협력 프로젝트',
              privileges_en: 'International exchange, collaboration projects',
              annual_fee: 200000,
              max_members: 300,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    const { data: levels, error } = await supabase
      .from('membership_levels')
      .select('*')
      .order('id');

    if (error) {
      return NextResponse.json(
        { success: false, error: '등급 조회 실패' },
        { status: 500 }
      );
    }

    // 개발 모드에서 데이터가 없으면 더미 데이터 반환
    if (process.env.NODE_ENV === 'development' && (!levels || levels.length === 0)) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'honorary_master',
            display_name_ko: '명예 마스터',
            display_name_en: 'Honorary Master',
            description_ko: '한국 서예 문화 발전에 기여한 명예 회원',
            description_en: 'Honorary members who have contributed to Korean calligraphy culture',
            requirements_ko: '특별한 공헌과 인정',
            requirements_en: 'Special contributions and recognition',
            privileges_ko: '모든 권한, 명예 이사 자격',
            privileges_en: 'All privileges, honorary director status',
            annual_fee: 0,
            max_members: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'certified_master',
            display_name_ko: '인증 마스터',
            display_name_en: 'Certified Master',
            description_ko: '서예 분야에서 뛰어난 실력과 경험을 인정받은 마스터',
            description_en: 'Masters recognized for exceptional skill and experience in calligraphy',
            requirements_ko: '최소 15년 경력, 마스터 작품 제출',
            requirements_en: 'Minimum 15 years experience, master work submission',
            privileges_ko: '강의, 심사, 전시 참여',
            privileges_en: 'Teaching, judging, exhibition participation',
            annual_fee: 500000,
            max_members: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'advanced_practitioner',
            display_name_ko: '고급 실습자',
            display_name_en: 'Advanced Practitioner',
            description_ko: '서예 실력이 뛰어나고 지속적으로 발전하는 실습자',
            description_en: 'Practitioners with excellent calligraphy skills and continuous development',
            requirements_ko: '최소 8년 경력, 정기 작품 제출',
            requirements_en: 'Minimum 8 years experience, regular work submission',
            privileges_ko: '전시 참여, 워크샵 참가',
            privileges_en: 'Exhibition participation, workshop attendance',
            annual_fee: 300000,
            max_members: 200,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'student',
            display_name_ko: '학습자',
            display_name_en: 'Student',
            description_ko: '서예를 배우고 있는 학생 및 초보자',
            description_en: 'Students and beginners learning calligraphy',
            requirements_ko: '서예 학습 의지, 기본 작품 제출',
            requirements_en: 'Willingness to learn calligraphy, basic work submission',
            privileges_ko: '기본 교육, 자료 접근',
            privileges_en: 'Basic education, material access',
            annual_fee: 150000,
            max_members: 1000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            name: 'institutional_member',
            display_name_ko: '기관 회원',
            display_name_en: 'Institutional Member',
            description_ko: '서예 관련 기관, 학교, 단체',
            description_en: 'Calligraphy-related institutions, schools, organizations',
            requirements_ko: '기관 인증, 서예 관련 활동',
            requirements_en: 'Institution certification, calligraphy-related activities',
            privileges_ko: '기관 협력, 공동 프로젝트',
            privileges_en: 'Institutional collaboration, joint projects',
            annual_fee: 1000000,
            max_members: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '6',
            name: 'international_associate',
            display_name_ko: '국제 협력자',
            display_name_en: 'International Associate',
            description_ko: '해외 서예가 및 문화 교류 기관',
            description_en: 'International calligraphers and cultural exchange institutions',
            requirements_ko: '해외 활동, 문화 교류 의지',
            requirements_en: 'International activities, cultural exchange willingness',
            privileges_ko: '국제 교류, 협력 프로젝트',
            privileges_en: 'International exchange, collaboration projects',
            annual_fee: 200000,
            max_members: 300,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      data: levels
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
}

// POST /api/membership-levels - 새 등급 생성
export async function POST(request: NextRequest) {
  try {
    // 개발 모드에서 인증 확인
    let userId: string | null = null;
    const devUser = await devAuth.getCurrentUser();
    if (devUser && devUser.role === 'admin') {
      userId = devUser.id;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Supabase 클라이언트 확인
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('membership_levels')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: '등급 생성 실패' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
} 