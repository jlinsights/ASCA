const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로 설정
  dir: './',
})

// Jest에 전달할 커스텀 설정
const customJestConfig = {
  // 테스트 환경 설정
  testEnvironment: 'jsdom',
  
  // 모듈 경로 별칭 설정
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  
  // 테스트 전 실행할 설정 파일들
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // 커버리지 임계값 설정
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 테스트 결과 리포터
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
    }],
  ],
}

// createJestConfig는 비동기 함수이므로 export
module.exports = createJestConfig(customJestConfig) 