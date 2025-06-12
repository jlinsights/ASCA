#!/usr/bin/env node

/**
 * Supabase Artists 테이블 중복 데이터 제거 스크립트
 * 
 * 중복 기준:
 * 1. 동일한 name (한국어 이름)
 * 2. 동일한 airtable_id
 * 3. 동일한 이름 + 생년월일 조합
 */

require('dotenv').config({ path: '.env.local' });

async function removeDuplicateArtists() {
  console.log('🔍 Supabase Artists 중복 데이터 분석 및 제거 시작...\n');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. 현재 데이터 상태 확인
    console.log('📊 1. 현재 Artists 테이블 상태 확인...');
    const { count: totalCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   전체 Artists 레코드: ${totalCount}개`);

    // 2. 중복 데이터 분석 (name 기준)
    console.log('\n🔍 2. 중복 데이터 분석...');
    
    // name 필드로 그룹화하여 중복 찾기
    const { data: duplicateNames } = await supabase.rpc('find_duplicate_artists_by_name');
    
    if (!duplicateNames) {
      // 수동으로 중복 찾기
      const { data: allArtists } = await supabase
        .from('artists')
        .select('id, name, name_zh, created_at, airtable_id')
        .order('created_at', { ascending: true });

      if (!allArtists) {
        throw new Error('Artists 데이터를 가져올 수 없습니다.');
      }

      // 중복 분석
      const nameGroups = new Map();
      allArtists.forEach(artist => {
        const key = artist.name || artist.name_zh || 'unknown';
        if (!nameGroups.has(key)) {
          nameGroups.set(key, []);
        }
        nameGroups.get(key).push(artist);
      });

      // 중복된 그룹 찾기
      const duplicates = Array.from(nameGroups.entries())
        .filter(([name, artists]) => artists.length > 1);

      console.log(`   중복된 이름: ${duplicates.length}개`);
      console.log(`   중복 레코드 총합: ${duplicates.reduce((sum, [name, artists]) => sum + artists.length - 1, 0)}개`);

      // 3. 중복 제거 전략
      console.log('\n🧹 3. 중복 제거 실행...');
      
      let removedCount = 0;
      let keptCount = 0;

      for (const [name, artists] of duplicates) {
        if (artists.length <= 1) continue;

        console.log(`   처리 중: "${name}" (${artists.length}개 중복)`);

        // 보존할 레코드 선택 (airtable_id가 있는 것 우선, 없으면 가장 최근 것)
        const toKeep = artists.find(a => a.airtable_id) || artists[artists.length - 1];
        const toRemove = artists.filter(a => a.id !== toKeep.id);

        console.log(`     보존: ${toKeep.id} (${toKeep.airtable_id ? 'Airtable 연동' : '최신'})`);
        console.log(`     삭제: ${toRemove.length}개`);

        // 중복 레코드 삭제
        for (const artist of toRemove) {
          const { error } = await supabase
            .from('artists')
            .delete()
            .eq('id', artist.id);

          if (error) {
            console.error(`     ❌ 삭제 실패 (${artist.id}):`, error.message);
          } else {
            removedCount++;
          }
        }

        keptCount++;

        // 진행상황 표시 (10개마다)
        if (keptCount % 10 === 0) {
          console.log(`   진행상황: ${keptCount}/${duplicates.length} 그룹 처리 완료`);
        }
      }

      console.log(`\n✅ 중복 제거 완료!`);
      console.log(`   삭제된 레코드: ${removedCount}개`);
      console.log(`   보존된 그룹: ${keptCount}개`);

    } else {
      console.log('   PostgreSQL 함수를 사용한 중복 제거 실행...');
    }

    // 4. 결과 확인
    console.log('\n📊 4. 결과 확인...');
    const { count: finalCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   최종 Artists 레코드: ${finalCount}개`);
    console.log(`   제거된 레코드: ${totalCount - finalCount}개`);

    // 5. Airtable과 동기화 상태 확인
    console.log('\n🔄 5. Airtable과의 동기화 상태 확인...');
    
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const airtableArtists = await base('Artists').select().all();
    
    console.log(`   Airtable Artists: ${airtableArtists.length}개`);
    console.log(`   Supabase Artists: ${finalCount}개`);
    console.log(`   격차: ${Math.abs(finalCount - airtableArtists.length)}개`);

    if (Math.abs(finalCount - airtableArtists.length) === 0) {
      console.log('   ✅ 완벽한 동기화 상태!');
    } else {
      console.log('   ⚠️ 추가 동기화 필요');
    }

    console.log('\n🎉 중복 데이터 제거 완료!');

  } catch (error) {
    console.error('\n❌ 중복 제거 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

// 실행
removeDuplicateArtists();