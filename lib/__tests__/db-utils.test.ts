import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import {
  getPaginatedResults,
  buildSearchQuery,
  formatDateForDB,
  calculateLearningProgress,
  updateLearningProgress,
  getSystemSettings,
  updateSystemSettings,
  logAuditEvent,
  getAuditLogs,
  calculatePerformanceScore
} from '../db/utils'

// Mock database
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  offset: jest.fn(),
  values: jest.fn(),
  set: jest.fn(),
}

jest.mock('../db', () => ({
  db: mockDb
}))

describe('Database Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup chainable methods
    Object.keys(mockDb).forEach(key => {
      mockDb[key].mockReturnValue(mockDb)
    })
  })

  describe('getPaginatedResults', () => {
    it('should return paginated results with correct metadata', async () => {
      const mockResults = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' }
      ]
      mockDb.select.mockResolvedValueOnce(mockResults)
      mockDb.select.mockResolvedValueOnce([{ count: 25 }])

      const result = await getPaginatedResults(
        mockDb as any,
        { page: 2, limit: 10 }
      )

      expect(result).toEqual({
        data: mockResults,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true
        }
      })

      expect(mockDb.offset).toHaveBeenCalledWith(10)
      expect(mockDb.limit).toHaveBeenCalledWith(10)
    })

    it('should handle first page correctly', async () => {
      const mockResults = [{ id: '1', name: 'Test 1' }]
      mockDb.select.mockResolvedValueOnce(mockResults)
      mockDb.select.mockResolvedValueOnce([{ count: 5 }])

      const result = await getPaginatedResults(
        mockDb as any,
        { page: 1, limit: 10 }
      )

      expect(result.pagination.hasPrev).toBe(false)
      expect(result.pagination.hasNext).toBe(false)
    })
  })

  describe('buildSearchQuery', () => {
    it('should build correct search query for single column', () => {
      const result = buildSearchQuery(['name'], 'john')

      expect(result).toContain('LOWER(name) LIKE LOWER(?)')
    })

    it('should build correct search query for multiple columns', () => {
      const result = buildSearchQuery(['name', 'email'], 'john')

      expect(result).toContain('LOWER(name) LIKE LOWER(?)')
      expect(result).toContain('OR LOWER(email) LIKE LOWER(?)')
    })

    it('should return empty string for empty search term', () => {
      const result = buildSearchQuery(['name'], '')

      expect(result).toBe('')
    })
  })

  describe('formatDateForDB', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateForDB(date)

      expect(result).toBe('2024-01-15T10:30:00.000Z')
    })

    it('should format date string correctly', () => {
      const result = formatDateForDB('2024-01-15')

      expect(result).toBe('2024-01-15T00:00:00.000Z')
    })

    it('should return current date for null input', () => {
      const result = formatDateForDB(null)
      const now = new Date().toISOString()

      expect(result.slice(0, 10)).toBe(now.slice(0, 10)) // Same date
    })
  })

  describe('calculateLearningProgress', () => {
    it('should calculate progress correctly for valid scores', () => {
      const scores = [85, 90, 88, 92, 87]
      const result = calculateLearningProgress(scores)

      expect(result.currentLevel).toBe(88.4) // Average
      expect(result.trend).toBe('improving')
      expect(result.consistency).toBeGreaterThan(0)
    })

    it('should handle improving trend', () => {
      const scores = [70, 75, 80, 85, 90]
      const result = calculateLearningProgress(scores)

      expect(result.trend).toBe('improving')
    })

    it('should handle declining trend', () => {
      const scores = [90, 85, 80, 75, 70]
      const result = calculateLearningProgress(scores)

      expect(result.trend).toBe('declining')
    })

    it('should handle stable trend', () => {
      const scores = [80, 81, 79, 80, 80]
      const result = calculateLearningProgress(scores)

      expect(result.trend).toBe('stable')
    })

    it('should handle empty scores array', () => {
      const result = calculateLearningProgress([])

      expect(result.currentLevel).toBe(0)
      expect(result.trend).toBe('stable')
      expect(result.consistency).toBe(0)
    })
  })

  describe('updateLearningProgress', () => {
    it('should update learning progress successfully', async () => {
      mockDb.select.mockResolvedValueOnce([
        { skillCategory: 'brush_control', score: 85, recordedAt: new Date() }
      ])
      mockDb.insert.mockResolvedValueOnce([{ insertId: 1 }])

      await updateLearningProgress('member-1', 'brush_control', 90)

      expect(mockDb.insert).toHaveBeenCalled()
    })
  })

  describe('getSystemSettings', () => {
    it('should return system settings with defaults', async () => {
      const mockSettings = [
        { key: 'maintenance_mode', value: 'false', type: 'boolean' },
        { key: 'max_file_size', value: '10485760', type: 'number' }
      ]
      
      mockDb.select.mockResolvedValueOnce(mockSettings)

      const result = await getSystemSettings()

      expect(result).toEqual({
        maintenance_mode: false,
        max_file_size: 10485760
      })
    })

    it('should handle empty settings', async () => {
      mockDb.select.mockResolvedValueOnce([])

      const result = await getSystemSettings()

      expect(result).toEqual({})
    })
  })

  describe('updateSystemSettings', () => {
    it('should update system settings', async () => {
      const settings = {
        maintenance_mode: true,
        max_file_size: 20971520
      }

      await updateSystemSettings(settings)

      expect(mockDb.insert).toHaveBeenCalledTimes(2)
    })
  })

  describe('logAuditEvent', () => {
    it('should log audit event successfully', async () => {
      await logAuditEvent({
        userId: 'user-1',
        action: 'CREATE',
        resource: 'member',
        resourceId: 'member-1',
        details: { name: 'John Doe' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      })

      expect(mockDb.insert).toHaveBeenCalled()
    })
  })

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [
        {
          id: '1',
          userId: 'user-1',
          action: 'CREATE',
          resource: 'member',
          createdAt: new Date()
        }
      ]
      
      mockDb.select.mockResolvedValueOnce(mockLogs)
      mockDb.select.mockResolvedValueOnce([{ count: 1 }])

      const result = await getAuditLogs({ page: 1, limit: 10 })

      expect(result.data).toEqual(mockLogs)
      expect(result.pagination.total).toBe(1)
    })
  })

  describe('calculatePerformanceScore', () => {
    it('should calculate performance score correctly', () => {
      const metrics = {
        lcp: 2000,    // Good
        fid: 50,      // Good  
        cls: 0.05,    // Good
        fcp: 1500,    // Good
        ttfb: 400     // Good
      }

      const score = calculatePerformanceScore(metrics)

      expect(score).toBeGreaterThan(90) // Should be high score
    })

    it('should penalize poor metrics', () => {
      const metrics = {
        lcp: 5000,    // Poor
        fid: 400,     // Poor
        cls: 0.3,     // Poor
        fcp: 4000,    // Poor
        ttfb: 2000    // Poor
      }

      const score = calculatePerformanceScore(metrics)

      expect(score).toBeLessThan(50) // Should be low score
    })

    it('should handle missing metrics', () => {
      const metrics = {
        lcp: 2000,
        // Missing other metrics
      }

      const score = calculatePerformanceScore(metrics)

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThan(100)
    })
  })
})