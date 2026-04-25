#!/usr/bin/env node

/**
 * Airtable Events, Notices 테이블 구조 분석 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function debugEventsNotices() {
  console.log('🔍 Airtable Events & Notices 테이블 분석...\n')

  try {
    const Airtable = require('airtable')
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    )

    // Events 테이블 확인
    console.log('📅 Events 테이블 분석...')
    try {
      const events = await base('Events').select({ maxRecords: 3 }).all()

      if (events.length > 0) {
        console.log(`   총 레코드: ${events.length}개 (샘플)`)
        console.log('   필드 구조:')
        const sampleEvent = events[0]
        Object.keys(sampleEvent.fields).forEach(field => {
          const value = sampleEvent.fields[field]
          console.log(
            `     - ${field}: ${typeof value} (${Array.isArray(value) ? 'Array' : value})`
          )
        })

        console.log('\n   샘플 데이터:')
        events.slice(0, 2).forEach((event, index) => {
          console.log(`     Event ${index + 1}:`, JSON.stringify(event.fields, null, 2))
        })
      } else {
        console.log('   테이블이 비어있습니다.')
      }
    } catch (error) {
      console.log(`   ❌ Events 테이블 접근 실패: ${error.message}`)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Notices 테이블 확인
    console.log('📢 Notices 테이블 분석...')
    try {
      const notices = await base('Notices').select({ maxRecords: 3 }).all()

      if (notices.length > 0) {
        console.log(`   총 레코드: ${notices.length}개 (샘플)`)
        console.log('   필드 구조:')
        const sampleNotice = notices[0]
        Object.keys(sampleNotice.fields).forEach(field => {
          const value = sampleNotice.fields[field]
          console.log(
            `     - ${field}: ${typeof value} (${Array.isArray(value) ? 'Array' : value})`
          )
        })

        console.log('\n   샘플 데이터:')
        notices.slice(0, 2).forEach((notice, index) => {
          console.log(`     Notice ${index + 1}:`, JSON.stringify(notice.fields, null, 2))
        })
      } else {
        console.log('   테이블이 비어있습니다.')
      }
    } catch (error) {
      console.log(`   ❌ Notices 테이블 접근 실패: ${error.message}`)
    }

    // 모든 테이블 나열
    console.log('\n' + '='.repeat(50))
    console.log('\n📋 사용 가능한 모든 테이블:')

    const allTables = ['Artists', 'Artworks', 'Exhibitions', 'Events', 'Notices']

    for (const tableName of allTables) {
      try {
        const { count } = await base(tableName).select().firstPage()
        console.log(`   ✅ ${tableName}: 접근 가능 (${count || 0}개 레코드)`)
      } catch (error) {
        console.log(`   ❌ ${tableName}: 접근 불가 (${error.message})`)
      }
    }

    console.log('\n✅ 분석 완료!')
  } catch (error) {
    console.error('\n❌ 분석 실패:', error.message)
  }
}

debugEventsNotices()
