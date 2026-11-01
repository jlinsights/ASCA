import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowDown, CalendarClock, Headphones, Phone } from 'lucide-react'
import { BOOKING_URL, KAKAO_CHAT_URL, OFFICE_HOURS, PHONE } from '@/lib/content/contact-info'

/** 규정 조문 링크 — /regulations/<slug>#a<조> */
export interface RegSource {
  label: string
  href: string
}

export const reg = (slug: string, article: string, label: string): RegSource => ({
  label,
  href: `/regulations/${slug}#a${article}`,
})

interface ApplySectionHeadProps {
  id: string
  title: string
  eyebrow?: string
  lede?: ReactNode
}

/** 섹션 머리 — 굵은 먹선 아래 왼쪽 정렬 제목. /academy 와 같은 리듬 */
export function ApplySectionHead({ id, title, eyebrow, lede }: ApplySectionHeadProps) {
  return (
    <header className='asca-apply__head'>
      <div>
        {eyebrow && <p className='asca-apply__eyebrow'>{eyebrow}</p>}
        <h2 id={id} className='asca-apply__title'>
          {title}
        </h2>
      </div>
      {lede && <p className='asca-apply__lede'>{lede}</p>}
    </header>
  )
}

/** 근거 조문 — 페이지에 옮긴 숫자·문구의 원문을 /regulations 해당 조에서 바로 확인하게 잇는다 */
export function RegCite({ sources }: { sources: readonly RegSource[] }) {
  if (sources.length === 0) return null
  return (
    <p className='asca-apply__cite'>
      <span className='asca-apply__cite-label'>근거</span>
      {sources.map((source, index) => (
        <span key={source.href}>
          {index > 0 && <span aria-hidden='true'> · </span>}
          <Link href={source.href}>{source.label}</Link>
        </span>
      ))}
    </p>
  )
}

export interface TocItem {
  href: `#${string}`
  label: string
}

interface ApplyTocProps {
  items: readonly TocItem[]
  /** 번역 화면에서만 넘긴다 — 기본은 한국어 */
  label?: string
}

export function ApplyToc({ items, label = '이 페이지 바로가기' }: ApplyTocProps) {
  return (
    <nav className='asca-apply__toc' aria-label={label}>
      {items.map(item => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export interface DownloadItem {
  type: string
  title: string
  note: string
  href: string
}

/** 내려받는 양식 — 온라인 접수(주) 아래에 놓이는 보조 경로 */
export function DownloadList({ items }: { items: readonly DownloadItem[] }) {
  return (
    <ul className='asca-apply__downloads'>
      {items.map(item => (
        <li key={item.href}>
          <a
            href={item.href}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-apply__download'
          >
            <span className='asca-apply__download-type'>{item.type}</span>
            <span className='asca-apply__download-title'>{item.title}</span>
            <span className='asca-apply__download-note'>
              {item.note}
              <span className='sr-only'> (새 창)</span>
            </span>
            <ArrowDown className='asca-apply__download-icon' aria-hidden='true' />
          </a>
        </li>
      ))}
    </ul>
  )
}

/** 상담 창구 문구 — 번역 화면은 언어별 문구를 넘기고, 넘기지 않으면 한국어 */
export interface ContactLabels {
  phone: string
  chat: string
  chatBody: string
  booking: string
  bookingBody: string
  newWindow: string
}

export const CONTACT_LABELS_KO: ContactLabels = {
  phone: '전화 상담',
  chat: '실시간 온라인 상담',
  chatBody: '1년 365일 언제든 문의 가능',
  booking: '상담 예약',
  bookingBody: OFFICE_HOURS,
  newWindow: ' (새 창)',
}

const contactsFor = (labels: ContactLabels) =>
  [
    { icon: Phone, title: labels.phone, body: PHONE.display, href: PHONE.href, external: false },
    {
      icon: Headphones,
      title: labels.chat,
      body: labels.chatBody,
      href: KAKAO_CHAT_URL,
      external: true,
    },
    {
      icon: CalendarClock,
      title: labels.booking,
      body: labels.bookingBody,
      href: BOOKING_URL,
      external: true,
    },
  ] as const

export function ContactList({ labels = CONTACT_LABELS_KO }: { labels?: ContactLabels }) {
  return (
    <ul className='asca-apply__contacts'>
      {contactsFor(labels).map(contact => (
        <li key={contact.href}>
          <a
            href={contact.href}
            className='asca-apply__contact'
            {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <contact.icon className='asca-apply__contact-icon' aria-hidden='true' />
            <span className='asca-apply__contact-title'>{contact.title}</span>
            <span className='asca-apply__contact-body'>
              {contact.body}
              {contact.external && <span className='sr-only'>{labels.newWindow}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export interface LedgerColumn {
  label: string
  numeric?: boolean
}

export interface LedgerRow {
  cells: readonly string[]
  lead?: boolean
}

interface LedgerTableProps {
  caption: string
  columns: readonly LedgerColumn[]
  rows: readonly LedgerRow[]
}

/** 장부 표 — 첫 열은 행 머리(th), 숫자 열은 오른쪽 정렬 */
export function LedgerTable({ caption, columns, rows }: LedgerTableProps) {
  return (
    <div className='asca-apply__table-wrap'>
      <table className='asca-apply__table'>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.label} scope='col' className={column.numeric ? 'is-num' : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.cells[0]} className={row.lead ? 'is-lead' : undefined}>
              {row.cells.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope='row'>
                    {cell}
                  </th>
                ) : (
                  <td key={index} className={columns[index]?.numeric ? 'is-num' : 'is-sub'}>
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
