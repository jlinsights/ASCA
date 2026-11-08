import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { SITE_FAQ } from '@/lib/content/site-faq'
import { FaqView } from './_components/faq-view'

/**
 * /faq — 자주 묻는 질문 전체. 문답은 lib/content/site-faq.ts 단일 출처
 * (/contact·/fundraising·출품원서 페이지가 같은 항목을 일부 골라 쓴다).
 */

export const metadata: Metadata = {
  title: '자주 묻는 질문 | 동양서예협회',
  description:
    '회원 가입·회비, 공모전 출품·심사, 개인전·부스전·도록, 작가 홈페이지, 강좌, 계정·후원을 질문과 답변으로 안내합니다.',
  alternates: { canonical: '/faq' },
  // openGraph 가 없으면 레이아웃의 기본 제목(ASCA | 사단법인 동양서예협회)으로 공유된다
  openGraph: {
    title: '자주 묻는 질문 | 동양서예협회',
    description:
      '회비·출품·전시·도록·작가 홈페이지·강좌·계정 이용의 궁금한 점을 검색하고 확인하세요.',
    images: [defaultSEO.image],
  },
}

/** 검색 결과의 FAQ 표시용 — 답은 평문 그대로 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SITE_FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function FaqPage() {
  return (
    <>
      <script
        type='application/ld+json'
        // 정적 상수만 직렬화한다. </script> 가 끼어들 수 없게 < 를 이스케이프
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
      <div>
        <FaqView />
      </div>
      <LayoutFooter />
    </>
  )
}
