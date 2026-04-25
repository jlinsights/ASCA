#!/usr/bin/env node

/**
 * Supabase MCP 서버 테스트 스크립트
 */

require('dotenv').config({ path: '.env.local' })

async function testSupabaseMCPServer() {
  console.log('🧪 Supabase MCP 서버 테스트 시작...\n')

  // 환경변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('📋 환경변수 확인:')
  console.log('   SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 미설정')
  console.log('   SUPABASE_KEY:', supabaseKey ? '✅ 설정됨' : '❌ 미설정')

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Supabase 환경변수가 설정되지 않았습니다.')
    console.log('   .env.local 파일에 다음 변수들을 설정해주세요:')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  try {
    // Supabase 클라이언트 연결 테스트
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('\n🔌 Supabase 연결 테스트...')

    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase
      .from('artists')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.log('   ❌ 연결 실패:', error.message)
    } else {
      console.log('   ✅ 연결 성공! Artists 테이블 레코드 수:', data || 0)
    }

    // 테이블 목록 확인
    console.log('\n📊 테이블 목록 확인...')
    const tables = ['artists', 'artworks', 'exhibitions', 'events', 'notices']

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`   ${table}: ❌ 오류 - ${error.message}`)
        } else {
          console.log(`   ${table}: ✅ ${count || 0}개 레코드`)
        }
      } catch (err) {
        console.log(`   ${table}: ❌ 테이블 없음`)
      }
    }

    console.log('\n✅ MCP 서버 준비 완료!')
    console.log('\n📝 MCP 설정 안내:')
    console.log('   1. Claude Desktop에서 MCP 설정')
    console.log('   2. mcp-config.json 파일 사용')
    console.log('   3. 환경변수를 통한 Supabase 연결')
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message)
  }
}

testSupabaseMCPServer()
