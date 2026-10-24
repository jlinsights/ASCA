import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { REGULATIONS, REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = defaultSEO.url

  // Static routes
  // 공개 페이지. /search·/events 는 옛 CMS 테이블이 비어 있어(ASCA-2026 이관 전) 빈 화면이라 뺀다
  const routes = [
    '',
    '/introductions',
    '/greetings',
    '/mission',
    '/history',
    '/board-members',
    '/business-plan',
    '/partners',
    '/brand',
    '/fairness-transparency-hub',
    '/membership',
    '/fundraising',
    '/academy',
    '/contact',
    '/contests',
    '/awards',
    '/application',
    '/application-for-recommended-invited-calligrapher',
    '/commissioning-application',
    '/forms',
    '/exhibitions/current',
    '/exhibitions/upcoming',
    '/exhibitions/past',
    '/exhibitions/online',
    '/artists',
    '/artworks',
    '/gallery',
    '/blog',
    '/terms-of-service',
    '/privacy-policy',
    '/copyright-policy',
    '/email-refuse',
    '/terms-and-conditions-donations',
    REGULATIONS_BASE_PATH,
    ...REGULATIONS.map(entry => regulationHref(entry.slug)),
  ]

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
