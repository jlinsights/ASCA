/**
 * 동적 임포트 컴포넌트들
 * 번들 크기 최적화를 위한 지연 로딩 컴포넌트들
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-sm text-muted-foreground">로딩 중...</span>
  </div>
)

// 에러 폴백 컴포넌트
const ErrorFallback = ({ error, retry }: { error?: Error; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-2">❌</div>
    <p className="text-sm text-muted-foreground mb-4">
      컴포넌트를 불러오는 중 오류가 발생했습니다.
    </p>
    {retry && (
      <button 
        onClick={retry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
      >
        다시 시도
      </button>
    )}
  </div>
)

// ==============================================================
// 갤러리 관련 동적 컴포넌트들
// ==============================================================

export const DynamicZoomableImageViewer = dynamic(
  () => import('@/components/gallery/ZoomableImageViewer'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // 클라이언트에서만 로딩
  }
)

export const DynamicGalleryManagementDashboard = dynamic(
  () => import('@/components/gallery/GalleryManagementDashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicArtworkComparison = dynamic(
  () => import('@/components/gallery/ArtworkComparison'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicAdvancedGallerySearch = dynamic(
  () => import('@/components/gallery/AdvancedGallerySearch'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// ==============================================================
// 문화 관련 동적 컴포넌트들
// ==============================================================

export const DynamicCulturalCalendar = dynamic(
  () => import('@/components/cultural/CulturalCalendar'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicCalligraphyHero = dynamic(
  () => import('@/components/cultural/CalligraphyHero'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // 이 컴포넌트는 SEO에 중요할 수 있음
  }
)

export const DynamicCulturalAccessibility = dynamic(
  () => import('@/components/cultural/CulturalAccessibility'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicLearningHub = dynamic(
  () => import('@/components/cultural/LearningHub'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// ==============================================================
// 검색 및 필터 관련 동적 컴포넌트들
// ==============================================================

export const DynamicSearchComponents = dynamic(
  () => import('@/components/search/search-components'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicAdvancedFilters = dynamic(
  () => import('@/components/search/search-components'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// ==============================================================
// 성능 모니터링 관련 동적 컴포넌트들
// ==============================================================

export const DynamicPerformanceDashboard = dynamic(
  () => import('@/components/performance/PerformanceDashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/performance/PerformanceProvider'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// ==============================================================
// 차트 및 시각화 관련 동적 컴포넌트들
// ==============================================================

// TODO: Fix Recharts dynamic import - currently causing TypeScript compilation errors
// export const DynamicRecharts = dynamic(
//   () => import('recharts').then(mod => ({ 
//     default: { 
//       LineChart: mod.LineChart,
//       AreaChart: mod.AreaChart,
//       BarChart: mod.BarChart,
//       PieChart: mod.PieChart,
//       ResponsiveContainer: mod.ResponsiveContainer,
//       XAxis: mod.XAxis,
//       YAxis: mod.YAxis,
//       CartesianGrid: mod.CartesianGrid,
//       Tooltip: mod.Tooltip,
//       Legend: mod.Legend,
//       Line: mod.Line,
//       Area: mod.Area,
//       Bar: mod.Bar,
//       Pie: mod.Pie,
//       Cell: mod.Cell,
//     }
//   })),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// ==============================================================
// UI 컴포넌트 번들링 최적화
// ==============================================================

// Radix UI 컴포넌트들의 동적 로딩 (필요시에만)
// TODO: Fix Dialog dynamic import - currently causing TypeScript compilation errors
// export const DynamicDialog = dynamic(
//   () => import('@radix-ui/react-dialog').then(mod => ({ 
//     default: {
//       Dialog: mod.Dialog,
//       DialogTrigger: mod.DialogTrigger,
//       DialogContent: mod.DialogContent,
//       DialogHeader: mod.DialogHeader,
//       DialogTitle: mod.DialogTitle,
//       DialogDescription: mod.DialogDescription,
//     }
//   })),
//   { ssr: true }
// )

// ==============================================================
// 조건부 로딩 헬퍼
// ==============================================================

export const createConditionalImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  condition: () => boolean
) => {
  if (!condition()) {
    return () => null
  }
  
  return dynamic(importFn, {
    loading: () => <LoadingSpinner />,
    ssr: false,
  })
}

// 사용 예시:
// const ConditionalChart = createConditionalImport(
//   () => import('./Chart'),
//   () => window.innerWidth > 768 // 데스크톱에서만 로딩
// )

// ==============================================================
// 지연 로딩 헬퍼 (교차점 관찰자 사용)
// ==============================================================

export const createIntersectionImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = { threshold: 0.1 }
) => {
  return dynamic(importFn, {
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  })
}

const DynamicComponents = {
  // 갤러리
  ZoomableImageViewer: DynamicZoomableImageViewer,
  GalleryManagementDashboard: DynamicGalleryManagementDashboard,
  ArtworkComparison: DynamicArtworkComparison,
  AdvancedGallerySearch: DynamicAdvancedGallerySearch,
  
  // 문화
  CulturalCalendar: DynamicCulturalCalendar,
  CalligraphyHero: DynamicCalligraphyHero,
  CulturalAccessibility: DynamicCulturalAccessibility,
  LearningHub: DynamicLearningHub,
  
  // 검색
  SearchComponents: DynamicSearchComponents,
  AdvancedFilters: DynamicAdvancedFilters,
  
  // 성능
  PerformanceDashboard: DynamicPerformanceDashboard,
  PerformanceMonitor: DynamicPerformanceMonitor,
  
  // 차트 (commented out due to TypeScript compilation issues)
  // Charts: DynamicRecharts,
}

export default DynamicComponents;