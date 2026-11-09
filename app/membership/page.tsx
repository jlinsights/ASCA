import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { MembershipHero } from './_components/membership-hero'
import { MembershipTiers } from './_components/membership-tiers'
import { MembershipPromotion } from './_components/membership-promotion'
import { MembershipSpecial } from './_components/membership-special'
import { MembershipBenefits } from './_components/membership-benefits'
import { MembershipDues } from './_components/membership-dues'
import { MembershipLifetime } from './_components/membership-lifetime'
import { MembershipJoin } from './_components/membership-join'
import './_components/membership.css'

export const metadata: Metadata = {
  alternates: { canonical: '/membership' },
  title: '회원 안내 | 동양서예협회',
  description:
    '동양서예협회의 회원 등급별 자격 요건, 연회비, 혜택 안내. 청년작가, 일반작가, 추천작가, 초대작가, 임원 등급별 혜택과 가입 방법을 확인하세요.',
  openGraph: {
    title: '회원 안내 | 동양서예협회',
    description:
      '동양서예협회 정회원 가입 안내. 등급별 연회비와 승급 기준, 회원 혜택, 평생회원 제도를 정관과 규정에 따라 확인하세요.',
  },
}

export default function MembershipPage() {
  return (
    <div className='asca-mb min-h-screen'>
      <MembershipHero />

      <div className='asca-mb__body'>
        <MembershipTiers />
        <MembershipPromotion />
        <MembershipSpecial />
        <MembershipBenefits />
        <MembershipDues />
        <MembershipLifetime />
        <MembershipJoin />
      </div>

      <LayoutFooter />
    </div>
  )
}
