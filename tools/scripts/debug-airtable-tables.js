#!/usr/bin/env node

/**
 * Airtable 테이블 구조 및 데이터 디버그 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function debugAirtableTables() {
  console.log('🔍 Airtable 테이블 구조 디버그 시작...\n')

  try {
    // 환경변수 확인
    console.log('1️⃣ 환경변수 확인...')
    if (!process.env.AIRTABLE_API_KEY) {
      console.log('   ❌ AIRTABLE_API_KEY가 설정되지 않았습니다.')
      return
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      console.log('   ❌ AIRTABLE_BASE_ID가 설정되지 않았습니다.')
      return
    }

    console.log(`   ✅ AIRTABLE_API_KEY: ${process.env.AIRTABLE_API_KEY.substring(0, 20)}...`)
    console.log(`   ✅ AIRTABLE_BASE_ID: ${process.env.AIRTABLE_BASE_ID}`)

    // Airtable 초기화
    console.log('\n2️⃣ Airtable 연결...')
    const Airtable = require('airtable')
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    )

    // 각 테이블별 개별 테스트
    const testTables = ['Artists', 'Artworks', 'Exhibitions', 'Events', 'Notices']

    for (const tableName of testTables) {
      console.log(`\n3️⃣ [${tableName}] 테이블 테스트...`)

      try {
        // 첫 번째 레코드만 가져와서 테이블 존재 여부 확인
        const records = await base(tableName)
          .select({
            maxRecords: 1,
          })
          .firstPage()

        if (records.length > 0) {
          console.log(`   ✅ [${tableName}] 테이블 존재 - 첫 번째 레코드 확인:`)
          console.log(`      ID: ${records[0].id}`)
          console.log(`      필드들: ${Object.keys(records[0].fields).join(', ')}`)

          // 전체 레코드 수 확인 (샘플링)
          const allRecords = await base(tableName)
            .select({
              fields: [Object.keys(records[0].fields)[0]], // 첫 번째 필드만 선택해서 빠르게
            })
            .all()

          console.log(`      총 레코드 수: ${allRecords.length}개`)
        } else {
          console.log(`   ⚠️ [${tableName}] 테이블이 비어있습니다.`)
        }
      } catch (error) {
        console.log(`   ❌ [${tableName}] 테이블 접근 실패:`)
        console.log(`      오류: ${error.message}`)

        if (error.message.includes('NOT_FOUND')) {
          console.log(`      → 테이블이 존재하지 않습니다.`)
        } else if (error.message.includes('INVALID_PERMISSIONS')) {
          console.log(`      → 접근 권한이 없습니다.`)
        }
      }
    }

    // Base 메타데이터 확인 (가능한 경우)
    console.log('\n4️⃣ Base 정보 확인...')
    try {
      // Airtable API로 Base 스키마 정보 가져오기
      const fetch = require('node-fetch')
      const response = await fetch(
        `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      )

      if (response.ok) {
        const metadata = await response.json()
        console.log('   ✅ Base 메타데이터 조회 성공:')

        if (metadata.tables && metadata.tables.length > 0) {
          console.log('   📋 실제 테이블 목록:')
          metadata.tables.forEach(table => {
            console.log(`      - ${table.name} (ID: ${table.id})`)
            console.log(`        필드 수: ${table.fields ? table.fields.length : 0}개`)
          })
        }
      } else {
        console.log('   ⚠️ Base 메타데이터 조회 실패 (권한 부족일 수 있음)')
      }
    } catch (metaError) {
      console.log('   ⚠️ Base 메타데이터 조회 중 오류:', metaError.message)
    }

    console.log('\n🎉 Airtable 디버그 완료!')
  } catch (error) {
    console.error('\n❌ 디버그 실패:', error.message)
    console.error('상세 오류:', error)
  }
}

debugAirtableTables()
