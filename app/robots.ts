import { MetadataRoute } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /webflow 는 옛 사이트 보관본(옛 주소가 남아 있다). 이미지는 /business-plan 이 쓰므로 지우지 않고 색인만 막는다
      disallow: ['/admin/', '/api/', '/webflow/', '/profile/'],
    },
    sitemap: `${defaultSEO.url}/sitemap.xml`,
  }
}
