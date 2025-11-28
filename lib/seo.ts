import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export const defaultSEO = {
  title: 'ASCA | 사단법인 동양서예협회',
  description: '正法의 계승, 創新의 조화 - 동양서예협회 공식 웹사이트',
  url: 'https://asca.co.kr', // Replace with actual domain
  image: '/images/og-default.jpg', // Ensure this image exists
}

export function constructMetadata({
  title = defaultSEO.title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = 'website',
}: SEOProps = {}): Metadata {
  const fullTitle = title === defaultSEO.title ? title : `${title} | ASCA`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type,
      siteName: 'ASCA',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    metadataBase: new URL(defaultSEO.url),
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
