import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HistoryTimeline } from './_components/history-timeline'

export const metadata: Metadata = {
  title: '연혁 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 연혁을 소개합니다. 1997년 한·중·일 서예문화교류연합회전을 시작으로 현재까지의 주요 활동과 전시 이력을 확인하실 수 있습니다.',
  openGraph: {
    title: '연혁 | 동양서예협회',
    description: '1997년부터 이어온 동양서예협회의 역사와 주요 활동을 소개합니다.',
  },
}

export default function HistoryPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            History
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>연 혁</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            1997년 韓·中·日 書藝文化交流聯合會展을 시작으로, 동양서예의 전통을 계승하고 발전시켜 온
            협회의 발자취를 소개합니다.
          </p>
        </div>
      </section>

      <HistoryTimeline />

      <LayoutFooter />
    </div>
  )
}
