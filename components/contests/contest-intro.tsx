'use client'

import Link from 'next/link'
import { PenLine, Users } from 'lucide-react'
import { HeroFacts, PageHero, type HeroFact } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { CONTESTS_PAGE_COPY } from '@/app/contests/_components/contests-page-copy'
import { ContestFlipbook } from './contest-flipbook'

interface ContestIntroProps {
  facts: HeroFact[]
}

// 공모요강은 목록 조회와 무관하게 바로 볼 수 있어야 한다.
export function ContestIntro({ facts }: ContestIntroProps) {
  const { language } = useLanguage()
  const { hero } = CONTESTS_PAGE_COPY[language]
  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.contests}
        title={hero.title}
        lede={hero.lede}
        actions={
          <>
            <Link
              href='/application'
              className='inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90'
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              {hero.apply}
            </Link>
            <Link
              href='/commissioning-application'
              className='inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted'
            >
              <Users className='h-4 w-4' aria-hidden='true' />
              {hero.commission}
            </Link>
          </>
        }
      >
        <HeroFacts facts={facts} />
      </PageHero>
      <div className='container py-10 md:py-16'>
        <ContestFlipbook />
      </div>
    </>
  )
}
