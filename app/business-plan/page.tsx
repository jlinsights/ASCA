import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { BusinessPlanSidebar } from './_components/business-plan-sidebar'
import { Plan2025 } from './_components/plan-2025'
import { YearSection } from './_components/year-section'
import { EXHIBITION_YEARS } from './_components/business-plan-data'
import { BOOKING_URL, CHAT_URL } from '@/lib/content/contact-info'

export const metadata: Metadata = {
  title: '사업계획 | 동양서예협회',
  description:
    '동양서예협회 연도별 사업계획 및 전시 아카이브. 2025년 사업계획서, 대한민국 동양서예대전 역대 전시 기록을 확인하세요.',
  openGraph: {
    title: '사업계획 | Business Plans - 동양서예협회',
    description: '전통과 현대를 잇는 동양미학 예술 플랫폼. 연도별 사업계획 및 전시 아카이브.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function BusinessPlanPage() {
  const pastYears = EXHIBITION_YEARS.filter(e => e.year < 2025)
  const years = EXHIBITION_YEARS.map(e => e.year)
  const firstYear = Math.min(...years)
  const lastYear = Math.max(...years)

  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.businessPlan}
        title='사업계획'
        lede='동양서예협회의 연도별 사업계획과 대한민국 동양서예대전 전시 아카이브를 확인하실 수 있습니다.'
        actions={
          <>
            <Button asChild className='bg-scholar-red text-white hover:bg-scholar-red/90'>
              <a href={CHAT_URL} target='_blank' rel='noopener noreferrer'>
                상담 문의
              </a>
            </Button>
            <Button asChild variant='outline'>
              <a href={BOOKING_URL} target='_blank' rel='noopener noreferrer'>
                상담 예약
              </a>
            </Button>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '수록 기간', value: `${firstYear}–${lastYear}` },
            { label: '전시 기록', value: `${EXHIBITION_YEARS.length}개년` },
          ]}
        />
      </PageHero>

      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <BusinessPlanSidebar />
          <main className='flex-1 min-w-0 space-y-16'>
            <div id='2025'>
              <Plan2025 />
            </div>

            {EXHIBITION_YEARS[0] && (
              <div id='2025-exhibition'>
                <YearSection exhibition={EXHIBITION_YEARS[0]} />
              </div>
            )}

            {pastYears.map(exhibition => (
              <div key={exhibition.year} id={String(exhibition.year)}>
                <YearSection exhibition={exhibition} />
              </div>
            ))}
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
