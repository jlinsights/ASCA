'use client'

import { useEffect, useState } from 'react'
import type { FairnessSection } from './fairness-content'

interface FairnessTocProps {
  sections: FairnessSection[]
}

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  const key = ids.join('|')

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return
    // 화면 위쪽 1/3 띠에 걸친 절을 "지금 읽는 절"로 본다 (규정 열람기와 같은 기준)
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -66% 0px' }
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
    // ids 는 key 로 비교한다 — 매 렌더 새 배열이어도 다시 구독하지 않게
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}

export function FairnessToc({ sections }: FairnessTocProps) {
  const active = useActiveSection(sections.map(section => section.id))

  return (
    <nav aria-label='공정·투명성 허브 목차' className='asca-fair-toc'>
      <p className='asca-fair-toc__label'>목차</p>
      <ol>
        {sections.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? 'location' : undefined}
            >
              <span className='asca-fair-toc__num' aria-hidden='true'>
                {section.num}
              </span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
