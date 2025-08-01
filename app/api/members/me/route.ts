import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import { devAuth } from '@/lib/auth/dev-auth';
import { Member, ArtisticProfile, Achievement, Certification, ApiResponse } from '@/types/membership';

// GET /api/members/me - 현재 로그인한 사용자의 프로필 조회
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
      // 개발 모드에서 더미 데이터 반환
      const dummyMember: Member = {
        id: userId,
        clerk_user_id: userId,
        email: (await devAuth.getCurrentUser())?.email || 'test@example.com',
        first_name_ko: '김',
        last_name_ko: '예술',
        first_name_en: 'Art',
        last_name_en: 'Kim',
        phone: '010-1234-5678',
        date_of_birth: '1990-01-01',
        gender: 'female',
        nationality: 'KR',
        residence_country: '대한민국',
        residence_city: '서울',
        timezone: 'Asia/Seoul',
        preferred_language: 'ko',
        membership_level_id: 'student',
        membership_status: 'active',
        joined_date: '2024-01-01',
        last_active: new Date().toISOString(),
        profile_image_url: null,
        bio_ko: '한국 전통 예술을 사랑하는 예술가입니다.',
        bio_en: 'I am an artist who loves Korean traditional arts.',
        website_url: null,
        social_media: {},
        is_verified: true,
        is_public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      };

      const dummyArtisticProfile: ArtisticProfile = {
        id: '1',
        member_id: userId,
        primary_art_form: '서예',
        secondary_art_forms: ['한국화', '전각'],
        years_of_experience: 5,
        education_background: {
          degree: '서예학과',
          institution: '한국예술종합학교'
        },
        teaching_experience: {
          years: 2,
          students: 15
        },
        exhibition_history: {
          solo_exhibitions: 2,
          group_exhibitions: 8
        },
        awards_and_recognition: {
          awards: ['서예대전 우수상', '전통예술상']
        },
        artistic_statement_ko: '한국 전통 서예의 아름다움을 현대적으로 재해석하여 새로운 예술적 가치를 창조하고 있습니다.',
        artistic_statement_en: 'I reinterpret the beauty of Korean traditional calligraphy in a modern way to create new artistic values.',
        portfolio_url: null,
        preferred_style: '전통 서예',
        materials_specialty: ['한지', '먹', '붓'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      };

      const dummyAchievements: Achievement[] = [
        {
          id: '1',
          member_id: userId,
          title_ko: '서예대전 우수상',
          title_en: 'Calligraphy Exhibition Excellence Award',
          description_ko: '2023년 전국서예대전에서 우수상을 수상했습니다.',
          description_en: 'Received Excellence Award at the 2023 National Calligraphy Exhibition.',
          achievement_type: 'award',
          category: '서예',
          year: 2023,
          organization: '한국서예협회',
          certificate_url: null,
          is_verified: true,
          verified_by: 'admin',
          verified_at: '2023-12-01T00:00:00Z',
          created_at: '2023-12-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ];

      const dummyCertifications: Certification[] = [
        {
          id: '1',
          member_id: userId,
          name_ko: '서예지도사 2급',
          name_en: 'Calligraphy Instructor Level 2',
          issuing_organization: '한국서예협회',
          certification_type: 'instructor',
          level: '2급',
          issue_date: '2022-06-01',
          expiry_date: '2025-06-01',
          certificate_number: 'CERT-2022-001',
          certificate_url: null,
          is_verified: true,
          verified_by: 'admin',
          verified_at: '2022-06-01T00:00:00Z',
          created_at: '2022-06-01T00:00:00Z',
          updated_at: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          member: dummyMember,
          artistic_profile: dummyArtisticProfile,
          achievements: dummyAchievements,
          certifications: dummyCertifications
        }
      });
    }

    // 실제 Supabase에서 데이터 조회
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // 예술 프로필 조회
    const { data: artisticProfile } = await supabase
      .from('artistic_profiles')
      .select('*')
      .eq('member_id', member.id)
      .single();

    // 성과 조회
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });

    // 자격증 조회
    const { data: certifications } = await supabase
      .from('certifications')
      .select('*')
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        member,
        artistic_profile: artisticProfile,
        achievements: achievements || [],
        certifications: certifications || []
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 