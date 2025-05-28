import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import Script from "next/script"
import { Analytics } from "../components/analytics"
import { ExternalScripts } from "../components/external-scripts"
import { StructuredData } from "../components/structured-data"
import { CalComFloating } from "../components/cal-com-floating"

// 폰트 최적화: 필요한 서브셋만 로드
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
})

export const metadata: Metadata = {
  metadataBase: new URL('https://familyoffices.vip'),
  
  // 기본 메타데이터 - 중소중견기업 대표 타겟팅
  title: {
    default: "FamilyOffice S | 중소중견기업 법인 대표 전용 자산관리",
    template: "%s | FamilyOffice S"
  },
  description: "비상장기업, 기술기업, 제조업 등 다양한 업종 법인 대표를 위한 프리미엄 자산관리. 정책자금부터 단체보험, 경영인정기보험, 중대재해처벌법 대응까지 5조원+ 관리 실적의 FamilyOffice S",
  
  // 키워드 - 중소중견기업 대표 타겟팅
  keywords: [
    "비상장기업 자산관리", "비상장기업 대표 재무설계", "매출 50억~300억 비상장기업", "비상장 중견기업 대표 자산관리", 
    "비상장 기업 오너 자산관리", "비상장기업 오너 재무관리", "비상장 중견기업 자금운용", "비상장기업 대표 상속설계",
    "비상장기업 CEO 자산관리", "비상장기업 재무상담", "비상장 중견기업 오너 자산설계", "비상장기업 승계 설계",
    "비상장기업 자금 운용", "비상장 중견기업 대표이사 자산관리", "비상장기업 금융자문", "비상장 중소중견기업 투자자문",
    "기술기업 자산관리", "스타트업 자산관리", "기술력 있는 중소기업", "벤처기업 자산관리", "이노비즈 기업 자산관리",
    "메인비즈 기업 자산관리", "정책자금 활용 자산관리", "벤처인증 기업 재무관리", "ISO 인증 기업 자산관리",
    "기술사업화 자산관리", "R&D 기업 재무설계", "특허 보유 기업 자산관리", "정부지원사업 기업 자산관리",
    "제조업 자산관리", "건설업 자산관리", "화학업 자산관리", "위험업종 자산관리", "산업재해 리스크 관리",
    "법인 단체보험", "기업 리스크 헷지", "제조업 단체보험", "건설업 단체보험", "위험업종 보험설계",
    "산재보험 최적화", "기업 안전관리", "법인보험 포트폴리오", "중소기업 리스크 관리", "제조업 리스크 헷지",
    "경영인정기보험", "CEO 정기보험", "임원진 보험설계", "경영진 생명보험", "법인 임원보험",
    "경영자 보험설계", "핵심인재 보험", "경영진 리스크 관리", "CEO 보장설계", "임원 정기보험",
    "법인명의 건강보험", "기업 건강보험", "법인 의료보험", "임직원 건강보험", "기업 의료 복리후생",
    "법인 단체 의료보험", "회사 건강보험", "기업 의료비 지원", "법인 의료 혜택", "임직원 의료보험",
    "기업재해보장보험", "산업재해보상보험", "근로자재해보상보험", "기업 산재보험", "산재보험 최적화",
    "중대재해처벌법", "중대재해처벌법 대응", "중대재해 예방", "중대재해 보험", "중대재해 리스크 관리",
    "중대재해처벌법 컨설팅", "안전보건관리체계", "경영책임자 처벌 대비", "중대재해 법령 준수", "안전관리 체계",
    "패밀리오피스 요금", "자산관리 수수료", "패밀리오피스 비용", "자산관리 비용", "투자자문 수수료",
    "자산관리 서비스 가격", "패밀리오피스 서비스 요금", "중소중견기업 자산관리 비용", "법인 자산관리 수수료",
    "기업 재무설계 비용", "상속설계 수수료", "세무최적화 비용", "투자자문료", "자산관리료", "재무자문 수수료",
    "패밀리오피스", "비상장기업 자산관리", "상속설계", "재무설계", "투자자문", "세무최적화",
    "비상장 주식 유동성 관리", "비상장기업 개인자산 분리", "비상장 중견기업 리스크관리", "비상장기업 가치평가",
    "비상장기업 세무최적화", "비상장기업 승계 전략", "비상장 중견기업 가치 극대화", "비상장기업 자산 포트폴리오"
  ],
  
  // Open Graph - 중소중견기업 대표 타겟팅
  openGraph: {
    type: "website",
    siteName: "FamilyOffice S",
    title: "FamilyOffice S | 중소중견기업 법인 대표 전용 자산관리",
    description: "비상장기업, 기술기업, 제조업 등 다양한 업종 법인 대표를 위한 프리미엄 자산관리. 중대재해처벌법 대응까지",
    url: "https://familyoffices.vip",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FamilyOffice S - 중소중견기업 법인 대표 전용 자산관리 서비스"
      }
    ],
    locale: "ko_KR"
  },
  
  // Twitter 카드
  twitter: {
    card: "summary_large_image",
    site: "@familyoffices",
    title: "FamilyOffice S | 중소중견기업 법인 대표 전용 자산관리",
    description: "비상장기업, 기술기업, 제조업 등 다양한 업종 법인 대표를 위한 프리미엄 자산관리. 중대재해처벌법 대응까지",
    images: ["/og-image.jpg"]
  },
  
  // 로봇 크롤링 설정
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
  
  // 네이버 특화 메타데이터
  other: {
    // 언어 및 지역 설정
    "locale": "ko_KR",
    
    // 네이버 사이트 검증
    "naver-site-verification": "your-naver-verification-code",
    
    // 네이버 블로그 RSS
    "NaverBot": "All",
    
    // 다음 검색엔진
    "Daumoa": "index,follow",
    
    // 지역 설정
    "geo.region": "KR-11", // 서울
    "geo.country": "KR",
    "geo.placename": "Seoul, South Korea",
    
    // 비즈니스 정보
    "business:contact_data:street_address": "서울특별시 강남구 테헤란로",
    "business:contact_data:locality": "서울",
    "business:contact_data:region": "서울특별시",
    "business:contact_data:postal_code": "06234",
    "business:contact_data:country_name": "대한민국",
    
    // 타겟 고객층 정보
    "business:target_audience": "중소중견기업 법인 대표, 제조업 경영진, 비상장기업 CEO, 기술기업 대표, 위험업종 임원",
    "business:industry": "중소중견기업 자산관리, 제조업 리스크 관리, 경영인정기보험, 중대재해처벌법 대응, 기업재해보장보험",
    
    // 카테고리
    "article:section": "중소중견기업 종합 금융서비스",
    "article:tag": "중소중견기업,제조업,위험업종,경영인정기보험,중대재해처벌법,기업재해보장보험,자산관리,재무설계,리스크헷지"
  },
  
  // canonical URL
  alternates: {
    canonical: "https://familyoffices.vip"
  },
  
  // 앱 정보
  applicationName: "FamilyOffice S",
  
  // 저자 정보
  authors: [
    {
      name: "FamilyOffice S",
      url: "https://familyoffices.vip"
    }
  ],
  
  // 생성자
  creator: "FamilyOffice S",
  publisher: "FamilyOffice S",
  
  // 분류
  category: "중소중견기업 종합 금융서비스",
  
  // 검증 코드들
  verification: {
    google: "your-google-verification-code",
    other: {
      "naver-site-verification": "your-naver-verification-code",
      "msvalidate.01": "your-bing-verification-code"
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 추가 SEO 메타 태그 */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 폰트 최적화 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        

        
        {/* 네이버 블로그 RSS */}
        <link rel="alternate" type="application/rss+xml" title="FamilyOffice S 뉴스" href="/rss.xml" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            
            {/* Cal.com 플로팅 버튼 */}
            <CalComFloating />
            
            {/* 클라이언트 전용 스크립트들 */}
            <StructuredData />
            <ExternalScripts />
            <Analytics />
          </ThemeProvider>
        </ClerkProvider>
        
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MP3HPPMN'}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  )
}
