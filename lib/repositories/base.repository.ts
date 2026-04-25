import { SQL, eq, and, or, like, desc, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import type { PgTable } from 'drizzle-orm/pg-core'

/**
 * Query options for repository methods
 */
export interface QueryOptions<T = any> {
  where?: SQL
  orderBy?: SQL | SQL[]
  limit?: number
  offset?: number
  select?: Partial<Record<keyof T, boolean>>
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  limit: number
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
  hasPrevious: boolean
}

/**
 * Sort options
 */
export interface SortOptions<T = any> {
  field: keyof T
  order: 'asc' | 'desc'
}

/**
 * Base Repository class
 * Provides common CRUD operations for all repositories
 *
 * @template TTable - The Drizzle table type
 * @template TSelect - The inferred SELECT type
 * @template TInsert - The inferred INSERT type
 */
export abstract class BaseRepository<
  TTable extends PgTable,
  TSelect = TTable['$inferSelect'],
  TInsert = TTable['$inferInsert'],
> {
  /**
   * @param table - The Drizzle table definition
   */
  constructor(protected readonly table: TTable) {}

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<TSelect | null> {
    const [result] = await db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id))
      .limit(1)

    return (result as TSelect) || null
  }

  /**
   * Find all records with optional filtering and sorting
   */
  async findAll(options?: QueryOptions<TSelect>): Promise<TSelect[]> {
    let query = db.select().from(this.table as any)

    if (options?.where) {
      query = query.where(options.where) as typeof query
    }

    if (options?.orderBy) {
      const orderByArray = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]
      query = query.orderBy(...orderByArray) as typeof query
    }

    if (options?.limit) {
      query = query.limit(options.limit) as typeof query
    }

    if (options?.offset) {
      query = query.offset(options.offset) as typeof query
    }

    const results = await query
    return results as TSelect[]
  }

  /**
   * Find records with pagination
   */
  async findWithPagination(
    options: PaginationOptions & Omit<QueryOptions<TSelect>, 'limit' | 'offset'>
  ): Promise<PaginatedResult<TSelect>> {
    const { page, limit, ...queryOptions } = options
    const offset = (page - 1) * limit

    // Get total count
    let countQuery = db.select().from(this.table as any)
    if (queryOptions.where) {
      countQuery = countQuery.where(queryOptions.where) as typeof countQuery
    }

    const allResults = await countQuery
    const total = allResults.length

    // Get paginated data
    const data = await this.findAll({
      ...queryOptions,
      limit,
      offset,
    })

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  /**
   * Find one record matching the criteria
   */
  async findOne(options: QueryOptions<TSelect>): Promise<TSelect | null> {
    const results = await this.findAll({ ...options, limit: 1 })
    return results[0] || null
  }

  /**
   * Create a new record
   */
  async create(data: TInsert): Promise<TSelect> {
    const [result] = await db
      .insert(this.table)
      .values(data as any)
      .returning()

    return result as TSelect
  }

  /**
   * Create multiple records
   */
  async createMany(data: TInsert[]): Promise<TSelect[]> {
    const results = await db
      .insert(this.table)
      .values(data as any[])
      .returning()

    return results as TSelect[]
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<TInsert>): Promise<TSelect | null> {
    const [result] = await db
      .update(this.table)
      .set(data as any)
      .where(eq((this.table as any).id, id))
      .returning()

    return (result as TSelect) || null
  }

  /**
   * Update multiple records matching criteria
   */
  async updateMany(where: SQL, data: Partial<TInsert>): Promise<TSelect[]> {
    const results = await db
      .update(this.table)
      .set(data as any)
      .where(where)
      .returning()

    return results as TSelect[]
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq((this.table as any).id, id))
      .returning()

    return result.length > 0
  }

  /**
   * Delete multiple records matching criteria
   */
  async deleteMany(where: SQL): Promise<number> {
    const result = await db.delete(this.table).where(where).returning()

    return result.length
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id)
    return result !== null
  }

  /**
   * Check if any records match the criteria
   */
  async existsWhere(where: SQL): Promise<boolean> {
    const result = await this.findOne({ where })
    return result !== null
  }

  /**
   * Count total records
   */
  async count(where?: SQL): Promise<number> {
    let query = db.select().from(this.table as any)

    if (where) {
      query = query.where(where) as typeof query
    }

    const results = await query
    return results.length
  }

  /**
   * Get first record
   */
  async first(options?: Omit<QueryOptions<TSelect>, 'limit'>): Promise<TSelect | null> {
    return this.findOne({ ...options, limit: 1 })
  }

  /**
   * Get last record
   */
  async last(options?: Omit<QueryOptions<TSelect>, 'limit'>): Promise<TSelect | null> {
    const results = await this.findAll(options)
    return results[results.length - 1] || null
  }

  /**
   * Soft delete (if table has deleted_at column)
   * Override this in child classes if needed
   */
  async softDelete(id: string): Promise<TSelect | null> {
    return this.update(id, {
      deleted_at: new Date(),
    } as any)
  }

  /**
   * Restore soft-deleted record
   * Override this in child classes if needed
   */
  async restore(id: string): Promise<TSelect | null> {
    return this.update(id, {
      deleted_at: null,
    } as any)
  }

  /**
   * Transaction helper
   * Execute multiple operations in a transaction
   */
  async transaction<T>(callback: (tx: typeof db) => Promise<T>): Promise<T> {
    return await db.transaction(async tx => {
      return await callback(tx as any)
    })
  }
}
