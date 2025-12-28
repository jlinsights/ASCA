/**
 * Member Repository with Cursor Pagination
 *
 * Demonstrates how to add cursor pagination to an existing repository.
 */

import { eq, like, or, and, desc } from 'drizzle-orm';
import { members, type Member } from '@/lib/db/schema-pg';
import { EnhancedMemberRepository } from './member.repository.enhanced';
import {
  CursorRepositoryMixin,
  CursorQueryBuilder,
} from '@/lib/pagination/cursor-repository';
import {
  Connection,
  CursorPaginationParams,
  createConnection,
} from '@/lib/pagination/cursor';
import { db } from '@/lib/db';

/**
 * Member repository with cursor pagination support
 *
 * Extends EnhancedMemberRepository and adds cursor pagination capabilities.
 */
export class CursorMemberRepository extends CursorRepositoryMixin(EnhancedMemberRepository) {
  /**
   * Search members with cursor pagination
   *
   * Perfect for infinite scroll in mobile apps or web UIs.
   *
   * @example
   * ```typescript
   * // Initial load
   * const firstPage = await repository.searchWithCursor({
   *   query: 'John',
   *   first: 20
   * });
   *
   * // Load next page
   * const nextPage = await repository.searchWithCursor({
   *   query: 'John',
   *   first: 20,
   *   after: firstPage.pageInfo.endCursor
   * });
   * ```
   */
  async searchWithCursor(
    criteria: {
      query?: string;
      status?: string;
      levelId?: string;
    },
    params: CursorPaginationParams
  ): Promise<Connection<Member>> {
    // Build WHERE clause
    const conditions = [];

    if (criteria.query) {
      conditions.push(
        or(
          like(members.first_name_ko, `%${criteria.query}%`),
          like(members.last_name_ko, `%${criteria.query}%`),
          like(members.first_name_en, `%${criteria.query}%`),
          like(members.last_name_en, `%${criteria.query}%`),
          like(members.email, `%${criteria.query}%`)
        )
      );
    }

    if (criteria.status) {
      conditions.push(eq(members.status, criteria.status));
    }

    if (criteria.levelId) {
      conditions.push(eq(members.membership_level_id, criteria.levelId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Use cursor pagination from mixin
    return this.findWithCursor(
      {
        ...params,
        sortField: params.sortField ?? 'created_at',
        sortDirection: params.sortDirection ?? 'desc',
      },
      where
    );
  }

  /**
   * Get recent members with cursor pagination
   *
   * Optimized for chronological feeds and activity streams.
   *
   * @example
   * ```typescript
   * // Get latest 20 members
   * const recent = await repository.getRecentWithCursor({ first: 20 });
   *
   * // Load more
   * const more = await repository.getRecentWithCursor({
   *   first: 20,
   *   after: recent.pageInfo.endCursor
   * });
   * ```
   */
  async getRecentWithCursor(
    params: CursorPaginationParams
  ): Promise<Connection<Member>> {
    return this.findWithCursor(
      {
        ...params,
        sortField: 'created_at',
        sortDirection: 'desc',
      }
    );
  }

  /**
   * Get active members with cursor pagination
   */
  async getActiveWithCursor(
    params: CursorPaginationParams
  ): Promise<Connection<Member>> {
    return this.findWithCursor(
      {
        ...params,
        sortField: params.sortField ?? 'created_at',
        sortDirection: params.sortDirection ?? 'desc',
      },
      eq(members.status, 'active')
    );
  }

  /**
   * Infinite scroll helper
   *
   * Simplified API for typical infinite scroll use cases.
   *
   * @example
   * ```typescript
   * // Component state
   * const [allMembers, setAllMembers] = useState([]);
   * const [cursor, setCursor] = useState(null);
   *
   * // Load more function
   * const loadMore = async () => {
   *   const result = await repository.infiniteScroll({
   *     limit: 20,
   *     cursor: cursor
   *   });
   *
   *   setAllMembers([...allMembers, ...result.items]);
   *   setCursor(result.nextCursor);
   *   return result.hasMore;
   * };
   * ```
   */
  async infiniteScroll(params: {
    limit?: number;
    cursor?: string | null;
    status?: string;
  }): Promise<{
    items: Member[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const limit = params.limit ?? 20;

    const where = params.status
      ? eq(members.status, params.status)
      : undefined;

    const connection = await this.paginateForward(
      limit,
      params.cursor ?? undefined,
      where,
      'created_at'
    );

    return {
      items: connection.nodes,
      nextCursor: connection.pageInfo.hasNextPage
        ? connection.pageInfo.endCursor ?? null
        : null,
      hasMore: connection.pageInfo.hasNextPage,
    };
  }

  /**
   * Bidirectional pagination
   *
   * Supports both forward and backward navigation.
   * Useful for timelines and chat interfaces.
   */
  async getBidirectional(params: {
    cursor?: string;
    direction: 'forward' | 'backward';
    limit?: number;
  }): Promise<Connection<Member>> {
    const limit = params.limit ?? 20;

    if (params.direction === 'forward') {
      return this.paginateForward(
        limit,
        params.cursor,
        undefined,
        'created_at'
      );
    } else {
      return this.paginateBackward(
        limit,
        params.cursor,
        undefined,
        'created_at'
      );
    }
  }
}

/**
 * Usage Examples
 */
export const CursorPaginationExamples = {
  /**
   * Example 1: Basic infinite scroll
   */
  infiniteScroll: async () => {
    const repository = new CursorMemberRepository();

    // First page
    const page1 = await repository.infiniteScroll({ limit: 20 });
    console.log('First 20 members:', page1.items);

    // Second page
    if (page1.hasMore) {
      const page2 = await repository.infiniteScroll({
        limit: 20,
        cursor: page1.nextCursor,
      });
      console.log('Next 20 members:', page2.items);
    }
  },

  /**
   * Example 2: Search with pagination
   */
  searchWithPagination: async () => {
    const repository = new CursorMemberRepository();

    const results = await repository.searchWithCursor(
      { query: 'John', status: 'active' },
      { first: 20 }
    );

    console.log('Total found:', results.pageInfo.totalCount);
    console.log('Has more:', results.pageInfo.hasNextPage);

    // Load next page
    if (results.pageInfo.hasNextPage) {
      const nextPage = await repository.searchWithCursor(
        { query: 'John', status: 'active' },
        { first: 20, after: results.pageInfo.endCursor! }
      );
      console.log('Next page:', nextPage.nodes);
    }
  },

  /**
   * Example 3: Recent members feed
   */
  recentFeed: async () => {
    const repository = new CursorMemberRepository();

    // Get latest members
    const recent = await repository.getRecentWithCursor({ first: 20 });

    console.log('Recent members:', recent.nodes);
    console.log('Oldest cursor:', recent.pageInfo.startCursor);
    console.log('Newest cursor:', recent.pageInfo.endCursor);

    // Load older members
    const older = await repository.getRecentWithCursor({
      first: 20,
      after: recent.pageInfo.endCursor!,
    });
  },

  /**
   * Example 4: Bidirectional navigation (chat-like)
   */
  bidirectional: async () => {
    const repository = new CursorMemberRepository();

    // Start from a specific point
    const current = await repository.getRecentWithCursor({ first: 10 });

    // Go forward (newer)
    const newer = await repository.getBidirectional({
      cursor: current.pageInfo.startCursor!,
      direction: 'backward',
      limit: 10,
    });

    // Go backward (older)
    const older = await repository.getBidirectional({
      cursor: current.pageInfo.endCursor!,
      direction: 'forward',
      limit: 10,
    });

    console.log('Newer:', newer.nodes);
    console.log('Current:', current.nodes);
    console.log('Older:', older.nodes);
  },
};

/**
 * Performance Comparison
 */
export const PerformanceComparison = {
  /**
   * Offset pagination (Phase 1 & 2)
   */
  offsetPagination: async () => {
    const repository = new EnhancedMemberRepository();

    // Page 1: fast (~1ms)
    const page1Start = Date.now();
    await repository.findAll({ page: 1, limit: 20 });
    const page1Time = Date.now() - page1Start;

    // Page 100: slow (~50ms)
    const page100Start = Date.now();
    await repository.findAll({ page: 100, limit: 20 });
    const page100Time = Date.now() - page100Start;

    console.log('Offset Performance:');
    console.log(`Page 1: ${page1Time}ms`);
    console.log(`Page 100: ${page100Time}ms (${(page100Time / page1Time).toFixed(1)}x slower)`);
  },

  /**
   * Cursor pagination (Phase 3)
   */
  cursorPagination: async () => {
    const repository = new CursorMemberRepository();

    // First page: fast (~1ms)
    const page1Start = Date.now();
    const page1 = await repository.getRecentWithCursor({ first: 20 });
    const page1Time = Date.now() - page1Start;

    // Simulate going to "page 100" by cursor
    let cursor = page1.pageInfo.endCursor!;
    for (let i = 0; i < 99; i++) {
      const page = await repository.getRecentWithCursor({
        first: 20,
        after: cursor,
      });
      cursor = page.pageInfo.endCursor!;
    }

    // "Page 100": still fast (~1ms)
    const page100Start = Date.now();
    await repository.getRecentWithCursor({ first: 20, after: cursor });
    const page100Time = Date.now() - page100Start;

    console.log('Cursor Performance:');
    console.log(`Page 1: ${page1Time}ms`);
    console.log(`Page 100: ${page100Time}ms (consistent performance!)`);
  },
};

// Export singleton
export const cursorMemberRepository = new CursorMemberRepository();
