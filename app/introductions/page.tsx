import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { IntroductionsHero } from './_components/introductions-hero'
import { IntroductionsTabs } from './_components/introductions-tabs'

export const metadata: Metadata = {
  title: '소개 | 동양서예협회',
  description:
    '사단법인 동양서예협회(ASCA)는 한국, 중국, 일본을 잇는 동양 서예의 전통을 계승하고 현대적 가치를 창출하는 전문 예술문화기관입니다.',
  openGraph: {
    title: '소개 | Introduction - ASCA',
    description:
      '正法의 계승 발전과 創新의 조화로운 구현. 동양서예협회의 비전과 사명을 소개합니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function IntroductionsPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <IntroductionsHero />

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-3xl mx-auto'>
          <IntroductionsTabs />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
