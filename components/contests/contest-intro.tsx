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
        lede='다양한 예술 공모전에 도전하고 여러분의 재능을 펼쳐보세요'
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
