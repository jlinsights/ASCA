import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

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
    '/news',
    '/gallery',
    '/search',
    '/terms-of-service',
    '/privacy-policy',
    '/copyright-policy',
    '/email-refuse',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
