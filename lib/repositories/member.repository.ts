import { eq, or, like, desc, asc, and, sql } from 'drizzle-orm';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
import { db } from '@/lib/db';
import { members } from '@/lib/db/schema-pg';
import type { Member, NewMember } from '@/lib/db/schema-pg';

/**
 * Member search criteria
 */
export interface MemberSearchCriteria {
  query?: string;
  status?: string;
  levelId?: string;
  nationality?: string;
  isVerified?: boolean;
  isPublic?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'email' | 'last_active' | 'joined_date';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Member statistics
 */
export interface MemberStatistics {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  byLevel: Record<string, number>;
  byNationality: Record<string, number>;
}

/**
 * Member Repository
 * Handles all database operations for members
 */
export class MemberRepository extends BaseRepository<typeof members, Member, NewMember> {
  constructor() {
    super(members);
  }

  /**
   * Find member by email
   */
  async findByEmail(email: string): Promise<Member | null> {
    return this.findOne({
      where: eq(members.email, email),
    });
  }

  /**
   * Find member by membership number
   */
  async findByMembershipNumber(membershipNumber: string): Promise<Member | null> {
    return this.findOne({
      where: eq(members.membership_number, membershipNumber),
    });
  }

  /**
   * Search members with advanced criteria
   */
  async search(
    criteria: MemberSearchCriteria,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Member>> {
    const conditions = [];

    // Text search across multiple fields
    if (criteria.query) {
      conditions.push(
        or(
          like(members.first_name_ko, `%${criteria.query}%`),
          like(members.last_name_ko, `%${criteria.query}%`),
          like(members.first_name_en, `%${criteria.query}%`),
          like(members.last_name_en, `%${criteria.query}%`),
          like(members.email, `%${criteria.query}%`),
          like(members.membership_number, `%${criteria.query}%`)
        )
      );
    }

    // Status filter
    if (criteria.status) {
      conditions.push(eq(members.membership_status, criteria.status));
    }

    // Level filter
    if (criteria.levelId) {
      conditions.push(eq(members.membership_level_id, criteria.levelId));
    }

    // Nationality filter
    if (criteria.nationality) {
      conditions.push(eq(members.nationality, criteria.nationality));
    }

    // Verified filter
    if (criteria.isVerified !== undefined) {
      conditions.push(eq(members.is_verified, criteria.isVerified));
    }

    // Public profile filter
    if (criteria.isPublic !== undefined) {
      conditions.push(eq(members.is_public, criteria.isPublic));
    }

    // Combine all conditions
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    const sortField = criteria.sortBy || 'created_at';
    const sortOrder = criteria.sortOrder || 'desc';
    const orderBy =
      sortOrder === 'asc'
        ? asc(members[sortField])
        : desc(members[sortField]);

    return this.findWithPagination({
      ...pagination,
      where,
      orderBy,
    });
  }

  /**
   * Find active members
   */
  async findActive(options?: PaginationOptions): Promise<Member[] | PaginatedResult<Member>> {
    const where = eq(members.membership_status, 'active');

    if (options) {
      return this.findWithPagination({
        ...options,
        where,
        orderBy: desc(members.joined_date),
      });
    }

    return this.findAll({
      where,
      orderBy: desc(members.joined_date),
    });
  }

  /**
   * Find pending approval members
   */
  async findPendingApproval(): Promise<Member[]> {
    return this.findAll({
      where: eq(members.membership_status, 'pending_approval'),
      orderBy: asc(members.created_at),
    });
  }

  /**
   * Find members by level
   */
  async findByLevel(
    levelId: string,
    pagination?: PaginationOptions
  ): Promise<Member[] | PaginatedResult<Member>> {
    const where = eq(members.membership_level_id, levelId);

    if (pagination) {
      return this.findWithPagination({
        ...pagination,
        where,
        orderBy: desc(members.joined_date),
      });
    }

    return this.findAll({
      where,
      orderBy: desc(members.joined_date),
    });
  }

  /**
   * Find members by nationality
   */
  async findByNationality(nationality: string): Promise<Member[]> {
    return this.findAll({
      where: eq(members.nationality, nationality),
      orderBy: desc(members.joined_date),
    });
  }

  /**
   * Get recently joined members
   */
  async getRecentlyJoined(limit: number = 10): Promise<Member[]> {
    return this.findAll({
      orderBy: desc(members.joined_date),
      limit,
    });
  }

  /**
   * Get most active members
   */
  async getMostActive(limit: number = 10): Promise<Member[]> {
    return this.findAll({
      where: eq(members.membership_status, 'active'),
      orderBy: desc(members.last_active),
      limit,
    });
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(id: string): Promise<Member | null> {
    return this.update(id, {
      last_active: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Update membership status
   */
  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'
  ): Promise<Member | null> {
    return this.update(id, {
      membership_status: status,
      updated_at: new Date(),
    });
  }

  /**
   * Verify member
   */
  async verify(id: string): Promise<Member | null> {
    return this.update(id, {
      is_verified: true,
      updated_at: new Date(),
    });
  }

  /**
   * Unverify member
   */
  async unverify(id: string): Promise<Member | null> {
    return this.update(id, {
      is_verified: false,
      updated_at: new Date(),
    });
  }

  /**
   * Update membership level
   */
  async updateLevel(id: string, levelId: string): Promise<Member | null> {
    return this.update(id, {
      membership_level_id: levelId,
      updated_at: new Date(),
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where = excludeId
      ? and(eq(members.email, email), sql`${members.id} != ${excludeId}`)
      : eq(members.email, email);

    return this.existsWhere(where!);
  }

  /**
   * Check if membership number exists
   */
  async membershipNumberExists(
    membershipNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    const where = excludeId
      ? and(
          eq(members.membership_number, membershipNumber),
          sql`${members.id} != ${excludeId}`
        )
      : eq(members.membership_number, membershipNumber);

    return this.existsWhere(where!);
  }

  /**
   * Get member statistics
   */
  async getStatistics(): Promise<MemberStatistics> {
    const allMembers = await this.findAll({});

    const stats: MemberStatistics = {
      total: allMembers.length,
      active: 0,
      inactive: 0,
      suspended: 0,
      pending: 0,
      byLevel: {},
      byNationality: {},
    };

    allMembers.forEach((member) => {
      // Count by status
      switch (member.membership_status) {
        case 'active':
          stats.active++;
          break;
        case 'inactive':
          stats.inactive++;
          break;
        case 'suspended':
          stats.suspended++;
          break;
        case 'pending_approval':
          stats.pending++;
          break;
      }

      // Count by level
      const level = member.membership_level_id || 'unknown';
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

      // Count by nationality
      const nationality = member.nationality || 'unknown';
      stats.byNationality[nationality] = (stats.byNationality[nationality] || 0) + 1;
    });

    return stats;
  }

  /**
   * Bulk update members
   */
  async bulkUpdate(ids: string[], data: Partial<NewMember>): Promise<Member[]> {
    return this.updateMany(
      sql`${members.id} = ANY(${ids})`,
      {
        ...data,
        updated_at: new Date(),
      }
    );
  }

  /**
   * Bulk delete members
   */
  async bulkDelete(ids: string[]): Promise<number> {
    return this.deleteMany(sql`${members.id} = ANY(${ids})`);
  }

  /**
   * Generate unique membership number
   */
  async generateMembershipNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ASCA-${year}-`;

    // Get all membership numbers for current year
    const currentYearMembers = await this.findAll({
      where: like(members.membership_number, `${prefix}%`),
    });

    // Extract numbers and find the highest
    const numbers = currentYearMembers
      .map((m) => {
        const match = m.membership_number?.match(/ASCA-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }
}

// Export singleton instance
export const memberRepository = new MemberRepository();
