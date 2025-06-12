'use client'

import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/lib/monitoring/performance'

export function PerformanceMonitor() {
  useEffect(() => {
    // 성능 모니터링 초기화
    initializePerformanceMonitoring()
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
} 