#!/usr/bin/env node

/**
 * Supabase 스키마 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function checkSupabaseSchema() {
  console.log('🔍 Supabase 스키마 확인...\n')

  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Artists 테이블 샘플 데이터로 스키마 확인
    console.log('📊 1. Artists 테이블 스키마 확인...')
    const { data: sampleArtists, error } = await supabase.from('artists').select('*').limit(1)

    if (error) {
      console.error('샘플 데이터 조회 실패:', error)
      return
    }

    if (sampleArtists && sampleArtists.length > 0) {
      const artist = sampleArtists[0]
      console.log('   실제 컬럼들:')
      Object.keys(artist).forEach(key => {
        const value = artist[key]
        const type = typeof value
        console.log(
          `     - ${key}: ${type} (${value === null ? 'null' : String(value).substring(0, 50)})`
        )
      })
    }

    // 2. 전체 데이터 개수 확인
    console.log('\n📊 2. 데이터 개수 확인...')
    const { count: artistCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    const { count: artworkCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })

    console.log(`   Artists: ${artistCount}개`)
    console.log(`   Artworks: ${artworkCount}개`)

    // 3. name 필드 기준 중복 검사 (airtable_id 없이)
    console.log('\n🔍 3. name 기준 중복 분석...')

    // name이 같은 레코드들 찾기
    const { data: nameGroups, error: nameError } = await supabase
      .from('artists')
      .select('name')
      .not('name', 'is', null)
      .neq('name', '')

    if (nameError) {
      console.error('name 분석 실패:', nameError)
    } else if (nameGroups) {
      const nameCount = new Map()
      nameGroups.forEach(artist => {
        const name = artist.name
        nameCount.set(name, (nameCount.get(name) || 0) + 1)
      })

      const duplicates = Array.from(nameCount.entries())
        .filter(([name, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // 상위 10개만

      console.log(`   중복된 이름: ${duplicates.length}개`)
      console.log('   상위 중복들:')
      duplicates.forEach(([name, count]) => {
        console.log(`     "${name}": ${count}개`)
      })
    }

    // 4. 간단한 중복 제거 (name 기준)
    console.log('\n🧹 4. 간단한 중복 제거 (name 기준)...')

    // 중복된 이름 중 하나만 처리해보기
    const testName = '김동철' // 일반적인 한국 이름으로 테스트

    const { data: duplicateRecords, error: dupError } = await supabase
      .from('artists')
      .select('id, name, created_at')
      .eq('name', testName)
      .order('created_at', { ascending: true })

    if (dupError) {
      console.error('중복 레코드 조회 실패:', dupError)
    } else if (duplicateRecords && duplicateRecords.length > 1) {
      console.log(`   "${testName}" 중복 레코드: ${duplicateRecords.length}개`)

      // 가장 오래된 것을 제외하고 삭제
      const toKeep = duplicateRecords[0]
      const toDelete = duplicateRecords.slice(1)

      console.log(`   보존: ${toKeep.id} (${toKeep.created_at})`)
      console.log(`   삭제할 것: ${toDelete.length}개`)

      // 실제 삭제는 주석 처리 (안전을 위해)
      // for (const record of toDelete) {
      //   const { error: deleteError } = await supabase
      //     .from('artists')
      //     .delete()
      //     .eq('id', record.id);
      //   if (!deleteError) {
      //     console.log(`   삭제됨: ${record.id}`);
      //   }
      // }

      console.log('   (실제 삭제는 안전을 위해 주석 처리됨)')
    } else {
      console.log(`   "${testName}" 중복 없음`)
    }

    console.log('\n✅ 스키마 확인 완료!')
  } catch (error) {
    console.error('\n❌ 스키마 확인 실패:', error.message)
  }
}

checkSupabaseSchema()
