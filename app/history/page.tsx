import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HistoryHero } from './_components/history-hero'
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
      <HistoryHero />

      <HistoryTimeline />

      <LayoutFooter />
    </div>
  )
}
