#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 * 개발 환경에 필요한 환경 변수들이 올바르게 설정되었는지 확인합니다.
 */

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// .env.local 파일 로드
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

// 필수 환경 변수 정의
const requiredEnvVars = {
  // 기본 설정
  NODE_ENV: {
    required: true,
    description: '실행 환경 (development/production)',
    default: 'development'
  },
  NEXT_PUBLIC_SITE_URL: {
    required: true,
    description: '사이트 URL',
    default: 'http://localhost:3000'
  },
  
  // 데이터베이스 (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase 프로젝트 URL',
    validation: (value) => value.includes('supabase.co') || '올바른 Supabase URL이 아닙니다'
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase 익명 키',
    validation: (value) => value.startsWith('eyJ') || '올바른 Supabase 키 형식이 아닙니다'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: false,
    description: 'Supabase 서비스 역할 키 (관리자 기능용)',
    validation: (value) => !value || value.startsWith('eyJ') || '올바른 Supabase 키 형식이 아닙니다'
  },
  
  // 인증 (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    required: true,
    description: 'Clerk 공개 키',
    validation: (value) => value.startsWith('pk_') || '올바른 Clerk 공개 키 형식이 아닙니다'
  },
  CLERK_SECRET_KEY: {
    required: true,
    description: 'Clerk 비밀 키',
    validation: (value) => value.startsWith('sk_') || '올바른 Clerk 비밀 키 형식이 아닙니다'
  },
  
  // 관리자 권한
  SUPER_ADMIN_EMAILS: {
    required: false,
    description: '최고 관리자 이메일 목록 (쉼표로 구분)',
    validation: (value) => !value || value.includes('@') || '유효한 이메일 주소를 입력하세요'
  },
  ADMIN_EMAILS: {
    required: false,
    description: '관리자 이메일 목록 (쉼표로 구분)',
    validation: (value) => !value || value.includes('@') || '유효한 이메일 주소를 입력하세요'
  },
}

// 선택적 환경 변수 정의
const optionalEnvVars = {
  // 외부 API
  AIRTABLE_API_KEY: 'Airtable API 키',
  AIRTABLE_BASE_ID: 'Airtable 베이스 ID',
  V0_API_KEY: 'V0 API 키',
  UNSPLASH_ACCESS_KEY: 'Unsplash API 키',
  
  // 한국 시장 특화
  NEXT_PUBLIC_CHANNEL_IO_KEY: 'Channel.io 키',
  NEXT_PUBLIC_CAL_COM_USERNAME: 'Cal.com 사용자명',
  NEXT_PUBLIC_KAKAO_APP_KEY: 'Kakao API 키',
  KAKAO_ADMIN_KEY: 'Kakao 관리자 키',
  
  // 모니터링
  NEXT_PUBLIC_SENTRY_DSN: 'Sentry DSN',
  SENTRY_AUTH_TOKEN: 'Sentry 인증 토큰',
  
  // 개발 설정
  DEV_ADMIN_MODE: '개발 관리자 모드',
  USE_MOCK_DATA: '모의 데이터 사용',
  LOG_LEVEL: '로그 레벨',
  ENABLE_CONSOLE_LOGS: '콘솔 로그 활성화',
}

function checkEnvVars() {
  console.log('🔍 환경 변수 검증 시작...\n')
  
  let hasErrors = false
  let hasWarnings = false
  
  // 필수 환경 변수 검증
  console.log('📋 필수 환경 변수 검사:')
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key]
    
    if (!value) {
      if (config.required) {
        console.error(`❌ ${key}: 누락됨 - ${config.description}`)
        if (config.default) {
          console.log(`   기본값 사용 가능: ${config.default}`)
        }
        hasErrors = true
      } else {
        console.warn(`⚠️  ${key}: 선택사항 - ${config.description}`)
        hasWarnings = true
      }
    } else {
      // 유효성 검증
      if (config.validation) {
        const validationResult = config.validation(value)
        if (validationResult !== true) {
          console.error(`❌ ${key}: ${validationResult}`)
          hasErrors = true
        } else {
          console.log(`✅ ${key}: 설정됨`)
        }
      } else {
        console.log(`✅ ${key}: 설정됨`)
      }
    }
  }
  
  // 선택적 환경 변수 검증
  console.log('\n📋 선택적 환경 변수 검사:')
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[key]
    
    if (value) {
      console.log(`✅ ${key}: 설정됨`)
    } else {
      console.log(`⭕ ${key}: 미설정 - ${description}`)
    }
  }
  
  // .env.local 파일 존재 여부 확인
  console.log('\n📁 환경 파일 검사:')
  if (fs.existsSync(envPath)) {
    console.log(`✅ .env.local: 존재함`)
  } else {
    console.warn(`⚠️  .env.local: 없음 - .env.example을 복사하여 생성하세요`)
    console.log(`   명령어: cp .env.example .env.local`)
    hasWarnings = true
  }
  
  // 결과 요약
  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.error('❌ 환경 변수 검증 실패!')
    console.error('필수 환경 변수가 누락되었습니다.')
    console.log('\n🔧 해결 방법:')
    console.log('1. .env.example 파일을 참고하여 .env.local 파일 생성')
    console.log('2. 필요한 API 키들을 각 서비스에서 발급받아 설정')
    console.log('3. npm run env:example 명령어로 기본 템플릿 생성 가능')
    process.exit(1)
  } else if (hasWarnings) {
    console.warn('⚠️  환경 변수 검증 완료 (경고 있음)')
    console.log('선택적 환경 변수들이 미설정되어 있습니다.')
    console.log('필요에 따라 설정하시기 바랍니다.')
  } else {
    console.log('✅ 환경 변수 검증 완료!')
    console.log('모든 필수 환경 변수가 올바르게 설정되었습니다.')
  }
  
  // 개발 환경 정보 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🚀 개발 환경 정보:')
    console.log(`📍 사이트 URL: ${process.env.NEXT_PUBLIC_SITE_URL}`)
    console.log(`🔧 개발 모드: ${process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? '활성화' : '비활성화'}`)
    console.log(`🛡️  관리자 모드: ${process.env.DEV_ADMIN_MODE === 'true' ? '활성화' : '비활성화'}`)
    console.log(`📝 로그 레벨: ${process.env.LOG_LEVEL || 'info'}`)
  }
  
  console.log('')
}

// 스크립트 실행
if (require.main === module) {
  checkEnvVars()
}

module.exports = { checkEnvVars } 