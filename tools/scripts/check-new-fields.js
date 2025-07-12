#!/usr/bin/env node

/**
 * 새로 추가된 Airtable 필드 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' });

async function checkNewFields() {
  console.log('🔍 Airtable 새 필드 확인 시작...\n');

  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    console.log('📊 Artists 테이블에서 더 많은 샘플 레코드 조회...');
    
    // 더 많은 레코드를 가져와서 새 필드를 찾아보기
    const records = await base('Artists').select({
      maxRecords: 20,
      sort: [{ field: 'Name (Korean)', direction: 'asc' }]
    }).firstPage();

    if (records.length > 0) {
      console.log(`\n✅ ${records.length}개 레코드 확인 중...\n`);
      
      // 모든 필드 수집
      const allFields = new Set();
      records.forEach(record => {
        Object.keys(record.fields).forEach(field => allFields.add(field));
      });

      console.log('📋 발견된 모든 필드 목록:');
      Array.from(allFields).sort().forEach(field => {
        console.log(`   - ${field}`);
      });

      // Phone 필드가 있는 레코드 찾기
      const recordsWithPhone = records.filter(record => record.fields.Phone);
      console.log(`\n📞 Phone 필드가 있는 레코드: ${recordsWithPhone.length}개`);
      
      if (recordsWithPhone.length > 0) {
        recordsWithPhone.slice(0, 3).forEach((record, index) => {
          console.log(`\n--- Phone 필드 있는 레코드 ${index + 1} (ID: ${record.id}) ---`);
          Object.entries(record.fields).forEach(([key, value]) => {
            console.log(`   ${key}: ${JSON.stringify(value)}`);
          });
        });
      }

      // Email 필드가 있는 레코드 찾기
      const emailFields = ['Email', 'email', 'E-mail', 'EMAIL'];
      const recordsWithEmail = records.filter(record => 
        emailFields.some(field => record.fields[field])
      );
      console.log(`\n📧 Email 필드가 있는 레코드: ${recordsWithEmail.length}개`);

      // DOB 필드가 있는 레코드 찾기
      const dobFields = ['DOB', 'Date of Birth', 'Birth Date', 'Birthday', 'dob'];
      const recordsWithDOB = records.filter(record => 
        dobFields.some(field => record.fields[field])
      );
      console.log(`🎂 DOB 필드가 있는 레코드: ${recordsWithDOB.length}개`);

      console.log('\n🎯 새 필드 매핑 권장사항:');
      console.log('   Airtable 필드 → Supabase 필드');
      if (allFields.has('Phone')) {
        console.log('   ✅ Phone → phone');
      }
      
      emailFields.forEach(field => {
        if (allFields.has(field)) {
          console.log(`   ✅ ${field} → email`);
        }
      });
      
      dobFields.forEach(field => {
        if (allFields.has(field)) {
          console.log(`   ✅ ${field} → date_of_birth`);
        }
      });

    } else {
      console.log('❌ 레코드를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('\n❌ 확인 실패:', error.message);
  }
}

checkNewFields(); 