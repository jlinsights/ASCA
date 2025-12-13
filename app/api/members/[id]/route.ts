import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { UpdateMemberRequest, ApiResponse, Member } from '@/types/membership';

// GET /api/members/[id] - 특정 회원 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 회원 정보 조회 (관계 데이터 포함)
    const { data: member, error } = await supabase
      .from('members')
      .select(`
        *,
        membership_level:membership_levels(*),
        artistic_profile:artistic_profiles(*),
        achievements:achievements(*),
        certifications:certifications(*),
        cultural_background:cultural_backgrounds(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Member not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: member });

  } catch (error) {
    logger.error('Error in GET /api/members/[id]', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - 회원 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: UpdateMemberRequest = await request.json();

    // 회원 존재 확인 및 권한 검증
    const { data: existingMember } = await supabase
      .from('members')
      .select('user_id, membership_level_id')
      .eq('id', id)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // 본인 또는 관리자만 수정 가능
    if (existingMember.user_id !== user.id) {
      // 관리자 권한 확인 로직 추가 필요
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 회원 정보 업데이트
    const { data: updatedMember, error } = await supabase
      .from('members')
      .update({
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
        timezone: body.timezone,
        preferred_language: body.preferred_language,
        membership_level_id: body.membership_level_id,
        membership_status: body.membership_status,
        profile_image_url: body.profile_image_url,
        bio_ko: body.bio_ko,
        bio_en: body.bio_en,
        website_url: body.website_url,
        social_media: body.social_media,
        is_public: body.is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        membership_level:membership_levels(*)
      `)
      .single();

    if (error) {
      logger.error('Error updating member', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { success: false, error: 'Failed to update member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedMember,
      message: '회원 정보가 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    logger.error('Error in PUT /api/members/[id]', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - 회원 삭제 (비활성화)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 회원 존재 확인
    const { data: existingMember } = await supabase
      .from('members')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // 본인 또는 관리자만 삭제 가능
    if (existingMember.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 회원 상태를 비활성화로 변경 (실제 삭제 대신)
    const { error } = await supabase
      .from('members')
      .update({
        membership_status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Error deactivating member', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '회원이 성공적으로 비활성화되었습니다.'
    });

  } catch (error) {
    logger.error('Error in DELETE /api/members/[id]', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 