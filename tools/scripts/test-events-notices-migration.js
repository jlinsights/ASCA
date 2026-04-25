#!/usr/bin/env node

/**
 * Events & Notices 마이그레이션 테스트 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function testEventsNoticesMigration() {
  console.log('🧪 Events & Notices 마이그레이션 테스트 시작...\n')

  try {
    // 1. 마이그레이션 상태 확인
    console.log('1️⃣ 마이그레이션 상태 확인...')
    const response = await fetch('http://localhost:3000/api/migration/check-status')
    if (response.ok) {
      const status = await response.json()
      console.log('   상태 응답:', JSON.stringify(status, null, 2))
    } else {
      console.log('   ❌ 상태 확인 실패')
    }

    console.log('\n2️⃣ Events 마이그레이션 테스트...')
    // Events 마이그레이션 테스트
    try {
      const eventsResponse = await fetch('http://localhost:3000/api/migration/events', {
        method: 'POST',
      })
      if (eventsResponse.ok) {
        const result = await eventsResponse.json()
        console.log('   Events 마이그레이션 결과:', JSON.stringify(result, null, 2))
      } else {
        const error = await eventsResponse.json()
        console.log('   ❌ Events 마이그레이션 실패:', error)
      }
    } catch (error) {
      console.log('   ❌ Events 마이그레이션 오류:', error.message)
    }

    console.log('\n3️⃣ Notices 마이그레이션 테스트...')
    // Notices 마이그레이션 테스트
    try {
      const noticesResponse = await fetch('http://localhost:3000/api/migration/notices', {
        method: 'POST',
      })
      if (noticesResponse.ok) {
        const result = await noticesResponse.json()
        console.log('   Notices 마이그레이션 결과:', JSON.stringify(result, null, 2))
      } else {
        const error = await noticesResponse.json()
        console.log('   ❌ Notices 마이그레이션 실패:', error)
      }
    } catch (error) {
      console.log('   ❌ Notices 마이그레이션 오류:', error.message)
    }

    console.log('\n✅ 테스트 완료!')
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  }
}

testEventsNoticesMigration()
