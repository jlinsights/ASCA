/**
 * 개발 서버 환경 설정
 */

import { logger } from '@/lib/utils/logger'

export const devConfig = {
  // 서버 설정
  server: {
    host: process.env.DEV_SERVER_HOST || 'localhost',
    port: parseInt(process.env.DEV_SERVER_PORT || '3000'),
    https: process.env.DEV_HTTPS === 'true',
    openBrowser: process.env.OPEN_BROWSER === 'true',
  },

  // 개발 모드 설정
  development: {
    hotReload: process.env.FAST_REFRESH !== 'false',
    devMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    adminMode: process.env.DEV_ADMIN_MODE === 'true',
    mockData: process.env.USE_MOCK_DATA === 'true',
    apiDelay: parseInt(process.env.API_DELAY_SIMULATION || '0'),
    enableConsoleLog: process.env.ENABLE_CONSOLE_LOGS === 'true',
  },

  // 빌드 설정
  build: {
    typeCheck: process.env.TYPE_CHECK_ON_BUILD === 'true',
    lint: process.env.LINT_ON_BUILD === 'true',
    analyze: process.env.ANALYZE === 'true',
  },

  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    performance: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    requests: process.env.ENABLE_CONSOLE_LOGS === 'true',
  },

  // 외부 서비스 설정
  services: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },

    airtable: {
      apiKey: process.env.AIRTABLE_API_KEY,
      baseId: process.env.AIRTABLE_BASE_ID,
    },
    unsplash: {
      accessKey: process.env.UNSPLASH_ACCESS_KEY,
    },
  },

  // 한국 시장 특화 서비스
  korean: {
    channelIo: process.env.NEXT_PUBLIC_CHANNEL_IO_KEY,
    calCom: process.env.NEXT_PUBLIC_CAL_COM_USERNAME,
    kakao: {
      appKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY,
      adminKey: process.env.KAKAO_ADMIN_KEY,
    },
  },

  // 개발 도구 설정
  tools: {
    bundleAnalyzer: process.env.BUNDLE_ANALYZE === 'true',
    sentry: process.env.NEXT_PUBLIC_SENTRY_DSN,
    lighthouse: true,
  },
}

// 개발 환경 검증
export const validateDevConfig = () => {
  const errors: string[] = []
  
  // 필수 환경 변수 검증
  if (!devConfig.services.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.')
  }
  
  if (!devConfig.services.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
  }
  

  
  if (errors.length > 0) {
    logger.error('개발 환경 설정 오류', new Error('Environment configuration errors'), { errors })
    return false
  }
  
  logger.info('개발 환경 설정이 완료되었습니다.')
  return true
}

// 개발 환경 정보 출력
export const logDevInfo = () => {
  if (process.env.NODE_ENV !== 'development') return
  
  const devInfo = {
    message: '개발 서버 시작',
    address: `http://${devConfig.server.host}:${devConfig.server.port}`,
    devMode: devConfig.development.devMode ? '활성화' : '비활성화',
    adminMode: devConfig.development.adminMode ? '활성화' : '비활성화',
    logLevel: devConfig.logging.level,
    mockData: devConfig.development.mockData ? '사용' : '미사용',
    performanceMonitoring: devConfig.logging.performance ? '활성화' : '비활성화',
    links: {
      admin: `http://${devConfig.server.host}:${devConfig.server.port}/admin`,
      api: `http://${devConfig.server.host}:${devConfig.server.port}/api`,
      database: 'http://localhost:4983'
    }
  }
  
  logger.info('개발 서버 정보', devInfo)
  
  if (devConfig.development.adminMode) {
    logger.warn('개발 모드에서 관리자 권한 체크가 우회됩니다.')
  }
}

// 개발 환경 초기화
export const initializeDevEnvironment = () => {
  if (process.env.NODE_ENV !== 'development') return
  
  // 환경 변수 검증
  validateDevConfig()
  
  // 개발 환경 정보 출력
  logDevInfo()
  
  // 성능 모니터링 초기화
  if (devConfig.logging.performance && typeof window !== 'undefined') {
    import('@/lib/monitoring/performance').then(({ initializePerformanceMonitoring }) => {
      initializePerformanceMonitoring()
    })
  }
}

export default devConfig 