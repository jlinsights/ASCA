import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { REGULATIONS, REGULATIONS_BASE_PATH, regulationHref } from '@/lib/regulations/catalog'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = defaultSEO.url

  // Static routes
  const routes = [
    '',
    '/exhibitions',
    '/exhibitions/current',
    '/exhibitions/upcoming',
    '/exhibitions/past',
    '/exhibitions/online',
    '/artworks',
    '/artists',
    '/events',
    '/blog',
    '/gallery',
    '/search',
    '/terms-of-service',
    '/privacy-policy',
    '/copyright-policy',
    '/email-refuse',
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
