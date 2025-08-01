import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  createMember,
  updateMember,
  getMemberById,
  getMembersByTier,
  searchMembers,
  updateMemberTier,
  getMemberStats,
  logMemberActivity,
  getMemberActivityHistory
} from '../api/membership'
import type { 
  MembershipProfile, 
  MembershipTier, 
  ActivityType 
} from '../types/membership'

// Mock database
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  eq: jest.fn(),
  like: jest.fn(),
  values: jest.fn(),
  set: jest.fn(),
}

jest.mock('../db', () => ({
  db: mockDb,
  members: mockDb,
  memberActivity: mockDb
}))

describe('Membership API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup chainable methods
    Object.keys(mockDb).forEach(key => {
      mockDb[key].mockReturnValue(mockDb)
    })
  })

  describe('createMember', () => {
    const memberData: Omit<MembershipProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      email: 'test@example.com',
      name: 'Test User',
      phone: '010-1234-5678',
      birthDate: '1990-01-01',
      gender: 'male',
      nationality: 'korean',
      address: {
        street: '123 Test St',
        city: 'Seoul',
        state: 'Seoul',
        zipCode: '12345',
        country: 'Korea'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'parent',
        phone: '010-9876-5432'
      },
      tier: 'student',
      status: 'active',
      joinDate: '2024-01-01',
      calligraphyExperience: {
        yearsOfExperience: 2,
        styles: ['kaishu', 'xingshu'],
        teachers: ['Master Kim'],
        achievements: ['Local Competition Winner'],
        currentLevel: 'intermediate',
        goals: ['Improve brush control']
      },
      preferences: {
        language: 'ko',
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          showProfile: true,
          showProgress: false,
          allowContact: true
        }
      },
      documents: [],
      notes: 'Test member'
    }

    it('should create a new member successfully', async () => {
      const newMember = { id: 'member-123', ...memberData, createdAt: new Date(), updatedAt: new Date() }
      mockDb.insert.mockResolvedValue([newMember])

      const result = await createMember(memberData)

      expect(mockDb.insert).toHaveBeenCalled()
      expect(result).toEqual(newMember)
    })

    it('should validate required fields', async () => {
      const invalidData = { ...memberData, email: '' }

      await expect(createMember(invalidData)).rejects.toThrow('Email is required')
    })

    it('should validate email format', async () => {
      const invalidData = { ...memberData, email: 'invalid-email' }

      await expect(createMember(invalidData)).rejects.toThrow('Invalid email format')
    })

    it('should validate phone format', async () => {
      const invalidData = { ...memberData, phone: '123' }

      await expect(createMember(invalidData)).rejects.toThrow('Invalid phone format')
    })
  })

  describe('updateMember', () => {
    it('should update member successfully', async () => {
      const memberId = 'member-123'
      const updateData = { name: 'Updated Name', phone: '010-9999-8888' }
      const updatedMember = { id: memberId, ...updateData, updatedAt: new Date() }

      mockDb.update.mockResolvedValue([updatedMember])

      const result = await updateMember(memberId, updateData)

      expect(mockDb.update).toHaveBeenCalled()
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining(updateData))
      expect(result).toEqual(updatedMember)
    })

    it('should handle member not found', async () => {
      mockDb.update.mockResolvedValue([])

      await expect(updateMember('nonexistent', { name: 'Test' }))
        .rejects.toThrow('Member not found')
    })
  })

  describe('getMemberById', () => {
    it('should return member by ID', async () => {
      const memberId = 'member-123'
      const member = { id: memberId, name: 'Test User', email: 'test@example.com' }

      mockDb.select.mockResolvedValue([member])

      const result = await getMemberById(memberId)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(result).toEqual(member)
    })

    it('should return null for non-existent member', async () => {
      mockDb.select.mockResolvedValue([])

      const result = await getMemberById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getMembersByTier', () => {
    it('should return members by tier', async () => {
      const tier: MembershipTier = 'advanced_practitioner'
      const members = [
        { id: '1', name: 'Member 1', tier },
        { id: '2', name: 'Member 2', tier }
      ]

      mockDb.select.mockResolvedValue(members)

      const result = await getMembersByTier(tier)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(result).toEqual(members)
    })

    it('should handle empty results', async () => {
      mockDb.select.mockResolvedValue([])

      const result = await getMembersByTier('honorary_master')

      expect(result).toEqual([])
    })
  })

  describe('searchMembers', () => {
    it('should search members by query', async () => {
      const query = 'john'
      const options = { limit: 10, offset: 0 }
      const members = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Johnny Smith', email: 'johnny@example.com' }
      ]

      mockDb.select.mockResolvedValue(members)

      const result = await searchMembers(query, options)

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(mockDb.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(members)
    })

    it('should apply filters correctly', async () => {
      const query = 'test'
      const options = {
        filters: {
          tier: 'student' as MembershipTier,
          status: 'active' as const,
          nationality: 'korean'
        }
      }

      await searchMembers(query, options)

      expect(mockDb.where).toHaveBeenCalledTimes(4) // query + 3 filters
    })
  })

  describe('updateMemberTier', () => {
    it('should update member tier successfully', async () => {
      const memberId = 'member-123'
      const newTier: MembershipTier = 'advanced_practitioner'
      const reason = 'Skill improvement'
      const approvedBy = 'admin-123'

      const updatedMember = {
        id: memberId,
        tier: newTier,
        updatedAt: new Date()
      }

      mockDb.update.mockResolvedValue([updatedMember])
      mockDb.insert.mockResolvedValue([{ id: 'activity-123' }])

      const result = await updateMemberTier(memberId, newTier, reason, approvedBy)

      expect(mockDb.update).toHaveBeenCalled()
      expect(mockDb.insert).toHaveBeenCalledWith(expect.objectContaining({
        type: 'tier_change',
        details: expect.objectContaining({
          newTier,
          reason,
          approvedBy
        })
      }))
      expect(result).toEqual(updatedMember)
    })

    it('should validate tier progression rules', async () => {
      const memberId = 'member-123'
      // Mock current member with student tier
      mockDb.select.mockResolvedValue([{ id: memberId, tier: 'student' }])

      // Try to skip to honorary_master (invalid progression)
      await expect(updateMemberTier(memberId, 'honorary_master', 'Invalid', 'admin'))
        .rejects.toThrow('Invalid tier progression')
    })
  })

  describe('getMemberStats', () => {
    it('should return member statistics', async () => {
      const mockStats = [
        { tier: 'student', count: 100 },
        { tier: 'advanced_practitioner', count: 50 },
        { tier: 'certified_master', count: 20 }
      ]

      mockDb.select.mockResolvedValue(mockStats)

      const result = await getMemberStats()

      expect(result).toEqual({
        totalMembers: 170,
        tierDistribution: {
          student: 100,
          advanced_practitioner: 50,
          certified_master: 20
        },
        newMembersThisMonth: expect.any(Number),
        activeMembers: expect.any(Number)
      })
    })
  })

  describe('logMemberActivity', () => {
    it('should log member activity', async () => {
      const activity = {
        memberId: 'member-123',
        type: 'profile_update' as ActivityType,
        description: 'Updated profile information',
        details: { field: 'phone', oldValue: '010-1111-1111', newValue: '010-2222-2222' },
        performedBy: 'member-123'
      }

      mockDb.insert.mockResolvedValue([{ id: 'activity-123' }])

      await logMemberActivity(activity)

      expect(mockDb.insert).toHaveBeenCalledWith(expect.objectContaining({
        ...activity,
        timestamp: expect.any(Date)
      }))
    })
  })

  describe('getMemberActivityHistory', () => {
    it('should return member activity history', async () => {
      const memberId = 'member-123'
      const activities = [
        {
          id: '1',
          type: 'profile_update',
          description: 'Updated profile',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'tier_change',
          description: 'Tier upgraded',
          timestamp: new Date()
        }
      ]

      mockDb.select.mockResolvedValue(activities)

      const result = await getMemberActivityHistory(memberId, { limit: 10 })

      expect(mockDb.select).toHaveBeenCalled()
      expect(mockDb.where).toHaveBeenCalled()
      expect(mockDb.orderBy).toHaveBeenCalled()
      expect(mockDb.limit).toHaveBeenCalledWith(10)
      expect(result).toEqual(activities)
    })

    it('should filter by activity type', async () => {
      const memberId = 'member-123'
      const activityType: ActivityType = 'tier_change'

      await getMemberActivityHistory(memberId, { 
        limit: 10, 
        activityType 
      })

      expect(mockDb.where).toHaveBeenCalledTimes(2) // memberId + activityType
    })
  })
})