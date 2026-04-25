import { z } from 'zod'

/**
 * Environment variable validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_REPLICA_URL: z.string().url().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/'),

  // Redis (Optional - for rate limiting and caching)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Security
  API_SECRET_KEY: z.string().min(32).optional(),

  // Vercel
  VERCEL_TOOLBAR: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
})

/**
 * Validated environment variables
 * This will throw an error if validation fails
 */
function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
      console.error('❌ Invalid environment variables:')
      console.error(JSON.stringify(parsed.error.format(), null, 2))
      throw new Error('Invalid environment variables')
    }

    return parsed.data
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>

/**
 * Check if we're in production environment
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if we're in development environment
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Check if we're in test environment
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Check if Redis is configured
 */
export const isRedisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)

/**
 * Get application URL based on environment
 */
export function getAppUrl(): string {
  // In Vercel, use VERCEL_URL if available
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }

  return env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/**
 * Get database connection string
 */
export function getDatabaseUrl(): string {
  return env.DATABASE_URL
}

/**
 * Get replica database URL if configured
 */
export function getReplicaDatabaseUrl(): string | undefined {
  return env.DATABASE_REPLICA_URL
}
