'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { trackWebVitals, performanceMonitor } from '@/lib/performance/monitor'

// Web Vitals tracking component
export function WebVitalsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track Web Vitals
    trackWebVitals((metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        // console.log(`${metric.name}: ${metric.value} (${metric.rating})`)
      }

      // Send to analytics service (if configured)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        })
      }
    })

    // Track page navigation
    performanceMonitor.trackCustomMetric(
      'page_navigation',
      Date.now(),
      'timestamp',
      { pathname }
    )

    // Track client-side navigation performance
    const navigationStart = performance.now()
    
    return () => {
      const navigationEnd = performance.now()
      performanceMonitor.trackCustomMetric(
        'client_navigation_time',
        navigationEnd - navigationStart,
        'ms',
        { pathname }
      )
    }
  }, [pathname])

  useEffect(() => {
    // Track resource loading
    const handleLoad = () => {
      performanceMonitor.trackCustomMetric(
        'page_load_complete',
        performance.now(),
        'ms',
        { pathname }
      )
    }

    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [pathname])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      performanceMonitor.flush()
    }
  }, [])

  return null
}

// Performance debug panel (development only)
export function PerformanceDebugPanel() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics().slice(-20)) // Last 20 metrics
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Debug"
      >
        📊
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-xl w-96 max-h-96 overflow-auto">
          <div className="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h3 className="font-semibold text-sm">Performance Metrics</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-3 space-y-2 text-xs">
            {metrics.length === 0 ? (
              <p className="text-gray-500">No metrics collected yet</p>
            ) : (
              metrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-mono">{metric.name}</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {metric.value.toFixed(2)} {metric.unit}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-700">
            <button
              onClick={() => performanceMonitor.flush()}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Send Metrics
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Resource loading tracker
export function ResourceLoadingTracker() {
  useEffect(() => {
    const trackResourceLoading = () => {
      const resources = performance.getEntriesByType('resource')
      
      resources.forEach((resource: any) => {
        if (resource.name.includes('/_next/static/')) {
          performanceMonitor.trackCustomMetric(
            'static_resource_load',
            resource.duration,
            'ms',
            {
              name: resource.name.split('/').pop(),
              size: resource.transferSize || 0,
              type: resource.initiatorType
            }
          )
        }
      })
    }

    // Track initial resources
    if (document.readyState === 'complete') {
      trackResourceLoading()
    } else {
      window.addEventListener('load', trackResourceLoading)
    }

    return () => {
      window.removeEventListener('load', trackResourceLoading)
    }
  }, [])

  return null
}

// Image loading performance tracker
export function useImageLoadingTracker() {
  const trackImageLoad = (src: string, loadTime: number, size?: { width: number; height: number }) => {
    performanceMonitor.trackImageLoad(src, loadTime, size)
  }

  return { trackImageLoad }
}

// API call performance tracker
export function useApiPerformanceTracker() {
  const trackApiCall = async (
    promise: Promise<any>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<any> => {
    const startTime = performance.now()
    
    try {
      const result = await promise
      const endTime = performance.now()
      
      performanceMonitor.trackCustomMetric(
        'api_call_success',
        endTime - startTime,
        'ms',
        { endpoint, method }
      )
      
      return result
    } catch (error) {
      const endTime = performance.now()
      
      performanceMonitor.trackCustomMetric(
        'api_call_error',
        endTime - startTime,
        'ms',
        { endpoint, method, error: String(error) }
      )
      
      throw error
    }
  }

  return { trackApiCall }
}