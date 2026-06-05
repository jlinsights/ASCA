#!/usr/bin/env node
/*
 * Validate required ASCA environment variables without printing secret values.
 * Loads local env files when present so `npm run env:check` works locally and in CI.
 */
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const root = process.cwd()
const envFiles = [
  '.env',
  '.env.local',
  `.env.${process.env.NODE_ENV || 'development'}`,
  '.env.test',
]

for (const file of envFiles) {
  const fullPath = path.join(root, file)
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false })
  }
}

const required = [
  ['DATABASE_URL', value => /^postgres(ql)?:\/\//.test(value), 'must be a PostgreSQL URL'],
  [
    'NEXT_PUBLIC_SUPABASE_URL',
    value => /^https?:\/\/.+\.supabase\.co\/?$/.test(value),
    'must be a Supabase project URL',
  ],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', value => value.length > 0, 'is required'],
  [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    value => /^pk_(test|live)_/.test(value),
    'must start with pk_test_ or pk_live_',
  ],
  [
    'CLERK_SECRET_KEY',
    value => /^sk_(test|live)_/.test(value),
    'must start with sk_test_ or sk_live_',
  ],
]

const optional = [
  [
    'SUPABASE_SERVICE_ROLE_KEY',
    value => !value || value.length > 0,
    'is optional but cannot be empty when set',
  ],
  [
    'NEXT_PUBLIC_APP_URL',
    value => !value || /^https?:\/\//.test(value),
    'must be an HTTP(S) URL when set',
  ],
]

const failures = []
for (const [name, validate, message] of required) {
  const value = process.env[name]
  if (!value || !validate(value)) failures.push(`${name}: ${message}`)
}
for (const [name, validate, message] of optional) {
  const value = process.env[name]
  if (value !== undefined && !validate(value)) failures.push(`${name}: ${message}`)
}

if (failures.length > 0) {
  console.error('❌ Environment validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error(
    '\nNo secret values were printed. Copy .env.example to .env.local and fill real values.'
  )
  process.exit(1)
}

console.log('✅ Required environment variables are present and structurally valid.')
