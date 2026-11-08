import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

const DESCRIPTION =
  '온라인으로 열린 동양서예협회 전시의 기록입니다. 웹에서 열린 전시의 기간과 내용을 협회 연혁 기록에서 모아 보여 줍니다.'

export const metadata: Metadata = {
  title: '온라인 전시 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/exhibitions/online' },
  openGraph: {
    title: '온라인 전시 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

// 협회 연혁 기록(app/history/_data/history-events.ts)에서 만든 목록 — 예시 전시를 쓰지 않는다
export default function OnlineExhibitionsPage() {
  return <ExhibitionRecordsPage variant='online' />
}
