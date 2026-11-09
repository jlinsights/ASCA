import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { exhibitionToday } from '../_data/exhibition-listings'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'

const DESCRIPTION =
  '온라인으로 열린 동양서예협회 전시의 기록입니다. 웹에서 열린 전시의 기간과 내용을 확인하고 온라인 도록과 작가·전시 홍보를 사무국에 상담할 수 있습니다.'

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

// 서울 기준 날짜를 고정하고 실제 전시와 홍보 목업을 구분한다.
export default function OnlineExhibitionsPage() {
  return <ExhibitionRecordsPage variant='online' today={exhibitionToday()} />
}
