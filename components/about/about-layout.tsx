import type { ReactNode } from 'react'
import './about.css'

// 소개 묶음 공통 틀 — about.css 의 .ab 이름공간을 쓴다. 구조는 follow.art/about 을 빌렸다.

export type AboutTone = 'paper' | 'gold' | 'navy'

export interface AboutFact {
  label: string
  value: string
}

/** 페이지 바탕. 맨 위 머리와 장들을 감싼다 */
export function AboutPage({ children }: { children: ReactNode }) {
  return <div className='ab'>{children}</div>
}

interface AboutHeroProps {
  /** 오른쪽 큰 글자 — 정체자 漢字. 장식이라 화면 읽기에서는 빠진다 */
  tc: string
  title: string
  eyebrow?: string
  lede?: ReactNode
  facts?: AboutFact[]
  actions?: ReactNode
  children?: ReactNode
  tone?: AboutTone
}

export function AboutHero({
  tc,
  title,
  eyebrow = 'ASCA · 소개',
  lede,
  facts,
  actions,
  children,
  tone = 'paper',
}: AboutHeroProps) {
  return (
    <section className={`ab-hero ab-tone--${tone}`} aria-labelledby='about-hero-title'>
      <div className='ab-hero__frame'>
        <div className='ab-hero__meta'>
          <p className='ab-hero__eyebrow'>{eyebrow}</p>
          <h1 id='about-hero-title' className='ab-hero__title'>
            {title}
          </h1>
          {lede && <p className='ab-hero__lede'>{lede}</p>}
          {children && <div className='ab-hero__extra'>{children}</div>}
          {facts && facts.length > 0 && (
            <dl className='ab-hero__facts'>
              {facts.map(fact => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className='ab-hero__actions'>{actions}</div>}
        </div>
        <p className='ab-hero__mark' lang='zh-Hant' aria-hidden='true'>
          {tc}
          <span className='ab-hero__seal'>東洋</span>
        </p>
      </div>
    </section>
  )
}

interface AboutChapterProps {
  id?: string
  tone?: AboutTone
  /** 왼쪽에 세로로 붙는 漢字 표제 */
  tc: string
  title: string
  /** 제목이 페이지 언어와 다를 때 */
  titleLang?: string
  eyebrow?: string
  note?: ReactNode
  /** 표제 아래 덧붙임 — 연도 목차 같은 것 */
  aside?: ReactNode
  children: ReactNode
}

export function AboutChapter({
  id,
  tone = 'paper',
  tc,
  title,
  titleLang,
  eyebrow,
  note,
  aside,
  children,
}: AboutChapterProps) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section id={id} className={`ab-chapter ab-tone--${tone}`} aria-labelledby={headingId}>
      <div className='ab-chapter__frame'>
        <div className='ab-chapter__side'>
          <p className='ab-chapter__tc' lang='zh-Hant' aria-hidden='true'>
            {tc}
          </p>
          <div className='ab-chapter__heading'>
            {eyebrow && <p className='ab-chapter__eyebrow'>{eyebrow}</p>}
            <h2 id={headingId} className='ab-chapter__title' lang={titleLang}>
              {title}
            </h2>
            {note && <p className='ab-chapter__note'>{note}</p>}
            {aside}
          </div>
        </div>
        <div className='ab-chapter__body'>{children}</div>
      </div>
    </section>
  )
}

export interface AboutRowItem {
  label: string
  body: ReactNode
}

/** 왼쪽 이름표·오른쪽 본문 행. numbered 면 01, 02… 를 붙인다 */
export function AboutRows({
  items,
  numbered = false,
}: {
  items: AboutRowItem[]
  numbered?: boolean
}) {
  return (
    <div className='ab-rows'>
      {items.map((item, index) => (
        <div key={item.label} className='ab-row' data-reveal>
          <h3 className='ab-row__label'>
            {numbered && <span className='ab-row__num'>{String(index + 1).padStart(2, '0')}</span>}
            {item.label}
          </h3>
          <div className='ab-row__body'>{item.body}</div>
        </div>
      ))}
    </div>
  )
}
