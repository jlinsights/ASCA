import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ApplySectionHead } from '@/components/apply/apply-parts'
import { listPublishedEvents } from '@/lib/events/events-data'
import { todayKst } from '@/lib/events/event-view'
import { EventArchive } from './_components/event-archive'
import { toEventRow } from './_components/event-rows'
import { UpcomingEvents } from './_components/upcoming-events'
import '@/components/apply/apply.css'
import './_components/events.css'

/**
 * 행사 — 다가오는 행사를 크게, 지난 행사는 해마다 묶은 기록으로.
 * 예전엔 브라우저에서 9건씩 읽어 같은 자리표시 사진을 붙인 카드로 보였고, 상세는 모두 오류였다(2026-10-25).
 */

const DESCRIPTION =
  '동양서예협회가 열고 후원한 전시·대회·총회·문화 기행을 날짜순으로 기록합니다. 다가오는 행사의 일정과 장소를 확인하세요.'

export const metadata: Metadata = {
  title: '행사 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '행사 | 동양서예협회', description: DESCRIPTION },
}

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const firstParam = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : value?.[0]

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const type = firstParam(params.type)
  const q = firstParam(params.q)
  const today = todayKst()
  const rows = (await listPublishedEvents()).map(event => toEventRow(event, today))
  const upcoming = rows.filter(row => row.phase === 'upcoming' || row.phase === 'ongoing').reverse() // 목록은 최신순 — 다가오는 행사는 가까운 날부터
  const past = rows.filter(row => row.phase === 'past' || row.phase === 'cancelled')
  const firstYear = past.at(-1)?.year

  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.events}
        title='행사'
        lede='협회가 열고 후원한 전시·대회·총회·문화 기행의 기록입니다.'
      >
        <HeroFacts
          facts={[
            { label: '다가오는 행사', value: `${upcoming.length}건` },
            { label: '기록된 행사', value: `${rows.length}건` },
            ...(firstYear ? [{ label: '기록 시작', value: `${firstYear}년` }] : []),
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <section id='upcoming' aria-labelledby='upcoming-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='upcoming-title'
            eyebrow='다가오는 행사'
            title={upcoming.length > 0 ? '곧 열리는 행사' : '예정된 행사'}
          />
          <UpcomingEvents rows={upcoming} />
        </section>

        <section id='archive' aria-labelledby='archive-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='archive-title'
            eyebrow='지난 행사'
            title={firstYear ? `${firstYear}년부터의 기록` : '행사 기록'}
            lede='행사명을 누르면 기간·장소·주최와 소개를 볼 수 있습니다.'
          />
          <EventArchive rows={past} initialType={type} initialQuery={q?.slice(0, 50)} />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}
