import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { POST, GET } from '../performance/metrics/route'
import { NextRequest } from 'next/server'

// Mock database
const mockDb = {
  insert: jest.fn(),
  select: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  values: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  desc: jest.fn(),
}

jest.mock('@/lib/db', () => ({
  db: mockDb,
  performanceMetrics: mockDb
}))

jest.mock('@/lib/db/utils', () => ({
  getPaginatedResults: jest.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 100, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
  }),
  calculatePerformanceScore: jest.fn().mockReturnValue(85)
}))

describe('Performance Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup chainable methods
    Object.keys(mockDb).forEach(key => {
      mockDb[key].mockReturnValue(mockDb)
    })
  })

  describe('POST /api/performance/metrics', () => {
    it('should store performance metrics successfully', async () => {
      const metricsData = {
        metrics: [
          {
            name: 'lcp',
            value: 2000,
            unit: 'ms',
            metadata: { page: '/test' }
          },
          {
            name: 'api_response_time',
            value: 150,
            unit: 'ms',
            metadata: { endpoint: '/api/test', method: 'GET', status: 200 }
          }
        ]
      }

      mockDb.insert.mockResolvedValue([{ insertId: 1 }, { insertId: 2 }])

      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: JSON.stringify(metricsData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        message: 'Metrics stored successfully',
        count: 2
      })

      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metricType: 'lcp',
            endpoint: '/test',
            method: 'GET',
            value: 2000,
            unit: 'ms'
          }),
          expect.objectContaining({
            metricType: 'api_response_time',
            endpoint: '/api/test',
            method: 'GET',
            value: 150,
            unit: 'ms'
          })
        ])
      )
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'content-type': 'application/json' }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Invalid JSON')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        metrics: [
          {
            // Missing name and value
            unit: 'ms'
          }
        ]
      }

      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Missing required fields')
    })

    it('should handle empty metrics array', async () => {
      const emptyData = { metrics: [] }

      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: JSON.stringify(emptyData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('No metrics provided')
    })

    it('should handle database errors', async () => {
      const metricsData = {
        metrics: [
          { name: 'lcp', value: 2000, unit: 'ms' }
        ]
      }

      mockDb.insert.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: JSON.stringify(metricsData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to store metrics')
    })

    it('should extract correct endpoint from metadata', async () => {
      const metricsData = {
        metrics: [
          {
            name: 'page_load_time',
            value: 1500,
            unit: 'ms',
            metadata: { page: '/gallery' }
          },
          {
            name: 'api_response_time',
            value: 200,
            unit: 'ms',
            metadata: { endpoint: '/api/artworks', method: 'POST', status: 201 }
          }
        ]
      }

      mockDb.insert.mockResolvedValue([{ insertId: 1 }, { insertId: 2 }])

      const request = new NextRequest('http://localhost:3000/api/performance/metrics', {
        method: 'POST',
        body: JSON.stringify(metricsData),
        headers: { 'content-type': 'application/json' }
      })

      await POST(request)

      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            endpoint: '/gallery',
            method: 'GET'
          }),
          expect.objectContaining({
            endpoint: '/api/artworks',
            method: 'POST'
          })
        ])
      )
    })
  })

  describe('GET /api/performance/metrics', () => {
    it('should return performance metrics with default parameters', async () => {
      const mockMetrics = [
        {
          id: '1',
          metricType: 'lcp',
          endpoint: '/test',
          method: 'GET',
          value: 2000,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {}
        }
      ]

      const mockStats = {
        lcp: { count: 1, sum: 2000, min: 2000, max: 2000, avg: 2000 }
      }

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      getPaginatedResults.mockResolvedValue({
        data: mockMetrics,
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      })

      // Mock stats calculation
      mockDb.select.mockResolvedValue([
        { metricType: 'lcp', count: 1, sum: 2000, min: 2000, max: 2000, avg: 2000 }
      ])

      const request = new NextRequest('http://localhost:3000/api/performance/metrics?timeRange=24h')

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.metrics).toEqual(mockMetrics)
      expect(responseData.stats).toBeDefined()
      expect(responseData.performanceScore).toBe(85)
    })

    it('should handle time range filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?timeRange=7d&limit=50')

      await GET(request)

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      expect(getPaginatedResults).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          page: 1,
          limit: 50
        }),
        expect.any(Function) // where clause function
      )
    })

    it('should handle metric type filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?metricType=lcp')

      await GET(request)

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      expect(getPaginatedResults).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          page: 1,
          limit: 100
        }),
        expect.any(Function)
      )
    })

    it('should handle endpoint filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?endpoint=/api/test')

      await GET(request)

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      expect(getPaginatedResults).toHaveBeenCalled()
    })

    it('should parse pagination parameters correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?page=2&limit=25')

      await GET(request)

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      expect(getPaginatedResults).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          page: 2,
          limit: 25
        }),
        expect.any(Function)
      )
    })

    it('should handle invalid pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?page=invalid&limit=0')

      await GET(request)

      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      expect(getPaginatedResults).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          page: 1, // Default
          limit: 100 // Default
        }),
        expect.any(Function)
      )
    })

    it('should calculate stats correctly', async () => {
      mockDb.select.mockResolvedValue([
        { metricType: 'lcp', count: 10, sum: 25000, min: 2000, max: 3000, avg: 2500 },
        { metricType: 'fid', count: 10, sum: 800, min: 50, max: 120, avg: 80 }
      ])

      const request = new NextRequest('http://localhost:3000/api/performance/metrics')

      const response = await GET(request)
      const responseData = await response.json()

      expect(responseData.stats).toEqual({
        lcp: { count: 10, sum: 25000, min: 2000, max: 3000, avg: 2500 },
        fid: { count: 10, sum: 800, min: 50, max: 120, avg: 80 }
      })
    })

    it('should handle database errors gracefully', async () => {
      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      getPaginatedResults.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/performance/metrics')

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to fetch metrics')
    })

    it('should return correct time range boundaries', async () => {
      const request = new NextRequest('http://localhost:3000/api/performance/metrics?timeRange=1h')

      await GET(request)

      // Verify that the time range is calculated correctly
      // This would be tested by checking the where clause function passed to getPaginatedResults
      const getPaginatedResults = require('@/lib/db/utils').getPaginatedResults
      const whereClause = getPaginatedResults.mock.calls[0][2]
      expect(typeof whereClause).toBe('function')
    })
  })
})