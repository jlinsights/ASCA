import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  WebVitalsTracker,
  PerformanceDebugPanel,
  ResourceLoadingTracker,
  useImageLoadingTracker,
  useApiPerformanceTracker,
  PerformanceBudgetMonitor,
  MemoryUsageMonitor,
  PerformanceTracker
} from '../performance/web-vitals'
import { performanceMonitor } from '@/lib/performance/monitor'

// Mock performance monitor
jest.mock('@/lib/performance/monitor', () => ({
  trackWebVitals: jest.fn(),
  performanceMonitor: {
    trackCustomMetric: jest.fn(),
    trackImageLoad: jest.fn(),
    trackApiCall: jest.fn(),
    getMetrics: jest.fn(() => []),
    flush: jest.fn(),
  }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/test-path'
}))

describe('Web Vitals Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('WebVitalsTracker', () => {
    it('tracks web vitals on mount', () => {
      const mockTrackWebVitals = require('@/lib/performance/monitor').trackWebVitals
      
      render(<WebVitalsTracker />)

      expect(mockTrackWebVitals).toHaveBeenCalledWith(expect.any(Function))
    })

    it('tracks page navigation', () => {
      render(<WebVitalsTracker />)

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'page_navigation',
        expect.any(Number),
        'timestamp',
        { pathname: '/test-path' }
      )
    })

    it('tracks client-side navigation time on unmount', () => {
      const { unmount } = render(<WebVitalsTracker />)

      act(() => {
        unmount()
      })

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'client_navigation_time',
        expect.any(Number),
        'ms',
        { pathname: '/test-path' }
      )
    })

    it('sends metrics to Google Analytics when available', () => {
      const mockGtag = jest.fn()
      ;(window as any).gtag = mockGtag

      const mockTrackWebVitals = require('@/lib/performance/monitor').trackWebVitals
      render(<WebVitalsTracker />)

      // Simulate web vital callback
      const callback = mockTrackWebVitals.mock.calls[0][0]
      callback({
        name: 'LCP',
        value: 2000,
        rating: 'good',
        id: 'test-id'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'LCP', {
        value: 2000,
        event_label: 'test-id',
        non_interaction: true
      })
    })

    it('handles CLS metric correctly', () => {
      const mockGtag = jest.fn()
      ;(window as any).gtag = mockGtag

      const mockTrackWebVitals = require('@/lib/performance/monitor').trackWebVitals
      render(<WebVitalsTracker />)

      const callback = mockTrackWebVitals.mock.calls[0][0]
      callback({
        name: 'CLS',
        value: 0.1,
        rating: 'good',
        id: 'test-id'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
        value: 100, // CLS * 1000
        event_label: 'test-id',
        non_interaction: true
      })
    })
  })

  describe('PerformanceDebugPanel', () => {
    beforeEach(() => {
      // Mock development environment
      process.env.NODE_ENV = 'development'
    })

    afterEach(() => {
      process.env.NODE_ENV = 'test'
    })

    it('renders debug button in development', () => {
      render(<PerformanceDebugPanel />)

      expect(screen.getByTitle('Performance Debug')).toBeInTheDocument()
    })

    it('does not render in production', () => {
      process.env.NODE_ENV = 'production'
      
      render(<PerformanceDebugPanel />)

      expect(screen.queryByTitle('Performance Debug')).not.toBeInTheDocument()
    })

    it('opens debug panel when button is clicked', () => {
      render(<PerformanceDebugPanel />)

      const debugButton = screen.getByTitle('Performance Debug')
      fireEvent.click(debugButton)

      expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
    })

    it('displays metrics in debug panel', () => {
      const mockMetrics = [
        { name: 'lcp', value: 2000, unit: 'ms' },
        { name: 'fid', value: 100, unit: 'ms' }
      ]
      
      ;(performanceMonitor.getMetrics as jest.Mock).mockReturnValue(mockMetrics)

      render(<PerformanceDebugPanel />)

      const debugButton = screen.getByTitle('Performance Debug')
      fireEvent.click(debugButton)

      act(() => {
        jest.advanceTimersByTime(1000) // Trigger metrics update
      })

      expect(screen.getByText('lcp')).toBeInTheDocument()
      expect(screen.getByText('2000.00 ms')).toBeInTheDocument()
    })

    it('handles empty metrics', () => {
      ;(performanceMonitor.getMetrics as jest.Mock).mockReturnValue([])

      render(<PerformanceDebugPanel />)

      const debugButton = screen.getByTitle('Performance Debug')
      fireEvent.click(debugButton)

      expect(screen.getByText('No metrics collected yet')).toBeInTheDocument()
    })

    it('sends metrics when send button is clicked', () => {
      render(<PerformanceDebugPanel />)

      const debugButton = screen.getByTitle('Performance Debug')
      fireEvent.click(debugButton)

      const sendButton = screen.getByText('Send Metrics')
      fireEvent.click(sendButton)

      expect(performanceMonitor.flush).toHaveBeenCalled()
    })
  })

  describe('ResourceLoadingTracker', () => {
    it('tracks resources on load', () => {
      const mockResources = [
        {
          name: '/_next/static/chunks/main.js',
          duration: 150,
          transferSize: 50000,
          initiatorType: 'script'
        }
      ]

      ;(performance.getEntriesByType as jest.Mock).mockReturnValue(mockResources)

      render(<ResourceLoadingTracker />)

      // Simulate window load event
      act(() => {
        window.dispatchEvent(new Event('load'))
      })

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'static_resource_load',
        150,
        'ms',
        {
          name: 'main.js',
          size: 50000,
          type: 'script'
        }
      )
    })

    it('only tracks Next.js static resources', () => {
      const mockResources = [
        {
          name: '/_next/static/chunks/main.js',
          duration: 150,
          transferSize: 50000,
          initiatorType: 'script'
        },
        {
          name: '/external-resource.js',
          duration: 200,
          transferSize: 30000,
          initiatorType: 'script'
        }
      ]

      ;(performance.getEntriesByType as jest.Mock).mockReturnValue(mockResources)

      render(<ResourceLoadingTracker />)

      act(() => {
        window.dispatchEvent(new Event('load'))
      })

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledTimes(1)
      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'static_resource_load',
        150,
        'ms',
        expect.any(Object)
      )
    })
  })

  describe('useImageLoadingTracker', () => {
    it('provides trackImageLoad function', () => {
      const TestComponent = () => {
        const { trackImageLoad } = useImageLoadingTracker()
        
        return (
          <button onClick={() => trackImageLoad('/test.jpg', 500, { width: 800, height: 600 })}>
            Track Image
          </button>
        )
      }

      render(<TestComponent />)

      const button = screen.getByText('Track Image')
      fireEvent.click(button)

      expect(performanceMonitor.trackImageLoad).toHaveBeenCalledWith(
        '/test.jpg',
        500,
        { width: 800, height: 600 }
      )
    })
  })

  describe('useApiPerformanceTracker', () => {
    it('tracks successful API calls', async () => {
      const TestComponent = () => {
        const { trackApiCall } = useApiPerformanceTracker()
        
        const handleClick = async () => {
          await trackApiCall(
            Promise.resolve({ data: 'success' }),
            '/api/test',
            'GET'
          )
        }

        return <button onClick={handleClick}>Track API</button>
      }

      render(<TestComponent />)

      const button = screen.getByText('Track API')
      
      await act(async () => {
        fireEvent.click(button)
      })

      expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
        '/api/test',
        'GET',
        expect.any(Number),
        200
      )
    })

    it('tracks failed API calls', async () => {
      const TestComponent = () => {
        const { trackApiCall } = useApiPerformanceTracker()
        
        const handleClick = async () => {
          try {
            await trackApiCall(
              Promise.reject(new Error('API Error')),
              '/api/test',
              'POST'
            )
          } catch (error) {
            // Expected error
          }
        }

        return <button onClick={handleClick}>Track API</button>
      }

      render(<TestComponent />)

      const button = screen.getByText('Track API')
      
      await act(async () => {
        fireEvent.click(button)
      })

      expect(performanceMonitor.trackApiCall).toHaveBeenCalledWith(
        '/api/test',
        'POST',
        expect.any(Number),
        500
      )
    })
  })

  describe('PerformanceBudgetMonitor', () => {
    it('tracks budget violations', () => {
      const mockTrackWebVitals = require('@/lib/performance/monitor').trackWebVitals
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      render(
        <PerformanceBudgetMonitor 
          budgets={{ lcp: 2000, fid: 100, cls: 0.1 }}
        />
      )

      const callback = mockTrackWebVitals.mock.calls[0][0]
      
      // Trigger budget violation
      callback({
        name: 'LCP',
        value: 3000, // Exceeds budget of 2000
        rating: 'poor',
        id: 'test-id'
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Performance budget exceeded: LCP = 3000 (budget: 2000)'
      )

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'budget_violation',
        3000,
        'ms',
        {
          metric: 'LCP',
          budget: 2000,
          violation: 1000
        }
      )

      consoleSpy.mockRestore()
    })

    it('does not track when within budget', () => {
      const mockTrackWebVitals = require('@/lib/performance/monitor').trackWebVitals
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      render(<PerformanceBudgetMonitor />)

      const callback = mockTrackWebVitals.mock.calls[0][0]
      
      callback({
        name: 'LCP',
        value: 2000, // Within default budget
        rating: 'good',
        id: 'test-id'
      })

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('MemoryUsageMonitor', () => {
    it('tracks memory usage when available', () => {
      render(<MemoryUsageMonitor />)

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'memory_usage',
        1000000, // From jest.setup.js mock
        'bytes',
        {
          total: 2000000,
          limit: 4000000,
          percentage: 25
        }
      )
    })

    it('tracks memory usage periodically', () => {
      render(<MemoryUsageMonitor />)

      act(() => {
        jest.advanceTimersByTime(30000) // 30 seconds
      })

      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledTimes(2) // Initial + periodic
    })
  })

  describe('PerformanceTracker', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    afterEach(() => {
      process.env.NODE_ENV = 'test'
    })

    it('renders all performance tracking components', () => {
      render(<PerformanceTracker />)

      // Should include debug panel in development
      expect(screen.getByTitle('Performance Debug')).toBeInTheDocument()
    })

    it('does not render debug panel in production', () => {
      process.env.NODE_ENV = 'production'
      
      render(<PerformanceTracker />)

      expect(screen.queryByTitle('Performance Debug')).not.toBeInTheDocument()
    })
  })
})