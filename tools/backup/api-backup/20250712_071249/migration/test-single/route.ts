import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { createArtist } from '@/lib/admin-api'
import type { Database } from '@/lib/supabase'

// Airtable 레코드 타입 명확화(간단 예시)
type AirtableArtistRecord = {
  id: string;
  fields: Record<string, any>;
};

type ArtistInsert = Database['public']['Tables']['artists']['Insert']

// 데이터 변환 함수
function transformAirtableArtist(record: AirtableArtistRecord): ArtistInsert {
  const fields = record.fields;
  return {
    name: fields['Name (Korean)'] || '',
    name_en: fields['Name (English)'] || null,
    name_ja: fields['Name (Japanese)'] || null,
    name_zh: fields['Name (Chinese)'] || null,
    bio: fields['Bio (Korean)'] || '',
    bio_en: fields['Bio (English)'] || null,
    bio_ja: fields['Bio (Japanese)'] || null,
    bio_zh: fields['Bio (Chinese)'] || null,
    birth_year: fields['Birth Year'] || null,
    nationality: fields['Nationality'] || null,
    specialties: fields['Specialties'] || [],
    awards: fields['Awards'] || [],
    exhibitions: fields['Exhibitions'] || [],
    profile_image: fields['Profile Image']?.[0]?.url || null,
    membership_type: fields['Membership Type'] || '준회원',
    artist_type: fields['Artist Type'] || '일반작가',
    title: fields['Title'] || null
  };
}

export async function POST(request: NextRequest) {
  try {
    // 환경변수 체크
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({
        success: false,
        message: 'Airtable credentials not configured',
        error: { code: 'NO_AIRTABLE_ENV' }
      }, { status: 400 })
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Supabase credentials not configured',
        error: { code: 'NO_SUPABASE_ENV' }
      }, { status: 400 })
    }

    const artists = await AirtableService.getAllArtists();

    // artists가 없거나 비어있으면 early return
    if (!artists || artists.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No artists found in Airtable',
        error: { code: 'NO_ARTISTS' }
      }, { status: 404 });
    }

    // firstArtist가 undefined일 가능성까지 방어
    const firstArtist = artists[0] as AirtableArtistRecord | undefined;
    if (!firstArtist) {
      return NextResponse.json({
        success: false,
        message: 'No first artist found in Airtable',
        error: { code: 'NO_FIRST_ARTIST' }
      }, { status: 404 });
    }

    // 데이터 변환
    const artistData = transformAirtableArtist(firstArtist);

    // Supabase에 저장
    const result = await createArtist(artistData);

    return NextResponse.json({
      success: true,
      message: 'Single artist migration completed successfully!',
      artist: {
        airtable_id: firstArtist.id,
        supabase_id: result.id,
        name: firstArtist.fields['Name (Korean)']
      }
    });
  } catch (error) {
    // 에러 정보 구조 통일
    const errorDetails = {
      message: 'Unknown error',
      code: null as string | null,
      details: null as any,
      hint: null as string | null,
      stack: null as string | null
    }
    if (error && typeof error === 'object') {
      if ('message' in error) errorDetails.message = String((error as any).message)
      if ('code' in error) errorDetails.code = String((error as any).code)
      if ('details' in error) errorDetails.details = (error as any).details
      if ('hint' in error) errorDetails.hint = String((error as any).hint)
      if ('stack' in error) errorDetails.stack = String((error as any).stack)
    } else {
      errorDetails.message = String(error)
    }
    return NextResponse.json({
      success: false,
      message: errorDetails.message,
      error: errorDetails,
      errorType: error?.constructor?.name || typeof error
    }, { status: 500 })
  }
} 