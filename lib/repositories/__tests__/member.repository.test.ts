/**
 * Member Repository Tests
 *
 * Tests for member-specific repository methods
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import { memberRepository, type MemberSearchCriteria } from '../member.repository'
import { testDatabaseHelpers } from '@/lib/testing/setup-test-db'
import { createMockMember } from '@/lib/testing/mock-data'

describe('MemberRepository', () => {
  beforeAll(async () => {
    await testDatabaseHelpers.beforeAll()
  })

  afterEach(async () => {
    await testDatabaseHelpers.afterEach()
  })

  afterAll(async () => {
    await testDatabaseHelpers.afterAll()
  })

  describe('findByEmail', () => {
    test('should find member by email', async () => {
      // Act
      const result = await memberRepository.findByEmail('test1@example.com')

      // Assert
      expect(result).toBeDefined()
      expect(result?.email).toBe('test1@example.com')
      expect(result?.first_name_ko).toBe('철수')
    })

    test('should return null for non-existent email', async () => {
      // Act
      const result = await memberRepository.findByEmail('nonexistent@example.com')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('findByMembershipNumber', () => {
    test('should find member by membership number', async () => {
      // Arrange - Create member with membership number
      const member = await memberRepository.create({
        email: 'numbered@example.com',
        first_name_ko: '번호',
        last_name_ko: '회원',
        membership_number: 'ASCA-2025-0001',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      // Act
      const result = await memberRepository.findByMembershipNumber('ASCA-2025-0001')

      // Assert
      expect(result).toBeDefined()
      expect(result?.membership_number).toBe('ASCA-2025-0001')
      expect(result?.id).toBe(member.id)
    })

    test('should return null for non-existent membership number', async () => {
      // Act
      const result = await memberRepository.findByMembershipNumber('ASCA-9999-9999')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('search', () => {
    test('should search members by query', async () => {
      // Arrange
      const criteria: MemberSearchCriteria = {
        query: '철수',
      }

      // Act
      const result = await memberRepository.search(criteria, {
        page: 1,
        limit: 10,
      })

      // Assert
      expect(result.data).toBeInstanceOf(Array)
      expect(result.total).toBeGreaterThan(0)
      expect(result.data[0].first_name_ko).toContain('철수')
    })

    test('should filter by status', async () => {
      // Arrange
      const criteria: MemberSearchCriteria = {
        status: 'active',
      }

      // Act
      const result = await memberRepository.search(criteria, {
        page: 1,
        limit: 10,
      })

      // Assert
      result.data.forEach(member => {
        expect(member.membership_status).toBe('active')
      })
    })

    test('should filter by level', async () => {
      // Arrange
      const levelId = '00000000-0000-0000-0000-000000000001'
      const criteria: MemberSearchCriteria = {
        levelId,
      }

      // Act
      const result = await memberRepository.search(criteria, {
        page: 1,
        limit: 10,
      })

      // Assert
      result.data.forEach(member => {
        expect(member.membership_level_id).toBe(levelId)
      })
    })

    test('should combine multiple filters', async () => {
      // Arrange
      const criteria: MemberSearchCriteria = {
        status: 'active',
        levelId: '00000000-0000-0000-0000-000000000001',
      }

      // Act
      const result = await memberRepository.search(criteria, {
        page: 1,
        limit: 10,
      })

      // Assert
      result.data.forEach(member => {
        expect(member.membership_status).toBe('active')
        expect(member.membership_level_id).toBe('00000000-0000-0000-0000-000000000001')
      })
    })

    test('should apply sort order', async () => {
      // Arrange
      const criteria: MemberSearchCriteria = {
        sortBy: 'created_at',
        sortOrder: 'desc',
      }

      // Act
      const result = await memberRepository.search(criteria, {
        page: 1,
        limit: 10,
      })

      // Assert
      expect(result.data).toBeInstanceOf(Array)
      // Most recent should be first
      for (let i = 0; i < result.data.length - 1; i++) {
        const current = new Date(result.data[i].created_at!).getTime()
        const next = new Date(result.data[i + 1].created_at!).getTime()
        expect(current).toBeGreaterThanOrEqual(next)
      }
    })
  })

  describe('findActive', () => {
    test('should find active members without pagination', async () => {
      // Act
      const results = await memberRepository.findActive()

      // Assert
      expect(results).toBeInstanceOf(Array)
      ;(results as any[]).forEach(member => {
        expect(member.membership_status).toBe('active')
      })
    })

    test('should find active members with pagination', async () => {
      // Act
      const result = await memberRepository.findActive({
        page: 1,
        limit: 10,
      })

      // Assert
      expect((result as any).data).toBeInstanceOf(Array)
      expect((result as any).total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findPendingApproval', () => {
    test('should find pending approval members', async () => {
      // Act
      const results = await memberRepository.findPendingApproval()

      // Assert
      expect(results).toBeInstanceOf(Array)
      results.forEach(member => {
        expect(member.membership_status).toBe('pending_approval')
      })
    })
  })

  describe('findByLevel', () => {
    test('should find members by level without pagination', async () => {
      // Arrange
      const levelId = '00000000-0000-0000-0000-000000000001'

      // Act
      const results = await memberRepository.findByLevel(levelId)

      // Assert
      expect(results).toBeInstanceOf(Array)
      ;(results as any[]).forEach(member => {
        expect(member.membership_level_id).toBe(levelId)
      })
    })

    test('should find members by level with pagination', async () => {
      // Arrange
      const levelId = '00000000-0000-0000-0000-000000000001'

      // Act
      const result = await memberRepository.findByLevel(levelId, {
        page: 1,
        limit: 10,
      })

      // Assert
      expect((result as any).data).toBeInstanceOf(Array)
    })
  })

  describe('findByNationality', () => {
    test('should find members by nationality', async () => {
      // Arrange
      await memberRepository.create({
        email: 'korean@example.com',
        first_name_ko: '한국',
        last_name_ko: '회원',
        nationality: 'KR',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      // Act
      const results = await memberRepository.findByNationality('KR')

      // Assert
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBeGreaterThan(0)
      results.forEach(member => {
        expect(member.nationality).toBe('KR')
      })
    })
  })

  describe('getRecentlyJoined', () => {
    test('should get recently joined members', async () => {
      // Act
      const results = await memberRepository.getRecentlyJoined(5)

      // Assert
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getMostActive', () => {
    test('should get most active members', async () => {
      // Act
      const results = await memberRepository.getMostActive(5)

      // Assert
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBeLessThanOrEqual(5)
    })
  })

  describe('updateLastActive', () => {
    test('should update last active timestamp', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'active@example.com',
        first_name_ko: '활동',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      const originalLastActive = member.last_active

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10))

      // Act
      const result = await memberRepository.updateLastActive(member.id)

      // Assert
      expect(result).toBeDefined()
      expect(result?.last_active).toBeDefined()
      expect(result?.last_active).not.toEqual(originalLastActive)
    })
  })

  describe('updateStatus', () => {
    test('should update membership status', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'status@example.com',
        first_name_ko: '상태',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      // Act
      const result = await memberRepository.updateStatus(member.id, 'active')

      // Assert
      expect(result).toBeDefined()
      expect(result?.membership_status).toBe('active')
    })

    test('should support all status values', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'allstatus@example.com',
        first_name_ko: '전체상태',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      const statuses: Array<'active' | 'inactive' | 'suspended' | 'pending_approval' | 'expelled'> =
        ['active', 'inactive', 'suspended', 'pending_approval', 'expelled']

      // Act & Assert
      for (const status of statuses) {
        const result = await memberRepository.updateStatus(member.id, status)
        expect(result?.membership_status).toBe(status)
      }
    })
  })

  describe('verify and unverify', () => {
    test('should verify member', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'verify@example.com',
        first_name_ko: '검증',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
        is_verified: false,
      })

      // Act
      const result = await memberRepository.verify(member.id)

      // Assert
      expect(result).toBeDefined()
      expect(result?.is_verified).toBe(true)
    })

    test('should unverify member', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'unverify@example.com',
        first_name_ko: '검증취소',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
        is_verified: true,
      })

      // Act
      const result = await memberRepository.unverify(member.id)

      // Assert
      expect(result).toBeDefined()
      expect(result?.is_verified).toBe(false)
    })
  })

  describe('updateLevel', () => {
    test('should update membership level', async () => {
      // Arrange
      const member = await memberRepository.create({
        email: 'level@example.com',
        first_name_ko: '레벨',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      const newLevelId = '00000000-0000-0000-0000-000000000002'

      // Act
      const result = await memberRepository.updateLevel(member.id, newLevelId)

      // Assert
      expect(result).toBeDefined()
      expect(result?.membership_level_id).toBe(newLevelId)
    })
  })

  describe('emailExists', () => {
    test('should return true for existing email', async () => {
      // Act
      const result = await memberRepository.emailExists('test1@example.com')

      // Assert
      expect(result).toBe(true)
    })

    test('should return false for non-existent email', async () => {
      // Act
      const result = await memberRepository.emailExists('nonexistent@example.com')

      // Assert
      expect(result).toBe(false)
    })

    test('should exclude specific ID', async () => {
      // Arrange
      const member = await memberRepository.findByEmail('test1@example.com')

      // Act
      const result = await memberRepository.emailExists('test1@example.com', member!.id)

      // Assert
      expect(result).toBe(false) // Excludes itself
    })
  })

  describe('membershipNumberExists', () => {
    test('should return true for existing membership number', async () => {
      // Arrange
      await memberRepository.create({
        email: 'numbered2@example.com',
        first_name_ko: '번호2',
        last_name_ko: '회원',
        membership_number: 'ASCA-2025-0002',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      // Act
      const result = await memberRepository.membershipNumberExists('ASCA-2025-0002')

      // Assert
      expect(result).toBe(true)
    })

    test('should return false for non-existent membership number', async () => {
      // Act
      const result = await memberRepository.membershipNumberExists('ASCA-9999-9999')

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('getStatistics', () => {
    test('should calculate member statistics', async () => {
      // Act
      const stats = await memberRepository.getStatistics()

      // Assert
      expect(stats).toBeDefined()
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.active).toBeGreaterThanOrEqual(0)
      expect(stats.inactive).toBeGreaterThanOrEqual(0)
      expect(stats.suspended).toBeGreaterThanOrEqual(0)
      expect(stats.pending).toBeGreaterThanOrEqual(0)
      expect(stats.byLevel).toBeDefined()
      expect(stats.byNationality).toBeDefined()
    })

    test('should sum up to total', async () => {
      // Act
      const stats = await memberRepository.getStatistics()

      // Assert
      const statusSum = stats.active + stats.inactive + stats.suspended + stats.pending
      expect(statusSum).toBeLessThanOrEqual(stats.total)
    })
  })

  describe('bulkUpdate', () => {
    test('should update multiple members', async () => {
      // Arrange
      const member1 = await memberRepository.create({
        email: 'bulk1@example.com',
        first_name_ko: '대량1',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      const member2 = await memberRepository.create({
        email: 'bulk2@example.com',
        first_name_ko: '대량2',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      const ids = [member1.id, member2.id]

      // Act
      const results = await memberRepository.bulkUpdate(ids, {
        membership_status: 'active',
      })

      // Assert
      expect(results).toBeInstanceOf(Array)
      expect(results.length).toBe(2)
      results.forEach(member => {
        expect(member.membership_status).toBe('active')
      })
    })
  })

  describe('bulkDelete', () => {
    test('should delete multiple members', async () => {
      // Arrange
      const member1 = await memberRepository.create({
        email: 'bulkdelete1@example.com',
        first_name_ko: '삭제1',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      const member2 = await memberRepository.create({
        email: 'bulkdelete2@example.com',
        first_name_ko: '삭제2',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval',
      })

      const ids = [member1.id, member2.id]

      // Act
      const deletedCount = await memberRepository.bulkDelete(ids)

      // Assert
      expect(deletedCount).toBe(2)

      // Verify deletion
      const found1 = await memberRepository.findById(member1.id)
      const found2 = await memberRepository.findById(member2.id)
      expect(found1).toBeNull()
      expect(found2).toBeNull()
    })
  })

  describe('generateMembershipNumber', () => {
    test('should generate unique membership number', async () => {
      // Act
      const number1 = await memberRepository.generateMembershipNumber()
      const number2 = await memberRepository.generateMembershipNumber()

      // Assert
      expect(number1).toBeDefined()
      expect(number1).toMatch(/^ASCA-\d{4}-\d{4}$/)
      expect(number2).toBe(number1) // Same since no new members created
    })

    test('should generate membership number with current year', async () => {
      // Act
      const membershipNumber = await memberRepository.generateMembershipNumber()

      // Assert
      const currentYear = new Date().getFullYear()
      expect(membershipNumber).toContain(`ASCA-${currentYear}-`)
    })

    test('should increment number for new members', async () => {
      // Arrange
      const number1 = await memberRepository.generateMembershipNumber()

      await memberRepository.create({
        email: 'increment@example.com',
        first_name_ko: '증가',
        last_name_ko: '회원',
        membership_number: number1,
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'active',
      })

      // Act
      const number2 = await memberRepository.generateMembershipNumber()

      // Assert
      expect(number2).not.toBe(number1)

      // Extract numbers and compare
      const match1 = number1.match(/ASCA-\d{4}-(\d{4})/)
      const match2 = number2.match(/ASCA-\d{4}-(\d{4})/)

      expect(match1).toBeDefined()
      expect(match2).toBeDefined()

      const num1 = parseInt(match1![1], 10)
      const num2 = parseInt(match2![1], 10)

      expect(num2).toBe(num1 + 1)
    })
  })
})
