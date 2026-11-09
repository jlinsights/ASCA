import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { exhibitionToday } from '../_data/exhibition-listings'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

const DESCRIPTION =
  '동양서예협회와 작가·외부 단체의 지난 전시 기록을 살펴보세요. 실제 전시와 홍보 게재 예시를 구분하며 전시 홍보·기록과 유관업체 광고를 사무국에 상담할 수 있습니다.'

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

// 서울 기준 날짜를 고정하고 실제 전시와 홍보 목업을 구분한다.
export default function PastExhibitionsPage() {
  return <ExhibitionRecordsPage variant='past' today={exhibitionToday()} />
}
