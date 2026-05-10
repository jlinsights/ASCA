import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroSection } from '@/components/sections/hero-section'
import { PhilosophySection } from '@/components/sections/philosophy-section'
import { WhatWeDoSection } from '@/components/sections/what-we-do-section'
import { BrandMessageSection } from '@/components/sections/brand-message-section'
import { ClosingCtaSection } from '@/components/sections/closing-cta-section'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'

const FeaturedExhibitionsSection = dynamic(
  () =>
    import('@/components/sections/featured-exhibitions-section').then(
      mod => mod.FeaturedExhibitionsSection
    ),
  { loading: () => <div className='h-96 animate-pulse bg-muted/20' /> }
)

export const metadata: Metadata = {
  title: '사단법인 동양서예협회',
  description:
    '전통 서예의 정법을 계승하고 현대적 창신을 통해 동양서예의 새로운 미래를 열어갑니다. ',
  openGraph: {
    title: '사단법인 동양서예협회',
    description:
      '동양서예협회 공식 홈페이지. 갤러리와 블로그를 통해 협회의 다양한 활동을 만나보세요. ',
    images: ['/logo/Logo & Tagline_white BG.png'],
  },
}

export default function Home() {
  return (
    <div className='min-h-screen bg-transparent'>
      <main className='flex-1'>
        {/* Hero Section */}
        <HeroSection />

        {/* Philosophy Section — brand-rollout D2 */}
        <PhilosophySection />

        {/* What We Do Section — brand-rollout D3 */}
        <WhatWeDoSection />

        {/* Brand Message Section — brand-rollout D4 */}
        <BrandMessageSection />

        {/* Featured Exhibitions Section */}
        <FeaturedExhibitionsSection />

        {/* Closing CTA Section — brand-rollout D5 */}
        <ClosingCtaSection />
      </main>

      <LayoutFooter />
    </div>
  )
}
