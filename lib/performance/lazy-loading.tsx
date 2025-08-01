'use client'

import { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react'
import { cn } from '@/lib/utils'

// Lazy loading wrapper with error boundary
interface LazyComponentProps {
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  className?: string
  retryCount?: number
}

// Custom error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error) => void
  },
  { hasError: boolean; error: Error | null; retryCount: number }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState(state => ({
      hasError: false,
      error: null,
      retryCount: state.retryCount + 1
    }))
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-destructive mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">컴포넌트 로딩 실패</h3>
          <p className="text-muted-foreground mb-4">
            {this.state.error.message || '알 수 없는 오류가 발생했습니다'}
          </p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.state.retryCount > 0 ? (
      <div key={this.state.retryCount}>{this.props.children}</div>
    ) : this.props.children
  }
}

// Default loading skeleton
const DefaultLoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="space-y-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  </div>
)

// Enhanced lazy component wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
): LazyExoticComponent<T> {
  const LazyComponent = lazy(factory)
  
  const WrappedComponent = (props: any) => {
    const {
      fallback = <DefaultLoadingSkeleton className={options.className} />,
      errorFallback,
      className
    } = options

    return (
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} className={cn(className, props.className)} />
        </Suspense>
      </LazyErrorBoundary>
    )
  }

  // Preserve component name for debugging
  WrappedComponent.displayName = `Lazy(${LazyComponent.displayName || 'Component'})`
  
  return WrappedComponent as any
}

// Intersection Observer based lazy loading
interface IntersectionLazyProps extends LazyComponentProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  placeholder?: React.ReactNode
}

export function IntersectionLazy({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  placeholder,
  className
}: IntersectionLazyProps) {
  const [isInView, setIsInView] = React.useState(false)
  const [hasBeenInView, setHasBeenInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setHasBeenInView(true)
          
          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  const shouldRender = triggerOnce ? hasBeenInView : isInView

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (placeholder || <DefaultLoadingSkeleton />)}
    </div>
  )
}

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const scrollElementRef = React.useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Progressive loading for content
interface ProgressiveContentProps {
  children: React.ReactNode
  priority?: 'high' | 'medium' | 'low'
  delay?: number
  className?: string
}

export function ProgressiveContent({
  children,
  priority = 'medium',
  delay,
  className
}: ProgressiveContentProps) {
  const [shouldRender, setShouldRender] = React.useState(false)

  React.useEffect(() => {
    const baseDelay = delay || (
      priority === 'high' ? 0 :
      priority === 'medium' ? 100 :
      300
    )

    const timer = setTimeout(() => {
      setShouldRender(true)
    }, baseDelay)

    return () => clearTimeout(timer)
  }, [priority, delay])

  if (!shouldRender) {
    return <DefaultLoadingSkeleton className={className} />
  }

  return <div className={className}>{children}</div>
}

// Lazy image component
interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  blurDataURL?: string
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '/placeholder.svg',
  blurDataURL,
  priority = false
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = React.useState(priority ? src : placeholder)
  const [isLoaded, setIsLoaded] = React.useState(priority)
  const [isInView, setIsInView] = React.useState(priority)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Intersection observer for lazy loading
  React.useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '50px' }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [priority, isInView])

  // Load actual image when in view
  React.useEffect(() => {
    if (!isInView || isLoaded) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    img.onerror = () => {
      setImageSrc(placeholder)
      setIsLoaded(true)
    }
    img.src = src
  }, [isInView, src, placeholder, isLoaded])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-70',
        className
      )}
      style={{
        filter: !isLoaded && blurDataURL ? 'blur(10px)' : 'none',
        backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    />
  )
}

// Bundle splitting utilities
export const LazyComponents = {
  // Admin components (loaded only for admin users)
  AdminDashboard: createLazyComponent(() => import('@/app/admin/page')),
  AdminUserManagement: createLazyComponent(() => import('@/components/admin/user-management')),
  
  // AI Vision components (loaded only when needed)
  CalligraphyAnalyzer: createLazyComponent(() => import('@/components/ai-vision/CalligraphyAnalyzer')),
  AnalysisHistory: createLazyComponent(() => import('@/components/ai-vision/AnalysisHistory')),
  
  // Cultural Exchange components
  ProgramDetails: createLazyComponent(() => import('@/components/cultural/ProgramDetails')),
  ApplicationForm: createLazyComponent(() => import('@/components/cultural/ApplicationForm')),
  
  // Heavy UI components
  ImageGallery: createLazyComponent(() => import('@/components/gallery/ImageGallery')),
  VideoPlayer: createLazyComponent(() => import('@/components/media/VideoPlayer')),
  ChartComponents: createLazyComponent(() => import('@/components/charts/Charts')),
  
  // Third-party integrations
  MapComponent: createLazyComponent(() => import('@/components/maps/Map')),
  PaymentForm: createLazyComponent(() => import('@/components/payment/PaymentForm')),
}

export default LazyComponents