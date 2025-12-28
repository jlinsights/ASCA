/**
 * Enhanced Member Repository with Query Optimization
 *
 * Demonstrates N+1 query prevention using DataLoader and batch loading techniques.
 */

import { eq, inArray, like, or, and, desc, asc, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  members,
  membershipLevels,
  artworks,
  exhibitions,
  type Member,
  type NewMember,
  type MembershipLevel,
  type Artwork,
} from '@/lib/db/schema-pg';
import { MemberRepository } from './member.repository';
import { createIdLoader, DataLoader } from '@/lib/optimization/dataloader';
import { batchLoadRelated, batchLoadHasMany } from '@/lib/optimization/query-optimizer';

/**
 * Member with related data loaded
 */
export interface MemberWithRelations extends Member {
  membershipLevel?: MembershipLevel | null;
  artworks?: Artwork[];
  exhibitionCount?: number;
}

/**
 * DataLoaders for Member-related queries
 */
export class MemberDataLoaders {
  /**
   * Load membership level by ID
   */
  membershipLevel: DataLoader<string, MembershipLevel>;

  /**
   * Load artworks by member ID
   */
  artworksByMember: DataLoader<string, Artwork[]>;

  /**
   * Load exhibition count by member ID
   */
  exhibitionCountByMember: DataLoader<string, number>;

  constructor() {
    // Membership Level Loader
    this.membershipLevel = createIdLoader(
      async (ids: readonly string[]) => {
        const levels = await db
          .select()
          .from(membershipLevels)
          .where(inArray(membershipLevels.id, [...ids]));

        return levels;
      },
      {
        maxBatchSize: 100,
        cache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
      }
    );

    // Artworks by Member Loader
    this.artworksByMember = new DataLoader({
      batchLoadFn: async (memberIds: readonly string[]) => {
        const allArtworks = await db
          .select()
          .from(artworks)
          .where(inArray(artworks.artist_id, [...memberIds]));

        // Group artworks by member ID
        const artworksByMemberId = new Map<string, Artwork[]>();
        allArtworks.forEach(artwork => {
          if (!artworksByMemberId.has(artwork.artist_id)) {
            artworksByMemberId.set(artwork.artist_id, []);
          }
          artworksByMemberId.get(artwork.artist_id)!.push(artwork);
        });

        // Return in same order as input keys
        return memberIds.map(id => artworksByMemberId.get(id) ?? []);
      },
      maxBatchSize: 50,
      cache: true,
    });

    // Exhibition Count Loader
    this.exhibitionCountByMember = new DataLoader({
      batchLoadFn: async (memberIds: readonly string[]) => {
        const counts = await db
          .select({
            artist_id: artworks.artist_id,
            count: count(),
          })
          .from(artworks)
          .where(inArray(artworks.artist_id, [...memberIds]))
          .groupBy(artworks.artist_id);

        const countMap = new Map(
          counts.map(c => [c.artist_id, Number(c.count)])
        );

        return memberIds.map(id => countMap.get(id) ?? 0);
      },
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.membershipLevel.clearAll();
    this.artworksByMember.clearAll();
    this.exhibitionCountByMember.clearAll();
  }
}

/**
 * Enhanced Member Repository with N+1 Prevention
 */
export class EnhancedMemberRepository extends MemberRepository {
  /**
   * Find all members with their membership levels (OPTIMIZED)
   *
   * This method uses batch loading to fetch membership levels in a single query,
   * avoiding the N+1 problem.
   */
  async findAllWithLevels(): Promise<MemberWithRelations[]> {
    // 1. Fetch all members (1 query)
    const allMembers = await this.findAll({
      orderBy: desc(members.created_at),
    });

    if (allMembers.length === 0) return [];

    // 2. Batch load membership levels (1 query instead of N)
    const levelIds = [...new Set(
      allMembers
        .map(m => m.membership_level_id)
        .filter(Boolean)
    )] as string[];

    const levels = await db
      .select()
      .from(membershipLevels)
      .where(inArray(membershipLevels.id, levelIds));

    const levelMap = new Map(levels.map(l => [l.id, l]));

    // 3. Attach levels to members
    return allMembers.map(member => ({
      ...member,
      membershipLevel: member.membership_level_id
        ? levelMap.get(member.membership_level_id) ?? null
        : null,
    }));

    // Total: 2 queries instead of 1 + N queries!
  }

  /**
   * Find member by ID with all related data (OPTIMIZED)
   *
   * Loads member, membership level, artworks, and exhibition count
   * in just 4 queries instead of potentially hundreds.
   */
  async findByIdWithRelations(id: string): Promise<MemberWithRelations | null> {
    // 1. Fetch member (1 query)
    const member = await this.findById(id);
    if (!member) return null;

    // 2. Fetch related data in parallel (3 queries)
    const [membershipLevel, memberArtworks, exhibitionCounts] = await Promise.all([
      // Membership level
      member.membership_level_id
        ? db.select()
            .from(membershipLevels)
            .where(eq(membershipLevels.id, member.membership_level_id))
            .then(rows => rows[0] ?? null)
        : Promise.resolve(null),

      // Artworks
      db.select()
        .from(artworks)
        .where(eq(artworks.artist_id, id))
        .orderBy(desc(artworks.created_at)),

      // Exhibition count
      db.select({ count: count() })
        .from(artworks)
        .where(eq(artworks.artist_id, id))
        .then(rows => Number(rows[0]?.count ?? 0)),
    ]);

    return {
      ...member,
      membershipLevel,
      artworks: memberArtworks,
      exhibitionCount: exhibitionCounts,
    };

    // Total: 4 queries (constant time, regardless of data size)
  }

  /**
   * Search members with related data using DataLoader (OPTIMIZED)
   */
  async searchWithRelations(
    criteria: {
      query?: string;
      status?: string;
      levelId?: string;
    },
    loaders: MemberDataLoaders
  ): Promise<MemberWithRelations[]> {
    // 1. Search members (1 query)
    const searchResults = await this.search(criteria, { page: 1, limit: 100 });

    if (searchResults.data.length === 0) {
      return [];
    }

    // 2. Load related data using DataLoaders (batched queries)
    const membersWithRelations = await Promise.all(
      searchResults.data.map(async (member) => {
        const [membershipLevel, memberArtworks, exhibitionCount] = await Promise.all([
          member.membership_level_id
            ? loaders.membershipLevel.load(member.membership_level_id).catch(() => null)
            : null,
          loaders.artworksByMember.load(member.id).catch(() => []),
          loaders.exhibitionCountByMember.load(member.id).catch(() => 0),
        ]);

        return {
          ...member,
          membershipLevel,
          artworks: memberArtworks,
          exhibitionCount,
        };
      })
    );

    return membersWithRelations;

    // Total: ~3-4 batched queries (instead of 1 + 3N individual queries)
  }

  /**
   * Get active members with their artwork counts (OPTIMIZED)
   */
  async getActiveWithArtworkCounts(): Promise<
    Array<Member & { artworkCount: number; membershipLevel: MembershipLevel | null }>
  > {
    // Single optimized query with JOIN
    const results = await db
      .select({
        member: members,
        level: membershipLevels,
        artworkCount: sql<number>`COALESCE(COUNT(${artworks.id}), 0)`,
      })
      .from(members)
      .leftJoin(membershipLevels, eq(members.membership_level_id, membershipLevels.id))
      .leftJoin(artworks, eq(members.id, artworks.artist_id))
      .where(eq(members.status, 'active'))
      .groupBy(members.id, membershipLevels.id)
      .orderBy(desc(members.created_at));

    return results.map(row => ({
      ...row.member,
      artworkCount: Number(row.artworkCount),
      membershipLevel: row.level,
    }));

    // Total: 1 optimized query with JOINs!
  }

  /**
   * Bulk load members with levels using helper functions
   */
  async bulkLoadWithLevels(memberIds: string[]): Promise<MemberWithRelations[]> {
    if (memberIds.length === 0) return [];

    // 1. Fetch members (1 query)
    const fetchedMembers = await db
      .select()
      .from(members)
      .where(inArray(members.id, memberIds));

    // 2. Batch load membership levels (1 query)
    const levels = await batchLoadRelated<Member, MembershipLevel>(
      fetchedMembers,
      'membership_level_id',
      membershipLevels,
      'id'
    );

    // 3. Combine results
    return fetchedMembers.map((member, index) => ({
      ...member,
      membershipLevel: levels[index],
    }));

    // Total: 2 queries
  }

  /**
   * Get members with their artworks (OPTIMIZED)
   */
  async getMembersWithArtworks(memberIds: string[]): Promise<MemberWithRelations[]> {
    if (memberIds.length === 0) return [];

    // 1. Fetch members (1 query)
    const fetchedMembers = await db
      .select()
      .from(members)
      .where(inArray(members.id, memberIds));

    // 2. Batch load artworks (1 query)
    const artworksByMember = await batchLoadHasMany<Member, Artwork>(
      fetchedMembers,
      'id',
      artworks,
      'artist_id'
    );

    // 3. Combine results
    return fetchedMembers.map((member, index) => ({
      ...member,
      artworks: artworksByMember[index],
    }));

    // Total: 2 queries
  }
}

/**
 * Performance Comparison Examples
 */
export const PerformanceExamples = {
  /**
   * BAD: N+1 Query Problem
   *
   * This will execute 1 + N queries:
   * - 1 query to fetch all members
   * - N queries to fetch each member's level (one per member)
   */
  async inefficientApproach() {
    const repository = new MemberRepository();

    // 1 query
    const members = await repository.findAll();

    // N queries (one per member) ❌
    const membersWithLevels = await Promise.all(
      members.map(async (member) => {
        if (!member.membership_level_id) {
          return { ...member, level: null };
        }

        // Individual query for each member's level
        const level = await db
          .select()
          .from(membershipLevels)
          .where(eq(membershipLevels.id, member.membership_level_id))
          .then(rows => rows[0]);

        return { ...member, level };
      })
    );

    return membersWithLevels;
    // Total: 1 + N queries (very slow for large datasets!)
  },

  /**
   * GOOD: Optimized Approach
   *
   * This will execute just 2 queries:
   * - 1 query to fetch all members
   * - 1 batched query to fetch all levels
   */
  async optimizedApproach() {
    const repository = new EnhancedMemberRepository();

    // 2 queries total ✅
    const membersWithLevels = await repository.findAllWithLevels();

    return membersWithLevels;
    // Total: 2 queries (constant time, regardless of data size!)
  },

  /**
   * BEST: Single Query with JOIN
   */
  async bestApproach() {
    const repository = new EnhancedMemberRepository();

    // 1 optimized query ✅✅
    const membersWithCounts = await repository.getActiveWithArtworkCounts();

    return membersWithCounts;
    // Total: 1 query (most efficient!)
  },
};

// Export singleton instance
export const enhancedMemberRepository = new EnhancedMemberRepository();
