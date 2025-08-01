import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { PerformanceMonitor, trackWebVitals } from '../performance/monitor'

// Mock web-vitals
const mockGetCLS = jest.fn()
const mockGetFCP = jest.fn()
const mockGetFID = jest.fn()
const mockGetLCP = jest.fn()
const mockGetTTFB = jest.fn()

jest.mock('web-vitals', () => ({
  getCLS: mockGetCLS,
  getFCP: mockGetFCP,
  getFID: mockGetFID,
  getLCP: mockGetLCP,
  getTTFB: mockGetTTFB,
}))

// Mock fetch
global.fetch = jest.fn()

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor
  
  beforeEach(() => {
    monitor = new PerformanceMonitor()
    jest.clearAllMocks()
    
    // Mock successful fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('trackCustomMetric', () => {
    it('should track a custom metric', () => {
      monitor.trackCustomMetric('test_metric', 100, 'ms', { page: '/test' })

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toMatchObject({
        name: 'test_metric',
        value: 100,
        unit: 'ms',
        metadata: { page: '/test' }
      })
    })

    it('should respect max metrics limit', () => {
      // Add 1001 metrics (exceeds default limit of 1000)
      for (let i = 0; i < 1001; i++) {
        monitor.trackCustomMetric(`metric_${i}`, i, 'ms')
      }

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1000)
      expect(metrics[0].name).toBe('metric_1') // First one should be removed
    })
  })

  describe('trackPageLoad', () => {
    it('should track page load time', () => {
      monitor.trackPageLoad('/test-page', 1500)

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toMatchObject({
        name: 'page_load_time',
        value: 1500,
        unit: 'ms',
        metadata: { page: '/test-page' }
      })
    })
  })

  describe('trackApiCall', () => {
    it('should track successful API call', () => {
      monitor.trackApiCall('/api/test', 'GET', 200, 200)

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toMatchObject({
        name: 'api_response_time',
        value: 200,
        unit: 'ms',
        metadata: {
          endpoint: '/api/test',
          method: 'GET',
          status: 200
        }
      })
    })

    it('should track failed API call', () => {
      monitor.trackApiCall('/api/test', 'POST', 1000, 500)

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0].metadata.status).toBe(500)
    })
  })

  describe('trackImageLoad', () => {
    it('should track image loading performance', () => {
      monitor.trackImageLoad('/test-image.jpg', 500, { width: 800, height: 600 })

      const metrics = monitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toMatchObject({
        name: 'image_load_time',
        value: 500,
        unit: 'ms',
        metadata: {
          src: '/test-image.jpg',
          dimensions: { width: 800, height: 600 }
        }
      })
    })
  })

  describe('getStats', () => {
    it('should calculate correct statistics', () => {
      monitor.trackCustomMetric('test_metric', 100, 'ms')
      monitor.trackCustomMetric('test_metric', 200, 'ms')
      monitor.trackCustomMetric('test_metric', 150, 'ms')

      const stats = monitor.getStats()
      expect(stats.test_metric).toEqual({
        count: 3,
        sum: 450,
        min: 100,
        max: 200,
        avg: 150
      })
    })

    it('should handle empty metrics', () => {
      const stats = monitor.getStats()
      expect(stats).toEqual({})
    })
  })

  describe('flush', () => {
    it('should send metrics to API endpoint', async () => {
      monitor.trackCustomMetric('test_metric', 100, 'ms')
      
      await monitor.flush()

      expect(global.fetch).toHaveBeenCalledWith('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: expect.arrayContaining([
            expect.objectContaining({
              name: 'test_metric',
              value: 100
            })
          ])
        })
      })
      
      // Metrics should be cleared after successful flush
      expect(monitor.getMetrics()).toHaveLength(0)
    })

    it('should retain metrics if API call fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      monitor.trackCustomMetric('test_metric', 100, 'ms')
      
      await monitor.flush()

      // Metrics should not be cleared if flush fails
      expect(monitor.getMetrics()).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('should clear all metrics', () => {
      monitor.trackCustomMetric('test_metric', 100, 'ms')
      monitor.clear()

      expect(monitor.getMetrics()).toHaveLength(0)
    })
  })
})

describe('trackWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register all Web Vitals callbacks', () => {
    const mockCallback = jest.fn()
    
    trackWebVitals(mockCallback)

    expect(mockGetCLS).toHaveBeenCalledWith(expect.any(Function))
    expect(mockGetFCP).toHaveBeenCalledWith(expect.any(Function))
    expect(mockGetFID).toHaveBeenCalledWith(expect.any(Function))
    expect(mockGetLCP).toHaveBeenCalledWith(expect.any(Function))
    expect(mockGetTTFB).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should call callback with Web Vitals metrics', () => {
    const mockCallback = jest.fn()
    const mockMetric = {
      name: 'LCP',
      value: 2000,
      rating: 'good',
      id: 'test-id'
    }

    trackWebVitals(mockCallback)

    // Simulate LCP callback
    const lcpCallback = mockGetLCP.mock.calls[0][0]
    lcpCallback(mockMetric)

    expect(mockCallback).toHaveBeenCalledWith(mockMetric)
  })

  it('should handle callback errors gracefully', () => {
    const mockCallback = jest.fn().mockImplementation(() => {
      throw new Error('Callback error')
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    trackWebVitals(mockCallback)

    // Simulate metric callback with error
    const lcpCallback = mockGetLCP.mock.calls[0][0]
    lcpCallback({ name: 'LCP', value: 2000, rating: 'good', id: 'test' })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in Web Vitals callback:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})