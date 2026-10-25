import { defineConfig, devices } from '@playwright/test'
import { execFileSync } from 'node:child_process'

// Dedicated real-service tests must be explicitly invoked against a local stack.
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    cwd: process.env.AUTH_LOCAL_WORKDIR || process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
if (
  !/^http:\/\/127\.0\.0\.1:\d+$/.test(local.API_URL) ||
  !/^postgresql:\/\/postgres:postgres@127\.0\.0\.1:/.test(local.DB_URL)
)
  throw Error('Local Supabase required')
process.env.AUTH_E2E_API_URL = local.API_URL
process.env.AUTH_E2E_ANON_KEY = local.ANON_KEY
process.env.AUTH_E2E_SERVICE_KEY = local.SERVICE_ROLE_KEY
process.env.AUTH_E2E_MAIL_URL = local.MAILPIT_URL || local.INBUCKET_URL

export default defineConfig({
  testDir: './e2e/auth',
  outputDir: './test-results/auth',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/auth', open: 'never' }]],
  // Recovery URLs and cookies are secrets, even in fixtures. Keep traces/video off.
  use: {
    baseURL: 'http://localhost:3105',
    locale: 'ko-KR',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'env -u NODE_ENV npm run dev -- --hostname localhost --port 3105',
    url: 'http://localhost:3105/sign-in',
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: local.ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
      DATABASE_URL: local.DB_URL,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3105',
      CSRF_ALLOWED_ORIGINS: 'http://localhost:3105',
    },
  },
})
