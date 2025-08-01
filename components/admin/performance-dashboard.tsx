'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Monitor,
  Smartphone,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceMetric {
  id: string
  metricType: string
  endpoint: string
  method: string
  value: number
  unit: string
  timestamp: Date
  metadata?: any
}

interface PerformanceStats {
  [key: string]: {
    count: number
    sum: number
    min: number
    max: number
    avg: number
  }
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [stats, setStats] = useState<PerformanceStats>({})
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(null)

  // Fetch performance metrics
  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/performance/metrics?timeRange=${timeRange}&limit=1000`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  // Performance rating based on Web Vitals thresholds
  const getPerformanceRating = (metricType: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1500 },
      api_response_time: { good: 200, poor: 1000 },
      page_load_time: { good: 3000, poor: 5000 }
    }

    const threshold = thresholds[metricType]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms' && value > 1000) {
      return `${(value / 1000).toFixed(2)}s`
    }
    if (unit === 'bytes' && value > 1024) {
      if (value > 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(2)}MB`
      }
      return `${(value / 1024).toFixed(2)}KB`
    }
    return `${value.toFixed(2)}${unit}`
  }

  // Core Web Vitals summary
  const webVitalsMetrics = ['lcp', 'fid', 'cls', 'fcp', 'ttfb']
  const webVitalsStats = webVitalsMetrics.map(metric => {
    const stat = stats[metric]
    if (!stat) return null
    
    const rating = getPerformanceRating(metric, stat.avg)
    return {
      name: metric.toUpperCase(),
      value: stat.avg,
      unit: metric === 'cls' ? 'score' : 'ms',
      rating,
      count: stat.count
    }
  }).filter(Boolean)

  // API performance summary
  const apiMetrics = metrics.filter(m => m.metricType === 'api_response_time')
  const apiEndpoints = [...new Set(apiMetrics.map(m => m.endpoint))]
    .map(endpoint => {
      const endpointMetrics = apiMetrics.filter(m => m.endpoint === endpoint)
      const avgTime = endpointMetrics.reduce((sum, m) => sum + m.value, 0) / endpointMetrics.length
      const rating = getPerformanceRating('api_response_time', avgTime)
      
      return {
        endpoint,
        avgTime,
        count: endpointMetrics.length,
        rating
      }
    })
    .sort((a, b) => b.avgTime - a.avgTime)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">성능 모니터링</h2>
          <p className="text-muted-foreground">
            웹사이트 성능 메트릭과 사용자 경험 분석
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="1h">최근 1시간</option>
            <option value="24h">최근 24시간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
          
          <Button
            onClick={fetchMetrics}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            새로고침
          </Button>
        </div>
      </div>

      {/* Core Web Vitals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {webVitalsStats.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.name}</span>
                <Badge className={cn("text-xs", getRatingColor(metric.rating))}>
                  {metric.rating === 'good' ? '우수' : 
                   metric.rating === 'needs-improvement' ? '개선필요' : '부족'}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric.count} 측정
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="api">API 성능</TabsTrigger>
          <TabsTrigger value="resources">리소스</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  전체 성능 점수
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">87</div>
                  <div className="text-sm text-muted-foreground">
                    Lighthouse 성능 점수 추정치
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>First Contentful Paint</span>
                    <span className="text-green-600">우수</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Largest Contentful Paint</span>  
                    <span className="text-yellow-600">개선필요</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cumulative Layout Shift</span>
                    <span className="text-green-600">우수</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  성능 이슈
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">느린 API 응답</div>
                      <div className="text-xs text-muted-foreground">
                        /api/artworks 평균 1.2초
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">큰 이미지 파일</div>
                      <div className="text-xs text-muted-foreground">
                        평균 500KB 이상의 이미지 감지
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">JavaScript 번들</div>
                      <div className="text-xs text-muted-foreground">
                        메인 번들 크기 최적화 권장
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Performance Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API 엔드포인트 성능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiEndpoints.slice(0, 10).map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-mono text-sm">{api.endpoint}</div>
                      <div className="text-xs text-muted-foreground">
                        {api.count} 요청
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatValue(api.avgTime, 'ms')}
                      </span>
                      <Badge className={cn("text-xs", getRatingColor(api.rating))}>
                        {api.rating === 'good' ? '우수' : 
                         api.rating === 'needs-improvement' ? '개선필요' : '느림'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  JavaScript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">245KB</div>
                <div className="text-sm text-muted-foreground mb-3">
                  메인 번들 크기
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  권장 크기: 244KB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  CSS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">45KB</div>
                <div className="text-sm text-muted-foreground mb-3">
                  스타일시트 크기
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  권장 크기: 150KB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  이미지
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">1.2MB</div>
                <div className="text-sm text-muted-foreground mb-3">
                  평균 페이지당
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  권장 크기: 1.5MB
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Web Vitals Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {webVitalsStats.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.name}</span>
                    <Badge className={cn("text-xs", getRatingColor(metric.rating))}>
                      {metric.rating === 'good' ? '우수' : 
                       metric.rating === 'needs-improvement' ? '개선필요' : '부족'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {metric.count}회 측정 평균
                  </div>
                  
                  {/* Recommendation */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-1">개선 방안</div>
                    <div className="text-xs text-muted-foreground">
                      {metric.name === 'LCP' && '이미지 최적화 및 CDN 사용을 권장합니다.'}
                      {metric.name === 'FID' && 'JavaScript 번들 크기를 줄이고 코드 스플리팅을 적용하세요.'}
                      {metric.name === 'CLS' && '이미지와 광고에 명시적 크기를 지정하세요.'}
                      {metric.name === 'FCP' && '서버 응답 시간을 최적화하고 리소스를 사전 로드하세요.'}
                      {metric.name === 'TTFB' && '서버 성능을 개선하고 캐싱을 활용하세요.'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}