// Performance monitoring utilities for ASCA application

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isClient = typeof window !== 'undefined';
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (this.isClient) {
      this.initializeObserver();
      this.trackNavigation();
    }
  }

  // Initialize Performance Observer
  private initializeObserver() {
    if (!this.isClient || !('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'];
      
      entryTypes.forEach(type => {
        try {
          this.observer!.observe({ entryTypes: [type] });
        } catch (e) {
          // Some browsers might not support all entry types
          console.warn(`Performance Observer: ${type} not supported`);
        }
      });
    } catch (error) {
      console.warn('Performance Observer initialization failed:', error);
    }
  }

  // Process performance entries
  private processPerformanceEntry(entry: PerformanceEntry) {
    const timestamp = Date.now();

    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming, timestamp);
        break;
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming, timestamp);
        break;
      case 'largest-contentful-paint':
        this.handleLCPEntry(entry as PerformanceEntry, timestamp);
        break;
      case 'first-input':
        this.handleFIDEntry(entry as PerformanceEntry, timestamp);
        break;
      case 'layout-shift':
        this.handleCLSEntry(entry as PerformanceEntry, timestamp);
        break;
    }
  }

  // Handle navigation timing
  private handleNavigationEntry(entry: PerformanceNavigationTiming, timestamp: number) {
    const metrics = [
      { name: 'dns_lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp_connection', value: entry.connectEnd - entry.connectStart },
      { name: 'tls_handshake', value: entry.connectEnd - entry.secureConnectionStart },
      { name: 'ttfb', value: entry.responseStart - entry.requestStart },
      { name: 'content_download', value: entry.responseEnd - entry.responseStart },
      { name: 'dom_processing', value: entry.domComplete - entry.domLoading },
      { name: 'page_load', value: entry.loadEventEnd - entry.navigationStart },
    ];

    metrics.forEach(metric => {
      if (metric.value >= 0) {
        this.addMetric({
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp,
          metadata: { url: window.location.href }
        });
      }
    });
  }

  // Handle paint timing
  private handlePaintEntry(entry: PerformancePaintTiming, timestamp: number) {
    this.addMetric({
      name: entry.name.replace('-', '_'),
      value: entry.startTime,
      unit: 'ms',
      timestamp,
      metadata: { url: window.location.href }
    });
  }

  // Handle Largest Contentful Paint
  private handleLCPEntry(entry: any, timestamp: number) {
    this.addMetric({
      name: 'largest_contentful_paint',
      value: entry.startTime,
      unit: 'ms',
      timestamp,
      metadata: { 
        url: window.location.href,
        element: entry.element?.tagName || 'unknown'
      }
    });
  }

  // Handle First Input Delay
  private handleFIDEntry(entry: any, timestamp: number) {
    this.addMetric({
      name: 'first_input_delay',
      value: entry.processingStart - entry.startTime,
      unit: 'ms',
      timestamp,
      metadata: { 
        url: window.location.href,
        eventType: entry.name
      }
    });
  }

  // Handle Cumulative Layout Shift
  private handleCLSEntry(entry: any, timestamp: number) {
    if (!entry.hadRecentInput) {
      this.addMetric({
        name: 'cumulative_layout_shift',
        value: entry.value,
        unit: 'score',
        timestamp,
        metadata: { 
          url: window.location.href,
          sources: entry.sources?.map((s: any) => s.node?.tagName).join(',')
        }
      });
    }
  }

  // Track navigation performance
  private trackNavigation() {
    if (!this.isClient) return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.addMetric({
        name: 'page_visibility_change',
        value: document.hidden ? 0 : 1,
        unit: 'boolean',
        timestamp: Date.now(),
        metadata: { 
          url: window.location.href,
          hidden: document.hidden
        }
      });
    });

    // Track unload events
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
  }

  // Add metric to collection
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Auto-send metrics when buffer is full
    if (this.metrics.length >= 50) {
      this.sendMetrics();
    }
  }

  // Send metrics to server
  private async sendMetrics() {
    if (this.metrics.length === 0) return;

    const payload = {
      metrics: [...this.metrics],
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    };

    try {
      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance/metrics', JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch('/api/performance/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(console.warn);
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }

    // Clear sent metrics
    this.metrics = [];
  }

  // Manual metric tracking
  public trackCustomMetric(name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>) {
    this.addMetric({
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    });
  }

  // Track API response times
  public trackApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.addMetric({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        endpoint,
        method,
        status,
        url: window.location.href
      }
    });
  }

  // Track image loading performance
  public trackImageLoad(src: string, loadTime: number, size?: { width: number; height: number }) {
    this.addMetric({
      name: 'image_load_time',
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        src,
        size,
        url: window.location.href
      }
    });
  }

  // Track bundle loading
  public trackBundleLoad(bundleName: string, size: number, loadTime: number) {
    this.addMetric({
      name: 'bundle_load_time',
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        bundleName,
        size,
        url: window.location.href
      }
    });
  }

  // Get current metrics
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Manual send
  public flush(): void {
    this.sendMetrics();
  }

  // Cleanup
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.sendMetrics(); // Send remaining metrics
  }
}

// Web Vitals tracking
export function trackWebVitals(onMetric?: (metric: WebVitalsMetric) => void) {
  if (typeof window === 'undefined') return;

  // Import web-vitals dynamically to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    const handleMetric = (metric: WebVitalsMetric) => {
      // Send to performance monitor
      performanceMonitor.trackCustomMetric(
        metric.name.toLowerCase(),
        metric.value,
        metric.name === 'CLS' ? 'score' : 'ms',
        {
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id
        }
      );

      // Call custom handler
      onMetric?.(metric);
    };

    onCLS(handleMetric);
    onFID(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }).catch(console.warn);
}

// Resource timing analysis
export function analyzeResourceTiming() {
  if (typeof window === 'undefined') return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    size: resource.transferSize || 0,
    duration: resource.duration,
    dns: resource.domainLookupEnd - resource.domainLookupStart,
    tcp: resource.connectEnd - resource.connectStart,
    tls: resource.connectEnd - resource.secureConnectionStart,
    download: resource.responseEnd - resource.responseStart,
    blocked: resource.startTime - resource.fetchStart,
  }));
}

// Memory usage tracking
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return null;

  const memory = (performance as any).memory;
  
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const trackMetric = (name: string, value: number, unit?: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackCustomMetric(name, value, unit, metadata);
  };

  const trackApiCall = (endpoint: string, method: string, duration: number, status: number) => {
    performanceMonitor.trackApiCall(endpoint, method, duration, status);
  };

  const getMetrics = () => performanceMonitor.getMetrics();
  
  const flush = () => performanceMonitor.flush();

  return {
    trackMetric,
    trackApiCall,
    getMetrics,
    flush
  };
}

// Performance budget checker
export interface PerformanceBudget {
  lcp: number; // ms
  fid: number; // ms
  cls: number; // score
  fcp: number; // ms
  ttfb: number; // ms
  bundleSize: number; // bytes
  imageSize: number; // bytes
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800,
  ttfb: 600,
  bundleSize: 500 * 1024, // 500KB
  imageSize: 100 * 1024   // 100KB per image
};

export function checkPerformanceBudget(budget: Partial<PerformanceBudget> = {}): Promise<{ metric: string; value: number; budget: number; passed: boolean }[]> {
  const fullBudget = { ...DEFAULT_PERFORMANCE_BUDGET, ...budget };
  
  return new Promise((resolve) => {
    const results: { metric: string; value: number; budget: number; passed: boolean }[] = [];
    
    // Check Web Vitals
    trackWebVitals((metric) => {
      const budgetKey = metric.name.toLowerCase() as keyof PerformanceBudget;
      const budgetValue = fullBudget[budgetKey];
      
      if (budgetValue !== undefined) {
        results.push({
          metric: metric.name,
          value: metric.value,
          budget: budgetValue,
          passed: metric.value <= budgetValue
        });
      }
      
      // Return results after collecting all metrics
      if (results.length >= 3) { // Expect at least LCP, FID, CLS
        resolve(results);
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(results), 5000);
  });
}