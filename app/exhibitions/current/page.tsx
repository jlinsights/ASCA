import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'

const DESCRIPTION =
  '동양서예협회가 주최하는 현재 진행 중인 전시를 만나보세요. 전시 기간과 장소를 협회 연혁 기록에서 모아 보여 줍니다.'

const metadata: Metadata = {
  title: '현재 전시 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/exhibitions/current' },
  openGraph: {
    title: '현재 전시 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

// 협회 연혁 기록(app/history/_data/history-events.ts)에서 만든 목록 — 예시 전시를 쓰지 않는다
export default function CurrentExhibitionsPage() {
  return <ExhibitionRecordsPage variant='current' />
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/exhibitions/current', metadata)
