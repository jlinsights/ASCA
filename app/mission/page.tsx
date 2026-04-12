import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { MissionTabs } from './_components/mission-tabs'

export const metadata: Metadata = {
  title: '사명 | 동양서예협회',
  description:
    '동양서예협회의 사명, 핵심 가치, 주요 목표를 소개합니다. 통합과 혁신, 전통과 창조, 포용과 소통의 가치로 동양 서예 문화의 새로운 지평을 열어갑니다.',
  openGraph: {
    title: '사명 | Mission - ASCA',
    description:
      '정법(正法)의 계승과 창신(創新)의 조화를 통해 동양 문자예술의 새로운 지평을 열어가는 동양서예협회의 사명입니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function MissionPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Mission
          </p>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-4'>사 명</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            동양서예협회의 사명과 핵심 가치를 소개합니다
          </p>
          <p className='mt-3 text-sm italic text-scholar-red/80'>
            &ldquo;통합과 혁신 · 전통과 창조 · 포용과 소통&rdquo;
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-4xl mx-auto'>
          <MissionTabs />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
