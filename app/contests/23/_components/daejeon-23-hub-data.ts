/**
 * 제23회 대전 허브(/contests/23) — 공모요강 전문(/contests)에 없는 것만 둔다: 전시실 구성, 출품 경로 안내,
 * 검색용 행사 구조화 데이터. 날짜·장소는 contest-23-data 의 CONTEST_23 하나에서 읽고, 규칙(자격·출품료·규격)은
 * 다시 적지 않고 /contests 의 해당 절로 잇는다 — 두 곳에 같은 규칙을 두면 한쪽만 고쳐질 때 어긋난다.
 */

import { CONTEST_23 } from '@/app/contests/_components/contest-23-data'
import { regulationHref } from '@/lib/regulations/catalog'
import { defaultSEO } from '@/lib/seo-constants'

export const HUB_PATH = '/contests/23'
export const HUB_TITLE = `제${CONTEST_23.edition}회 대한민국 동양서예대전`

export interface HubLink {
  label: string
  href: string
}

export interface HallItem {
  hall: string
  title: string
  body: string
}

/** 두 전시실 — 이사장 인사말씀(2026-10-30)과 공모요강의 전시실 배정 */
export const HALLS: readonly HallItem[] = [
  {
    hall: '제2전시실',
    title: '공모전',
    body: '다섯 부문의 공모 작품을 심사해 특선·입선 이상을 전시하고 도록에 싣습니다. 새로운 작가를 처음 소개하는 자리입니다.',
  },
  {
    hall: '제1전시실',
    title: '書境(서경) 초대작가전 · 개인전 · 부스전',
    body: '초대작가의 원숙한 필묵과 함께 10점 이상의 개인전, 서예 단체의 부스전을 한 전시실에서 선보입니다.',
  },
]

export interface EntryPath {
  title: string
  who: string
  body: string
  links: readonly HubLink[]
}

/** 출품 경로 — 누가 어디로 내는지만 안내하고, 세부 규칙은 공모요강 절로 보낸다 */
export const ENTRY_PATHS: readonly EntryPath[] = [
  {
    title: '일반 출품',
    who: '대한민국 국민 · 재외동포 · 국내 거주 외국인',
    body: '한글, 한문, 현대서예·캘리그라피, 전각·서각, 문인화·동양화의 다섯 부문 가운데 골라 출품합니다. 연령·학력·경력 제한은 없습니다.',
    links: [
      { label: '자격·부문', href: '/contests#entry' },
      { label: '규격·표장', href: '/contests#specs' },
      { label: '출품료', href: '/contests#fees' },
    ],
  },
  {
    title: '청년부',
    who: '대학 서예 전공자 · 전국대학서예연합 소속·출신 청년작가',
    body: '청년부는 별도 심사 기준을 적용하며, 청년작가 출품료를 따로 둡니다. 대학에서 서예를 공부하는 분의 출품을 권장합니다.',
    links: [
      { label: '자격·부문', href: '/contests#entry' },
      { label: '출품료', href: '/contests#fees' },
    ],
  },
  {
    title: '書境 초대작가전',
    who: '협회 초대작가 · 특별규정에 따른 비회원 작가',
    body: '협회 초대작가는 공모 부문이 아니라 초대작가전으로 출품합니다. 이번 회차 특별규정으로 정회원이 아니어도 실력을 갖춘 작가가 참여할 수 있습니다.',
    links: [
      { label: '출품원서', href: '/application' },
      {
        label: '특별선임 (선임 규정 제11조)',
        href: `${regulationHref('artist-selection')}#a11`,
      },
    ],
  },
]

/** 공모요강의 시상식 시각("14:00 ~ 16:00")에서 시작·끝을 뽑는다 */
function ceremonyTimes(): { start: string; end: string } {
  const match = /(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/.exec(CONTEST_23.ceremonyTime)
  if (!match) throw new Error(`시상식 시각을 읽을 수 없습니다: ${CONTEST_23.ceremonyTime}`)
  return { start: match[1]!, end: match[2]! }
}

const VENUE = {
  '@type': 'Place',
  name: CONTEST_23.venue,
  // 예술의전당 공식 안내(sac.or.kr)의 도로명 주소
  address: {
    '@type': 'PostalAddress',
    streetAddress: '남부순환로 2406',
    addressLocality: '서초구',
    addressRegion: '서울특별시',
    postalCode: '06757',
    addressCountry: 'KR',
  },
} as const

/**
 * 검색 결과의 행사 표시용 ExhibitionEvent. 전시 기간만 행사로 싣고(접수 마감은 행사가 아니다),
 * 개막·시상식은 하위 행사로 둔다. 후원 기관은 승인 확인 전이라 싣지 않는다.
 * 전시 개관 시각은 공모요강에 없어 날짜만 쓴다.
 */
export function buildEventJsonLd() {
  const { start, end } = ceremonyTimes()
  const url = `${defaultSEO.url}${HUB_PATH}`
  const organizer = { '@type': 'Organization', name: CONTEST_23.host, url: defaultSEO.url }
  return {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: `${HUB_TITLE} · 書境 초대작가전`,
    description:
      '예술의전당 서울서예박물관 제1·2전시실에서 공모전과 書境(서경) 초대작가전·개인전·부스전을 함께 엽니다.',
    url,
    image: [`${defaultSEO.url}${defaultSEO.image}`],
    startDate: CONTEST_23.exhibitionStart,
    endDate: CONTEST_23.exhibitionEnd,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: true,
    location: VENUE,
    organizer,
    subEvent: {
      '@type': 'Event',
      name: `${HUB_TITLE} 개막·시상식`,
      startDate: `${CONTEST_23.ceremony}T${start}:00+09:00`,
      endDate: `${CONTEST_23.ceremony}T${end}:00+09:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: VENUE,
      organizer,
    },
  }
}
