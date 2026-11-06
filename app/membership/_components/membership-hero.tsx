'use client'

import Link from 'next/link'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { CONSULT_LINKS } from './membership-data'
import { useMembershipText } from './use-membership-copy'

/** 회원 안내 머리 — 고른 언어로. 연회비 범위는 번역된 등급표의 첫·끝 금액에서 만든다 */
export function MembershipHero() {
  const { copy, ui } = useMembershipText()
  const feeRange = `${copy.tiers.at(0)?.annualFee ?? ''} ~ ${copy.tiers.at(-1)?.annualFee ?? ''}`

  return (
    <PageHero
      {...PAGE_HERO_MARKS.membership}
      title={ui('heroTitle')}
      lede={ui('heroLede')}
      actions={
        <>
          <Link
            href={CONSULT_LINKS.chat}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
          >
            <MessageCircle className='h-4 w-4' aria-hidden='true' />
            {ui('heroChat')}
          </Link>
          <Link
            href={CONSULT_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
          >
            <CalendarDays className='h-4 w-4' aria-hidden='true' />
            {ui('heroBooking')}
          </Link>
        </>
      }
    >
      <HeroFacts
        facts={[
          {
            label: ui('factTiers'),
            value: ui('factTiersValue').replace('{n}', String(copy.tiers.length)),
          },
          { label: ui('factFee'), value: feeRange },
        ]}
      />
    </PageHero>
  )
}
