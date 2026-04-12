import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { BusinessPlanSidebar } from './_components/business-plan-sidebar'
import { Plan2025 } from './_components/plan-2025'
import { YearSection } from './_components/year-section'
import { EXHIBITION_YEARS } from './_components/business-plan-data'

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

  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Business Plans
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>사 업 계 획</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            동양서예협회의 연도별 사업계획과 대한민국 동양서예대전 전시 아카이브를 확인하실 수
            있습니다.
          </p>
          <div className='flex justify-center gap-3 mt-6'>
            <a
              href='https://orientalcalligraphy.channel.io'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md bg-scholar-red px-4 py-2 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
            >
              상담 문의
            </a>
            <a
              href='https://whattime.co.kr/orientalcalligraphy'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md border border-scholar-red/40 px-4 py-2 text-sm font-medium text-scholar-red hover:bg-scholar-red/5 transition-colors'
            >
              상담 예약
            </a>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
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
