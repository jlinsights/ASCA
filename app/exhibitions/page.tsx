import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { exhibitionToday } from './_data/exhibition-listings'
import { ExhibitionRecordsPage } from './_components/exhibition-records-page'

const DESCRIPTION =
  '동양서예협회와 작가·외부 단체의 전시 정보를 현재·예정·지난 전시로 살펴보고, 전시 홍보·작가 기록·유관업체 광고를 사무국에 상담하세요.'

export const metadata: Metadata = {
  title: '전시 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '전시 | 동양서예협회', description: DESCRIPTION, images: [defaultSEO.image] },
}

// 전시 목록도 하위 페이지(현재·예정·지난·온라인)와 같은 협회 연혁 기록을 쓴다.
// 예전엔 비어 있는 exhibitions 테이블을 읽어 "전시가 없습니다"만 보였다.
export default function ExhibitionsPage() {
  return <ExhibitionRecordsPage variant='all' today={exhibitionToday()} />
}
