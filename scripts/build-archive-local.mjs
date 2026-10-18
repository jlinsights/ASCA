import { execFileSync } from 'node:child_process'
const local = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
)
execFileSync('npm', ['run', 'build:full'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    DATABASE_URL: local.DB_URL,
    NEXT_PUBLIC_SUPABASE_URL: local.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dGVzdC5jbGVyay5hY2NvdW50cy5kZXYk',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_archive_build_only',
  },
})
