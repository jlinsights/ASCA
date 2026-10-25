/**
 * 2027 동양서예 캘린더 증정 행사 — 협회가 낸 안내 플립북(FlipHTML5 gjjr, 2026-10)에서 옮긴 값.
 * 날짜의 요일은 koDate 가 계산한다. 마감이 지나면 홈·행사 목록의 안내가 저절로 내려간다(CALENDAR_2027.closesAt).
 */

import { DONUS_PAYMENT_URL } from '@/app/fundraising/_components/fundraising-data'
import { koDate } from '@/lib/utils/ko-date'
import type { EventRow } from '../../_components/event-rows'

export const CALENDAR_2027 = {
  path: '/events/calendar-2027',
  opens: '2026-10-25',
  closes: '2026-12-15',
  closesTime: '18:00',
  /** 신청 마감 시각(KST) — 이후 홈·목록 안내를 내린다 */
  closesAt: '2026-12-15T18:00:00+09:00',
  earlyBy: '2026-11-15',
  shipFrom: '2026-12-03',
  shipLast: '2026-12-22',
  artist: '소산(小山) 박대성 화백',
  formUrl: 'https://tally.so/r/bZ5pkE',
  payUrl: DONUS_PAYMENT_URL,
  account: { bank: '신한은행', number: '100-028-611714', holder: '사단법인 동양서예협회' },
} as const

/** 안내를 아직 보여 줄지 — 마감 시각 전까지 */
export function isCalendarEventOpen(now: Date = new Date()): boolean {
  return now.getTime() < new Date(CALENDAR_2027.closesAt).getTime()
}

export interface ParticipationWay {
  title: string
  body: string
  href: string
  linkLabel: string
}

/** 참여 방법 — 하나 이상이면 증정 대상 */
export const WAYS: readonly ParticipationWay[] = [
  {
    title: '2027 연회비 납부',
    body: '청년 3만 원 · 일반 5만 원 · 추천작가 8만 원 · 초대작가 10만 원 · 임원 20만 원',
    href: '/membership#mb-dues',
    linkLabel: '회비 안내',
  },
  {
    title: '협회 후원',
    body: '일시 후원 10만 원 이상, 또는 정기 후원 새 약정',
    href: '/fundraising#pay',
    linkLabel: '후원 안내',
  },
  {
    title: '제23회 대전 조기 출품',
    body: '출품신청서와 출품료 납부로 참여 — 작품 접수 마감은 2027년 1월 31일(일) 18:00',
    href: '/contests',
    linkLabel: '공모요강',
  },
  {
    title: '2027 대만 서예·문화 기행',
    body: '2027년 4월 7일(수) – 11일(일), 4박 5일 · 선착순 20명 · 1차 분납금 납부로 참여',
    href: '/programs/cultural-exchange#taiwan-trip-flipbook',
    linkLabel: '기행 안내',
  },
]

export interface GiftTier {
  tier: string
  condition: string
  gift: string
  lead?: boolean
}

export const GIFT_TIERS: readonly GiftTier[] = [
  { tier: '기본', condition: '참여 방법 1가지', gift: '탁상형 캘린더 1부' },
  { tier: '상향 1', condition: '참여 방법 2가지', gift: '탁상형 캘린더 2부' },
  {
    tier: '상향 2',
    condition: '대만 기행 참가, 일시 후원 30만 원 이상, 또는 참여 방법 3가지',
    gift: '족자형 캘린더 1부',
  },
  {
    tier: '최상',
    condition: '참여 방법 4가지 모두, 또는 일시 후원 100만 원 이상',
    gift: '족자형 + 탁상형 세트 · 「2027 동양서예 후원회원」 인증서',
    lead: true,
  },
]

export const STEPS: readonly { title: string; body: string }[] = [
  { title: '납부·신청', body: '참여 방법에 맞게 회비·후원금·출품료·분납금을 납부합니다.' },
  { title: '온라인 신청서', body: '받는 분과 배송지를 적는 신청서를 작성합니다(약 3분).' },
  { title: '입금 확인', body: '사무국이 납부를 확인하고 문자로 알려 드립니다.' },
  { title: '발송', body: '우편으로 보내 드립니다. 조기 참여자부터 먼저 발송합니다.' },
]

export const FAQ: readonly { q: string; a: string }[] = [
  { q: '회원이 아니어도 참여할 수 있나요?', a: '네. 회원이 아니어도 참여할 수 있습니다.' },
  { q: '해외로도 보내 주나요?', a: '국내 배송만 합니다.' },
  {
    q: '제출한 신청서를 고치고 싶어요.',
    a: '신청서는 다시 내지 마시고 사무국에 연락해 주세요.',
  },
  {
    q: '받은 캘린더가 파손됐어요.',
    a: '받은 날부터 7일 안에 사무국에 알려 주세요.',
  },
  {
    q: '대만 기행이 취소되면 어떻게 되나요?',
    a: '기행이 취소되면 1차 분납금은 전액 돌려드립니다.',
  },
  {
    q: '원하는 형태의 캘린더가 없으면요?',
    a: '재고에 따라 다른 구성으로 바뀔 수 있습니다.',
  },
]

/** 행사 목록 '다가오는 행사'에 신청 기간 동안 맨 앞에 두는 줄 — 날짜 칸은 신청 마감일 */
export const CALENDAR_EVENT_ROW: EventRow = {
  id: 'calendar-2027',
  href: CALENDAR_2027.path,
  title: '2027 동양서예 캘린더 증정 행사',
  summary: `${CALENDAR_2027.artist}의 2027 캘린더를 드립니다. 연회비·후원·대전 조기 출품·대만 기행 가운데 하나 이상 참여하면 신청할 수 있습니다.`,
  type: 'other',
  typeLabel: '증정 행사 · 신청 마감일',
  phase: 'ongoing',
  year: 2026,
  monthDay: '12.15',
  month: 12,
  day: 15,
  period: `신청 ${koDate(CALENDAR_2027.opens)} – ${koDate(CALENDAR_2027.closes, false)} ${CALENDAR_2027.closesTime}`,
  place: `우편 발송 · ${koDate(CALENDAR_2027.shipFrom, false)}부터`,
  organizer: '사단법인 동양서예협회',
  link: null,
}
