import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

const DESCRIPTION =
  '1997년부터 동양서예협회가 열어 온 전시의 기록입니다. 대한민국 동양서예대전을 비롯한 협회 전시의 기간과 장소를 연혁에서 모아 보여 줍니다.'

export const metadata: Metadata = {
  title: '지난 전시 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/exhibitions/past' },
  openGraph: {
    title: '지난 전시 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

// 협회 연혁 기록(app/history/_data/history-events.ts)에서 만든 목록 — 예시 전시를 쓰지 않는다
export default function PastExhibitionsPage() {
  return <ExhibitionRecordsPage variant='past' />
}
