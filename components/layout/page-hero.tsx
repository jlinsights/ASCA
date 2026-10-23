import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import './page-hero.css'

/** 모든 페이지 題簽 아래 찍히는 협회 낙관 — 東洋書藝協會 */
export const ASCA_SEAL = '書協'

/**
 * 다 불러온 뒤의 0 은 숨긴다 — '전시 0'·'불러온 행사 0' 이 제목 바로 아래에서
 * 빈 페이지를 먼저 알리지 않게. 불러오는 중의 '—' 는 그대로 둔다(높이 고정).
 */
function isShown(item: { value: ReactNode }): boolean {
  return item.value !== 0 && item.value !== '0'
}

export interface PageHeroCrumb {
  label: string
  href?: string
}

export interface PageHeroStat {
  label: ReactNode
  value: ReactNode
  unit?: string
}

export interface PageHeroProps {
  title: string
  /** 페이지의 漢字 이름 — 세로 題簽으로 선다. 예: 作家 · 作品 · 展覽 */
  tc?: string
  /** 낙관. 생략하면 협회 낙관(ASCA_SEAL) — 제목 글자를 되풀이하지 않는다 */
  seal?: string
  lede?: ReactNode
  /** @deprecated lede 를 쓴다. 기존 호출부 호환용 */
  subtitle?: ReactNode
  /** feature = 둘러보기 페이지, band = 읽기·신청 페이지 */
  tier?: 'feature' | 'band'
  crumbs?: PageHeroCrumb[]
  actions?: ReactNode
  /** 실제 숫자만. 지어낸 통계를 넣지 않는다 */
  ledger?: PageHeroStat[]
  /** feature 오른쪽 칸 — 보통 <HeroScrolls /> */
  media?: ReactNode
  /** 배지·날짜처럼 lede 아래 붙는 짧은 정보 */
  children?: ReactNode
  id?: string
}

export function PageHero({
  title,
  tc,
  seal,
  lede,
  subtitle,
  tier = 'band',
  crumbs,
  actions,
  ledger,
  media,
  children,
  id = 'page-hero-title',
}: PageHeroProps) {
  const body = lede ?? subtitle
  const shownLedger = (ledger ?? []).filter(isShown)
  const sealText = seal ?? ASCA_SEAL
  const hasMedia = tier === 'feature' && Boolean(media)
  const className = ['asca-ph', `asca-ph--${tier}`, hasMedia ? 'asca-ph--has-media' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={className} aria-labelledby={id}>
      <div className='asca-ph__frame'>
        {tc && (
          <div className='asca-ph__mark' aria-hidden='true'>
            <p className='asca-ph__tc' lang='zh-Hant'>
              {tc}
            </p>
            {sealText && (
              <span className='asca-ph__seal' lang='zh-Hant'>
                {sealText}
              </span>
            )}
          </div>
        )}

        <div className='asca-ph__copy'>
          {crumbs && crumbs.length > 0 && (
            <nav aria-label='breadcrumb'>
              <ol className='asca-ph__crumbs'>
                {crumbs.map(crumb => (
                  <li key={crumb.label}>
                    {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 id={id} className='asca-ph__title'>
            {title}
          </h1>
          {tc && (
            <p className='asca-ph__tc-inline' lang='zh-Hant' aria-hidden='true'>
              {tc}
            </p>
          )}
          {body && <p className='asca-ph__lede'>{body}</p>}
          {children && <div className='asca-ph__extra'>{children}</div>}
          {actions && <div className='asca-ph__actions'>{actions}</div>}
        </div>

        {hasMedia && <div className='asca-ph__media'>{media}</div>}
      </div>

      {shownLedger.length > 0 && (
        <div className='asca-ph__ledger'>
          <dl>
            {shownLedger.map((stat, index) => (
              <div className='asca-ph__stat' key={index}>
                <dt>{stat.label}</dt>
                <dd>
                  {stat.value}
                  {stat.unit && <em>{stat.unit}</em>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  )
}

export interface HeroScrollImage {
  src: string
  alt: string
  href?: string
}

interface HeroScrollsProps {
  images: HeroScrollImage[]
  /** 작품처럼 잘리면 안 되는 이미지는 contain */
  fit?: 'cover' | 'contain'
  max?: number
  /** 데이터를 불러오는 동안 빈 족자 자리를 잡아 레이아웃이 튀지 않게 한다 */
  loading?: boolean
}

/**
 * 족자 벽 — 실제 이미지를 3~5폭 엇갈려 건다.
 * 이미지가 없으면 아무것도 그리지 않는다(히어로는 글자만으로 선다).
 */
export function HeroScrolls({ images, fit = 'cover', max = 5, loading = false }: HeroScrollsProps) {
  const shown = images.slice(0, max)
  if (loading && shown.length === 0) {
    return (
      <ul className='asca-scrolls asca-scrolls--pending' aria-hidden='true'>
        {Array.from({ length: max }, (_, index) => (
          <li className='asca-scrolls__item' key={index}>
            <span className='asca-scrolls__link' />
          </li>
        ))}
      </ul>
    )
  }
  if (shown.length === 0) return null

  return (
    <ul className={`asca-scrolls${fit === 'contain' ? ' asca-scrolls--contain' : ''}`}>
      {shown.map((image, index) => {
        const img = (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes='(max-width: 767px) 33vw, (max-width: 1024px) 20vw, 12vw'
            className='asca-scrolls__img'
            priority={index < 2}
          />
        )
        return (
          <li className='asca-scrolls__item' key={`${image.src}-${index}`}>
            {image.href ? (
              <Link href={image.href} className='asca-scrolls__link'>
                <span className='relative block h-full w-full'>{img}</span>
              </Link>
            ) : (
              <span className='asca-scrolls__link'>
                <span className='relative block h-full w-full'>{img}</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export interface HeroFact {
  label: string
  value: ReactNode
}

/** band 페이지의 사실 한 줄 — 시행일·서식 수·임원 수처럼 페이지가 이미 가진 정보만 */
export function HeroFacts({ facts }: { facts: HeroFact[] }) {
  const shown = facts.filter(isShown)
  if (shown.length === 0) return null
  return (
    <dl className='asca-ph__facts'>
      {shown.map(fact => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
