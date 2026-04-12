import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { GreetingsTabs } from './_components/greetings-tabs'

export const metadata: Metadata = {
  title: '인사말씀 | 동양서예협회',
  description:
    '사단법인 동양서예협회 이사장 임재홍의 인사말씀입니다. 2026년 병오년 새해를 맞아 협회의 비전과 주요 계획을 안내합니다.',
  openGraph: {
    title: '인사말씀 | Greetings - ASCA',
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
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Greetings from the Chairman
          </p>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-4'>인 사 말 씀</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            사단법인 동양서예협회 이사장의 새해 인사말씀을 전합니다
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-3xl mx-auto'>
          <GreetingsTabs />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
