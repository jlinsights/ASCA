import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${defaultSEO.url}/sitemap.xml`,
  }
}
