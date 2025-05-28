import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://familyoffices.vip'
  
  // 기본 페이지들 - 우선순위 높음
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
      keywords: '중소중견기업 법인 대표 전용 자산관리, 제조업 자산관리, 중대재해처벌법 대응, 기업재해보장보험, 위험업종 리스크 관리, 패밀리오피스 요금, 자산관리 수수료, 패밀리오피스 비용'
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      keywords: '중소중견기업 자산관리 서비스, 제조업 재무설계, 중대재해처벌법 컨설팅, 기업재해보장보험 설계, 위험업종 리스크 관리, 자산관리 서비스 가격, 투자자문 수수료, 재무설계 비용'
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      keywords: 'FamilyOffice S 소개, 중소중견기업 전문 패밀리오피스, 제조업 자산관리 전문가, 경영인정기보험 전문 컨설팅, 패밀리오피스 서비스 요금'
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      keywords: '중소중견기업 대표 상담 신청, 제조업 자산관리 상담, 중대재해처벌법 무료 컨설팅, 기업재해보장보험 상담, 자산관리 비용 상담, 패밀리오피스 요금 안내'
    }
  ]

  // 서비스별 상세 페이지들 - 중간 우선순위
  const servicePages = [
    {
      url: `${baseUrl}/services/wealth-management`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      keywords: '기술기업 자산관리, 스타트업 자산포트폴리오, 벤처기업 대표 자산관리, 정책자금 활용 자산관리, R&D 투자 관리'
    },
    {
      url: `${baseUrl}/services/investment-advisory`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      keywords: '기술기업 투자자문, 스타트업 투자전략, 벤처기업 포트폴리오 관리, 기술사업화 투자, 특허 포트폴리오 관리'
    },
    {
      url: `${baseUrl}/services/estate-planning`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      keywords: '기술기업 상속설계, 스타트업 승계 전략, 벤처기업 승계 계획, 기술기업 대표 상속 전략, 이노비즈 승계'
    },
    {
      url: `${baseUrl}/services/tax-optimization`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      keywords: '기술기업 세무최적화, 스타트업 세무 전략, 벤처기업 절세 방안, R&D 세액공제, 정책자금 세무'
    },
    {
      url: `${baseUrl}/services/family-governance`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      keywords: '기술기업 거버넌스, 스타트업 지배구조, 벤처기업 가족헌법, 기술기업 대표 의사결정 구조'
    }
  ]

  // 정보성 페이지들 - 낮은 우선순위
  const informationPages = [
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      keywords: '기술기업 인사이트, 스타트업 자산관리 트렌드, 벤처기업 전략, 기술사업화 동향, 정책자금 활용법'
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      keywords: '기술기업 성공사례, 스타트업 자산관리 사례, 벤처기업 대표 성공 스토리, 이노비즈 메인비즈 사례'
    }
  ]

  return [...staticPages, ...servicePages, ...informationPages]
} 