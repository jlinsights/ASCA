#!/usr/bin/env node

/**
 * 모든 MCP 서버 통합 테스트 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { spawn } = require('child_process');

async function testAllMCPServers() {
  console.log('🧪 모든 MCP 서버 통합 테스트 시작...\n');

  const results = {
    supabase: false,
    context7: false
  };

  // 1. Supabase MCP 서버 테스트
  console.log('1️⃣ Supabase MCP 서버 테스트...');
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('   ❌ Supabase 환경변수 미설정');
    } else {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { count, error } = await supabase
        .from('artists')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log('   ❌ Supabase 연결 실패:', error.message);
      } else {
        console.log('   ✅ Supabase MCP 서버 연결 성공');
        console.log(`   📊 Artists 테이블: ${count || 0}개 레코드`);
        results.supabase = true;
      }
    }
  } catch (error) {
    console.log('   ❌ Supabase 테스트 오류:', error.message);
  }

  // 2. Context7 MCP 서버 테스트
  console.log('\n2️⃣ Context7 MCP 서버 테스트...');
  try {
    const child = spawn('npx', ['@upstash/context7-mcp', '--help'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });

    let hasOutput = false;
    
    child.stdout.on('data', (data) => {
      hasOutput = true;
    });

    child.stderr.on('data', (data) => {
      hasOutput = true;
    });

    setTimeout(() => {
      child.kill();
      if (hasOutput) {
        console.log('   ✅ Context7 MCP 서버 설치 확인됨');
        results.context7 = true;
      } else {
        console.log('   ⚠️  Context7 MCP 서버 응답 없음');
      }
      
      // 최종 결과 출력
      console.log('\n📋 전체 테스트 결과:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔹 Supabase MCP: ${results.supabase ? '✅ 정상' : '❌ 실패'}`);
      console.log(`🔹 Context7 MCP: ${results.context7 ? '✅ 정상' : '❌ 실패'}`);
      
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      console.log(`\n🎯 성공률: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
      
      if (successCount === totalCount) {
        console.log('\n🎉 모든 MCP 서버가 정상적으로 설정되었습니다!');
        console.log('\n📝 다음 단계:');
        console.log('   1. Claude Desktop 설정 파일 업데이트');
        console.log('   2. Claude Desktop 재시작');
        console.log('   3. MCP 기능 테스트');
      } else {
        console.log('\n⚠️  일부 MCP 서버 설정을 확인해주세요.');
      }
      
      console.log('\n🔧 Claude Desktop 설정 파일 위치:');
      console.log('   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json');
      console.log('   Windows: %APPDATA%\\Claude\\claude_desktop_config.json');
    }, 3000);

  } catch (error) {
    console.log('   ❌ Context7 테스트 오류:', error.message);
  }
}

testAllMCPServers(); 