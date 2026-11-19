import type { Language } from '@/lib/i18n/types'
import { CONTEST_23 } from '@/app/contests/_components/contest-23-data'
import type { HistoryEvent } from '@/app/history/_data/history-events'
import { localizeHistoryEvent } from '@/app/history/_data/history-i18n'
import { exhibitionEvents } from './planned-exhibitions'

export type ExhibitionStatus = 'current' | 'upcoming' | 'past'
export type ExhibitionSource = 'association' | 'external'

export interface ExhibitionListing {
  id: string
  title: string
  subtitle?: string
  venue?: string
  date: string
  year: number
  source: ExhibitionSource
  organizer?: string
  status: ExhibitionStatus
  paidPromotion: boolean
  online: boolean
  poster?: string
  href?: string
  sortDate: string
}

export interface ExhibitionPromotion {
  id: string
  publication: 'draft' | 'approved'
  publishFrom: string
  publishUntil: string
  startDate: string
  endDate: string
  paidPromotion: boolean
  online?: boolean
  poster?: string
  href?: string
  copy: Record<Language, { title: string; subtitle?: string; venue: string; organizer: string }>
}

// 사무국이 자료·공개 권한·계약을 확인한 실제 전시만 추가한다. 예시 전시는 공개하지 않는다.
// 현재 승인된 외부 홍보 자료는 제공되지 않았다. 결제만으로 자동 게시하지 않는다.
export const exhibitionPromotions: readonly ExhibitionPromotion[] = []

const POSTERS: Record<string, string> = {
  '2025-6': '/images/business-plan/poster-2025.webp',
  '2024-9': '/images/business-plan/poster-2024.webp',
  '2023-5': '/images/business-plan/poster-2023.webp',
  '2022-7': '/images/business-plan/poster-2022.webp',
  '2021-7': '/images/business-plan/poster-2021.webp',
  '2020-10': '/images/business-plan/poster-2020.webp',
  '2019-7': '/images/business-plan/poster-2019.webp',
}

export function exhibitionToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: string) => parts.find(part => part.type === type)!.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  )
}

function safeHref(value?: string): string | undefined {
  if (!value || /[\s\\]/.test(value)) return undefined
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}

function status(start: string, end: string, today: string): ExhibitionStatus {
  return today < start ? 'upcoming' : today > end ? 'past' : 'current'
}

export function getExhibitionListings(
  language: Language,
  today: string,
  events: readonly HistoryEvent[] = exhibitionEvents(),
  promotions: readonly ExhibitionPromotion[] = exhibitionPromotions
): ExhibitionListing[] {
  const records: ExhibitionListing[] = events
    .filter(event => event.type === 'exhibition')
    .map(source => {
      const event = localizeHistoryEvent(source, language)
      const month = `${source.year}-${String(source.month).padStart(2, '0')}`
      const exact = source.id === `contest-${CONTEST_23.edition}`
      const state = exact
        ? status(CONTEST_23.exhibitionStart, CONTEST_23.exhibitionEnd, today)
        : status(month, month, today.slice(0, 7))
      return {
        id: source.id,
        title: event.title,
        subtitle: event.subtitle,
        venue: event.venue,
        date: event.date ?? String(event.year),
        year: event.year,
        source: 'association',
        status: state,
        paidPromotion: false,
        online: event.online === true,
        poster: POSTERS[source.id],
        href: safeHref(event.href),
        sortDate: exact ? CONTEST_23.exhibitionStart : `${month}-01`,
      }
    })
  const seen = new Set<string>()
  for (const promotion of promotions) {
    if (
      promotion.publication !== 'approved' ||
      !validDate(promotion.publishFrom) ||
      !validDate(promotion.publishUntil) ||
      promotion.publishUntil < promotion.publishFrom ||
      today < promotion.publishFrom ||
      today > promotion.publishUntil ||
      !validDate(promotion.startDate) ||
      !validDate(promotion.endDate) ||
      promotion.endDate < promotion.startDate ||
      seen.has(promotion.id)
    )
      continue
    const copy = promotion.copy[language]
    if (!copy?.title.trim() || !copy.organizer.trim() || !copy.venue.trim()) continue
    seen.add(promotion.id)
    records.push({
      ...copy,
      id: `promotion-${promotion.id}`,
      source: 'external',
      status: status(promotion.startDate, promotion.endDate, today),
      date: `${promotion.startDate} — ${promotion.endDate}`,
      year: Number(promotion.startDate.slice(0, 4)),
      paidPromotion: promotion.paidPromotion,
      online: promotion.online === true,
      poster: safeHref(promotion.poster)?.startsWith('/') ? safeHref(promotion.poster) : undefined,
      href: safeHref(promotion.href),
      sortDate: promotion.startDate,
    })
  }
  return records.toSorted(
    (a, b) => b.sortDate.localeCompare(a.sortDate) || a.id.localeCompare(b.id)
  )
}
