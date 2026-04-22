import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import * as schema from './schema'
import { env, isProduction, isDevelopment } from '@/lib/config/env'
import { info, warn, error as logError } from '@/lib/logging'

/**
 * Database connection configuration
 */
const connectionConfig = {
  // Connection pooling settings
  max: isProduction ? 10 : 5, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds

  // Disable prepared statements for serverless compatibility
  prepare: false,

  // Enable SSL in production
  ssl: (isProduction || (env.DATABASE_URL && env.DATABASE_URL.includes('supabase'))
    ? 'require'
    : false) as any,

  // Connection lifecycle hooks
  onnotice: isDevelopment ? (notice: any) => info('[DB Notice]', { notice }) : undefined,
}

/**
 * Create database client with connection pooling
 */
const client = postgres(env.DATABASE_URL, connectionConfig)

/**
 * Drizzle ORM instance with schema
 */
export const db = drizzle(client, { schema })

/**
 * Optional: Create read replica connection for scaling
 * Use this for SELECT queries to reduce load on primary database
 */
export const readDb = env.DATABASE_REPLICA_URL
  ? drizzle(postgres(env.DATABASE_REPLICA_URL, connectionConfig), { schema })
  : db // Fallback to primary if no replica configured

/**
 * Get database instance based on operation type
 * @param readonly - If true, use read replica for better performance
 */
export function getDb(options: { readonly?: boolean } = {}) {
  return options.readonly ? readDb : db
}

/**
 * Database health check
 * Tests if the database connection is working
 */
export async function checkDbHealth(): Promise<{
  healthy: boolean
  message: string
  latency?: number
}> {
  const startTime = Date.now()

  try {
    // Simple ping query
    await db.execute(sql`SELECT 1`)

    const latency = Date.now() - startTime

    return {
      healthy: true,
      message: 'Database connection is healthy',
      latency,
    }
  } catch (err) {
    logError('❌ Database health check failed', err instanceof Error ? err : undefined)

    return {
      healthy: false,
      message: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}

/**
 * Test database connection on startup (only in development)
 */
export async function testConnection(): Promise<boolean> {
  if (!isDevelopment) {
    return true // Skip in production to avoid cold start delays
  }

  try {
    const health = await checkDbHealth()

    if (health.healthy) {
      info(`✅ Database connected successfully (${health.latency}ms)`)
      return true
    } else {
      logError(`❌ Database connection failed: ${health.message}`)
      return false
    }
  } catch (err) {
    logError('❌ Database connection test failed', err instanceof Error ? err : undefined)
    return false
  }
}

/**
 * Gracefully close database connections
 * Important for cleanup in serverless functions
 */
export async function closeConnection(): Promise<void> {
  try {
    await client.end()
    info('✅ Database connection closed')
  } catch (err) {
    logError('❌ Error closing database connection', err instanceof Error ? err : undefined)
  }
}

/**
 * Transaction helper
 * Wraps operations in a database transaction
 */
export async function withTransaction<T>(callback: (tx: typeof db) => Promise<T>): Promise<T> {
  return await db.transaction(async tx => {
    return await callback(tx as unknown as typeof db)
  })
}

/**
 * Query performance logger
 * Logs slow queries for optimization
 */
export async function logSlowQuery(
  queryName: string,
  duration: number,
  threshold: number = 1000
): Promise<void> {
  if (duration > threshold) {
    warn(`⚠️ Slow query detected: ${queryName} took ${duration}ms`)

    // In production, you might want to send this to a monitoring service
    // e.g., Sentry, DataDog, or store in a performance_metrics table
  }
}

/**
 * Query wrapper with performance logging
 */
export async function withPerformanceLog<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  threshold?: number
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await queryFn()
    const duration = Date.now() - startTime

    await logSlowQuery(queryName, duration, threshold)

    return result
  } catch (err) {
    logError(`❌ Query failed: ${queryName}`, err instanceof Error ? err : undefined)
    throw err
  }
}

// Export schema for convenience
export { schema }

// Export types from schema
export type * from './schema'
