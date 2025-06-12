// 간단한 성능 모니터링 유틸리티
export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface PerformanceReport {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  timestamp: number
  url: string
  userAgent: string
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
}

// 성능 모니터링 클래스
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric> = new Map()

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 기본 성능 메트릭 수집
  public collectBasicMetrics(): PerformanceReport | null {
    if (typeof window === 'undefined' || !window.performance) {
      return null
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')

    const memoryUsage = this.getMemoryUsage()
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: firstPaint ? firstPaint.startTime : 0,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...(memoryUsage && { memoryUsage }),
    }
  }

  // 메모리 사용량 수집
  private getMemoryUsage() {
    if (typeof window === 'undefined' || !window.performance) {
      return undefined
    }

    const memory = (performance as any).memory
    if (!memory) return undefined

    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    }
  }

  // 성능 점수 계산 (0-100)
  public calculatePerformanceScore(report: PerformanceReport): number {
    let score = 100

    // 로드 시간 평가 (5초 이하 = 좋음, 10초 이상 = 나쁨)
    if (report.loadTime > 10000) score -= 40
    else if (report.loadTime > 5000) score -= 20
    else if (report.loadTime > 3000) score -= 10

    // DOM 준비 시간 평가
    if (report.domContentLoaded > 3000) score -= 20
    else if (report.domContentLoaded > 1500) score -= 10

    // First Paint 평가
    if (report.firstPaint > 2000) score -= 20
    else if (report.firstPaint > 1000) score -= 10

    // 메모리 사용량 평가
    if (report.memoryUsage) {
      const memoryUsagePercent = (report.memoryUsage.used / report.memoryUsage.limit) * 100
      if (memoryUsagePercent > 80) score -= 20
      else if (memoryUsagePercent > 60) score -= 10
    }

    return Math.max(0, score)
  }

  // 성능 리포트를 콘솔에 출력 (개발 환경만)
  public logPerformanceReport() {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const report = this.collectBasicMetrics()
    if (!report) return

    const score = this.calculatePerformanceScore(report)
    
    // eslint-disable-next-line no-console
    console.group('🚀 성능 리포트')
    // eslint-disable-next-line no-console
    console.log('📊 성능 점수:', `${score}/100`)
    // eslint-disable-next-line no-console
    console.log('⏱️ 로드 시간:', `${(report.loadTime / 1000).toFixed(2)}초`)
    // eslint-disable-next-line no-console
    console.log('🎨 First Paint:', `${report.firstPaint.toFixed(2)}ms`)
    // eslint-disable-next-line no-console
    console.log('📄 DOM 준비:', `${(report.domContentLoaded / 1000).toFixed(2)}초`)
    
    if (report.memoryUsage) {
      const memoryMB = (report.memoryUsage.used / 1024 / 1024).toFixed(2)
      // eslint-disable-next-line no-console
      console.log('💾 메모리 사용량:', `${memoryMB}MB`)
    }
    
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

// 번들 크기 분석 유틸리티
export class BundleAnalyzer {
  public static analyzeResources() {
    if (typeof window === 'undefined' || !window.performance) {
      return null
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const jsResources = resources.filter(r => r.name.includes('.js'))
    const cssResources = resources.filter(r => r.name.includes('.css'))
    const imageResources = resources.filter(r => 
      r.name.includes('.jpg') || 
      r.name.includes('.png') || 
      r.name.includes('.webp') || 
      r.name.includes('.svg')
    )

    return {
      totalResources: resources.length,
      jsCount: jsResources.length,
      cssCount: cssResources.length,
      imageCount: imageResources.length,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      jsSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      cssSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      imageSize: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    }
  }

  public static logBundleAnalysis() {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const analysis = this.analyzeResources()
    if (!analysis) return

    // eslint-disable-next-line no-console
    console.group('📦 번들 분석')
    // eslint-disable-next-line no-console
    console.log('📊 총 리소스:', analysis.totalResources)
    // eslint-disable-next-line no-console
    console.log('🟨 JS 파일:', `${analysis.jsCount}개 (${(analysis.jsSize / 1024).toFixed(2)}KB)`)
    // eslint-disable-next-line no-console
    console.log('🟦 CSS 파일:', `${analysis.cssCount}개 (${(analysis.cssSize / 1024).toFixed(2)}KB)`)
    // eslint-disable-next-line no-console
    console.log('🖼️ 이미지:', `${analysis.imageCount}개 (${(analysis.imageSize / 1024).toFixed(2)}KB)`)
    // eslint-disable-next-line no-console
    console.log('📦 총 크기:', `${(analysis.totalSize / 1024).toFixed(2)}KB`)
    // eslint-disable-next-line no-console
    console.groupEnd()
  }
}

// 성능 모니터링 초기화
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return
  }

  const monitor = PerformanceMonitor.getInstance()

  // 페이지 로드 완료 후 성능 분석
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.logPerformanceReport()
      BundleAnalyzer.logBundleAnalysis()
    }, 1000)
  })
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance() 