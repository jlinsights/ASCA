import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { isCalendarEventOpen } from '@/app/events/calendar-2027/_components/calendar-2027-data'
import { defaultSEO } from '@/lib/seo-constants'
import { CONTEST_23, koDate } from '../_components/contest-23-data'
import { HUB_PATH, HUB_TITLE, buildEventJsonLd } from './_components/daejeon-23-hub-data'
import { Daejeon23HubView } from './_components/daejeon-23-hub-view'
import '@/components/apply/apply.css'
import '@/app/events/_components/events.css'

/**
 * 제23회 대전 허브 — 두 전시실 구성, 출품 경로, 일정, 자주 묻는 질문을 한 화면에 모으고
 * 공모요강 전문(/contests)·출품원서(/application)로 잇는다. 정적 주소라 /contests/[id] 보다 먼저 잡힌다.
 * 본문은 언어 선택을 따르는 Daejeon23HubView(클라이언트), 메타데이터·구조화 데이터는 여기서 한국어로 둔다.
 */

// 캘린더 증정 안내는 신청 마감(12-15 18:00)이 지나면 내린다 — 정적 페이지라 한 시간마다 다시 만든다
export const revalidate = 3600

const DESCRIPTION = `예술의전당 서울서예박물관 제1·2전시실에서 공모전과 書境 초대작가전을 함께 엽니다. 출품 마감 ${koDate(CONTEST_23.deadline)}, 전시 ${koDate(CONTEST_23.exhibitionStart, false)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)}.`

export const metadata: Metadata = {
  title: `${HUB_TITLE} | 동양서예협회`,
  description: DESCRIPTION,
  alternates: { canonical: HUB_PATH },
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: `${HUB_TITLE} | 동양서예협회`,
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function Daejeon23HubPage() {
  const eventJsonLd = buildEventJsonLd()
  return (
    <div className='asca-apply min-h-screen'>
      <script
        type='application/ld+json'
        // 정적 상수만 직렬화한다. </script> 가 끼어들 수 없게 < 를 이스케이프
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c') }}
      />
      <Daejeon23HubView calendarOpen={isCalendarEventOpen()} />

      <LayoutFooter />
    </div>
  )
}
