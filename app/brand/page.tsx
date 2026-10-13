import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { BrandGuide } from './_components/brand-guide'
import './brand.css'

export const metadata: Metadata = {
  title: '브랜드 · 스타일 가이드 | 동양서예협회',
  description:
    '사단법인 동양서예협회(東洋書藝協會)의 시각 언어 ASCA Ink System — 공식 명칭, 로고, 남색·금색 팔레트, 글꼴, 말투, 형태 요소, 컴포넌트, 사진 처리 규칙을 안내합니다.',
  openGraph: {
    title: '동양서예협회 브랜드 · 스타일 가이드',
    description:
      '남색과 금색, 선지의 바탕, 낙관의 붉은 인장 — 동양서예협회의 시각 언어 ASCA Ink System 을 소개합니다.',
    images: [{ url: '/logo/asca-logo-navy.png', width: 505, height: 325 }],
  },
}

export default function BrandPage() {
  return (
    <>
      <BrandGuide />
      <LayoutFooter />
    </>
  )
}
