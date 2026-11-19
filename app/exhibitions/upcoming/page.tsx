import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { exhibitionToday } from '../_data/exhibition-listings'
import { ExhibitionRecordsPage } from '../_components/exhibition-records-page'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'

const DESCRIPTION =
  '앞으로 열릴 동양서예협회와 작가·외부 단체의 전시 기간과 장소를 미리 확인하세요. 전시 홍보와 작가 기록 서비스는 소속 협회와 관계없이 사무국에 상담할 수 있습니다.'

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

// 서울 기준 날짜를 고정하고 실제 전시와 홍보 목업을 구분한다.
export default function UpcomingExhibitionsPage() {
  return <ExhibitionRecordsPage variant='upcoming' today={exhibitionToday()} />
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/exhibitions/upcoming', metadata)
