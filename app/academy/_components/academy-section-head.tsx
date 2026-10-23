import type { ReactNode } from 'react'

interface AcademySectionHeadProps {
  id: string
  title: string
  eyebrow?: string
  lede?: ReactNode
}

/** 섹션 머리 — 굵은 먹선 아래 왼쪽 정렬 제목. /membership 과 같은 리듬으로 읽히게 한다 */
export function AcademySectionHead({ id, title, eyebrow, lede }: AcademySectionHeadProps) {
  return (
    <header className='asca-ac__head'>
      <div>
        {eyebrow && <p className='asca-ac__eyebrow'>{eyebrow}</p>}
        <h2 id={id} className='asca-ac__title'>
          {title}
        </h2>
      </div>
      {lede && <p className='asca-ac__lede'>{lede}</p>}
    </header>
  )
}
