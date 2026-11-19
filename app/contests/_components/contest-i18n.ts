/**
 * 공모전 화면의 언어별 표기 도구 — 날짜·금액·인원 같은 사실은 한국어 원본(contest-23-data·application-data)에서
 * 한 번만 읽고, 여기서는 그 값을 언어별 꼴로 바꾸기만 한다. 숫자를 네 벌로 다시 적으면 한쪽만 고쳐질 때 어긋난다.
 */

import type { Language } from '@/lib/i18n/types'
import { localizeHistoryVenue } from '@/app/history/_data/history-i18n'
import { CONTACT_LABELS_KO, type ContactLabels } from '@/components/apply/apply-parts'
import { koDate } from '@/lib/utils/ko-date'
import { CONTEST_23 } from './contest-23-data'

export type Foreign = Exclude<Language, 'ko'>
export type Phrase = Record<Foreign, string>

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const WEEKDAYS: Record<Foreign, readonly string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
}

/**
 * '2027-01-31' → ko '2027년 1월 31일(일)' · en 'Sun, Jan 31, 2027' · ja '2027年1月31日(日)' · zh '2027年1月31日(週日)'.
 * 요일은 koDate 처럼 날짜에서 UTC 로 계산한다 — 보는 사람의 시간대에 따라 하루 밀리지 않게.
 */
export function contestDate(iso: string, lang: Language, withYear = true): string {
  if (lang === 'ko') return koDate(iso, withYear)
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number]
  const weekday = WEEKDAYS[lang][new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  if (lang === 'en')
    return `${weekday}, ${EN_MONTHS[month - 1]} ${day}${withYear ? `, ${year}` : ''}`
  return `${withYear ? `${year}年` : ''}${month}月${day}日(${weekday})`
}

/** '5만원' · '상장 및 상금 200만원' → 50000 · 2000000. 만원 단위가 없으면 null */
export function parseManwon(text: string): number | null {
  const match = /(\d+)만원/.exec(text)
  return match ? Number(match[1]) * 10000 : null
}

export function formatWon(amount: number, lang: Foreign): string {
  if (lang === 'en') return `KRW ${new Intl.NumberFormat('en-US').format(amount)}`
  return lang === 'ja' ? `${amount / 10000}万ウォン` : `${amount / 10000}萬韓元`
}

/** 원본 한국어 표의 값이 번역 사전에 없으면 화면에 한국어가 새지 않도록 바로 실패시킨다 */
export function phrase(table: Record<string, Phrase>, ko: string, lang: Foreign): string {
  const found = table[ko]
  if (!found) throw new Error(`공모전 번역 사전에 없는 값입니다: ${ko}`)
  return found[lang]
}

/** 1 → '1st', 23 → '23rd' */
export function ordinal(n: number): string {
  const tens = n % 100
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const suffix = tens >= 11 && tens <= 13 ? 'th' : (suffixes[n % 10] ?? 'th')
  return `${n}${suffix}`
}

/** 회차 표기 — '제23회' · '23rd' · '第23回' */
export const editionLabel = (edition: number, lang: Language): string =>
  lang === 'ko' ? `제${edition}회` : lang === 'en' ? ordinal(edition) : `第${edition}回`

export const contestTitle = (lang: Language): string =>
  ({
    ko: `제${CONTEST_23.edition}회 대한민국 동양서예대전`,
    en: `${ordinal(CONTEST_23.edition)} Korea Oriental Calligraphy Grand Exhibition`,
    // 공식 한자 전시명은 일본어·중국어에서도 그대로 쓴다(연혁 표기와 같음)
    ja: `第${CONTEST_23.edition}回 大韓民國 東洋書藝大展`,
    zh: `第${CONTEST_23.edition}回 大韓民國 東洋書藝大展`,
  })[lang]

export const contestVenue = (lang: Language): string => localizeHistoryVenue(CONTEST_23.venue, lang)

/** 요강의 문장형 값(주최·후원·은행) — 후원은 승인 전이라 '(예정)'을 모든 언어에 남긴다 */
export const CONTEST_FACTS: Record<Foreign, { host: string; sponsors: string; bank: string }> = {
  en: {
    host: 'The Asian Society of Calligraphic Arts',
    sponsors:
      'Ministry of Culture, Sports and Tourism · Seoul Metropolitan Government · Seoul Arts Center · Daehan Geomjeonghoe (pending approval)',
    bank: 'Shinhan Bank',
  },
  ja: {
    host: '社団法人 東洋書芸協会',
    sponsors: '文化体育観光部 · ソウル特別市 · 芸術の殿堂 · 大韓検定会(予定)',
    bank: '新韓銀行',
  },
  zh: {
    host: '社團法人 東洋書藝協會',
    sponsors: '文化體育觀光部 · 首爾特別市 · 藝術殿堂 · 大韓檢定會(預定)',
    bank: '新韓銀行',
  },
}

export const CONTACT_LABELS: Record<Language, ContactLabels> = {
  ko: CONTACT_LABELS_KO,
  en: {
    phone: 'Phone',
    chat: 'Live online chat',
    chatBody: 'Available any time, 365 days a year',
    booking: 'Book a consultation',
    bookingBody: 'Mon–Fri, 10 AM – 5 PM (KST)',
    newWindow: ' (opens in a new window)',
  },
  ja: {
    phone: '電話相談',
    chat: 'リアルタイム オンライン相談',
    chatBody: '年中無休でいつでもお問い合わせいただけます',
    booking: '相談予約',
    bookingBody: '月〜金 午前10時〜午後5時(韓国時間)',
    newWindow: '(新しいウィンドウ)',
  },
  zh: {
    phone: '電話諮詢',
    chat: '即時線上諮詢',
    chatBody: '全年無休，隨時可諮詢',
    booking: '預約諮詢',
    bookingBody: '週一至週五 上午10時至下午5時(韓國時間)',
    newWindow: '(另開新視窗)',
  },
}

export const TOC_LABEL: Record<Language, string> = {
  ko: '이 페이지 바로가기',
  en: 'On this page',
  ja: 'このページの目次',
  zh: '本頁目錄',
}
