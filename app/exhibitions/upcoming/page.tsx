import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'

const DESCRIPTION =
  '앞으로 열릴 동양서예협회 전시를 미리 만나보세요. 예정된 전시의 기간과 장소를 협회 연혁 기록에서 모아 안내합니다.'

const metadata: Metadata = {
  title: '다가오는 전시 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/exhibitions/upcoming' },
  openGraph: {
    title: '다가오는 전시 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

// 협회 연혁 기록(app/history/_data/history-events.ts)에서 만든 목록 — 예시 전시를 쓰지 않는다
export default function UpcomingExhibitionsPage() {
  return <ExhibitionRecordsPage variant='upcoming' />
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/exhibitions/upcoming', metadata)
