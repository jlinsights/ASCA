#!/usr/bin/env node

/**
 * Supabase-Airtable 동기화 상태 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function checkSyncStatus() {
  console.log('🔄 Airtable ↔ Supabase 동기화 상태 확인...\n')

  try {
    // Supabase 연결
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Airtable 연결
    const Airtable = require('airtable')
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    )

    console.log('📊 1. 데이터 개수 비교...')

    // Supabase 데이터 개수 확인
    const { count: supabaseArtists } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    const { count: supabaseArtworks } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })

    // Airtable 데이터 개수 확인
    const airtableArtists = await base('Artists').select().all()
    const airtableArtworks = await base('Artworks').select().all()

    console.log(`   Supabase Artists: ${supabaseArtists || 0}개`)
    console.log(`   Airtable Artists: ${airtableArtists.length}개`)
    console.log(`   Supabase Artworks: ${supabaseArtworks || 0}개`)
    console.log(`   Airtable Artworks: ${airtableArtworks.length}개`)

    console.log('\n🏗️ 2. 스키마 비교...')

    // Supabase 스키마 확인
    const { data: supabaseColumns } = await supabase.rpc('get_table_columns', {
      table_name: 'artists',
    })

    // Airtable 필드 확인
    const airtableFields = new Set()
    if (airtableArtists.length > 0) {
      airtableArtists.slice(0, 5).forEach(record => {
        Object.keys(record.fields).forEach(field => airtableFields.add(field))
      })
    }

    console.log('\n   Supabase Artists 테이블 컬럼:')
    if (supabaseColumns) {
      supabaseColumns.forEach(col => {
        console.log(`     - ${col.column_name} (${col.data_type})`)
      })
    }

    console.log('\n   Airtable Artists 필드:')
    Array.from(airtableFields)
      .sort()
      .forEach(field => {
        console.log(`     - ${field}`)
      })

    console.log('\n📝 3. 샘플 데이터 비교...')

    // 샘플 레코드 비교
    if (supabaseArtists > 0 && airtableArtists.length > 0) {
      const { data: supabaseSample } = await supabase.from('artists').select('*').limit(3)

      console.log('\n   Supabase 샘플 레코드:')
      supabaseSample?.forEach((record, index) => {
        console.log(`     ${index + 1}. ${record.name_korean || record.name_chinese || record.id}`)
        console.log(`        phone: ${record.phone || '없음'}`)
        console.log(`        email: ${record.email || '없음'}`)
        console.log(`        date_of_birth: ${record.date_of_birth || '없음'}`)
      })

      console.log('\n   Airtable 샘플 레코드:')
      airtableArtists.slice(0, 3).forEach((record, index) => {
        console.log(
          `     ${index + 1}. ${record.fields['Name (Korean)'] || record.fields['Name (Chinese)'] || record.id}`
        )
        console.log(`        Phone: ${record.fields.Phone || '없음'}`)
        console.log(`        Email: ${record.fields.Email || '없음'}`)
        console.log(`        DOB: ${record.fields.DOB || record.fields['Date of Birth'] || '없음'}`)
      })
    }

    console.log('\n🔍 4. 동기화 격차 분석...')

    const artistGap = Math.abs((supabaseArtists || 0) - airtableArtists.length)
    const artworkGap = Math.abs((supabaseArtworks || 0) - airtableArtworks.length)

    console.log(`   Artists 격차: ${artistGap}개`)
    console.log(`   Artworks 격차: ${artworkGap}개`)

    if (artistGap === 0) {
      console.log('   ✅ Artists 데이터 개수 일치')
    } else {
      console.log('   ⚠️ Artists 데이터 개수 불일치')
    }

    if (artworkGap === 0) {
      console.log('   ✅ Artworks 데이터 개수 일치')
    } else {
      console.log('   ⚠️ Artworks 데이터 개수 불일치')
    }

    console.log('\n🎯 동기화 권장사항:')
    if (artistGap > 0) {
      console.log('   📋 Artists 테이블 재동기화 필요')
    }
    if (artworkGap > 0) {
      console.log('   🎨 Artworks 테이블 동기화 필요 (Artist 매핑 수정 후)')
    }
    console.log('   🔄 실시간 동기화 시스템 구축 권장')
  } catch (error) {
    console.error('\n❌ 동기화 상태 확인 실패:', error.message)
    console.error('상세 오류:', error)
  }
}

checkSyncStatus()
