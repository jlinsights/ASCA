'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/language-context'
import {
  NOTICE_CATEGORIES,
  noticeHref,
  type NoticeCategory,
  type NoticeRow,
} from '@/lib/notices/notice-view'
import { NOTICE_COPY } from './notice-copy'
import { matchesQuery, noticePeriodLabel } from './notice-format'

/**
 * 공지 장부 — 해마다 묶고, 분류 칩과 검색으로 거른다. 거른 상태는 주소(?category=&q=)에 남겨 공유할 수 있게 한다.
 * 공지는 수십 건이라 서버에 다시 묻지 않고 받은 목록 안에서 거른다(행사 기록과 같은 방식).
 */

const ALL = 'all'
type CategoryFilter = NoticeCategory | typeof ALL

interface NoticeArchiveProps {
  rows: readonly NoticeRow[]
  initialCategory?: string
  initialQuery?: string
}

const isCategory = (value: string | undefined): value is NoticeCategory =>
  (NOTICE_CATEGORIES as readonly string[]).includes(value ?? '')

const MAX_QUERY = 50

/** 주소의 분류 값 — 모르는 분류나 공지가 없는 분류는 '전체' */
const toFilter = (rows: readonly NoticeRow[], value: string | undefined): CategoryFilter =>
  isCategory(value) && rows.some(row => row.category === value) ? value : ALL

export function NoticeArchive({ rows, initialCategory, initialQuery = '' }: NoticeArchiveProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const copy = NOTICE_COPY[language]
  const [category, setCategory] = useState<CategoryFilter>(toFilter(rows, initialCategory))
  const [query, setQuery] = useState(initialQuery)

  // 같은 경로에서 주소만 바뀌면(목차의 /notice 링크, 뒤로 가기) 화면이 다시 마운트되지 않는다 —
  // 주소가 바뀐 그 순간에만 거르는 상태를 주소에 맞춘다(입력 중인 검색어는 건드리지 않는다)
  const urlCategory = searchParams?.get('category') ?? undefined
  const urlQuery = (searchParams?.get('q') ?? '').slice(0, MAX_QUERY)
  const urlKey = `${urlCategory ?? ''}\u0000${urlQuery}`
  const [syncedKey, setSyncedKey] = useState(urlKey)
  if (syncedKey !== urlKey) {
    setSyncedKey(urlKey)
    setCategory(toFilter(rows, urlCategory))
    setQuery(urlQuery)
  }

  // 공지가 있는 분류만 칩으로 — 정한 순서(공지·행사·일반·긴급)대로
  const chips = useMemo(
    () =>
      NOTICE_CATEGORIES.map(value => ({
        value,
        count: rows.filter(row => row.category === value).length,
      })).filter(chip => chip.count > 0),
    [rows]
  )

  const trimmed = query.trim()
  const visible = rows.filter(
    row => (category === ALL || row.category === category) && matchesQuery(row, trimmed)
  )
  const years = [...new Set(visible.map(row => row.year))]

  const updateUrl = (next: { category?: CategoryFilter; q?: string }) => {
    const nextCategory = next.category ?? category
    const nextQuery = next.q ?? trimmed
    setCategory(nextCategory)
    const search = new URLSearchParams()
    if (nextCategory !== ALL) search.set('category', nextCategory)
    if (nextQuery) search.set('q', nextQuery)
    const qs = search.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}#archive`, { scroll: false })
  }

  return (
    <div className='asca-notice__archive'>
      <div className='asca-events__tools'>
        <div className='asca-events__chips' role='group' aria-label={copy.categoryGroup}>
          {[{ value: ALL, count: rows.length } as const, ...chips].map(chip => (
            <button
              key={chip.value}
              type='button'
              className='asca-events__chip'
              aria-pressed={category === chip.value}
              onClick={() => updateUrl({ category: chip.value })}
            >
              {copy.categories[chip.value]}
              <span className='asca-events__chip-count'>{chip.count}</span>
            </button>
          ))}
        </div>
        <form
          role='search'
          className='asca-events__search'
          onSubmit={event => {
            event.preventDefault()
            updateUrl({ q: trimmed })
          }}
        >
          <label htmlFor='notice-search' className='sr-only'>
            {copy.search.label}
          </label>
          <input
            id='notice-search'
            type='search'
            value={query}
            maxLength={MAX_QUERY}
            placeholder={copy.search.placeholder}
            onChange={event => setQuery(event.target.value)}
          />
        </form>
      </div>

      <p className='asca-events__count' aria-live='polite'>
        {visible.length === rows.length
          ? copy.listed(rows.length)
          : copy.filtered(rows.length, visible.length)}
      </p>

      {visible.length === 0 ? (
        <div className='asca-events__empty'>
          <p>{copy.empty.body}</p>
          <button
            type='button'
            className='asca-events__reset'
            onClick={() => {
              setQuery('')
              updateUrl({ category: ALL, q: '' })
            }}
          >
            {copy.empty.reset}
          </button>
        </div>
      ) : (
        years.map(year => (
          <section key={year} className='asca-events__year' aria-labelledby={`notice-year-${year}`}>
            <h3 id={`notice-year-${year}`} className='asca-events__year-label'>
              {year}
            </h3>
            <ol className='asca-events__rows'>
              {visible
                .filter(row => row.year === year)
                .map(row => (
                  <li key={row.id}>
                    <Link href={noticeHref(row)} className='asca-events__row'>
                      <time className='asca-events__row-date' dateTime={row.published}>
                        {row.monthDay}
                      </time>
                      <span className='asca-events__row-main'>
                        <span className='asca-events__row-title' lang='ko'>
                          {row.title}
                        </span>
                        {row.summary && (
                          <span className='asca-notice__row-summary' lang='ko'>
                            {row.summary}
                          </span>
                        )}
                        {(row.period || row.place) && (
                          <span className='asca-notice__row-meta'>
                            {row.phase && row.phase !== 'past' && (
                              <span className='asca-events__phase' data-phase={row.phase}>
                                {copy.phases[row.phase]}
                              </span>
                            )}
                            <span>
                              {row.period && noticePeriodLabel(row.period, language)}
                              {row.period && row.place && ' · '}
                              {row.place && <span lang='ko'>{row.place}</span>}
                            </span>
                          </span>
                        )}
                      </span>
                      <span className='asca-events__row-type' data-category={row.category}>
                        {copy.categories[row.category]}
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        ))
      )}
    </div>
  )
}
