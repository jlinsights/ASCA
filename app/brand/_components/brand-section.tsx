import type { ReactNode } from 'react'

interface BrandSectionProps {
  id: string
  index: number
  eyebrow: string
  title: string
  lede: string
  children: ReactNode
}

/** 가이드 한 구획 — 번호·영문 눈썹·제목·설명 + 본문 */
export function BrandSection({ id, index, eyebrow, title, lede, children }: BrandSectionProps) {
  const headingId = `${id}-title`
  return (
    <section id={id} aria-labelledby={headingId} className='brand-section'>
      <header className='brand-section__head'>
        <p className='brand-section__index'>
          <span className='brand-section__num'>{String(index).padStart(2, '0')}</span>
          <span lang='en'>{eyebrow}</span>
        </p>
        <h2 id={headingId} className='brand-section__title'>
          {title}
        </h2>
        <p className='brand-section__lede'>{lede}</p>
      </header>
      {children}
    </section>
  )
}
