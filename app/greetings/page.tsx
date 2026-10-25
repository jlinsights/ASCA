import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { GreetingsTabs } from './_components/greetings-tabs'

export const metadata: Metadata = {
  title: '인사말씀 | 동양서예협회',
  description:
    '사단법인 동양서예협회 이사장 임재홍의 인사말씀입니다. 2026년 병오년 새해를 맞아 협회의 비전과 주요 계획을 안내합니다.',
  openGraph: {
    title: '인사말씀 | 동양서예협회',
    description:
      '사단법인 동양서예협회 이사장 임재홍의 인사말씀. 전통과 혁신의 조화로운 구현을 향한 협회의 비전을 소개합니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function GreetingsPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.greetings}
        title='인사말씀'
        lede='사단법인 동양서예협회 이사장의 새해 인사말씀을 전합니다'
      />

      <section className='container py-8 md:py-12'>
        <div className='max-w-3xl mx-auto'>
          <GreetingsTabs />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
