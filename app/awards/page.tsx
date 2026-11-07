import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AwardsView } from './_components/awards-view'
import '@/components/apply/apply.css'

const DESCRIPTION =
  '대한민국 동양서예대전의 시상 등급과 상금, 그리고 제1회부터 이어진 역대 대전의 개최 기간과 장소를 규정 원문·협회 연혁과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '수상 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '수상 | 동양서예협회', description: DESCRIPTION },
}

export default function AwardsPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <AwardsView />
      <LayoutFooter />
    </div>
  )
}
