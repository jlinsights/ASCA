#!/usr/bin/env node

/**
 * Supabase 테이블 자동 생성 스크립트
 * 필요한 모든 테이블과 정책을 생성합니다.
 */

require('dotenv').config({ path: '.env.local' });

async function createSupabaseTables() {
  console.log('🏗️  Supabase 테이블 생성 시작...\n');

  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Service Role Key가 필요합니다 (테이블 생성을 위해)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.log('❌ SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.');
      console.log('Supabase 대시보드 > Settings > API에서 service_role key를 복사하여');
      console.log('.env.local 파일에 SUPABASE_SERVICE_ROLE_KEY=your_service_role_key를 추가하세요.');
      console.log('\n또는 Supabase 대시보드의 SQL Editor에서 직접 다음 SQL을 실행하세요:\n');
      
      console.log(getCreateTablesSQL());
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey
    );

    console.log('1️⃣ Artists 테이블 생성...');
    
    const createArtistsSQL = `
      CREATE TABLE IF NOT EXISTS public.artists (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT,
        name_ja TEXT,
        name_zh TEXT,
        bio TEXT DEFAULT '',
        bio_en TEXT,
        bio_ja TEXT,
        bio_zh TEXT,
        birth_year INTEGER,
        nationality TEXT,
        specialties TEXT[] DEFAULT '{}',
        awards TEXT[] DEFAULT '{}',
        exhibitions TEXT[] DEFAULT '{}',
        profile_image TEXT,
        membership_type TEXT DEFAULT '준회원',
        artist_type TEXT DEFAULT '일반작가',
        title TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createArtistsSQL 
    });

    if (createError) {
      console.error('   ❌ 테이블 생성 실패:', createError);
      console.log('\n수동으로 Supabase 대시보드에서 다음 SQL을 실행하세요:\n');
      console.log(getCreateTablesSQL());
      return;
    }

    console.log('   ✅ Artists 테이블 생성 완료');

    console.log('\n2️⃣ RLS 정책 설정...');
    
    const rlsPoliciesSQL = `
      -- RLS 활성화
      ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

      -- 기존 정책 삭제 (있다면)
      DROP POLICY IF EXISTS "Artists are viewable by everyone" ON public.artists;
      DROP POLICY IF EXISTS "Artists are insertable by authenticated users" ON public.artists;
      DROP POLICY IF EXISTS "Artists are updatable by authenticated users" ON public.artists;
      DROP POLICY IF EXISTS "Artists are deletable by authenticated users" ON public.artists;

      -- 새 정책 생성
      CREATE POLICY "Artists are viewable by everyone" ON public.artists
        FOR SELECT USING (true);

      CREATE POLICY "Artists are insertable by authenticated users" ON public.artists
        FOR INSERT WITH CHECK (true);

      CREATE POLICY "Artists are updatable by authenticated users" ON public.artists
        FOR UPDATE USING (true);

      CREATE POLICY "Artists are deletable by authenticated users" ON public.artists
        FOR DELETE USING (true);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: rlsPoliciesSQL 
    });

    if (rlsError) {
      console.error('   ❌ RLS 정책 설정 실패:', rlsError);
    } else {
      console.log('   ✅ RLS 정책 설정 완료');
    }

    console.log('\n🎉 테이블 생성 완료!');
    console.log('이제 마이그레이션을 실행할 수 있습니다.');

  } catch (error) {
    console.error('\n❌ 테이블 생성 실패:', error.message);
    console.log('\n수동으로 Supabase 대시보드에서 다음 SQL을 실행하세요:\n');
    console.log(getCreateTablesSQL());
  }
}

function getCreateTablesSQL() {
  return `
-- Artists 테이블 생성
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  name_zh TEXT,
  bio TEXT DEFAULT '',
  bio_en TEXT,
  bio_ja TEXT,
  bio_zh TEXT,
  birth_year INTEGER,
  nationality TEXT,
  specialties TEXT[] DEFAULT '{}',
  awards TEXT[] DEFAULT '{}',
  exhibitions TEXT[] DEFAULT '{}',
  profile_image TEXT,
  membership_type TEXT DEFAULT '준회원',
  artist_type TEXT DEFAULT '일반작가',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (모든 사용자)
CREATE POLICY "Artists are viewable by everyone" ON public.artists
  FOR SELECT USING (true);

-- 쓰기 권한 (모든 사용자 - 개발용)
CREATE POLICY "Artists are insertable by everyone" ON public.artists
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists are updatable by everyone" ON public.artists
  FOR UPDATE USING (true);

CREATE POLICY "Artists are deletable by everyone" ON public.artists
  FOR DELETE USING (true);
`;
}

createSupabaseTables(); 