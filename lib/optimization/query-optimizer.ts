/**
 * Query Optimization Helpers
 *
 * Utilities for detecting and fixing N+1 queries and other common performance issues.
 */

import { eq, inArray, SQL } from 'drizzle-orm'
import { PgTable } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db'
import { info, warn } from '@/lib/logging'
import { DataLoader, createIdLoader } from './dataloader'

/**
 * Query performance tracking
 */
interface QueryMetrics {
  queryCount: number
  totalDuration: number
  queries: Array<{
    sql: string
    duration: number
    timestamp: number
  }>
}

class QueryOptimizer {
  private metrics: Map<string, QueryMetrics> = new Map()
  private enabled = process.env.NODE_ENV === 'development'

  /**
   * Start tracking queries for a request
   */
  startTracking(requestId: string): void {
    if (!this.enabled) return

    this.metrics.set(requestId, {
      queryCount: 0,
      totalDuration: 0,
      queries: [],
    })
  }

  /**
   * Record a query execution
   */
  recordQuery(requestId: string, sql: string, duration: number): void {
    if (!this.enabled) return

    const metrics = this.metrics.get(requestId)
    if (!metrics) return

    metrics.queryCount++
    metrics.totalDuration += duration
    metrics.queries.push({
      sql,
      duration,
      timestamp: Date.now(),
    })
  }

  /**
   * Detect N+1 queries
   */
  detectN1(requestId: string): {
    hasN1: boolean
    suspiciousQueries: Array<{
      pattern: string
      count: number
      totalDuration: number
    }>
  } {
    const metrics = this.metrics.get(requestId)
    if (!metrics) {
      return { hasN1: false, suspiciousQueries: [] }
    }

    // Group similar queries
    const queryPatterns = new Map<string, { count: number; totalDuration: number }>()

    metrics.queries.forEach(({ sql, duration }) => {
      // Normalize query by removing specific values
      const pattern = sql.replace(/'\w+'/g, '?').replace(/\d+/g, '?').replace(/\s+/g, ' ').trim()

      const existing = queryPatterns.get(pattern)
      if (existing) {
        existing.count++
        existing.totalDuration += duration
      } else {
        queryPatterns.set(pattern, { count: 1, totalDuration: duration })
      }
    })

    // Find suspicious patterns (queries executed >5 times)
    const suspiciousQueries = Array.from(queryPatterns.entries())
      .filter(([_, stats]) => stats.count > 5)
      .map(([pattern, stats]) => ({
        pattern,
        count: stats.count,
        totalDuration: stats.totalDuration,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      hasN1: suspiciousQueries.length > 0,
      suspiciousQueries,
    }
  }

  /**
   * Get metrics for a request
   */
  getMetrics(requestId: string): QueryMetrics | undefined {
    return this.metrics.get(requestId)
  }

  /**
   * Clear metrics for a request
   */
  clearMetrics(requestId: string): void {
    this.metrics.delete(requestId)
  }

  /**
   * Get performance report
   */
  getReport(requestId: string): string {
    const metrics = this.metrics.get(requestId)
    if (!metrics) return 'No metrics available'

    const n1Detection = this.detectN1(requestId)

    let report = `\n=== Query Performance Report ===\n`
    report += `Total Queries: ${metrics.queryCount}\n`
    report += `Total Duration: ${metrics.totalDuration.toFixed(2)}ms\n`
    report += `Average Duration: ${(metrics.totalDuration / metrics.queryCount).toFixed(2)}ms\n`

    if (n1Detection.hasN1) {
      report += `\n⚠️  Potential N+1 Queries Detected:\n`
      n1Detection.suspiciousQueries.forEach(({ pattern, count, totalDuration }) => {
        report += `  - Executed ${count} times (${totalDuration.toFixed(2)}ms total)\n`
        report += `    Pattern: ${pattern.substring(0, 100)}...\n`
      })
    }

    return report
  }
}

export const queryOptimizer = new QueryOptimizer()

/**
 * Batch load related entities
 *
 * @example
 * ```typescript
 * const members = await memberRepository.findAll();
 *
 * // Bad: N+1 queries
 * for (const member of members) {
 *   member.level = await levelRepository.findById(member.membership_level_id);
 * }
 *
 * // Good: 1 batched query
 * const levels = await batchLoadRelated(
 *   members,
 *   'membership_level_id',
 *   membershipLevels,
 *   'id'
 * );
 * members.forEach((member, i) => {
 *   member.level = levels[i];
 * });
 * ```
 */
export async function batchLoadRelated<T extends Record<string, any>, R>(
  items: T[],
  foreignKey: keyof T,
  relatedTable: PgTable,
  relatedKey: string = 'id'
): Promise<(R | null)[]> {
  if (items.length === 0) return []

  const foreignIds = items.map(item => item[foreignKey]).filter(Boolean)
  if (foreignIds.length === 0) {
    return items.map(() => null)
  }

  // Execute single batched query
  const relatedItems = (await db
    .select()
    .from(relatedTable)
    .where(inArray((relatedTable as any)[relatedKey], foreignIds))) as R[]

  // Create lookup map
  const relatedMap = new Map<any, R>()
  relatedItems.forEach(item => {
    relatedMap.set((item as any)[relatedKey], item)
  })

  // Return results in same order as input
  return items.map(item => relatedMap.get(item[foreignKey]) ?? null)
}

/**
 * Load related entities with one-to-many relationship
 *
 * @example
 * ```typescript
 * const members = await memberRepository.findAll();
 *
 * // Bad: N queries
 * for (const member of members) {
 *   member.artworks = await artworkRepository.findByMemberId(member.id);
 * }
 *
 * // Good: 1 batched query
 * const artworksByMember = await batchLoadHasMany(
 *   members,
 *   'id',
 *   artworks,
 *   'artist_id'
 * );
 * members.forEach((member, i) => {
 *   member.artworks = artworksByMember[i];
 * });
 * ```
 */
export async function batchLoadHasMany<T extends Record<string, any>, R>(
  items: T[],
  primaryKey: keyof T,
  relatedTable: PgTable,
  foreignKey: string
): Promise<R[][]> {
  if (items.length === 0) return []

  const primaryIds = items.map(item => item[primaryKey])

  // Execute single batched query
  const relatedItems = (await db
    .select()
    .from(relatedTable)
    .where(inArray((relatedTable as any)[foreignKey], primaryIds))) as R[]

  // Group by foreign key
  const groupedMap = new Map<any, R[]>()
  relatedItems.forEach(item => {
    const fk = (item as any)[foreignKey]
    if (!groupedMap.has(fk)) {
      groupedMap.set(fk, [])
    }
    groupedMap.get(fk)!.push(item)
  })

  // Return results in same order as input
  return items.map(item => groupedMap.get(item[primaryKey]) ?? [])
}

/**
 * Create a request-scoped DataLoader factory
 *
 * @example
 * ```typescript
 * // In API route
 * const loaders = createRequestLoaders();
 *
 * // Use loaders
 * const level = await loaders.membershipLevel.load(member.membership_level_id);
 * ```
 */
export function createRequestLoaders() {
  return {
    // Add your DataLoaders here
    // membershipLevel: createIdLoader(async (ids) => { ... }),
    // artist: createIdLoader(async (ids) => { ... }),
    // artwork: createIdLoader(async (ids) => { ... }),
  }
}

/**
 * Middleware to track query performance
 */
export function withQueryTracking(requestId: string) {
  return {
    start: () => queryOptimizer.startTracking(requestId),
    end: () => {
      const report = queryOptimizer.getReport(requestId)
      if (process.env.NODE_ENV === 'development') {
        info(typeof report === 'string' ? report : JSON.stringify(report))
      }
      queryOptimizer.clearMetrics(requestId)
    },
  }
}

/**
 * Prefetch related data to avoid N+1
 *
 * @example
 * ```typescript
 * const members = await memberRepository.findAll();
 *
 * // Prefetch all related data at once
 * await prefetchRelated(members, {
 *   membershipLevel: 'membership_level_id',
 *   createdByUser: 'created_by_id',
 * });
 *
 * // Now access related data without additional queries
 * members.forEach(member => {
 *   console.log(member.membershipLevel.name);
 * });
 * ```
 */
export async function prefetchRelated<T extends Record<string, any>>(
  items: T[],
  relations: Record<
    string,
    {
      table: PgTable
      foreignKey: keyof T
      targetKey?: string
    }
  >
): Promise<void> {
  const promises = Object.entries(relations).map(async ([name, config]) => {
    const { table, foreignKey, targetKey = 'id' } = config

    const relatedItems = await batchLoadRelated(items, foreignKey, table, targetKey)

    items.forEach((item, index) => {
      ;(item as any)[name] = relatedItems[index]
    })
  })

  await Promise.all(promises)
}

/**
 * Query execution wrapper with performance tracking
 */
export async function executeQuery<T>(
  requestId: string,
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await queryFn()
    const duration = Date.now() - startTime

    queryOptimizer.recordQuery(requestId, queryName, duration)

    if (duration > 1000) {
      warn(`⚠️  Slow query detected (${duration}ms): ${queryName}`)
    }

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    queryOptimizer.recordQuery(requestId, `${queryName} (FAILED)`, duration)
    throw error
  }
}
