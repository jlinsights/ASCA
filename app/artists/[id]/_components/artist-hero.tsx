import type { ReactNode } from 'react'
import Link from 'next/link'
import { ASCA_SEAL } from '@/components/layout/page-hero'
import './artist-hero.css'

export interface ArtistHeroFact {
  label: string
  value: string | number | null
  unit?: string
}

interface ArtistHeroProps {
  name: string
  /** 한글 이름과 다른 한자 이름 — 이름 아래 두 번째 줄로 선다 */
  hanja: string | null
  /** 아호·등급 줄 */
  lede?: ReactNode
  facts: ArtistHeroFact[]
  /** 작품 수·연도·경력 — 실제 숫자만 */
  ledger: ArtistHeroFact[]
  /** 초상이나 족자 벽. 없으면 세로 題簽이 오른쪽 칸을 채운다 */
  media?: ReactNode
}

const shown = (fact: ArtistHeroFact) =>
  fact.value !== null && fact.value !== '' && fact.value !== 0 && fact.value !== '0'

/** 글자 수로 이름 크기 단계를 고른다 — 세 글자까지 / 네 글자 / 그보다 긴 이름(영문 포함) */
export function nameScale(name: string): 'short' | 'medium' | 'long' {
  const length = [...name.trim()].length
  if (length <= 3) return 'short'
  return length === 4 ? 'medium' : 'long'
}

/**
 * 작가 히어로 — 이름이 화면을 연다.
 * 왼쪽 넓은 단(황금비)에 큰 이름, 오른쪽 좁은 단에 초상 또는 세로 題簽.
 * 첫 화면에서 이름에 먹이 들고(왼→오), 題簽이 위에서 아래로 펼쳐진다 — CSS 한 번뿐.
 */
export function ArtistHero({ name, hanja, lede, facts, ledger, media }: ArtistHeroProps) {
  const shownFacts = facts.filter(shown)
  const shownLedger = ledger.filter(shown)

  return (
    <header className='ah' aria-labelledby='ah-name'>
      <div className='ah__grid'>
        <div className='ah__copy'>
          <nav aria-label='breadcrumb'>
            <ol className='ah__crumbs'>
              <li>
                <Link href='/artists'>작가 목록</Link>
              </li>
              <li aria-current='page'>{name}</li>
            </ol>
          </nav>

          <h1 id='ah-name' className='ah__name' data-scale={nameScale(name)}>
            {name}
          </h1>
          {hanja && (
            <p className='ah__hanja' lang='zh-Hant'>
              {hanja}
            </p>
          )}

          {lede && <div className='ah__lede'>{lede}</div>}

          {(shownFacts.length > 0 || shownLedger.length > 0) && (
            <dl className='ah__facts'>
              {[...shownFacts, ...shownLedger].map(fact => (
                <div key={fact.label} className='ah__fact'>
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.value}
                    {fact.unit && <span className='ah__unit'>{fact.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className='ah__media'>
          {media ?? (
            <div className='ah-tc' aria-hidden='true'>
              <span className='ah-tc__text' lang='zh-Hant'>
                {hanja ?? '作家'}
              </span>
              <span className='ah-tc__seal' lang='zh-Hant'>
                {ASCA_SEAL}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
