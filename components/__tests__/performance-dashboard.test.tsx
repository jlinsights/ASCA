import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PerformanceDashboard } from '../admin/performance-dashboard'

// Mock fetch
global.fetch = jest.fn()

// Mock performance data
const mockMetrics = [
  {
    id: '1',
    metricType: 'lcp',
    endpoint: '/page',
    method: 'GET',
    value: 2000,
    unit: 'ms',
    timestamp: new Date(),
    metadata: {}
  },
  {
    id: '2',
    metricType: 'api_response_time',
    endpoint: '/api/members',
    method: 'GET',
    value: 150,
    unit: 'ms',
    timestamp: new Date(),
    metadata: {}
  }
]

const mockStats = {
  lcp: { count: 10, sum: 25000, min: 2000, max: 3000, avg: 2500 },
  fid: { count: 10, sum: 800, min: 50, max: 120, avg: 80 },
  cls: { count: 10, sum: 0.8, min: 0.05, max: 0.12, avg: 0.08 },
  fcp: { count: 10, sum: 18000, min: 1500, max: 2000, avg: 1800 },
  ttfb: { count: 10, sum: 5000, min: 400, max: 600, avg: 500 },
  api_response_time: { count: 5, sum: 1000, min: 100, max: 300, avg: 200 }
}

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        metrics: mockMetrics,
        stats: mockStats
      })
    })
  })

  it('renders performance dashboard with header', async () => {
    render(<PerformanceDashboard />)
    
    expect(screen.getByText('성능 모니터링')).toBeInTheDocument()
    expect(screen.getByText('웹사이트 성능 메트릭과 사용자 경험 분석')).toBeInTheDocument()
  })

  it('displays Web Vitals metrics', async () => {
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('LCP')).toBeInTheDocument()
      expect(screen.getByText('FID')).toBeInTheDocument()
      expect(screen.getByText('CLS')).toBeInTheDocument()
      expect(screen.getByText('FCP')).toBeInTheDocument()
      expect(screen.getByText('TTFB')).toBeInTheDocument()
    })
  })

  it('shows performance ratings correctly', async () => {
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      // LCP 2500ms should be "needs improvement"
      expect(screen.getByText('개선필요')).toBeInTheDocument()
      
      // FID 80ms should be "good"
      expect(screen.getByText('우수')).toBeInTheDocument()
    })
  })

  it('displays API performance metrics', async () => {
    render(<PerformanceDashboard />)
    
    // Click on API tab
    const apiTab = screen.getByText('API 성능')
    fireEvent.click(apiTab)
    
    await waitFor(() => {
      expect(screen.getByText('/api/members')).toBeInTheDocument()
    })
  })

  it('allows time range selection', async () => {
    render(<PerformanceDashboard />)
    
    const timeRangeSelect = screen.getByDisplayValue('최근 24시간')
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } })
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeRange=7d'),
        expect.any(Object)
      )
    })
  })

  it('handles refresh button click', async () => {
    render(<PerformanceDashboard />)
    
    const refreshButton = screen.getByText('새로고침')
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2) // Initial + refresh
    })
  })

  it('formats values correctly', async () => {
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      // Should format milliseconds > 1000 as seconds
      expect(screen.getByText('2.50s')).toBeInTheDocument()
      
      // Should show score for CLS
      expect(screen.getByText('0.08score')).toBeInTheDocument()
    })
  })

  it('displays performance score', async () => {
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('87')).toBeInTheDocument()
      expect(screen.getByText('Lighthouse 성능 점수 추정치')).toBeInTheDocument()
    })
  })

  it('shows performance issues', async () => {
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('성능 이슈')).toBeInTheDocument()
      expect(screen.getByText('느린 API 응답')).toBeInTheDocument()
      expect(screen.getByText('큰 이미지 파일')).toBeInTheDocument()
      expect(screen.getByText('JavaScript 번들')).toBeInTheDocument()
    })
  })

  it('displays resource metrics in Resources tab', async () => {
    render(<PerformanceDashboard />)
    
    const resourcesTab = screen.getByText('리소스')
    fireEvent.click(resourcesTab)
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('CSS')).toBeInTheDocument()
      expect(screen.getByText('이미지')).toBeInTheDocument()
      expect(screen.getByText('245KB')).toBeInTheDocument()
      expect(screen.getByText('45KB')).toBeInTheDocument()
      expect(screen.getByText('1.2MB')).toBeInTheDocument()
    })
  })

  it('shows Web Vitals recommendations in Vitals tab', async () => {
    render(<PerformanceDashboard />)
    
    const vitalsTab = screen.getByText('Web Vitals')
    fireEvent.click(vitalsTab)
    
    await waitFor(() => {
      expect(screen.getByText('개선 방안')).toBeInTheDocument()
      expect(screen.getByText('이미지 최적화 및 CDN 사용을 권장합니다.')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<PerformanceDashboard />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch performance metrics:',
        expect.any(Error)
      )
    })
    
    consoleSpy.mockRestore()
  })

  it('shows loading state correctly', () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    
    render(<PerformanceDashboard />)
    
    const refreshButton = screen.getByText('새로고침')
    expect(refreshButton).toBeDisabled()
  })

  it('auto-refreshes every 30 seconds', async () => {
    jest.useFakeTimers()
    
    render(<PerformanceDashboard />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
    
    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
    
    jest.useRealTimers()
  })
})