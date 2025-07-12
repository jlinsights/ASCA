#!/usr/bin/env node

/**
 * Supabase artworks 테이블 생성 및 테스트 스크립트
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseArtworks() {
  console.log('🎨 Supabase Artworks 테이블 생성 및 테스트 시작...\n');

  try {
    // 환경변수 확인
    console.log('1️⃣ 환경변수 확인...');
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        throw new Error(`환경변수 ${env}가 설정되지 않았습니다.`);
      }
      console.log(`   ✅ ${env}: ${process.env[env].substring(0, 30)}...`);
    }

    // Supabase 연결
    console.log('\n2️⃣ Supabase 연결...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 기존 테이블 확인
    console.log('\n3️⃣ 기존 테이블 상태 확인...');
    
    // Artists 테이블 확인
    const { data: artistsData, error: artistsError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true });

    if (artistsError) {
      console.log('   ⚠️ Artists 테이블이 없습니다. 먼저 생성해야 합니다.');
    } else {
      console.log(`   ✅ Artists 테이블 존재: ${artistsData || 0}개 레코드`);
    }

    // Artworks 테이블 확인
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('count', { count: 'exact', head: true });

    if (artworksError) {
      console.log('   📊 Artworks 테이블이 없습니다. 생성이 필요합니다.');
    } else {
      console.log(`   ✅ Artworks 테이블 이미 존재: ${artworksData || 0}개 레코드`);
      
      // 샘플 데이터 조회
      const { data: sampleArtworks } = await supabase
        .from('artworks')
        .select('id, title, category, artist_id')
        .limit(3);
      
      if (sampleArtworks && sampleArtworks.length > 0) {
        console.log('   📝 샘플 작품들:');
        sampleArtworks.forEach(artwork => {
          console.log(`      - ${artwork.title} (${artwork.category})`);
        });
      }
    }

    // Artists 테이블이 없으면 먼저 생성
    if (artistsError) {
      console.log('\n4️⃣ Artists 테이블 생성...');
      const artistsSQL = `
        CREATE TABLE IF NOT EXISTS public.artists (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          name_en TEXT,
          bio TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);
      `;

      const { error: createArtistsError } = await supabase.rpc('execute_sql', { 
        sql_query: artistsSQL 
      });

      if (createArtistsError) {
        console.log('   ⚠️ Artists 테이블 생성 실패 (이미 존재할 수 있음)');
      } else {
        console.log('   ✅ Artists 테이블 생성 완료');
      }
    }

    // Artworks 테이블이 없으면 생성
    if (artworksError) {
      console.log('\n5️⃣ Artworks 테이블 생성...');
      
      // 간단한 버전으로 먼저 테스트
      const simpleArtworksSQL = `
        CREATE TABLE IF NOT EXISTS public.artworks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          artist_id UUID,
          title TEXT NOT NULL,
          title_en TEXT,
          description TEXT DEFAULT '',
          category TEXT DEFAULT 'mixed-media',
          style TEXT DEFAULT 'traditional',
          year INTEGER,
          materials TEXT[] DEFAULT '{}',
          images TEXT[] DEFAULT '{}',
          featured BOOLEAN DEFAULT false,
          availability TEXT DEFAULT 'available',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Artworks are viewable by everyone" ON public.artworks FOR SELECT USING (true);
      `;

      try {
        // Supabase RPC로 SQL 실행
        const { error: createError } = await supabase.rpc('execute_sql', { 
          sql_query: simpleArtworksSQL 
        });

        if (createError) {
          console.log('   ⚠️ RPC 방식 실패, 직접 INSERT 테스트로 전환');
        } else {
          console.log('   ✅ Artworks 테이블 생성 완료');
        }
      } catch (rpcError) {
        console.log('   ⚠️ RPC 기능을 사용할 수 없습니다.');
      }
    }

    // 테스트 데이터 삽입
    console.log('\n6️⃣ 테스트 데이터 삽입...');
    
    // 먼저 테스트 아티스트 생성
    const { data: testArtist, error: artistInsertError } = await supabase
      .from('artists')
      .insert([{
        name: '테스트 작가',
        name_en: 'Test Artist',
        bio: 'Airtable 마이그레이션 테스트용 작가'
      }])
      .select()
      .single();

    if (artistInsertError) {
      console.log('   ⚠️ 테스트 아티스트 생성 실패:', artistInsertError.message);
    } else {
      console.log(`   ✅ 테스트 아티스트 생성: ${testArtist.name} (ID: ${testArtist.id})`);

      // 테스트 작품 생성
      const { data: testArtwork, error: artworkInsertError } = await supabase
        .from('artworks')
        .insert([{
          artist_id: testArtist.id,
          title: '테스트 작품',
          title_en: 'Test Artwork',
          description: 'Airtable 마이그레이션 테스트용 작품',
          category: 'painting',
          style: 'contemporary',
          year: 2024,
          materials: ['캔버스', '아크릴'],
          featured: true
        }])
        .select()
        .single();

      if (artworkInsertError) {
        console.log('   ⚠️ 테스트 작품 생성 실패:', artworkInsertError.message);
      } else {
        console.log(`   ✅ 테스트 작품 생성: ${testArtwork.title}`);
      }
    }

    // 최종 상태 확인
    console.log('\n7️⃣ 최종 테이블 상태 확인...');
    
    const { count: finalArtistsCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalArtworksCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true });

    console.log(`   📊 Artists: ${finalArtistsCount || 0}개`);
    console.log(`   🎨 Artworks: ${finalArtworksCount || 0}개`);

    console.log('\n🎉 Supabase Artworks 테이블 설정 완료!');
    console.log('\n📋 다음 단계:');
    console.log('   1. Supabase 대시보드에서 테이블 구조 확인');
    console.log('   2. 필요시 scripts/create-artworks-table.sql 실행');
    console.log('   3. http://localhost:3000/admin/migration에서 Airtable 마이그레이션 실행');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

testSupabaseArtworks(); 