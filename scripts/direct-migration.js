#!/usr/bin/env node

/**
 * 직접 마이그레이션 스크립트
 * API를 거치지 않고 직접 Airtable에서 Supabase로 데이터를 마이그레이션합니다.
 */

require('dotenv').config({ path: '.env.local' });

async function directMigration() {
  console.log('🚀 직접 마이그레이션 시작...\n');

  try {
    // 환경변수 확인
    console.log('1️⃣ 환경변수 확인...');
    const requiredEnvs = [
      'AIRTABLE_API_KEY',
      'AIRTABLE_BASE_ID', 
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        throw new Error(`환경변수 ${env}가 설정되지 않았습니다.`);
      }
      console.log(`   ✅ ${env}: ${process.env[env].substring(0, 10)}...`);
    }

    // Airtable 연결 테스트
    console.log('\n2️⃣ Airtable 연결 테스트...');
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    
    // 첫 번째 아티스트 가져오기
    const records = await base('Artists').select({ maxRecords: 1 }).firstPage();
    
    if (records.length === 0) {
      throw new Error('Airtable에서 아티스트 데이터를 찾을 수 없습니다.');
    }

    const firstRecord = records[0];
    console.log(`   ✅ 첫 번째 아티스트: ${firstRecord.fields['Name (Korean)'] || '이름 없음'}`);

    // Supabase 연결 테스트
    console.log('\n3️⃣ Supabase 연결 테스트...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 테이블 존재 확인
    const { data: tables, error: tablesError } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true });

    if (tablesError) {
      console.error('   ❌ Supabase 테이블 오류:', tablesError);
      throw new Error(`Supabase 연결 실패: ${tablesError.message}`);
    }

    console.log(`   ✅ Supabase 연결 성공 (현재 아티스트 수: ${tables || 0})`);

    // 데이터 변환 및 삽입 테스트
    console.log('\n4️⃣ 데이터 변환 및 삽입 테스트...');
    
    const artistData = {
      name: firstRecord.fields['Name (Korean)'] || '',
      name_en: firstRecord.fields['Name (English)'] || null,
      name_ja: firstRecord.fields['Name (Japanese)'] || null,
      name_zh: firstRecord.fields['Name (Chinese)'] || null,
      bio: firstRecord.fields['Bio (Korean)'] || '',
      bio_en: firstRecord.fields['Bio (English)'] || null,
      bio_ja: firstRecord.fields['Bio (Japanese)'] || null,
      bio_zh: firstRecord.fields['Bio (Chinese)'] || null,
      birth_year: firstRecord.fields['Birth Year'] || null,
      nationality: firstRecord.fields['Nationality'] || null,
      specialties: firstRecord.fields['Specialties'] || [],
      awards: firstRecord.fields['Awards'] || [],
      exhibitions: firstRecord.fields['Exhibitions'] || [],
      profile_image: firstRecord.fields['Profile Image']?.[0]?.url || null,
      membership_type: firstRecord.fields['Membership Type'] || '준회원',
      artist_type: firstRecord.fields['Artist Type'] || '일반작가',
      title: firstRecord.fields['Title'] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('   변환된 데이터:', JSON.stringify(artistData, null, 2));

    // Supabase에 삽입
    console.log('\n   Supabase에 데이터 삽입 중...');
    const { data: insertedArtist, error: insertError } = await supabase
      .from('artists')
      .insert([artistData])
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ 삽입 오류 상세 정보:');
      console.error('   - 오류 코드:', insertError.code);
      console.error('   - 오류 메시지:', insertError.message);
      console.error('   - 오류 세부사항:', insertError.details);
      console.error('   - 오류 힌트:', insertError.hint);
      console.error('   - 전체 오류 객체:', JSON.stringify(insertError, null, 2));
      throw new Error(`데이터 삽입 실패: ${insertError.message || '알 수 없는 오류'}`);
    }

    console.log(`   ✅ 아티스트 삽입 성공! ID: ${insertedArtist.id}`);

    console.log('\n🎉 직접 마이그레이션 테스트 완료!');
    console.log('이제 전체 마이그레이션을 실행할 수 있습니다.');

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

directMigration(); 