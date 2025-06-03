#!/usr/bin/env node

/**
 * 마이그레이션 상태 확인 스크립트
 * 환경변수 설정 여부와 데이터베이스 상태를 확인합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ASCA 마이그레이션 상태 확인\n');

// 1. 환경변수 파일 확인
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 환경변수 파일 상태:');
console.log(`   .env.local: ${envExists ? '✅ 존재' : '❌ 없음'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID'
  ];
  
  console.log('\n🔑 필수 환경변수 확인:');
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName) && !envContent.includes(`${varName}=your_`);
    console.log(`   ${varName}: ${hasVar ? '✅ 설정됨' : '❌ 미설정'}`);
  });
} else {
  console.log('\n❗ .env.local 파일을 생성해야 합니다.');
  console.log('   다음 명령어로 템플릿을 복사하세요:');
  console.log('   cp env.example .env.local');
}

// 2. 마이그레이션 파일 확인
console.log('\n📋 마이그레이션 파일 상태:');
const migrationFiles = [
  'lib/airtable-migration.ts',
  'app/api/migration/migrate-all/route.ts',
  'app/api/migration/check-status/route.ts',
  'app/admin/migration/page.tsx'
];

migrationFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`   ${file}: ${exists ? '✅ 존재' : '❌ 없음'}`);
});

// 3. 다음 단계 안내
console.log('\n📝 다음 단계:');
if (!envExists) {
  console.log('1. 환경변수 파일 생성:');
  console.log('   cp env.example .env.local');
  console.log('2. .env.local 파일에서 다음 값들을 실제 값으로 교체:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - AIRTABLE_API_KEY');
  console.log('   - AIRTABLE_BASE_ID');
} else {
  console.log('1. 개발 서버 실행: npm run dev');
  console.log('2. 관리자 페이지 접속: http://localhost:3000/admin/migration');
  console.log('3. 마이그레이션 실행');
}

console.log('\n🔗 유용한 링크:');
console.log('   - Supabase 대시보드: https://supabase.com/dashboard');
console.log('   - Airtable API: https://airtable.com/developers/web/api/introduction');
console.log('   - Clerk 대시보드: https://dashboard.clerk.com/'); 