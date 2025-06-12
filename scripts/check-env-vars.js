#!/usr/bin/env node

/**
 * 환경변수 설정 확인 스크립트
 * 동기화에 필요한 모든 환경변수가 올바르게 설정되어 있는지 확인합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 환경변수 설정 확인...\n');

// 필수 환경변수 목록
const requiredEnvVars = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID', 
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// 선택적 환경변수
const optionalEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'V0_API_KEY'
];

async function checkEnvironment() {
  console.log('📁 환경변수 파일 확인...');
  
  // .env.local 파일 존재 확인
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envLocalExists = fs.existsSync(envLocalPath);
  
  console.log(`   .env.local: ${envLocalExists ? '✅ 존재함' : '❌ 없음'}`);
  
  if (!envLocalExists) {
    console.log('\n⚠️ .env.local 파일이 없습니다.');
    console.log('💡 env.example 파일을 복사하여 .env.local을 만들고 실제 값으로 채워주세요:');
    console.log('   cp env.example .env.local');
    return;
  }

  console.log('\n🔑 필수 환경변수 확인...');
  
  let missingVars = [];
  let setVars = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    
    if (!value || value.includes('your_') || value.includes('_here')) {
      missingVars.push(varName);
      console.log(`   ${varName}: ❌ 미설정 또는 기본값`);
    } else {
      setVars.push(varName);
      // 민감한 정보는 마스킹해서 표시
      const maskedValue = value.length > 8 ? 
        value.substring(0, 8) + '*'.repeat(value.length - 8) : 
        '*'.repeat(value.length);
      console.log(`   ${varName}: ✅ 설정됨 (${maskedValue})`);
    }
  });

  console.log('\n🔧 선택적 환경변수 확인...');
  optionalEnvVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && !value.includes('your_') && !value.includes('_here');
    console.log(`   ${varName}: ${isSet ? '✅ 설정됨' : '⚪ 미설정'}`);
  });

  // Airtable 연결 테스트
  if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
    console.log('\n🔗 Airtable 연결 테스트...');
    await testAirtableConnection();
  }

  // Supabase 연결 테스트  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('\n🔗 Supabase 연결 테스트...');
    await testSupabaseConnection();
  }

  // 결과 요약
  console.log('\n📊 환경변수 설정 요약:');
  console.log(`   ✅ 설정된 필수 변수: ${setVars.length}/${requiredEnvVars.length}`);
  console.log(`   ❌ 누락된 필수 변수: ${missingVars.length}`);

  if (missingVars.length > 0) {
    console.log('\n⚠️ 다음 환경변수를 설정해야 합니다:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n💡 설정 가이드:');
    console.log('   1. .env.local 파일을 열어주세요');
    console.log('   2. 각 서비스의 실제 키값으로 교체해주세요');
    console.log('   3. 개발 서버를 재시작해주세요 (npm run dev)');
  } else {
    console.log('\n✅ 모든 필수 환경변수가 설정되었습니다!');
  }
}

async function testAirtableConnection() {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_BASE_ID);

    // Artists 테이블에서 1개 레코드만 가져와서 테스트
    const records = await base('Artists').select({
      maxRecords: 1
    }).firstPage();

    console.log(`   ✅ Airtable 연결 성공 (Artists 테이블: ${records.length > 0 ? '데이터 있음' : '데이터 없음'})`);
    
    if (records.length > 0) {
      const sampleRecord = records[0];
      const fieldCount = Object.keys(sampleRecord.fields).length;
      console.log(`   📊 샘플 레코드 필드 수: ${fieldCount}개`);
    }
    
  } catch (error) {
    console.log(`   ❌ Airtable 연결 실패: ${error.message}`);
    
    if (error.message.includes('AUTHENTICATION_REQUIRED')) {
      console.log('   💡 API 키를 확인해주세요');
    } else if (error.message.includes('NOT_FOUND')) {
      console.log('   💡 Base ID나 테이블명을 확인해주세요');
    }
  }
}

async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log(`   ✅ Supabase 연결 성공 (artists 테이블 레코드 수: ${data || 0}개)`);

  } catch (error) {
    console.log(`   ❌ Supabase 연결 실패: ${error.message}`);
    
    if (error.message.includes('Invalid API key')) {
      console.log('   💡 Supabase API 키를 확인해주세요');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('   💡 데이터베이스 테이블이 생성되지 않았을 수 있습니다');
    }
  }
}

// 실행
checkEnvironment().catch(console.error); 