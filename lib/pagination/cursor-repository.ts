/**
 * Cursor Pagination Repository Mixin
 *
 * Adds cursor-based pagination capabilities to existing repositories.
 */

import { SQL, asc, desc, gt, lt, and, or } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { db } from '@/lib/db';
import {
  CursorPaginationParams,
  Connection,
  CursorPaginator,
  validateCursorParams,
  decodeCursor,
  getCursorComparison,
} from './cursor';

/**
 * Cursor pagination result
 */
export interface CursorPaginationResult<T> {
  connection: Connection<T>;
  hasMore: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

/**
 * Base cursor repository interface
 */
export interface ICursorRepository<T extends Record<string, any>> {
  /**
   * Find items with cursor pagination
   */
  findWithCursor(
    params: CursorPaginationParams,
    where?: SQL
  ): Promise<Connection<T>>;

  /**
   * Count total items (optional, can be expensive)
   */
  countTotal(where?: SQL): Promise<number>;
}

/**
 * Create a cursor-paginated query builder
 */
export class CursorQueryBuilder<T extends Record<string, any>> {
  private table: PgTable;
  private paginator: CursorPaginator<T>;
  private defaultSortField: string;

  constructor(
    table: PgTable,
    options: {
      sortField?: string;
      defaultLimit?: number;
    } = {}
  ) {
    this.table = table;
    this.defaultSortField = options.sortField ?? 'id';
    this.paginator = new CursorPaginator<T>({
      sortField: this.defaultSortField,
      defaultLimit: options.defaultLimit ?? 20,
    });
  }

  /**
   * Build cursor-paginated query
   */
  async execute(
    params: CursorPaginationParams,
    where?: SQL,
    options?: {
      includeTotalCount?: boolean;
    }
  ): Promise<Connection<T>> {
    // Validate parameters
    validateCursorParams(params);

    // Get pagination params
    const {
      isForward,
      limit,
      cursor: cursorData,
      sortDirection,
      comparison,
    } = this.paginator.getParams(params);

    const sortField = params.sortField ?? this.defaultSortField;
    const tableColumn = this.table[sortField];

    // Build WHERE clause
    let whereClause = where;

    if (cursorData) {
      const cursorCondition = comparison === '>'
        ? gt(tableColumn, cursorData.sortValue ?? cursorData.id)
        : lt(tableColumn, cursorData.sortValue ?? cursorData.id);

      whereClause = where
        ? and(where, cursorCondition)
        : cursorCondition;
    }

    // Build ORDER BY clause
    const orderBy = sortDirection === 'asc'
      ? asc(tableColumn)
      : desc(tableColumn);

    // Execute query (fetch limit + 1 to check if there are more)
    let query = db
      .select()
      .from(this.table)
      .limit(limit);

    if (whereClause) {
      query = query.where(whereClause) as any;
    }

    query = query.orderBy(orderBy) as any;

    const results = await query as T[];

    // Check if there are more items
    const hasMore = results.length > (limit - 1);
    const items = hasMore ? results.slice(0, -1) : results;

    // Reverse if backward pagination
    if (!isForward) {
      items.reverse();
    }

    // Get total count if requested
    let totalCount: number | undefined;
    if (options?.includeTotalCount) {
      totalCount = await this.countTotal(where);
    }

    // Determine page info
    const hasPreviousPage = isForward ? !!params.after : hasMore;
    const hasNextPage = isForward ? hasMore : !!params.before;

    // Create connection
    return this.paginator.createConnection(
      items,
      params,
      { hasPreviousPage, hasNextPage },
      totalCount
    );
  }

  /**
   * Count total items
   */
  async countTotal(where?: SQL): Promise<number> {
    let query = db.select({ count: db.$count() }).from(this.table);

    if (where) {
      query = query.where(where) as any;
    }

    const result = await query;
    return Number(result[0]?.count ?? 0);
  }
}

/**
 * Cursor repository mixin
 *
 * Add cursor pagination to any repository:
 *
 * @example
 * ```typescript
 * class MemberRepository extends CursorRepositoryMixin(BaseRepository) {
 *   // Your existing methods...
 * }
 * ```
 */
export function CursorRepositoryMixin<TBase extends new (...args: any[]) => any>(
  Base: TBase
) {
  return class extends Base implements ICursorRepository<any> {
    protected cursorBuilder?: CursorQueryBuilder<any>;

    /**
     * Initialize cursor builder
     */
    protected initCursorBuilder(sortField: string = 'id') {
      if (!this.cursorBuilder) {
        this.cursorBuilder = new CursorQueryBuilder(this.table, {
          sortField,
          defaultLimit: 20,
        });
      }
      return this.cursorBuilder;
    }

    /**
     * Find items with cursor pagination
     */
    async findWithCursor(
      params: CursorPaginationParams,
      where?: SQL
    ): Promise<Connection<any>> {
      const builder = this.initCursorBuilder(params.sortField);
      return builder.execute(params, where);
    }

    /**
     * Count total items
     */
    async countTotal(where?: SQL): Promise<number> {
      const builder = this.initCursorBuilder();
      return builder.countTotal(where);
    }

    /**
     * Helper: Forward pagination (typical infinite scroll)
     */
    async paginateForward(
      first: number,
      after?: string,
      where?: SQL,
      sortField?: string
    ): Promise<Connection<any>> {
      return this.findWithCursor(
        { first, after, sortField },
        where
      );
    }

    /**
     * Helper: Backward pagination
     */
    async paginateBackward(
      last: number,
      before?: string,
      where?: SQL,
      sortField?: string
    ): Promise<Connection<any>> {
      return this.findWithCursor(
        { last, before, sortField },
        where
      );
    }
  };
}

/**
 * Standalone cursor repository for direct use
 */
export class CursorRepository<T extends Record<string, any>> implements ICursorRepository<T> {
  protected cursorBuilder: CursorQueryBuilder<T>;

  constructor(
    protected table: PgTable,
    options: {
      sortField?: string;
      defaultLimit?: number;
    } = {}
  ) {
    this.cursorBuilder = new CursorQueryBuilder<T>(table, options);
  }

  async findWithCursor(
    params: CursorPaginationParams,
    where?: SQL
  ): Promise<Connection<T>> {
    return this.cursorBuilder.execute(params, where);
  }

  async countTotal(where?: SQL): Promise<number> {
    return this.cursorBuilder.countTotal(where);
  }

  async paginateForward(
    first: number,
    after?: string,
    where?: SQL
  ): Promise<Connection<T>> {
    return this.findWithCursor({ first, after }, where);
  }

  async paginateBackward(
    last: number,
    before?: string,
    where?: SQL
  ): Promise<Connection<T>> {
    return this.findWithCursor({ last, before }, where);
  }
}

/**
 * Performance comparison: Offset vs Cursor pagination
 */
export const PaginationPerformance = {
  /**
   * Offset pagination performance (decreases with page number)
   *
   * Page 1:    OFFSET 0    LIMIT 20  → ~1ms
   * Page 10:   OFFSET 200  LIMIT 20  → ~5ms
   * Page 100:  OFFSET 2000 LIMIT 20  → ~50ms
   * Page 1000: OFFSET 20000 LIMIT 20 → ~500ms
   */
  offset: {
    page1: '~1ms',
    page10: '~5ms',
    page100: '~50ms',
    page1000: '~500ms',
    complexity: 'O(n) - linear with page depth',
  },

  /**
   * Cursor pagination performance (constant regardless of position)
   *
   * First page:    WHERE id > 0 LIMIT 20      → ~1ms
   * 10th page:     WHERE id > '...' LIMIT 20  → ~1ms
   * 100th page:    WHERE id > '...' LIMIT 20  → ~1ms
   * 1000th page:   WHERE id > '...' LIMIT 20  → ~1ms
   */
  cursor: {
    anyPage: '~1ms (with proper index)',
    complexity: 'O(1) - constant time',
    requirement: 'Requires index on sort field',
  },

  /**
   * When to use each approach
   */
  recommendation: {
    useOffset: [
      'Small datasets (<1000 records)',
      'Users need to jump to specific page numbers',
      'Total count and page numbers are important',
      'Admin interfaces with traditional pagination',
    ],
    useCursor: [
      'Large datasets (>1000 records)',
      'Infinite scroll interfaces',
      'Real-time feeds and social media',
      'Mobile applications',
      'Performance is critical',
    ],
  },
};
