import Link from 'next/link'
import { PenLine, Users } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ContestFlipbook } from './contest-flipbook'

interface ContestIntroProps {
  /** 공모전 목록을 아직 불러오는 중이면 null → '—' */
  total: number | null
  open: number | null
}

// 공모요강은 목록 조회와 무관하게 바로 볼 수 있어야 한다.
export function ContestIntro({ total, open }: ContestIntroProps) {
  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.contests}
        title='공모전'
        lede='협회가 주최하는 대한민국 동양서예대전의 공모 안내와 출품·수상 정보를 한곳에 모았습니다.'
        actions={
          <>
            <Link
              href='/application'
              className='inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90'
            >
              <PenLine className='h-4 w-4' aria-hidden='true' />
              출품원서 작성
            </Link>
            <Link
              href='/commissioning-application'
              className='inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted'
            >
              <Users className='h-4 w-4' aria-hidden='true' />
              위원 위촉 지원
            </Link>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '전체 공모전', value: total ?? '—' },
            { label: '접수중', value: open ?? '—' },
          ]}
        />
      </PageHero>
      <div className='container mx-auto px-4 py-10 md:py-16'>
        <ContestFlipbook />
      </div>
    </>
  )
}
