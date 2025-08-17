'use client'

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Performance thresholds based on Web Vitals recommendations
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  
  // Additional Web Vitals
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte
} as const

export type PerformanceMetricName = keyof typeof PERFORMANCE_THRESHOLDS
export type PerformanceScore = 'good' | 'needs-improvement' | 'poor'

// Enhanced metric data structure
export interface EnhancedMetric extends Metric {
  score: PerformanceScore
  timestamp: number
  url: string
  userAgent: string
  connectionType?: string
  deviceMemory?: number
  isFirstVisit: boolean
}

// Performance analytics data
export interface PerformanceAnalytics {
  sessionId: string
  metrics: EnhancedMetric[]
  pageLoadTime: number
  resourceLoadTimes: { [key: string]: number }
  renderTime: number
  interactionTime: number
  errors: string[]
  warnings: string[]
}

// Performance configuration
export interface PerformanceConfig {
  enableReporting: boolean
  enableConsoleLogging: boolean
  enableLocalStorage: boolean
  reportingEndpoint?: string
  sampleRate: number // 0.0 to 1.0
  maxMetrics: number
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableReporting: process.env.NODE_ENV === 'production',
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableLocalStorage: true,
  sampleRate: 1.0,
  maxMetrics: 100
}

// Performance monitor class
export class PerformanceMonitor {
  private config: PerformanceConfig
  private analytics: PerformanceAnalytics
  private startTime: number

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startTime = performance.now()
    this.analytics = {
      sessionId: this.generateSessionId(),
      metrics: [],
      pageLoadTime: 0,
      resourceLoadTimes: {},
      renderTime: 0,
      interactionTime: 0,
      errors: [],
      warnings: []
    }

    // Initialize monitoring if sampling allows
    if (Math.random() < this.config.sampleRate) {
      this.initializeMonitoring()
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeMonitoring(): void {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this))
    onINP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    
    // Additional metrics
    onFCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))

    // Page performance monitoring
    this.monitorPagePerformance()
    
    // Resource loading monitoring
    this.monitorResourceLoading()

    // User interaction monitoring
    this.monitorUserInteractions()

    // Error monitoring
    this.monitorErrors()
  }

  private handleMetric(metric: Metric): void {
    const enhancedMetric: EnhancedMetric = {
      ...metric,
      score: this.calculateScore(metric.name as PerformanceMetricName, metric.value),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory(),
      isFirstVisit: this.isFirstVisit()
    }

    this.analytics.metrics.push(enhancedMetric)

    // Trim metrics if exceeding max
    if (this.analytics.metrics.length > this.config.maxMetrics) {
      this.analytics.metrics = this.analytics.metrics.slice(-this.config.maxMetrics)
    }

    // Log to console in development
    if (this.config.enableConsoleLogging) {
      this.logMetricToConsole(enhancedMetric)
    }

    // Store in localStorage for debugging
    if (this.config.enableLocalStorage) {
      this.storeMetricLocally(enhancedMetric)
    }

    // Report to analytics endpoint
    if (this.config.enableReporting && this.config.reportingEndpoint) {
      this.reportMetric(enhancedMetric)
    }
  }

  private calculateScore(name: PerformanceMetricName, value: number): PerformanceScore {
    const thresholds = PERFORMANCE_THRESHOLDS[name]
    if (!thresholds) return 'poor'

    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  private getConnectionType(): string | undefined {
    return (navigator as any).connection?.effectiveType
  }

  private getDeviceMemory(): number | undefined {
    return (navigator as any).deviceMemory
  }

  private isFirstVisit(): boolean {
    return !localStorage.getItem('performance_visited')
  }

  private monitorPagePerformance(): void {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime
      this.analytics.pageLoadTime = loadTime

      // Mark first visit
      if (this.isFirstVisit()) {
        localStorage.setItem('performance_visited', '1')
      }
    })

    // DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.analytics.renderTime = performance.now() - this.startTime
      })
    } else {
      this.analytics.renderTime = performance.now() - this.startTime
    }
  }

  private monitorResourceLoading(): void {
    // Monitor resource loading times
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      resources.forEach(resource => {
        if (resource.name && resource.duration > 0) {
          const resourceName = this.getResourceName(resource.name)
          this.analytics.resourceLoadTimes[resourceName] = resource.duration
        }
      })
    })
  }

  private getResourceName(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const segments = pathname.split('/')
      return segments[segments.length - 1] || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private monitorUserInteractions(): void {
    const interactionStart = performance.now()
    
    // First meaningful interaction
    const events = ['click', 'keydown', 'scroll', 'touchstart']
    const handleFirstInteraction = () => {
      this.analytics.interactionTime = performance.now() - interactionStart
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }

    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true })
    })
  }

  private monitorErrors(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.analytics.errors.push(`JS Error: ${event.message} at ${event.filename}:${event.lineno}`)
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.analytics.errors.push(`Unhandled Promise Rejection: ${event.reason}`)
    })

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement
        this.analytics.errors.push(`Resource Error: Failed to load ${target.tagName}`)
      }
    }, true)
  }

  private logMetricToConsole(metric: EnhancedMetric): void {
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.score === 'good' ? '🟢' : metric.score === 'needs-improvement' ? '🟡' : '🔴'
      // eslint-disable-next-line no-console
      console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.score})`)
    }
  }

  private storeMetricLocally(metric: EnhancedMetric): void {
    try {
      const stored = localStorage.getItem('performance_metrics')
      const metrics = stored ? JSON.parse(stored) : []
      metrics.push({
        name: metric.name,
        value: metric.value,
        score: metric.score,
        timestamp: metric.timestamp,
        url: metric.url
      })
      
      // Keep only last 50 metrics
      if (metrics.length > 50) {
        metrics.splice(0, metrics.length - 50)
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics))
    } catch (error) {

    }
  }

  private async reportMetric(metric: EnhancedMetric): Promise<void> {
    if (!this.config.reportingEndpoint) return

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.analytics.sessionId,
          metric,
          analytics: this.analytics
        })
      })
    } catch (error) {

    }
  }

  // Public methods
  public getAnalytics(): PerformanceAnalytics {
    return { ...this.analytics }
  }

  public getMetricsByName(name: PerformanceMetricName): EnhancedMetric[] {
    return this.analytics.metrics.filter(m => m.name === name)
  }

  public getPerformanceScore(): { overall: PerformanceScore; breakdown: Record<string, PerformanceScore> } {
    const breakdown: Record<string, PerformanceScore> = {}
    const scoreValues = { good: 3, 'needs-improvement': 2, poor: 1 }
    let totalScore = 0
    let metricCount = 0

    // Calculate score for each metric type
    Object.keys(PERFORMANCE_THRESHOLDS).forEach(metricName => {
      const metrics = this.getMetricsByName(metricName as PerformanceMetricName)
      if (metrics.length > 0) {
        const latestMetric = metrics[metrics.length - 1]
        breakdown[metricName] = latestMetric.score
        totalScore += scoreValues[latestMetric.score]
        metricCount++
      }
    })

    // Calculate overall score
    const averageScore = metricCount > 0 ? totalScore / metricCount : 1
    const overall: PerformanceScore = averageScore >= 2.5 ? 'good' : averageScore >= 1.5 ? 'needs-improvement' : 'poor'

    return { overall, breakdown }
  }

  public exportMetrics(): string {
    return JSON.stringify(this.analytics, null, 2)
  }

  public clearMetrics(): void {
    this.analytics.metrics = []
    this.analytics.errors = []
    this.analytics.warnings = []
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('performance_metrics')
    }
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null

export function initializePerformanceMonitoring(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(config)
  }
  return globalPerformanceMonitor
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return globalPerformanceMonitor
}

// React hook for performance monitoring
export function usePerformanceMonitoring(config?: Partial<PerformanceConfig>) {
  if (typeof window === 'undefined') return null
  
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(config)
  }
  
  return globalPerformanceMonitor
}

// Utility functions
export function getStoredMetrics(): any[] {
  try {
    const stored = localStorage.getItem('performance_metrics')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function formatMetricValue(name: string, value: number): string {
  const unit = name === 'CLS' ? '' : 'ms'
  return `${value.toFixed(name === 'CLS' ? 3 : 0)}${unit}`
}

export function getMetricColor(score: PerformanceScore): string {
  switch (score) {
    case 'good': return '#10B981' // green-500
    case 'needs-improvement': return '#F59E0B' // amber-500
    case 'poor': return '#EF4444' // red-500
    default: return '#6B7280' // gray-500
  }
}