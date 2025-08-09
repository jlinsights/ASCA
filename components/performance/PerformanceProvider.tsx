'use client'

import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/lib/performance/web-vitals'

interface PerformanceProviderProps {
  children: React.ReactNode
  config?: {
    enableReporting?: boolean
    enableConsoleLogging?: boolean
    sampleRate?: number
  }
}

export default function PerformanceProvider({ 
  children, 
  config = {} 
}: PerformanceProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring only on client side
    if (typeof window !== 'undefined') {
      const defaultConfig = {
        enableReporting: process.env.NODE_ENV === 'production',
        enableConsoleLogging: process.env.NODE_ENV === 'development',
        enableLocalStorage: true,
        sampleRate: 1.0,
        ...config
      }

      try {
        initializePerformanceMonitoring(defaultConfig)
      } catch (error) {

      }
    }
  }, [config])

  return <>{children}</>
}