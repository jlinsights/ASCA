import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { RecommendedView } from './_components/recommended-view'
import '@/components/apply/apply.css'

/**
 * 추천·초대작가 신청. 배점·요건·심사 절차는 /membership 과 같은 데이터(membership-data.ts)를 쓴다 —
 * 예전엔 이 페이지만 "10~14점 → 추천작가" 처럼 점수로 자동 승급되는 듯 적고, 규정에 없는 '공모작가' 등급과
 * '재심 청구' 절차를 따로 들고 있었다.
 */

const DESCRIPTION =
  '추천작가·초대작가 승급과 특별선임을 온라인으로 신청하세요. 대한민국 동양서예대전 입상 배점, 점수와 별개로 갖춰야 하는 필수 요건, 자격심사위원회 심사 절차, 비회원 특별선임 비용을 규정 원문과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '추천·초대작가 신청 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '추천·초대작가 신청 | 동양서예협회', description: DESCRIPTION },
}

export default function RecommendedInvitedCalligrapherPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <RecommendedView />
      <LayoutFooter />
    </div>
  )
}
