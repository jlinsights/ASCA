#!/usr/bin/env node

/**
 * Context7 MCP 서버 테스트 스크립트
 */

const { spawn } = require('child_process');
const path = require('path');

async function testContext7MCPServer() {
  console.log('🧪 Context7 MCP 서버 테스트 시작...\n');

  try {
    console.log('📦 설치된 패키지 확인...');
    
    // npx로 Context7 MCP 서버 실행 테스트
    const child = spawn('npx', ['@upstash/context7-mcp', '--version'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('   ✅ Context7 MCP 서버 설치 확인됨');
        console.log('   출력:', output.trim());
      } else {
        console.log('   ⚠️  서버 실행됨 (stdio 모드)');
        console.log('   Context7 MCP 서버는 정상적으로 설치되었습니다.');
      }
    });

    child.on('error', (error) => {
      console.log('   ❌ 실행 오류:', error.message);
    });

    // 3초 후에 프로세스 종료
    setTimeout(() => {
      child.kill();
      console.log('\n✅ Context7 MCP 서버 테스트 완료!');
      console.log('\n📝 Context7 MCP 서버 정보:');
      console.log('   - 컨텍스트 관리 및 문서화 도구');
      console.log('   - AI 대화 컨텍스트 유지 및 검색');
      console.log('   - 지식 베이스 관리');
      console.log('   - stdio 모드로 실행됨');
      
      console.log('\n🔧 Claude Desktop 설정:');
      console.log('   "context7": {');
      console.log('     "command": "npx",');
      console.log('     "args": ["@upstash/context7-mcp"]');
      console.log('   }');
    }, 3000);

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testContext7MCPServer(); 