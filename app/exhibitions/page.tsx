import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ExhibitionRecordsPage } from './_components/exhibition-records-page'

const DESCRIPTION =
  '대한민국 동양서예대전과 초대작가전 등 동양서예협회가 열어 온 전시를 현재·예정·지난 전시와 온라인 전시로 나누어 안내합니다.'

export const metadata: Metadata = {
  title: '전시 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '전시 | 동양서예협회', description: DESCRIPTION, images: [defaultSEO.image] },
}

// 전시 목록도 하위 페이지(현재·예정·지난·온라인)와 같은 협회 연혁 기록을 쓴다.
// 예전엔 비어 있는 exhibitions 테이블을 읽어 "전시가 없습니다"만 보였다.
export default function ExhibitionsPage() {
  return <ExhibitionRecordsPage variant='all' />
}
