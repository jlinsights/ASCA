import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { listPublishedEvents } from '@/lib/events/events-data'
import { todayKst } from '@/lib/events/event-view'
import { toEventRow } from './_components/event-rows'
import { EventsView } from './_components/events-view'
import {
  CALENDAR_EVENT_ROW,
  isCalendarEventOpen,
} from './calendar-2027/_components/calendar-2027-data'
import '@/components/apply/apply.css'
import './_components/events.css'

/**
 * 행사 — 다가오는 행사를 크게, 지난 행사는 해마다 묶은 기록으로.
 * 예전엔 브라우저에서 9건씩 읽어 같은 자리표시 사진을 붙인 카드로 보였고, 상세는 모두 오류였다(2026-10-25).
 * 화면 틀은 언어 선택을 따르는 EventsView(클라이언트)가 그리고, 메타데이터는 여기서 한국어로 둔다.
 */

const DESCRIPTION =
  '동양서예협회가 열고 후원한 전시·대회·총회·문화 기행을 날짜순으로 기록합니다. 다가오는 행사의 일정과 장소를 확인하세요.'

export const metadata: Metadata = {
  title: '행사 | 동양서예협회',
  description: DESCRIPTION,
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: { title: '행사 | 동양서예협회', description: DESCRIPTION, images: [defaultSEO.image] },
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
  const upcoming = [
    // DB 행사가 아닌 정적 안내 페이지 — 신청 기간에만 맨 앞에 둔다
    ...(isCalendarEventOpen() ? [CALENDAR_EVENT_ROW] : []),
    // 목록은 최신순 — 다가오는 행사는 가까운 날부터
    ...rows.filter(row => row.phase === 'upcoming' || row.phase === 'ongoing').reverse(),
  ]
  const past = rows.filter(row => row.phase === 'past' || row.phase === 'cancelled')
  const firstYear = past.at(-1)?.year

  return (
    <div className='asca-apply min-h-screen'>
      <EventsView
        upcoming={upcoming}
        past={past}
        total={rows.length}
        firstYear={firstYear}
        initialType={type}
        initialQuery={q?.slice(0, 50)}
      />
      <LayoutFooter />
    </div>
  )
}
