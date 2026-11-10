import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { exhibitionToday } from '../_data/exhibition-listings'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'

const DESCRIPTION =
  '지금 관람할 수 있는 동양서예협회와 작가·외부 단체의 전시 정보를 안내합니다. 실제 전시와 구분한 홍보 예시를 살펴보고 사무국에 전시 홍보를 상담할 수 있습니다.'

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

// 서울 기준 날짜를 고정하고 실제 전시와 홍보 목업을 구분한다.
export default function CurrentExhibitionsPage() {
  return <ExhibitionRecordsPage variant='current' today={exhibitionToday()} />
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/exhibitions/current', metadata)
