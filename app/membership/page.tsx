import { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { CONSULT_LINKS, MEMBER_TIERS } from './_components/membership-data'
import { MembershipTiers } from './_components/membership-tiers'
import { MembershipPromotion } from './_components/membership-promotion'
import { MembershipSpecial } from './_components/membership-special'
import { MembershipBenefits } from './_components/membership-benefits'
import { MembershipDues } from './_components/membership-dues'
import { MembershipLifetime } from './_components/membership-lifetime'
import { MembershipJoin } from './_components/membership-join'
import './_components/membership.css'

export const metadata: Metadata = {
  title: '회원 안내 | 동양서예협회',
  description:
    '동양서예협회의 회원 등급별 자격 요건, 연회비, 혜택 안내. 청년작가, 일반작가, 추천작가, 초대작가, 임원 등급별 혜택과 가입 방법을 확인하세요.',
  openGraph: {
    title: '회원 안내 | 동양서예협회',
    description:
      '동양서예협회 정회원 가입 안내. 등급별 연회비와 승급 기준, 회원 혜택, 평생회원 제도를 정관과 규정에 따라 확인하세요.',
  },
}

const FEE_RANGE = `${MEMBER_TIERS.at(0)?.annualFee ?? ''} ~ ${MEMBER_TIERS.at(-1)?.annualFee ?? ''}`

export default function MembershipPage() {
  return (
    <div className='asca-mb min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.membership}
        title='회원 안내'
        lede='회원 등급과 연회비, 추천·초대작가 승급 기준과 특별선임, 등급별 혜택과 가입 방법을 협회 정관과 규정에 따라 안내합니다.'
        actions={
          <>
            <Link
              href={CONSULT_LINKS.chat}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
            >
              <MessageCircle className='h-4 w-4' aria-hidden='true' />
              상담 문의
            </Link>
            <Link
              href={CONSULT_LINKS.booking}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
            >
              <CalendarDays className='h-4 w-4' aria-hidden='true' />
              상담 예약
            </Link>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '회원 등급', value: `${MEMBER_TIERS.length}종` },
            { label: '연회비', value: FEE_RANGE },
          ]}
        />
      </PageHero>

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
