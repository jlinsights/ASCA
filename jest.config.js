const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    // SKIP REASON: Next.js 14 unhandled-rejection.tsx polyfill + node v22 + jest 29
    // 호환성 이슈로 jest worker 모듈 reload 시 polyfill internal queue 누적 →
    // stack overflow. file 내 describe.skip 으로는 module load side-effect 차단 불가.
    // REF: docs/01-plan/features/asca-test-suite-debt.plan.md §5
    // SPLIT_CANDIDATE: realtime-jest-polyfill-debt (별 사이클)
    '<rootDir>/lib/realtime/__tests__/e2e-flow.test.ts',
    '<rootDir>/lib/realtime/__tests__/sse-manager.test.ts',
    '<rootDir>/lib/realtime/__tests__/websocket-manager.test.ts',
    '<rootDir>/lib/realtime/__tests__/event-emitter.test.ts',
    // SKIP REASON: repository 2 file — 실제 Supabase 호스트 연결 시도
    // (PostgresError ENOTFOUND tenant/user). DB mock 누락.
    // SPLIT_CANDIDATE: repository-test-mock-debt
    '<rootDir>/lib/repositories/__tests__/base.repository.test.ts',
    '<rootDir>/lib/repositories/__tests__/member.repository.test.ts',
    // SKIP REASON: SSE route handler mock setup 결함 (jest.fn 호출 0회).
    // SPLIT_CANDIDATE: sse-route-mock-debt
    '<rootDir>/app/api/realtime/__tests__/sse-route.test.ts',
    // SKIP REASON: asca-api-security-hardening (2026-04-25) Clerk auth()
    // 보안 fix 부수 효과로 401. 기존 test 가 인증 mock 누락.
    // SPLIT_CANDIDATE: route-auth-mock-debt
    '<rootDir>/app/api/members/\\[id\\]/__tests__/route.test.ts',
  ],
  transformIgnorePatterns: [
    // ESM-only npm packages must be transformed by babel-jest.
    // graphql v16 ships dual-package; deep imports may resolve to ESM paths.
    '/node_modules/(?!(graphql|@graphql-tools|@graphql-yoga|graphql-yoga|graphql-ws)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
}

module.exports = createJestConfig(customJestConfig)
