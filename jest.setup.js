import '@testing-library/jest-dom'

// Load test environment variables
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.test') })

// Test env placeholders — schema 통과용. 실제 값은 .env.test에서 override.
// CI에서 .env.test 부재 시에도 lib/config/env.ts validateEnv() 통과 보장.
const TEST_ENV_DEFAULTS = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/asca_test',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-' + 'x'.repeat(64),
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-' + 'x'.repeat(64),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_' + 'x'.repeat(40),
  CLERK_SECRET_KEY: 'sk_test_' + 'x'.repeat(40),
}
for (const [key, value] of Object.entries(TEST_ENV_DEFAULTS)) {
  process.env[key] = process.env[key] ?? value
}

// Polyfill crypto.randomUUID for jsdom environment (pg-mem requires it)
if (
  typeof globalThis.crypto === 'undefined' ||
  typeof globalThis.crypto.randomUUID === 'undefined'
) {
  const nodeCrypto = require('crypto')
  if (!globalThis.crypto) {
    globalThis.crypto = nodeCrypto.webcrypto || {}
  }
  if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => nodeCrypto.randomUUID()
  }
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock performance API (only in browser environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      getEntriesByType: jest.fn(() => []),
      mark: jest.fn(),
      measure: jest.fn(),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
    },
    writable: true,
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(callback => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

// Mock Web Vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFCP: jest.fn(),
  getFID: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}))

// Database mocks will be defined in individual test files as needed

// Suppress console warnings in tests (only in browser environment)
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn
  beforeAll(() => {
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('React does not recognize')) {
        return
      }
      originalConsoleWarn.call(console, ...args)
    }
  })

  afterAll(() => {
    console.warn = originalConsoleWarn
  })
}
