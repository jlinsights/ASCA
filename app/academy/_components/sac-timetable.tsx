'use client'

import { useState } from 'react'
import {
  SAC_CATEGORIES,
  SAC_CLASSES,
  SAC_DAYS,
  SAC_SLOTS,
  type SacCategory,
  type SacClass,
} from './academy-data'

type Filter = SacCategory | '전체'

const FILTERS: readonly Filter[] = ['전체', ...SAC_CATEGORIES]

const countOf = (filter: Filter): number =>
  filter === '전체'
    ? SAC_CLASSES.length
    : SAC_CLASSES.filter(item => item.category === filter).length

/**
 * 주간 수업시간표 — 요일 다섯 열 × 오전·오후 두 줄. 넓은 화면에선 subgrid 로 오전 칸 높이를 맞추고,
 * 좁은 화면에선 요일별로 쌓는다. 분야 버튼은 해당 분야만 먹색으로 남기고 나머지를 옅게 한다(칸 모양은 유지).
 */
export function SacTimetable() {
  const [filter, setFilter] = useState<Filter>('전체')
  const isMatch = (item: SacClass) => filter === '전체' || item.category === filter

  return (
    <div className='asca-ac__tt-wrap'>
      <div className='asca-ac__filters' role='group' aria-label='분야별로 보기'>
        {FILTERS.map(option => (
          <button
            key={option}
            type='button'
            className='asca-ac__filter'
            data-cat={option}
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option}
            <span className='asca-ac__filter-count'>{countOf(option)}</span>
          </button>
        ))}
      </div>
      <p className='sr-only' aria-live='polite'>
        {filter === '전체' ? '전체' : filter} 강좌 {countOf(filter)}개를 표시합니다.
      </p>

      <div className='asca-ac__tt' data-filtered={filter !== '전체'}>
        <div className='asca-ac__tt-corner' aria-hidden='true' />
        {SAC_SLOTS.map((slot, index) => (
          <div
            key={slot.id}
            className='asca-ac__tt-slot'
            style={{ gridRow: index + 2 }}
            aria-hidden='true'
          >
            <span className='asca-ac__tt-slot-label'>{slot.label}</span>
            <span className='asca-ac__tt-slot-time'>{slot.time}</span>
          </div>
        ))}

        {SAC_DAYS.map((day, dayIndex) => (
          <section
            key={day}
            className='asca-ac__tt-day'
            style={{ gridColumn: dayIndex + 2 }}
            aria-labelledby={`ac-tt-${dayIndex}`}
          >
            <h4 id={`ac-tt-${dayIndex}`} className='asca-ac__tt-day-name'>
              {day}
              <span className='asca-ac__tt-day-suffix'>요일</span>
            </h4>
            {SAC_SLOTS.map(slot => {
              const items = SAC_CLASSES.filter(item => item.day === day && item.slot === slot.id)
              return (
                <div key={slot.id} className='asca-ac__tt-cell'>
                  <p className='asca-ac__tt-cell-label'>
                    {slot.label} <span>{slot.time}</span>
                  </p>
                  <ul className='asca-ac__tt-list'>
                    {items.map(item => (
                      <li
                        key={`${item.title}-${item.instructor}-${item.time ?? ''}`}
                        className='asca-ac__class'
                        data-cat={item.category}
                        data-dim={!isMatch(item)}
                      >
                        <span className='asca-ac__class-title'>{item.title}</span>
                        <span className='asca-ac__class-meta'>
                          {item.instructor}
                          {item.time && <span className='asca-ac__class-time'>{item.time}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
