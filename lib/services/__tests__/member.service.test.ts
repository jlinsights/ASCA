/**
 * Member Service Tests
 *
 * Tests for member business logic with mocked repositories
 *
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { MemberService } from '../member.service'
import { MemberRepository } from '@/lib/repositories/member.repository'
import { ApiError } from '@/lib/api/response'
import type { Member, NewMember } from '@/lib/db/schema-pg'
import type { PaginatedResult } from '@/lib/repositories/base.repository'

// Mock the repository
jest.mock('@/lib/repositories/member.repository')

describe('MemberService', () => {
  let memberService: MemberService
  let mockRepository: jest.Mocked<MemberRepository>

  // Mock data
  const mockMember: Member = {
    id: '00000000-0000-0000-0000-000000000101',
    email: 'test@example.com',
    first_name_ko: '철수',
    last_name_ko: '김',
    first_name_en: 'Chulsoo',
    last_name_en: 'Kim',
    membership_number: 'ASCA-2024-0001',
    membership_level_id: '00000000-0000-0000-0000-000000000001',
    membership_status: 'active',
    nationality: 'KR',
    is_verified: false,
    is_public: false,
    joined_date: new Date('2024-01-01'),
    last_active: new Date('2024-01-10'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    deleted_at: null,
  }

  const mockPendingMember: Member = {
    ...mockMember,
    id: '00000000-0000-0000-0000-000000000102',
    email: 'pending@example.com',
    membership_number: 'ASCA-2024-0002',
    membership_status: 'pending_approval',
  }

  const mockSuspendedMember: Member = {
    ...mockMember,
    id: '00000000-0000-0000-0000-000000000103',
    email: 'suspended@example.com',
    membership_number: 'ASCA-2024-0003',
    membership_status: 'suspended',
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Create a new instance with mocked repository
    mockRepository = new MemberRepository() as jest.Mocked<MemberRepository>
    memberService = new MemberService()
    ;(memberService as any).repository = mockRepository
  })

  describe('getMemberById', () => {
    test('should get member by ID', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)

      // Act
      const result = await memberService.getMemberById(mockMember.id)

      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBe(mockMember.id)
      expect(result.email).toBe(mockMember.email)
      expect(mockRepository.findById).toHaveBeenCalledWith(mockMember.id)
    })

    test('should throw not found error for non-existent member', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999'
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(memberService.getMemberById(nonExistentId)).rejects.toThrow(ApiError)
      await expect(memberService.getMemberById(nonExistentId)).rejects.toThrow('Member not found')
    })
  })

  describe('getMemberByEmail', () => {
    test('should get member by email', async () => {
      // Arrange
      mockRepository.findByEmail = jest.fn().mockResolvedValue(mockMember)

      // Act
      const result = await memberService.getMemberByEmail('test@example.com')

      // Assert
      expect(result).toBeDefined()
      expect(result?.email).toBe('test@example.com')
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
    })

    test('should return null for non-existent email', async () => {
      // Arrange
      mockRepository.findByEmail = jest.fn().mockResolvedValue(null)

      // Act
      const result = await memberService.getMemberByEmail('nonexistent@example.com')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('getMemberByMembershipNumber', () => {
    test('should get member by membership number', async () => {
      // Arrange
      mockRepository.findByMembershipNumber = jest.fn().mockResolvedValue(mockMember)

      // Act
      const result = await memberService.getMemberByMembershipNumber('ASCA-2024-0001')

      // Assert
      expect(result).toBeDefined()
      expect(result?.membership_number).toBe('ASCA-2024-0001')
    })

    test('should return null for non-existent membership number', async () => {
      // Arrange
      mockRepository.findByMembershipNumber = jest.fn().mockResolvedValue(null)

      // Act
      const result = await memberService.getMemberByMembershipNumber('ASCA-2024-9999')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('searchMembers', () => {
    test('should search members with criteria', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<Member> = {
        data: [mockMember],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
        hasPrevious: false,
      }

      mockRepository.search = jest.fn().mockResolvedValue(mockPaginatedResult)

      // Act
      const result = await memberService.searchMembers({ query: '철수' }, 1, 20)

      // Assert
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(mockRepository.search).toHaveBeenCalledWith({ query: '철수' }, { page: 1, limit: 20 })
    })

    test('should use default pagination', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<Member> = {
        data: [mockMember],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
        hasPrevious: false,
      }

      mockRepository.search = jest.fn().mockResolvedValue(mockPaginatedResult)

      // Act
      await memberService.searchMembers({ status: 'active' })

      // Assert
      expect(mockRepository.search).toHaveBeenCalledWith(
        { status: 'active' },
        { page: 1, limit: 20 }
      )
    })

    test('should limit max page size to 100', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<Member> = {
        data: [mockMember],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
        hasMore: false,
        hasPrevious: false,
      }

      mockRepository.search = jest.fn().mockResolvedValue(mockPaginatedResult)

      // Act
      await memberService.searchMembers({ status: 'active' }, 1, 200)

      // Assert
      expect(mockRepository.search).toHaveBeenCalledWith(
        { status: 'active' },
        { page: 1, limit: 100 }
      )
    })
  })

  describe('getActiveMembers', () => {
    test('should get active members with pagination', async () => {
      // Arrange
      const mockPaginatedResult: PaginatedResult<Member> = {
        data: [mockMember],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
        hasPrevious: false,
      }

      mockRepository.findActive = jest.fn().mockResolvedValue(mockPaginatedResult)

      // Act
      const result = await memberService.getActiveMembers(1, 20)

      // Assert
      expect(result).toEqual(mockPaginatedResult)
      expect(mockRepository.findActive).toHaveBeenCalledWith({ page: 1, limit: 20 })
    })

    test('should get all active members without pagination', async () => {
      // Arrange
      mockRepository.findActive = jest.fn().mockResolvedValue([mockMember])

      // Act
      const result = await memberService.getActiveMembers()

      // Assert
      expect(result).toEqual([mockMember])
      expect(mockRepository.findActive).toHaveBeenCalledWith()
    })
  })

  describe('getPendingApprovalMembers', () => {
    test('should get pending approval members', async () => {
      // Arrange
      mockRepository.findPendingApproval = jest.fn().mockResolvedValue([mockPendingMember])

      // Act
      const result = await memberService.getPendingApprovalMembers()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].membership_status).toBe('pending_approval')
    })
  })

  describe('createMember', () => {
    test('should create new member with valid data', async () => {
      // Arrange
      const createData = {
        email: 'newmember@example.com',
        first_name_ko: '신규',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval' as const,
      }

      mockRepository.findByEmail = jest.fn().mockResolvedValue(null)
      mockRepository.generateMembershipNumber = jest.fn().mockResolvedValue('ASCA-2024-0010')
      mockRepository.create = jest.fn().mockResolvedValue({
        ...mockMember,
        ...createData,
        id: 'new-id',
        membership_number: 'ASCA-2024-0010',
      })

      // Act
      const result = await memberService.createMember(createData)

      // Assert
      expect(result).toBeDefined()
      expect(result.email).toBe('newmember@example.com')
      expect(result.membership_number).toBe('ASCA-2024-0010')
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('newmember@example.com')
      expect(mockRepository.generateMembershipNumber).toHaveBeenCalled()
      expect(mockRepository.create).toHaveBeenCalled()
    })

    test('should throw conflict error for duplicate email', async () => {
      // Arrange
      const createData = {
        email: 'test@example.com',
        first_name_ko: '중복',
        last_name_ko: '이메일',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval' as const,
      }

      mockRepository.findByEmail = jest.fn().mockResolvedValue(mockMember)

      // Act & Assert
      await expect(memberService.createMember(createData)).rejects.toThrow(ApiError)
      await expect(memberService.createMember(createData)).rejects.toThrow('Email already exists')
    })

    test('should throw validation error for invalid data', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        first_name_ko: '',
        membership_level_id: 'invalid-id',
      }

      // Act & Assert
      await expect(memberService.createMember(invalidData as any)).rejects.toThrow(ApiError)
    })
  })

  describe('updateMember', () => {
    test('should update member with valid data', async () => {
      // Arrange
      const updateData = {
        first_name_ko: '업데이트',
      }

      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.update = jest.fn().mockResolvedValue({
        ...mockMember,
        ...updateData,
      })

      // Act
      const result = await memberService.updateMember(mockMember.id, updateData)

      // Assert
      expect(result.first_name_ko).toBe('업데이트')
      expect(mockRepository.findById).toHaveBeenCalledWith(mockMember.id)
      expect(mockRepository.update).toHaveBeenCalled()
    })

    test('should throw not found error for non-existent member', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999'
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(
        memberService.updateMember(nonExistentId, { first_name_ko: '테스트' })
      ).rejects.toThrow('Member not found')
    })

    test('should check email uniqueness when updating email', async () => {
      // Arrange
      const updateData = {
        email: 'newemail@example.com',
      }

      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.emailExists = jest.fn().mockResolvedValue(false)
      mockRepository.update = jest.fn().mockResolvedValue({
        ...mockMember,
        ...updateData,
      })

      // Act
      await memberService.updateMember(mockMember.id, updateData)

      // Assert
      expect(mockRepository.emailExists).toHaveBeenCalledWith('newemail@example.com', mockMember.id)
    })

    test('should throw conflict error for duplicate email', async () => {
      // Arrange
      const updateData = {
        email: 'existing@example.com',
      }

      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.emailExists = jest.fn().mockResolvedValue(true)

      // Act & Assert
      await expect(memberService.updateMember(mockMember.id, updateData)).rejects.toThrow(
        'Email already exists'
      )
    })
  })

  describe('deleteMember', () => {
    test('should delete existing member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.delete = jest.fn().mockResolvedValue(true)

      // Act
      const result = await memberService.deleteMember(mockMember.id)

      // Assert
      expect(result).toBe(true)
      expect(mockRepository.findById).toHaveBeenCalledWith(mockMember.id)
      expect(mockRepository.delete).toHaveBeenCalledWith(mockMember.id)
    })

    test('should throw not found error for non-existent member', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999'
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(memberService.deleteMember(nonExistentId)).rejects.toThrow('Member not found')
    })
  })

  describe('approveMember', () => {
    test('should approve pending member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockPendingMember)
      mockRepository.updateStatus = jest.fn().mockResolvedValue({
        ...mockPendingMember,
        membership_status: 'active',
      })

      // Act
      const result = await memberService.approveMember(mockPendingMember.id)

      // Assert
      expect(result.membership_status).toBe('active')
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(mockPendingMember.id, 'active')
    })

    test('should throw bad request for non-pending member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)

      // Act & Assert
      await expect(memberService.approveMember(mockMember.id)).rejects.toThrow(
        'Member is not pending approval'
      )
    })

    test('should throw not found if member does not exist', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(memberService.approveMember('invalid-id')).rejects.toThrow('Member not found')
    })
  })

  describe('suspendMember', () => {
    test('should suspend active member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.updateStatus = jest.fn().mockResolvedValue({
        ...mockMember,
        membership_status: 'suspended',
      })

      // Act
      const result = await memberService.suspendMember(mockMember.id, 'Policy violation')

      // Assert
      expect(result.membership_status).toBe('suspended')
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(mockMember.id, 'suspended')
    })

    test('should suspend member without reason', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.updateStatus = jest.fn().mockResolvedValue({
        ...mockMember,
        membership_status: 'suspended',
      })

      // Act
      const result = await memberService.suspendMember(mockMember.id)

      // Assert
      expect(result.membership_status).toBe('suspended')
    })

    test('should throw not found for non-existent member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(memberService.suspendMember('invalid-id')).rejects.toThrow('Member not found')
    })
  })

  describe('reactivateMember', () => {
    test('should reactivate suspended member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockSuspendedMember)
      mockRepository.updateStatus = jest.fn().mockResolvedValue({
        ...mockSuspendedMember,
        membership_status: 'active',
      })

      // Act
      const result = await memberService.reactivateMember(mockSuspendedMember.id)

      // Assert
      expect(result.membership_status).toBe('active')
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(mockSuspendedMember.id, 'active')
    })

    test('should reactivate inactive member', async () => {
      // Arrange
      const inactiveMember = { ...mockMember, membership_status: 'inactive' as const }
      mockRepository.findById = jest.fn().mockResolvedValue(inactiveMember)
      mockRepository.updateStatus = jest.fn().mockResolvedValue({
        ...inactiveMember,
        membership_status: 'active',
      })

      // Act
      const result = await memberService.reactivateMember(mockMember.id)

      // Assert
      expect(result.membership_status).toBe('active')
    })

    test('should throw bad request for active member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)

      // Act & Assert
      await expect(memberService.reactivateMember(mockMember.id)).rejects.toThrow(
        'Member is not suspended or inactive'
      )
    })
  })

  describe('updateMemberLevel', () => {
    test('should update member level', async () => {
      // Arrange
      const newLevelId = '00000000-0000-0000-0000-000000000002'
      mockRepository.findById = jest.fn().mockResolvedValue(mockMember)
      mockRepository.updateLevel = jest.fn().mockResolvedValue({
        ...mockMember,
        membership_level_id: newLevelId,
      })

      // Act
      const result = await memberService.updateMemberLevel(mockMember.id, newLevelId)

      // Assert
      expect(result.membership_level_id).toBe(newLevelId)
      expect(mockRepository.updateLevel).toHaveBeenCalledWith(mockMember.id, newLevelId)
    })

    test('should throw not found for non-existent member', async () => {
      // Arrange
      mockRepository.findById = jest.fn().mockResolvedValue(null)

      // Act & Assert
      await expect(memberService.updateMemberLevel('invalid-id', 'level-id')).rejects.toThrow(
        'Member not found'
      )
    })
  })

  describe('trackActivity', () => {
    test('should track member activity', async () => {
      // Arrange
      mockRepository.updateLastActive = jest.fn().mockResolvedValue(mockMember)

      // Act
      await memberService.trackActivity(mockMember.id)

      // Assert
      expect(mockRepository.updateLastActive).toHaveBeenCalledWith(mockMember.id)
    })
  })

  describe('getStatistics', () => {
    test('should get member statistics', async () => {
      // Arrange
      const mockStats = {
        total: 100,
        active: 80,
        inactive: 10,
        suspended: 5,
        pending: 5,
        byLevel: { level1: 50, level2: 30, level3: 20 },
        byNationality: { KR: 60, US: 30, JP: 10 },
      }

      mockRepository.getStatistics = jest.fn().mockResolvedValue(mockStats)

      // Act
      const result = await memberService.getStatistics()

      // Assert
      expect(result).toEqual(mockStats)
      expect(mockRepository.getStatistics).toHaveBeenCalled()
    })
  })

  describe('getRecentlyJoined', () => {
    test('should get recently joined members', async () => {
      // Arrange
      mockRepository.getRecentlyJoined = jest.fn().mockResolvedValue([mockMember])

      // Act
      const result = await memberService.getRecentlyJoined(10)

      // Assert
      expect(result).toHaveLength(1)
      expect(mockRepository.getRecentlyJoined).toHaveBeenCalledWith(10)
    })

    test('should use default limit', async () => {
      // Arrange
      mockRepository.getRecentlyJoined = jest.fn().mockResolvedValue([mockMember])

      // Act
      await memberService.getRecentlyJoined()

      // Assert
      expect(mockRepository.getRecentlyJoined).toHaveBeenCalledWith(10)
    })
  })

  describe('getMostActive', () => {
    test('should get most active members', async () => {
      // Arrange
      mockRepository.getMostActive = jest.fn().mockResolvedValue([mockMember])

      // Act
      const result = await memberService.getMostActive(10)

      // Assert
      expect(result).toHaveLength(1)
      expect(mockRepository.getMostActive).toHaveBeenCalledWith(10)
    })

    test('should use default limit', async () => {
      // Arrange
      mockRepository.getMostActive = jest.fn().mockResolvedValue([mockMember])

      // Act
      await memberService.getMostActive()

      // Assert
      expect(mockRepository.getMostActive).toHaveBeenCalledWith(10)
    })
  })

  describe('bulkApproveMember', () => {
    test('should approve multiple members', async () => {
      // Arrange
      const ids = ['id1', 'id2', 'id3']
      const approvedMembers = [
        { ...mockPendingMember, id: 'id1', membership_status: 'active' as const },
        { ...mockPendingMember, id: 'id2', membership_status: 'active' as const },
        { ...mockPendingMember, id: 'id3', membership_status: 'active' as const },
      ]

      // Mock each approval
      mockRepository.findById = jest
        .fn()
        .mockResolvedValueOnce({ ...mockPendingMember, id: 'id1' })
        .mockResolvedValueOnce({ ...mockPendingMember, id: 'id2' })
        .mockResolvedValueOnce({ ...mockPendingMember, id: 'id3' })

      mockRepository.updateStatus = jest
        .fn()
        .mockResolvedValueOnce(approvedMembers[0])
        .mockResolvedValueOnce(approvedMembers[1])
        .mockResolvedValueOnce(approvedMembers[2])

      // Act
      const result = await memberService.bulkApproveMember(ids)

      // Assert
      expect(result).toHaveLength(3)
      expect(result[0].membership_status).toBe('active')
    })

    test('should continue on error when one approval fails', async () => {
      // Arrange
      const ids = ['id1', 'id2', 'id3']

      mockRepository.findById = jest
        .fn()
        .mockResolvedValueOnce({ ...mockPendingMember, id: 'id1' })
        .mockResolvedValueOnce(mockMember) // Not pending - will throw
        .mockResolvedValueOnce({ ...mockPendingMember, id: 'id3' })

      mockRepository.updateStatus = jest
        .fn()
        .mockResolvedValueOnce({
          ...mockPendingMember,
          id: 'id1',
          membership_status: 'active' as const,
        })
        .mockResolvedValueOnce({
          ...mockPendingMember,
          id: 'id3',
          membership_status: 'active' as const,
        })

      // Act
      const result = await memberService.bulkApproveMember(ids)

      // Assert
      expect(result).toHaveLength(2)
    })
  })

  describe('bulkDeleteMembers', () => {
    test('should delete multiple members', async () => {
      // Arrange
      const ids = ['id1', 'id2', 'id3']
      mockRepository.bulkDelete = jest.fn().mockResolvedValue(3)

      // Act
      const result = await memberService.bulkDeleteMembers(ids)

      // Assert
      expect(result).toBe(3)
      expect(mockRepository.bulkDelete).toHaveBeenCalledWith(ids)
    })
  })
})
