'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Clock, 
  Zap, 
  Eye, 
  Gauge, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  usePerformanceMonitoring,
  getStoredMetrics,
  formatMetricValue,
  getMetricColor,
  type EnhancedMetric,
  type PerformanceScore,
  PERFORMANCE_THRESHOLDS
} from '@/lib/performance/web-vitals'

interface MetricCardProps {
  name: string
  value: number
  score: PerformanceScore
  description: string
  icon: React.ReactNode
}

function MetricCard({ name, value, score, description, icon }: MetricCardProps) {
  const color = getMetricColor(score)
  const ScoreIcon = score === 'good' ? CheckCircle : score === 'needs-improvement' ? AlertTriangle : XCircle

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <div className="flex items-center space-x-1">
          {icon}
          <ScoreIcon className="h-4 w-4" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>
          {formatMetricValue(name, value)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge 
            variant={score === 'good' ? 'default' : score === 'needs-improvement' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {score === 'good' ? 'Good' : score === 'needs-improvement' ? 'Needs Work' : 'Poor'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

interface PerformanceHistoryProps {
  metrics: any[]
}

function PerformanceHistory({ metrics }: PerformanceHistoryProps) {
  const groupedMetrics = (metrics as any[]).reduce((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = []
    acc[metric.name].push(metric)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-4">
      {Object.entries(groupedMetrics).map(([metricName, metricList]) => {
        const latest = (metricList as any[])[(metricList as any[]).length - 1]
        return (
          <Card key={metricName}>
            <CardHeader>
              <CardTitle className="text-sm">{metricName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {formatMetricValue(metricName, latest.value)}
                </span>
                <Badge 
                  variant={latest.score === 'good' ? 'default' : latest.score === 'needs-improvement' ? 'secondary' : 'destructive'}
                >
                  {latest.score}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(metricList as any[]).length} measurement{(metricList as any[]).length > 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface PerformanceInsightsProps {
  monitor: any
}

function PerformanceInsights({ monitor }: PerformanceInsightsProps) {
  const analytics = monitor?.getAnalytics()
  const performanceScore = monitor?.getPerformanceScore()

  if (!analytics || !performanceScore) {
    return <div className="text-muted-foreground">성능 데이터를 불러올 수 없습니다.</div>
  }

  const insights = []

  // Page load time insights
  if (analytics && (analytics as any).pageLoadTime > 3000) {
    insights.push({
      type: 'warning',
      title: '페이지 로딩 시간',
      message: `페이지 로딩 시간이 ${(analytics.pageLoadTime / 1000).toFixed(1)}초입니다. 3초 이하를 목표로 해보세요.`
    })
  } else if (analytics.pageLoadTime > 0) {
    insights.push({
      type: 'success',
      title: '페이지 로딩 시간',
      message: `페이지 로딩 시간이 ${(analytics.pageLoadTime / 1000).toFixed(1)}초로 양호합니다.`
    })
  }

  // Resource loading insights
  const slowResources = Object.entries((analytics as any).resourceLoadTimes || {})
    .filter(([_, time]) => (time as number) > 1000)
    .slice(0, 3)

  if (slowResources.length > 0) {
    insights.push({
      type: 'warning',
      title: '느린 리소스',
      message: `${slowResources.length}개의 리소스가 1초 이상 로딩되고 있습니다.`
    })
  }

  // Error insights
  if (analytics.errors.length > 0) {
    insights.push({
      type: 'error',
      title: '오류 감지',
      message: `${analytics.errors.length}개의 오류가 감지되었습니다.`
    })
  }

  // Overall score insight
  insights.push({
    type: performanceScore.overall === 'good' ? 'success' : performanceScore.overall === 'needs-improvement' ? 'warning' : 'error',
    title: '전체 성능 점수',
    message: `현재 성능 점수: ${performanceScore.overall === 'good' ? '좋음' : performanceScore.overall === 'needs-improvement' ? '개선 필요' : '나쁨'}`
  })

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className={`p-1 rounded-full ${
                insight.type === 'success' ? 'bg-green-100' : 
                insight.type === 'warning' ? 'bg-yellow-100' : 
                'bg-red-100'
              }`}>
                {insight.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : insight.type === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PerformanceDashboard() {
  const monitor = usePerformanceMonitoring({
    enableConsoleLogging: true,
    enableLocalStorage: true,
    sampleRate: 1.0
  })

  const [storedMetrics, setStoredMetrics] = useState<any[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<EnhancedMetric[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = useCallback(() => {
    setIsRefreshing(true)
    setStoredMetrics(getStoredMetrics())
    if (monitor) {
      setCurrentMetrics(monitor.getAnalytics().metrics)
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }, [monitor])

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  const exportData = () => {
    if (!monitor) return
    
    const data = monitor.exportMetrics()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (monitor) {
      monitor.clearMetrics()
      refreshData()
    }
  }

  if (!monitor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            성능 모니터링이 지원되지 않는 환경입니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  const analytics = monitor.getAnalytics()
  const performanceScore = monitor.getPerformanceScore()

  // Get latest metrics for each type
  const latestMetrics = Object.keys(PERFORMANCE_THRESHOLDS).map(metricName => {
    const metrics = currentMetrics.filter(m => m.name === metricName)
    return metrics.length > 0 ? metrics[metrics.length - 1] : null
  }).filter(Boolean) as EnhancedMetric[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">성능 모니터링</h2>
          <p className="text-muted-foreground">실시간 웹 성능 지표 추적</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportData}
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearData}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5" />
            <span>전체 성능 점수</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold" style={{ color: getMetricColor(performanceScore.overall) }}>
              {performanceScore.overall === 'good' ? '좋음' : performanceScore.overall === 'needs-improvement' ? '개선 필요' : '나쁨'}
            </div>
            <div className="flex space-x-2">
              {Object.entries(performanceScore.breakdown).map(([metric, score]) => (
                <Badge 
                  key={metric}
                  variant={score === 'good' ? 'default' : score === 'needs-improvement' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestMetrics.map((metric) => (
          <MetricCard
            key={metric.name}
            name={metric.name}
            value={metric.value}
            score={metric.score}
            description={getMetricDescription(metric.name)}
            icon={getMetricIcon(metric.name)}
          />
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">인사이트</TabsTrigger>
          <TabsTrigger value="history">히스토리</TabsTrigger>
          <TabsTrigger value="details">상세 정보</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights">
          <PerformanceInsights monitor={monitor} />
        </TabsContent>
        
        <TabsContent value="history">
          <PerformanceHistory metrics={storedMetrics} />
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>상세 성능 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">페이지 성능</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>페이지 로딩 시간:</span>
                      <span>{analytics.pageLoadTime > 0 ? `${(analytics.pageLoadTime / 1000).toFixed(2)}초` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>렌더링 시간:</span>
                      <span>{analytics.renderTime > 0 ? `${analytics.renderTime.toFixed(0)}ms` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>첫 상호작용 시간:</span>
                      <span>{analytics.interactionTime > 0 ? `${analytics.interactionTime.toFixed(0)}ms` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">세션 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>세션 ID:</span>
                      <span className="font-mono text-xs">{analytics.sessionId.split('-')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>측정 항목:</span>
                      <span>{analytics.metrics.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span>오류:</span>
                      <span>{analytics.errors.length}개</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'LCP': '최대 콘텐츠풀 페인트 - 페이지의 주요 콘텐츠가 로딩되는 시간',
    'FID': '최초 입력 지연 - 사용자 첫 상호작용의 응답 시간',
    'CLS': '누적 레이아웃 시프트 - 페이지 로딩 중 레이아웃 변화',
    'FCP': '최초 콘텐츠풀 페인트 - 첫 번째 콘텐츠가 나타나는 시간',
    'TTFB': '첫 바이트까지의 시간 - 서버 응답 시간'
  }
  return descriptions[name] || '성능 지표'
}

function getMetricIcon(name: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'LCP': <Eye className="h-4 w-4" />,
    'FID': <Zap className="h-4 w-4" />,
    'CLS': <Activity className="h-4 w-4" />,
    'FCP': <Clock className="h-4 w-4" />,
    'TTFB': <Gauge className="h-4 w-4" />
  }
  return icons[name] || <Activity className="h-4 w-4" />
}