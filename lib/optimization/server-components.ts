// Server Components 최적화 분석 도구
export interface PageAnalysis {
  filePath: string
  currentType: 'client' | 'server' | 'mixed'
  canBeServerComponent: boolean
  reasons: string[]
  recommendedChanges: string[]
  clientOnlyFeatures: string[]
  estimatedImprovement: {
    bundleReduction: string
    initialLoadImprovement: string
    seoImprovement: 'low' | 'medium' | 'high'
  }
}

export interface ComponentOptimizationReport {
  totalPages: number
  serverComponentPages: number
  clientComponentPages: number
  optimizablePages: PageAnalysis[]
  totalBundleReduction: string
  estimatedPerformanceGain: string
}

// 클라이언트 전용 기능들
const CLIENT_ONLY_FEATURES = [
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useContext',
  'useReducer',
  'onClick',
  'onSubmit',
  'onChange',
  'onFocus',
  'onBlur',
  'addEventListener',
  'localStorage',
  'sessionStorage',
  'window.',
  'document.',
  'navigator.',
  'IntersectionObserver',
  'MutationObserver',
  'WebSocket',
  'fetch', // 클라이언트에서의 fetch
] as const

// Server Components로 변환 가능한 페이지들 분석
export class ServerComponentAnalyzer {
  // 파일 내용 분석하여 클라이언트 전용 기능 사용 여부 확인
  public analyzeFileContent(filePath: string, content: string): PageAnalysis {
    const hasUseClient = content.includes("'use client'") || content.includes('"use client"')
    const clientFeatures = this.findClientOnlyFeatures(content)
    const canBeServerComponent = !hasUseClient && clientFeatures.length === 0

    const reasons: string[] = []
    const recommendedChanges: string[] = []

    if (hasUseClient) {
      reasons.push("'use client' directive found")
    }

    if (clientFeatures.length > 0) {
      reasons.push(`클라이언트 전용 기능 사용: ${clientFeatures.join(', ')}`)

      // 개선 제안
      if (clientFeatures.includes('useState') || clientFeatures.includes('useEffect')) {
        recommendedChanges.push('상태 관리 로직을 별도 클라이언트 컴포넌트로 분리')
      }

      if (clientFeatures.some(f => f.startsWith('on'))) {
        recommendedChanges.push('이벤트 핸들러가 있는 요소만 클라이언트 컴포넌트로 분리')
      }

      if (clientFeatures.includes('localStorage') || clientFeatures.includes('sessionStorage')) {
        recommendedChanges.push('브라우저 저장소 접근 로직을 useEffect 내부로 이동')
      }
    }

    // 변환 가능한 경우의 개선 제안
    if (canBeServerComponent && hasUseClient) {
      recommendedChanges.push("'use client' 지시문을 제거하여 Server Component로 변환")
    }

    return {
      filePath,
      currentType: hasUseClient ? 'client' : 'server',
      canBeServerComponent,
      reasons,
      recommendedChanges,
      clientOnlyFeatures: clientFeatures,
      estimatedImprovement: this.estimateImprovement(content, canBeServerComponent),
    }
  }

  // 클라이언트 전용 기능 찾기
  private findClientOnlyFeatures(content: string): string[] {
    const found: string[] = []

    for (const feature of CLIENT_ONLY_FEATURES) {
      if (content.includes(feature)) {
        found.push(feature)
      }
    }

    return found
  }

  // 성능 개선 추정
  private estimateImprovement(content: string, canBeServerComponent: boolean) {
    const contentSize = content.length

    if (!canBeServerComponent) {
      return {
        bundleReduction: '0%',
        initialLoadImprovement: '0%',
        seoImprovement: 'low' as const,
      }
    }

    // 컨텐츠 크기와 복잡도에 따른 추정
    let bundleReduction = '5-10%'
    let loadImprovement = '10-15%'
    let seoImprovement: 'low' | 'medium' | 'high' = 'medium'

    if (contentSize > 5000) {
      bundleReduction = '15-25%'
      loadImprovement = '20-30%'
      seoImprovement = 'high'
    } else if (contentSize > 2000) {
      bundleReduction = '10-15%'
      loadImprovement = '15-20%'
      seoImprovement = 'medium'
    }

    // React Hook 사용량에 따른 조정
    const hookMatches = content.match(/use[A-Z]\w*/g) || []
    if (hookMatches.length > 5) {
      bundleReduction = '20-30%'
      loadImprovement = '25-35%'
    }

    return {
      bundleReduction,
      initialLoadImprovement: loadImprovement,
      seoImprovement,
    }
  }

  // 최적화 우선순위 계산
  public calculateOptimizationPriority(analysis: PageAnalysis): number {
    let priority = 0

    // Server Component로 변환 가능하면 높은 우선순위
    if (analysis.canBeServerComponent) priority += 50

    // 현재 클라이언트 컴포넌트인 경우
    if (analysis.currentType === 'client') priority += 30

    // 클라이언트 전용 기능이 적을수록 높은 우선순위
    priority += Math.max(0, 20 - analysis.clientOnlyFeatures.length * 2)

    // SEO 개선 효과에 따른 우선순위
    switch (analysis.estimatedImprovement.seoImprovement) {
      case 'high':
        priority += 30
        break
      case 'medium':
        priority += 20
        break
      case 'low':
        priority += 10
        break
    }

    return priority
  }
}

// 특정 패턴들에 대한 최적화 제안
export const OPTIMIZATION_PATTERNS = {
  // 정적 데이터만 사용하는 페이지
  staticDataOnly: {
    pattern: /^(?!.*use[A-Z])(?!.*on[A-Z]).*$/,
    suggestion: 'Server Component로 변환하여 초기 로딩 성능 향상',
    priority: 'high' as const,
  },

  // 데이터 페칭만 있는 페이지
  dataFetchingOnly: {
    pattern: /fetch|axios|swr|useQuery/,
    suggestion: 'Server에서 데이터를 사전 로드하고 Client Component 부분만 분리',
    priority: 'high' as const,
  },

  // 폼 컴포넌트
  formComponents: {
    pattern: /useState.*form|useForm|onSubmit/,
    suggestion: '폼 UI는 Server Component로, 상호작용 로직만 Client Component로 분리',
    priority: 'medium' as const,
  },

  // 레이아웃 컴포넌트
  layoutComponents: {
    pattern: /header|footer|nav|sidebar/i,
    suggestion: '정적 레이아웃 부분은 Server Component로, 동적 기능만 Client Component로 분리',
    priority: 'medium' as const,
  },
} as const

// 전체 프로젝트 분석 리포트 생성
export function generateOptimizationReport(analyses: PageAnalysis[]): ComponentOptimizationReport {
  const serverComponentPages = analyses.filter(a => a.currentType === 'server').length
  const clientComponentPages = analyses.filter(a => a.currentType === 'client').length
  const optimizablePages = analyses.filter(
    a => a.canBeServerComponent && a.currentType === 'client'
  )

  // 전체 번들 크기 절약 추정
  const totalBundleReduction =
    optimizablePages.length > 0 ? `${Math.round(optimizablePages.length * 15)}% (예상)` : '0%'

  // 전체 성능 향상 추정
  const estimatedPerformanceGain =
    optimizablePages.length > 0
      ? `초기 로딩 ${Math.round(optimizablePages.length * 20)}% 향상 (예상)`
      : '현재 최적화 완료'

  return {
    totalPages: analyses.length,
    serverComponentPages,
    clientComponentPages,
    optimizablePages,
    totalBundleReduction,
    estimatedPerformanceGain,
  }
}

// 최적화 제안 출력 (개발 환경용)
export function logOptimizationSuggestions(report: ComponentOptimizationReport) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // eslint-disable-next-line no-console
  console.group('🚀 Server Components 최적화 리포트')

  // eslint-disable-next-line no-console

  // eslint-disable-next-line no-console

  // eslint-disable-next-line no-console

  // eslint-disable-next-line no-console

  if (report.optimizablePages.length > 0) {
    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console

    report.optimizablePages.forEach(page => {
      // eslint-disable-next-line no-console

      page.recommendedChanges.forEach(change => {
        // eslint-disable-next-line no-console
      })
    })

    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console
  } else {
    // eslint-disable-next-line no-console
    // eslint-disable-next-line no-console
  }

  // eslint-disable-next-line no-console
  console.groupEnd()
}
