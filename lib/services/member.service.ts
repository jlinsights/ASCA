import { BaseService } from './base.service';
import {
  memberRepository,
  MemberRepository,
  type MemberSearchCriteria,
} from '@/lib/repositories/member.repository';
import type { Member, NewMember } from '@/lib/db/schema';
import type { PaginatedResult } from '@/lib/repositories/base.repository';
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberDTO,
  type UpdateMemberDTO,
} from '@/lib/api/validators';

/**
 * Member Service
 * Handles all business logic for member operations
 */
export class MemberService extends BaseService<
  MemberRepository,
  Member,
  CreateMemberDTO,
  UpdateMemberDTO
> {
  constructor() {
    super(memberRepository);
  }

  /**
   * Get member by ID
   */
  async getMemberById(id: string): Promise<Member> {
    this.log('info', `Getting member by ID: ${id}`);
    return await this.ensureExists(id, 'Member');
  }

  /**
   * Get member by email
   */
  async getMemberByEmail(email: string): Promise<Member | null> {
    this.log('info', `Getting member by email: ${email}`);
    return await this.repository.findByEmail(email);
  }

  /**
   * Get member by membership number
   */
  async getMemberByMembershipNumber(membershipNumber: string): Promise<Member | null> {
    this.log('info', `Getting member by membership number: ${membershipNumber}`);
    return await this.repository.findByMembershipNumber(membershipNumber);
  }

  /**
   * Search members with pagination
   */
  async searchMembers(
    criteria: MemberSearchCriteria,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<Member>> {
    this.log('info', 'Searching members', { criteria, page, limit });

    const pagination = this.paginationParams(page, limit);

    return await this.repository.search(criteria, pagination);
  }

  /**
   * Get all active members
   */
  async getActiveMembers(page?: number, limit?: number): Promise<PaginatedResult<Member> | Member[]> {
    this.log('info', 'Getting active members');

    if (page && limit) {
      const pagination = this.paginationParams(page, limit);
      return await this.repository.findActive(pagination);
    }

    return await this.repository.findActive();
  }

  /**
   * Get pending approval members
   */
  async getPendingApprovalMembers(): Promise<Member[]> {
    this.log('info', 'Getting pending approval members');
    return await this.repository.findPendingApproval();
  }

  /**
   * Create a new member
   */
  async createMember(data: CreateMemberDTO): Promise<Member> {
    this.log('info', 'Creating new member', { email: data.email });

    // Validate input
    const validatedData = this.validate(createMemberSchema, data);

    // Check if email already exists
    const existingMember = await this.repository.findByEmail(validatedData.email);
    if (existingMember) {
      this.throwConflict('Email already exists', { email: validatedData.email });
    }

    // Generate unique membership number
    const membershipNumber = await this.repository.generateMembershipNumber();

    // Create member
    // Create member
    // Combine names for DB schema
    const fullNameKo = validatedData.firstNameKo && validatedData.lastNameKo 
      ? `${validatedData.lastNameKo}${validatedData.firstNameKo}`
      : undefined;
      
    const fullNameEn = validatedData.firstNameEn && validatedData.lastNameEn
      ? `${validatedData.firstNameEn} ${validatedData.lastNameEn}`
      : undefined;

    // Default primary full name to Korean, fallback to English or empty
    const fullName = fullNameKo || fullNameEn || '';

    // Remove DTO specific fields that don't match DB schema
    const { 
      firstNameKo, lastNameKo, firstNameEn, lastNameEn, 
      residenceCountry, residenceCity, membershipLevelId, membershipStatus,
      preferredLanguage,
      ...otherData 
    } = validatedData;
    
    const newMember = await this.repository.create({
      ...otherData,
      fullName,
      fullNameKo,
      fullNameEn,
      // Map other mismatched fields if any
      // Schema uses camelCase for TypeScript keys (inferred from Drizzle)
      country: residenceCountry, 
      city: residenceCity,
      tierId: membershipLevelId,
      status: membershipStatus,
      // nationality is already in otherData if names match
      // timezone is in otherData
      
      membershipNumber,
      joinDate: new Date(),
      // createdAt/updatedAt are usually handled by Drizzle defaultNow(), but repository.create might need them if not omitted
      // Looking at schema, they have defaultNow().
      // However, spread might include raw strings from DTO, while schema expects Date object for timestamps? 
      // dateOfBirth in DTO is string (dateSchema), Schema is timestamp (Date).
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
    } as unknown as NewMember); // Force cast to avoid strict type checks on intermediate object, relying on repository validation

    this.log('info', 'Member created successfully', {
      id: newMember.id,
      email: validatedData.email,
      membershipNumber,
    });

    return newMember;
  }

  /**
   * Update a member
   */
  async updateMember(id: string, data: UpdateMemberDTO): Promise<Member> {
    this.log('info', `Updating member: ${id}`);

    // Ensure member exists
    await this.ensureExists(id, 'Member');

    // Validate input
    const validatedData = this.validate(updateMemberSchema, {
      ...data,
      id,
    });

    // Check email uniqueness if email is being updated
    if (validatedData.email) {
      const emailExists = await this.repository.emailExists(
        validatedData.email,
        id
      );
      if (emailExists) {
        this.throwConflict('Email already exists', { email: validatedData.email });
      }
    }

    // Remove id from update data
    const { id: _, ...updateData } = validatedData;

    // Update member
    const updatedMember = await this.repository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    } as Partial<NewMember>);

    if (!updatedMember) {
      this.throwNotFound('Member', id);
    }

    this.log('info', 'Member updated successfully', { id });

    return updatedMember;
  }

  /**
   * Delete a member
   */
  async deleteMember(id: string): Promise<boolean> {
    this.log('info', `Deleting member: ${id}`);

    // Ensure member exists
    await this.ensureExists(id, 'Member');

    // Delete member
    const deleted = await this.repository.delete(id);

    if (deleted) {
      this.log('info', 'Member deleted successfully', { id });
    }

    return deleted;
  }

  /**
   * Approve a pending member
   */
  async approveMember(id: string): Promise<Member> {
    this.log('info', `Approving member: ${id}`);

    // Ensure member exists
    const member = await this.ensureExists(id, 'Member');

    // Check if member is pending
    if (member.status !== 'pending_approval') {
      this.throwBadRequest('Member is not pending approval', {
        currentStatus: member.status,
      });
    }

    // Update status to active
    const approvedMember = await this.repository.updateStatus(id, 'active');

    if (!approvedMember) {
      this.throwNotFound('Member', id);
    }

    this.log('info', 'Member approved successfully', { id });

    return approvedMember;
  }

  /**
   * Suspend a member
   */
  async suspendMember(id: string, reason?: string): Promise<Member> {
    this.log('info', `Suspending member: ${id}`, { reason });

    // Ensure member exists
    await this.ensureExists(id, 'Member');

    // Update status to suspended
    const suspendedMember = await this.repository.updateStatus(id, 'suspended');

    if (!suspendedMember) {
      this.throwNotFound('Member', id);
    }

    this.log('info', 'Member suspended successfully', { id, reason });

    return suspendedMember;
  }

  /**
   * Reactivate a suspended member
   */
  async reactivateMember(id: string): Promise<Member> {
    this.log('info', `Reactivating member: ${id}`);

    // Ensure member exists
    const member = await this.ensureExists(id, 'Member');

    // Check if member is suspended or inactive
    if (!['suspended', 'inactive'].includes(member.status)) {
      this.throwBadRequest('Member is not suspended or inactive', {
        currentStatus: member.status,
      });
    }

    // Update status to active
    const reactivatedMember = await this.repository.updateStatus(id, 'active');

    if (!reactivatedMember) {
      this.throwNotFound('Member', id);
    }

    this.log('info', 'Member reactivated successfully', { id });

    return reactivatedMember;
  }

  /**
   * Update member tier
   */
  async updateMemberTier(id: string, tierId: string): Promise<Member> {
    this.log('info', `Updating member tier: ${id}`, { tierId });

    // Ensure member exists
    await this.ensureExists(id, 'Member');

    // Update tier
    const updatedMember = await this.repository.updateTier(id, tierId);

    if (!updatedMember) {
      this.throwNotFound('Member', id);
    }

    this.log('info', 'Member tier updated successfully', { id, tierId });

    return updatedMember;
  }

  /**
   * Update last active timestamp
   */
  async trackActivity(id: string): Promise<void> {
    await this.repository.updateLastActive(id);
  }

  /**
   * Get member statistics
   */
  async getStatistics() {
    this.log('info', 'Getting member statistics');
    return await this.repository.getStatistics();
  }

  /**
   * Get recently joined members
   */
  async getRecentlyJoined(limit: number = 10): Promise<Member[]> {
    this.log('info', 'Getting recently joined members', { limit });
    return await this.repository.getRecentlyJoined(limit);
  }

  /**
   * Get most active members
   */
  async getMostActive(limit: number = 10): Promise<Member[]> {
    this.log('info', 'Getting most active members', { limit });
    return await this.repository.getMostActive(limit);
  }

  /**
   * Bulk approve members
   */
  async bulkApproveMember(ids: string[]): Promise<Member[]> {
    this.log('info', `Bulk approving ${ids.length} members`);

    const { results, errors } = await this.bulkOperation(
      ids,
      async (id) => await this.approveMember(id),
      { continueOnError: true }
    );

    if (errors.length > 0) {
      this.log('warn', `${errors.length} members failed to approve`, { errors });
    }

    return results;
  }

  /**
   * Bulk delete members
   */
  async bulkDeleteMembers(ids: string[]): Promise<number> {
    this.log('info', `Bulk deleting ${ids.length} members`);
    return await this.repository.bulkDelete(ids);
  }
}

// Export singleton instance
export const memberService = new MemberService();
