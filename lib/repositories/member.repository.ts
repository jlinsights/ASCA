import { eq, or, like, desc, asc, and, sql } from 'drizzle-orm';
import { BaseRepository, type PaginatedResult, type PaginationOptions } from './base.repository';
import { db } from '@/lib/db';
import { members, users } from '@/lib/db/schema';
import type { Member, NewMember } from '@/lib/db/schema';

/**
 * Member search criteria
 */
export interface MemberSearchCriteria {
  query?: string;
  status?: string;
  tierId?: string;
  nationality?: string;
  // isVerified?: boolean; // Removed: Not in schema
  // isPublic?: boolean;   // Removed: Not in schema (privacySettings complex handling)
  sortBy?: 'created_at' | 'updated_at' | 'join_date' | 'last_activity_date';
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
  byTier: Record<string, number>;
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
   * Find member by email (via User table)
   */
  async findByEmail(email: string): Promise<Member | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true }
    });
    
    if (!user) return null;

    return this.findOne({
      where: eq(members.userId, user.id),
    });
  }

  /**
   * Find member by membership number
   */
  async findByMembershipNumber(membershipNumber: string): Promise<Member | null> {
    return this.findOne({
      where: eq(members.membershipNumber, membershipNumber),
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
          like(members.fullName, `%${criteria.query}%`),
          like(members.fullNameKo, `%${criteria.query}%`),
          like(members.fullNameEn, `%${criteria.query}%`),
          like(members.membershipNumber, `%${criteria.query}%`)
        )
      );
    }

    // Status filter
    if (criteria.status) {
      conditions.push(eq(members.status, criteria.status as any));
    }

    // Tier filter
    if (criteria.tierId) {
      conditions.push(eq(members.tierId, criteria.tierId));
    }

    // Nationality filter
    if (criteria.nationality) {
      conditions.push(eq(members.nationality, criteria.nationality));
    }

    // Combine all conditions
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    let sortColumn: any = members.createdAt;
    if (criteria.sortBy) {
        if (criteria.sortBy === 'join_date') sortColumn = members.joinDate;
        else if (criteria.sortBy === 'last_activity_date') sortColumn = members.lastActivityDate;
        else if (criteria.sortBy === 'updated_at') sortColumn = members.updatedAt;
    }

    const orderBy =
      criteria.sortOrder === 'asc'
        ? asc(sortColumn)
        : desc(sortColumn);

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
    const where = eq(members.status, 'active');

    if (options) {
      return this.findWithPagination({
        ...options,
        where,
        orderBy: desc(members.joinDate),
      });
    }

    return this.findAll({
      where,
      orderBy: desc(members.joinDate),
    });
  }

  /**
   * Find pending approval members
   */
  async findPendingApproval(): Promise<Member[]> {
    return this.findAll({
      where: eq(members.status, 'pending_approval'),
      orderBy: asc(members.createdAt),
    });
  }

  /**
   * Find members by tier
   */
  async findByTier(
    tierId: string,
    pagination?: PaginationOptions
  ): Promise<Member[] | PaginatedResult<Member>> {
    const where = eq(members.tierId, tierId);

    if (pagination) {
      return this.findWithPagination({
        ...pagination,
        where,
        orderBy: desc(members.joinDate),
      });
    }

    return this.findAll({
      where,
      orderBy: desc(members.joinDate),
    });
  }

  /**
   * Find members by nationality
   */
  async findByNationality(nationality: string): Promise<Member[]> {
    return this.findAll({
      where: eq(members.nationality, nationality),
      orderBy: desc(members.joinDate),
    });
  }

  /**
   * Get recently joined members
   */
  async getRecentlyJoined(limit: number = 10): Promise<Member[]> {
    return this.findAll({
      orderBy: desc(members.joinDate),
      limit,
    });
  }

  /**
   * Get most active members
   */
  async getMostActive(limit: number = 10): Promise<Member[]> {
    return this.findAll({
      where: eq(members.status, 'active'),
      orderBy: desc(members.lastActivityDate),
      limit,
    });
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(id: string): Promise<Member | null> {
    return this.update(id, {
      lastActivityDate: new Date(),
      updatedAt: new Date(),
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
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Update membership tier
   */
  async updateTier(id: string, tierId: string): Promise<Member | null> {
    return this.update(id, {
      tierId,
      updatedAt: new Date(),
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const member = await this.findByEmail(email);
    if (!member) return false;
    
    if (excludeId && member.id === excludeId) return false;
    
    return true;
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
          eq(members.membershipNumber, membershipNumber),
          sql`${members.id} != ${excludeId}`
        )
      : eq(members.membershipNumber, membershipNumber);

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
      byTier: {},
      byNationality: {},
    };

    allMembers.forEach((member) => {
      // Count by status
      if (member.status === 'active') stats.active++;
      else if (member.status === 'inactive') stats.inactive++;
      else if (member.status === 'suspended') stats.suspended++;
      else if (member.status === 'pending_approval') stats.pending++;

      // Count by tier
      const tier = member.tierId || 'unknown';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;

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
        updatedAt: new Date(),
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
      where: like(members.membershipNumber, `${prefix}%`),
    });

    // Extract numbers and find the highest
    const numbers = currentYearMembers
      .map((m) => {
        const match = m.membershipNumber?.match(/ASCA-\d{4}-(\d+)/);
        return match ? parseInt(match[1] || '0', 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }
}

// Export singleton instance
export const memberRepository = new MemberRepository();
