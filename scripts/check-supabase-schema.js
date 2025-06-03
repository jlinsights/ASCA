#!/usr/bin/env node

/**
 * Supabase 테이블 스키마 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' });

async function checkSupabaseSchema() {
  console.log('🔍 Supabase 스키마 확인...\n');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 1. 테이블 목록 확인
    console.log('1️⃣ 테이블 목록 확인...');
    
    // PostgreSQL 시스템 테이블에서 테이블 목록 조회
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list');

    if (tablesError) {
      console.log('   RPC 함수가 없으므로 직접 테이블 접근을 시도합니다...');
      
      // artists 테이블에 직접 접근 시도
      const { data: artistsTest, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .limit(1);

      if (artistsError) {
        console.error('   ❌ artists 테이블 접근 오류:', artistsError);
        
        // 테이블이 존재하지 않는 경우
        if (artistsError.code === '42P01') {
          console.log('\n🚨 artists 테이블이 존재하지 않습니다!');
          console.log('Supabase 대시보드에서 테이블을 생성해야 합니다.');
          
          console.log('\n📋 필요한 테이블 스키마:');
          console.log(`
CREATE TABLE public.artists (
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

-- 쓰기 권한 (인증된 사용자)
CREATE POLICY "Artists are insertable by authenticated users" ON public.artists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Artists are updatable by authenticated users" ON public.artists
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Artists are deletable by authenticated users" ON public.artists
  FOR DELETE USING (auth.role() = 'authenticated');
          `);
          
          return;
        }
      } else {
        console.log('   ✅ artists 테이블 접근 성공');
        console.log(`   현재 레코드 수: ${artistsTest?.length || 0}`);
      }
    }

    // 2. 간단한 삽입 테스트
    console.log('\n2️⃣ 간단한 삽입 테스트...');
    
    const testData = {
      name: 'TEST_ARTIST_' + Date.now(),
      bio: 'Test bio',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('artists')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('   ❌ 테스트 삽입 실패:', insertError);
    } else {
      console.log('   ✅ 테스트 삽입 성공:', insertResult[0]?.id);
      
      // 테스트 데이터 삭제
      await supabase
        .from('artists')
        .delete()
        .eq('id', insertResult[0].id);
      
      console.log('   ✅ 테스트 데이터 정리 완료');
    }

  } catch (error) {
    console.error('\n❌ 스키마 확인 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

checkSupabaseSchema(); 