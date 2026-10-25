'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { EventRow } from './event-rows'

/**
 * 지난 행사 기록 — 해마다 묶은 장부. 유형 칩과 검색으로 거르고, 거른 상태는 주소(?type=&q=)에 남겨 공유할 수 있게 한다.
 * 건수가 적어(수십 건) 서버에 다시 묻지 않고 받은 목록 안에서 거른다.
 */

interface EventArchiveProps {
  rows: readonly EventRow[]
  /** 주소의 ?type= — 서버가 읽어 넘긴다(첫 화면부터 거른 상태로 그리기 위해) */
  initialType?: string
  initialQuery?: string
}

const ALL = 'all'

function matches(row: EventRow, type: string, query: string): boolean {
  if (type !== ALL && row.type !== type) return false
  if (!query) return true
  const haystack = `${row.title} ${row.place} ${row.organizer} ${row.summary}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every(term => haystack.includes(term))
}

export function EventArchive({ rows, initialType = ALL, initialQuery = '' }: EventArchiveProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [type, setType] = useState(rows.some(row => row.type === initialType) ? initialType : ALL)
  const [query, setQuery] = useState(initialQuery)

  const types = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const row of rows) {
      const entry = counts.get(row.type)
      counts.set(row.type, { label: row.typeLabel, count: (entry?.count ?? 0) + 1 })
    }
    return [...counts.entries()].sort(([, a], [, b]) => b.count - a.count)
  }, [rows])

  const trimmed = query.trim()
  const visible = rows.filter(row => matches(row, type, trimmed))
  const years = [...new Set(visible.map(row => row.year))]

  const updateUrl = (next: { type?: string; q?: string }) => {
    const search = new URLSearchParams()
    const nextType = next.type ?? type
    const nextQuery = next.q ?? trimmed
    setType(nextType)
    if (nextType === ALL) search.delete('type')
    else search.set('type', nextType)
    if (nextQuery) search.set('q', nextQuery)
    else search.delete('q')
    const qs = search.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}#archive`, { scroll: false })
  }

  return (
    <div className='asca-events__archive'>
      <div className='asca-events__tools'>
        <div className='asca-events__chips' role='group' aria-label='행사 유형'>
          {[[ALL, { label: '전체', count: rows.length }] as const, ...types].map(
            ([value, { label, count }]) => (
              <button
                key={value}
                type='button'
                className='asca-events__chip'
                aria-pressed={type === value}
                onClick={() => updateUrl({ type: value })}
              >
                {label}
                <span className='asca-events__chip-count'>{count}</span>
              </button>
            )
          )}
        </div>
        <form
          role='search'
          className='asca-events__search'
          onSubmit={event => {
            event.preventDefault()
            updateUrl({ q: trimmed })
          }}
        >
          <label htmlFor='event-search' className='sr-only'>
            행사 검색
          </label>
          <input
            id='event-search'
            type='search'
            value={query}
            placeholder='행사명·장소·작가로 찾기'
            onChange={event => setQuery(event.target.value)}
          />
        </form>
      </div>

      <p className='asca-events__count' aria-live='polite'>
        {visible.length === rows.length
          ? `${rows.length}건`
          : `${rows.length}건 가운데 ${visible.length}건`}
      </p>

      {visible.length === 0 ? (
        <div className='asca-events__empty'>
          <p>조건에 맞는 행사가 없습니다.</p>
          <button
            type='button'
            className='asca-events__reset'
            onClick={() => {
              setQuery('')
              updateUrl({ type: ALL, q: '' })
            }}
          >
            조건 지우기
          </button>
        </div>
      ) : (
        years.map(year => (
          <section key={year} className='asca-events__year' aria-labelledby={`year-${year}`}>
            <h3 id={`year-${year}`} className='asca-events__year-label'>
              {year}
            </h3>
            <ol className='asca-events__rows'>
              {visible
                .filter(row => row.year === year)
                .map(row => (
                  <li key={row.id}>
                    <Link href={`/events/${row.id}`} className='asca-events__row'>
                      <span className='asca-events__row-date'>{row.monthDay}</span>
                      <span className='asca-events__row-main'>
                        <span className='asca-events__row-title'>{row.title}</span>
                        <span className='asca-events__row-meta'>
                          {[row.place, row.organizer].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className='asca-events__row-type'>{row.typeLabel}</span>
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
