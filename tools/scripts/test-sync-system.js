#!/usr/bin/env node

/**
 * 실시간 동기화 시스템 테스트 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function testSyncSystem() {
  console.log('🧪 실시간 동기화 시스템 테스트 시작...\n')

  const baseUrl = 'http://localhost:3000'

  try {
    // 1. 동기화 상태 확인
    console.log('1️⃣ 동기화 상태 확인...')
    const statusResponse = await fetch(`${baseUrl}/api/sync/status`)
    const statusData = await statusResponse.json()

    console.log(`   Artists: ${statusData.data_counts.artists}개`)
    console.log(`   Artworks: ${statusData.data_counts.artworks}개`)
    console.log(`   최근 24시간 동기화: ${statusData.sync_status.last_24h.total}건`)

    // 2. Airtable 상태 확인 (공개 API는 503 — Secure API 안내)
    console.log('\n2️⃣ Airtable 연결 상태 확인...')
    const airtableResponse = await fetch(`${baseUrl}/api/migration/check-status`)
    const airtableData = await airtableResponse.json()

    if (airtableResponse.status === 503) {
      console.log('   ⛔ 공개 /api/migration/check-status 는 비활성화됨')
      console.log('   💡 대신 GET /api/secure/migration/check-status (admin 인증) 사용')
      console.log(`   응답: ${airtableData.message || 'disabled'}`)
    } else if (airtableData.airtable) {
      console.log(`   Airtable Artists: ${airtableData.airtable.artists}개`)
      console.log(`   Airtable Artworks: ${airtableData.airtable.artworks}개`)
    } else {
      console.log('   ⚠️ Airtable 상태 응답 형식이 예상과 다릅니다')
    }

    // 3. 동기화 격차 분석 (공개 check-status가 막힌 경우 스킵)
    console.log('\n3️⃣ 동기화 격차 분석...')
    if (airtableResponse.status === 503 || !airtableData.airtable) {
      console.log('   ⏭️ Airtable 공개 상태 API 비활성으로 격차 분석 스킵')
      console.log('   💡 Secure check-status 결과와 /api/sync/status 카운트를 비교하세요')
    } else {
      const artistGap = Math.abs(statusData.data_counts.artists - airtableData.airtable.artists)
      const artworkGap = Math.abs(statusData.data_counts.artworks - airtableData.airtable.artworks)

      console.log(`   Artists 격차: ${artistGap}개`)
      console.log(`   Artworks 격차: ${artworkGap}개`)

      if (artistGap === 0) {
        console.log('   ✅ Artists 데이터 동기화 완료')
      } else {
        console.log('   ⚠️ Artists 데이터 동기화 필요')
      }
    }

    // 4. 새로운 필드 확인
    console.log('\n4️⃣ 새로운 필드 확인...')

    // Airtable에서 샘플 데이터로 새 필드 확인
    const Airtable = require('airtable')
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    )

    const sampleRecords = await base('Artists')
      .select({
        maxRecords: 5,
        filterByFormula: "AND({Phone} != '', {Phone} != BLANK())", // Phone이 있는 레코드만
      })
      .firstPage()

    console.log(`   Phone 필드가 있는 샘플 레코드: ${sampleRecords.length}개`)

    if (sampleRecords.length > 0) {
      sampleRecords.forEach((record, index) => {
        const fields = record.fields
        console.log(`   ${index + 1}. ${fields['Name (Korean)'] || fields['Name (Chinese)']}`)
        console.log(`      Phone: ${fields.Phone || '없음'}`)
        console.log(`      Email: ${fields.Email || '없음'}`)
        console.log(`      DOB: ${fields.DOB || '없음'}`)
      })
    }

    // 5. 동기화 권장사항
    console.log('\n🎯 동기화 권장사항:')

    console.log('   📋 재동기화가 필요하면 Secure API 또는 CLI를 사용하세요')
    console.log(`   💡 POST ${baseUrl}/api/secure/migration/migrate-all (admin/system)`)
    console.log('   💡 node tools/scripts/direct-migration.js')

    if (sampleRecords.length > 0) {
      console.log('   📱 새로운 필드 감지: Phone, Email, DOB')
      console.log('   💡 Supabase 스키마 업데이트 필요')
    }

    console.log('\n✅ 동기화 시스템 테스트 완료!')

    // 6. 실시간 동기화 시작 옵션
    console.log('\n🚀 실시간 동기화를 시작하려면:')
    console.log(
      `   curl -X POST ${baseUrl}/api/sync/start -H "Content-Type: application/json" -d '{"intervalMs": 60000}'`
    )
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message)
    console.error('상세 오류:', error)
  }
}

// 실행
testSyncSystem()
