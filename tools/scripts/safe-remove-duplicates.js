#!/usr/bin/env node

/**
 * 안전한 Supabase Artists 중복 제거 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function safeDuplicateRemoval() {
  console.log('🛡️ 안전한 중복 데이터 제거 시작...\n')

  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. 현재 상태 확인
    console.log('📊 1. 현재 상태 확인...')
    const { count: totalCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    console.log(`   전체 Artists: ${totalCount}개`)

    // 2. 배치별로 데이터 조회 (메모리 효율성)
    console.log('\n🔍 2. 배치별 중복 분석...')

    const batchSize = 1000
    let offset = 0
    let allDuplicates = []
    let processedCount = 0

    while (true) {
      const { data: batch, error } = await supabase
        .from('artists')
        .select('id, name, name_zh, created_at, airtable_id')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('배치 조회 오류:', error)
        break
      }

      if (!batch || batch.length === 0) {
        break
      }

      processedCount += batch.length
      console.log(
        `   처리 중: ${processedCount}/${totalCount} (${Math.round((processedCount / totalCount) * 100)}%)`
      )

      // 이 배치에서 중복 찾기
      const batchGroups = new Map()
      batch.forEach(artist => {
        const key = artist.name || artist.name_zh || `unknown_${artist.id}`
        if (!batchGroups.has(key)) {
          batchGroups.set(key, [])
        }
        batchGroups.get(key).push(artist)
      })

      // 중복된 그룹만 저장
      batchGroups.forEach((artists, name) => {
        if (artists.length > 1) {
          allDuplicates.push({ name, artists })
        }
      })

      offset += batchSize
    }

    console.log(`\n   발견된 중복 그룹: ${allDuplicates.length}개`)

    if (allDuplicates.length === 0) {
      console.log('✅ 중복 데이터가 없습니다!')
      return
    }

    // 3. 중복 제거 전략
    console.log('\n🧹 3. 중복 제거 실행...')

    let removedCount = 0
    let keptCount = 0
    let errorCount = 0

    for (const { name, artists } of allDuplicates.slice(0, 100)) {
      // 안전을 위해 처음 100개만
      try {
        console.log(`   처리: "${name}" (${artists.length}개)`)

        // 보존 우선순위: airtable_id 있음 > 최신 생성일
        const sorted = artists.sort((a, b) => {
          if (a.airtable_id && !b.airtable_id) return -1
          if (!a.airtable_id && b.airtable_id) return 1
          return new Date(b.created_at) - new Date(a.created_at)
        })

        const toKeep = sorted[0]
        const toRemove = sorted.slice(1)

        console.log(`     보존: ${toKeep.id} (${toKeep.airtable_id ? 'Airtable' : 'Local'})`)

        // 하나씩 안전하게 삭제
        for (const artist of toRemove) {
          const { error } = await supabase.from('artists').delete().eq('id', artist.id)

          if (error) {
            console.error(`     ❌ 삭제 실패 ${artist.id}:`, error.message)
            errorCount++
          } else {
            removedCount++
          }

          // 요청 간격 (너무 빠른 삭제 방지)
          await new Promise(resolve => setTimeout(resolve, 10))
        }

        keptCount++

        // 진행 상황
        if (keptCount % 10 === 0) {
          console.log(`   진행: ${keptCount}/${Math.min(allDuplicates.length, 100)}`)
        }
      } catch (error) {
        console.error(`   ❌ 그룹 처리 실패 "${name}":`, error.message)
        errorCount++
      }
    }

    // 4. 결과 확인
    console.log('\n📊 4. 결과 확인...')
    const { count: finalCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    console.log(`   처리 전: ${totalCount}개`)
    console.log(`   처리 후: ${finalCount}개`)
    console.log(`   제거됨: ${removedCount}개`)
    console.log(`   오류: ${errorCount}개`)

    // 5. Airtable과 비교
    console.log('\n🔄 5. Airtable과 비교...')
    const Airtable = require('airtable')
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    )
    const airtableArtists = await base('Artists').select().all()

    const gap = Math.abs(finalCount - airtableArtists.length)
    console.log(`   Airtable: ${airtableArtists.length}개`)
    console.log(`   Supabase: ${finalCount}개`)
    console.log(`   격차: ${gap}개`)

    if (gap < 100) {
      console.log('   ✅ 동기화 상태 양호!')
    } else {
      console.log('   ⚠️ 추가 정리 필요')
    }

    console.log('\n🎉 안전한 중복 제거 완료!')
  } catch (error) {
    console.error('\n❌ 처리 실패:', error.message)
  }
}

safeDuplicateRemoval()
