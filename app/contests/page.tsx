import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ContestsView } from './_components/contests-view'
import '@/components/apply/apply.css'

/**
 * 공모전 — 협회가 여는 공모전은 대한민국 동양서예대전 하나다. 회차 기록은 /awards 와 같은 연혁 데이터를 쓴다.
 * 예전엔 존재하지 않는 contests 테이블을 읽어 "전체 공모전 0 · 접수중 0"만 보였다.
 * 본문은 언어 선택을 따르는 ContestsView(클라이언트)가 그리고, 메타데이터는 여기서 한국어로 둔다.
 */

const DESCRIPTION =
  '제23회 대한민국 동양서예대전 공모요강 — 접수 마감 2027년 1월 31일, 출품 부문·자격·규격·출품료·시상과 역대 대전 기록을 안내합니다.'

export const metadata: Metadata = {
  title: '공모전 | 동양서예협회',
  description: DESCRIPTION,
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: '공모전 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function ContestsPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <ContestsView />
      <LayoutFooter />
    </div>
  )
}
