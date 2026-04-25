#!/usr/bin/env node

/**
 * Supabase artworks 테이블 스키마 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function checkArtworksSchema() {
  console.log('🔍 Supabase Artworks 테이블 스키마 확인...\n')

  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 1. Artists 테이블 구조 확인
    console.log('📊 Artists 테이블 샘플 조회...')
    const { data: artistSample, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .limit(1)

    if (artistError) {
      console.log('   ❌ Artists 테이블 오류:', artistError.message)
    } else if (artistSample && artistSample.length > 0) {
      console.log('   ✅ Artists 테이블 필드:', Object.keys(artistSample[0]))
      console.log('   📝 첫 번째 레코드:', JSON.stringify(artistSample[0], null, 2))
    }

    // 2. Artworks 테이블 구조 확인
    console.log('\n🎨 Artworks 테이블 스키마 확인...')

    // 빈 삽입을 시도해서 필요한 필드 확인
    const { error: insertError } = await supabase.from('artworks').insert([{}]).select()

    if (insertError) {
      console.log('   📋 Artworks 테이블 필수 필드 확인:')
      console.log('   오류 메시지:', insertError.message)

      if (insertError.message.includes('not-null')) {
        console.log('   ⚠️ NOT NULL 제약조건이 있는 필드들이 있습니다.')
      }
    }

    // 3. 테이블 메타데이터 조회 (PostgreSQL 시스템 테이블 사용)
    console.log('\n🔍 테이블 메타데이터 조회...')

    // PostgreSQL information_schema를 통한 컬럼 정보 조회
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'artworks')
      .order('ordinal_position')

    if (schemaError) {
      console.log('   ⚠️ 스키마 정보 조회 실패:', schemaError.message)
    } else if (schemaInfo && schemaInfo.length > 0) {
      console.log('   ✅ Artworks 테이블 컬럼 정보:')
      schemaInfo.forEach(col => {
        console.log(
          `      ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL 허용)'} ${col.column_default ? `기본값: ${col.column_default}` : ''}`
        )
      })
    }

    // 4. 간단한 테스트 데이터로 삽입 테스트
    console.log('\n🧪 최소 필드로 삽입 테스트...')

    // 아티스트 ID 가져오기
    const { data: firstArtist } = await supabase
      .from('artists')
      .select('id, name')
      .limit(1)
      .single()

    if (firstArtist) {
      console.log(`   🎯 테스트용 아티스트: ${firstArtist.name} (${firstArtist.id})`)

      // 최소 필드로 작품 삽입 시도
      const testArtwork = {
        title: '스키마 테스트 작품',
        artist_id: firstArtist.id,
      }

      const { data: insertResult, error: testInsertError } = await supabase
        .from('artworks')
        .insert([testArtwork])
        .select()
        .single()

      if (testInsertError) {
        console.log('   ❌ 삽입 실패:', testInsertError.message)

        // 더 많은 필드로 재시도
        const extendedArtwork = {
          title: '확장 테스트 작품',
          artist_id: firstArtist.id,
          description: '테스트 설명',
          category: 'painting',
          style: 'contemporary',
        }

        const { data: extendedResult, error: extendedError } = await supabase
          .from('artworks')
          .insert([extendedArtwork])
          .select()
          .single()

        if (extendedError) {
          console.log('   ❌ 확장 삽입도 실패:', extendedError.message)
        } else {
          console.log('   ✅ 확장 삽입 성공:', extendedResult.title)
        }
      } else {
        console.log('   ✅ 최소 필드 삽입 성공:', insertResult.title)
      }
    }

    // 5. 최종 상태 확인
    console.log('\n📈 최종 테이블 상태...')

    const { count: artistCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })

    const { count: artworkCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })

    console.log(`   📊 Artists: ${artistCount || 0}개`)
    console.log(`   🎨 Artworks: ${artworkCount || 0}개`)

    // 6. Airtable 마이그레이션 호환성 체크
    console.log('\n🔗 Airtable 마이그레이션 호환성 체크...')

    const airtableFields = [
      'title',
      'title_en',
      'title_ja',
      'title_zh',
      'description',
      'description_en',
      'category',
      'style',
      'year',
      'materials',
      'technique',
      'condition',
      'dimensions',
      'price',
      'availability',
      'featured',
      'authenticity_certificate',
      'images',
      'thumbnail',
      'tags',
    ]

    const existingFields = schemaInfo ? schemaInfo.map(col => col.column_name) : []
    const missingFields = airtableFields.filter(field => !existingFields.includes(field))
    const extraFields = existingFields.filter(
      field =>
        !airtableFields.includes(field) &&
        !['id', 'artist_id', 'created_at', 'updated_at'].includes(field)
    )

    if (missingFields.length > 0) {
      console.log('   ⚠️ Airtable 마이그레이션을 위해 누락된 필드들:')
      missingFields.forEach(field => console.log(`      - ${field}`))
    }

    if (extraFields.length > 0) {
      console.log('   ℹ️ 추가로 존재하는 필드들:')
      extraFields.forEach(field => console.log(`      - ${field}`))
    }

    if (missingFields.length === 0) {
      console.log('   ✅ Airtable 마이그레이션 호환성: 완벽!')
    }
  } catch (error) {
    console.error('\n❌ 스키마 확인 실패:', error.message)
    console.error('상세 오류:', error)
  }
}

checkArtworksSchema()
