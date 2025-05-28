'use client'

import Script from 'next/script'

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "FamilyOffice S",
  "alternateName": "패밀리오피스 에스",
  "description": "대한민국 상위 1% 초고액자산가를 위한 전문 자산관리 서비스",
  "url": "https://familyoffices.vip",
  "logo": "https://familyoffices.vip/logo.png",
  "image": "https://familyoffices.vip/og-image.jpg",
  "telephone": "+82-2-1234-5678",
  "email": "contact@familyoffices.vip",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "테헤란로 123",
    "addressLocality": "강남구",
    "addressRegion": "서울특별시",
    "postalCode": "06234",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.5665,
    "longitude": 126.9780
  },
  "serviceArea": {
    "@type": "Country",
    "name": "대한민국"
  },
  "serviceType": [
    "자산관리",
    "상속설계", 
    "투자자문",
    "재무설계",
    "세무최적화"
  ],
  "priceRange": "프리미엄",
  "currenciesAccepted": "KRW",
  "paymentAccepted": "현금, 계좌이체",
  "openingHours": "Mo-Fr 09:00-18:00",
  "sameAs": [
    "https://www.linkedin.com/company/familyoffice-s",
    "https://www.youtube.com/familyoffices"
  ],
  "founder": {
    "@type": "Person",
    "name": "FamilyOffice S 창립자"
  },
  "foundingDate": "2008",
  "numberOfEmployees": "50-100",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "250",
    "bestRating": "5"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "김○○"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "3년간 FamilyOffice S와 함께하며 자산이 40% 이상 성장했습니다."
    }
  ]
}

export function StructuredData() {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
} 