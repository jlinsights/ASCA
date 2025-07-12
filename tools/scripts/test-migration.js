#!/usr/bin/env node

/**
 * 마이그레이션 테스트 스크립트
 * 작은 배치로 마이그레이션을 테스트합니다.
 */

const fetch = require('node-fetch');

async function testMigration() {
  console.log('🧪 마이그레이션 테스트 시작...\n');

  try {
    // 1. Airtable 상태 확인
    console.log('1️⃣ Airtable 상태 확인...');
    const statusResponse = await fetch('http://localhost:3000/api/migration/check-status');
    const status = await statusResponse.json();
    console.log(`   Artists: ${status.airtable.artists}개`);
    console.log(`   Artworks: ${status.airtable.artworks}개`);
    console.log(`   Exhibitions: ${status.airtable.exhibitions}개\n`);

    // 2. 현재 Supabase 데이터 확인
    console.log('2️⃣ 현재 Supabase 데이터 확인...');
    const artistsResponse = await fetch('http://localhost:3000/api/artists');
    const artistsData = await artistsResponse.json();
    console.log(`   Supabase Artists: ${artistsData.artists?.length || 0}개\n`);

    // 3. 마이그레이션 실행
    console.log('3️⃣ 마이그레이션 실행...');
    const migrationResponse = await fetch('http://localhost:3000/api/migration/migrate-all', {
      method: 'POST'
    });
    
    const result = await migrationResponse.json();
    
    if (result.success) {
      console.log('✅ 마이그레이션 성공!');
      console.log(`   Artists: ${result.results.artists.success}/${result.results.artists.total}`);
      console.log(`   Artworks: ${result.results.artworks.success}/${result.results.artworks.total}`);
      console.log(`   Exhibitions: ${result.results.exhibitions.success}/${result.results.exhibitions.total}`);
    } else {
      console.log('❌ 마이그레이션 실패:');
      console.log(`   메시지: ${result.message}`);
      if (result.error) {
        console.log(`   오류: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

testMigration(); 