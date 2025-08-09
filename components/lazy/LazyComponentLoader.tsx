'use client'

import React, { Suspense, lazy, ComponentType, ReactElement } from 'react'
import { cn } from '@/lib/utils'

// ===============================
// Types and Interfaces
// ===============================

interface LazyComponentLoaderProps {
  children: ReactElement
  fallback?: ReactElement
  className?: string
  errorBoundary?: boolean
}

interface LazyLoadConfig {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactElement
  errorComponent?: ComponentType<{ error: Error; retry: () => void }>
}

// ===============================
// Default Components
// ===============================

const DefaultFallback = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scholar-red"></div>
    <span className="ml-3 text-sm text-muted-foreground">컴포넌트를 불러오는 중...</span>
  </div>
)

const DefaultErrorComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5">
    <p className="text-sm text-destructive mb-4">컴포넌트를 불러올 수 없습니다.</p>
    <p className="text-xs text-muted-foreground mb-4">{error.message}</p>
    <button 
      onClick={retry}
      className="px-4 py-2 text-sm bg-background border border-border rounded-md hover:bg-muted"
    >
      다시 시도
    </button>
  </div>
)

// ===============================
// Error Boundary for Lazy Components
// ===============================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class LazyErrorBoundary extends React.Component<
  React.PropsWithChildren<{ 
    fallback?: ComponentType<{ error: Error; retry: () => void }>
    onRetry?: () => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ 
    fallback?: ComponentType<{ error: Error; retry: () => void }>
    onRetry?: () => void
  }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {

  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onRetry?.()
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.fallback || DefaultErrorComponent
      return <ErrorComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// ===============================
// Lazy Component Loader
// ===============================

export function LazyComponentLoader({ 
  children, 
  fallback, 
  className,
  errorBoundary = true 
}: LazyComponentLoaderProps) {
  const suspenseWrapper = (
    <Suspense fallback={fallback || <DefaultFallback className={className} />}>
      {children}
    </Suspense>
  )

  if (errorBoundary) {
    return (
      <LazyErrorBoundary>
        {suspenseWrapper}
      </LazyErrorBoundary>
    )
  }

  return suspenseWrapper
}

// ===============================
// Lazy Load Hook
// ===============================

export function useLazyComponent<T = any>(config: LazyLoadConfig) {
  const LazyComponent = lazy(config.component)
  
  return function LazyWrapper(props: T) {
    return (
      <LazyComponentLoader 
        fallback={config.fallback}
        errorBoundary={true}
      >
        <LazyComponent {...props} />
      </LazyComponentLoader>
    )
  }
}

// ===============================
// Pre-defined Lazy Loaders for Common Components
// ===============================

// 갤러리 관련 대형 컴포넌트들
export const LazyAdvancedGallerySearch = lazy(() => 
  import('@/components/gallery/AdvancedGallerySearch').catch(err => {

    return { default: () => <div>갤러리 검색을 불러올 수 없습니다.</div> }
  })
)

export const LazyZoomableImageViewer = lazy(() => 
  import('@/components/gallery/ZoomableImageViewer').catch(err => {

    return { default: () => <div>이미지 뷰어를 불러올 수 없습니다.</div> }
  })
)

export const LazyGalleryManagementDashboard = lazy(() => 
  import('@/components/gallery/GalleryManagementDashboard').catch(err => {

    return { default: () => <div>갤러리 관리 대시보드를 불러올 수 없습니다.</div> }
  })
)

export const LazyStrokeAnimationPlayer = lazy(() => 
  import('@/components/gallery/StrokeAnimationPlayer').catch(err => {

    return { default: () => <div>스트로크 애니메이션을 불러올 수 없습니다.</div> }
  })
)

export const LazyArtworkComparison = lazy(() => 
  import('@/components/gallery/ArtworkComparison').catch(err => {

    return { default: () => <div>작품 비교 도구를 불러올 수 없습니다.</div> }
  })
)

// 문화 관련 대형 컴포넌트들
export const LazyCulturalAccessibility = lazy(() => 
  import('@/components/cultural/CulturalAccessibility').catch(err => {

    return { default: () => <div>문화 접근성 도구를 불러올 수 없습니다.</div> }
  })
)

export const LazyCulturalCalendar = lazy(() => 
  import('@/components/cultural/CulturalCalendar').catch(err => {

    return { default: () => <div>문화 캘린더를 불러올 수 없습니다.</div> }
  })
)

export const LazyLearningHub = lazy(() => 
  import('@/components/cultural/LearningHub').catch(err => {

    return { default: () => <div>학습 허브를 불러올 수 없습니다.</div> }
  })
)

// ===============================
// Batch Lazy Loading for Multiple Components
// ===============================

export const LazyComponentBundle = {
  Gallery: {
    AdvancedSearch: LazyAdvancedGallerySearch,
    ZoomableViewer: LazyZoomableImageViewer,
    ManagementDashboard: LazyGalleryManagementDashboard,
    StrokePlayer: LazyStrokeAnimationPlayer,
    ArtworkComparison: LazyArtworkComparison,
  },
  Cultural: {
    Accessibility: LazyCulturalAccessibility,
    Calendar: LazyCulturalCalendar,
    LearningHub: LazyLearningHub,
  }
}

// ===============================
// Export all
// ===============================

export {
  DefaultFallback,
  DefaultErrorComponent,
  LazyErrorBoundary
}