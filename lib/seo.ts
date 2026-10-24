import { Metadata } from 'next'
import { defaultSEO } from './seo-constants'
import { SOCIAL_LINKS } from './social-links'
import { HEADQUARTERS } from './content/contact-info'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export { defaultSEO }

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
      siteName: defaultSEO.siteName,
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
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/favicon/favicon.svg',
    },
  }
}

// JSON-LD Generators for AEO
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '동양서예협회',
    alternateName: 'ASCA',
    url: defaultSEO.url,
    logo: `${defaultSEO.url}/logo/Logo & Tagline_black BG.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-502-5550-8700',
      contactType: 'customer service',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: HEADQUARTERS.street,
      addressLocality: HEADQUARTERS.locality,
      addressRegion: HEADQUARTERS.region,
      postalCode: HEADQUARTERS.postalCode,
      addressCountry: 'KR',
    },
    sameAs: SOCIAL_LINKS.map(link => link.href),
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultSEO.siteName,
    url: defaultSEO.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultSEO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
