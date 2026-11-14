'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ArtistWork } from './artist-works'

type Translate = (key: string) => string

interface ArtistWorksWallProps {
  works: ArtistWork[]
  titleOf: (work: ArtistWork) => string
  t: Translate
}

/** 작품에 적힌 서체·분야(style) — 코드에 박지 않고 데이터에서 모은다. 두 가지 이상일 때만 거르기 칩을 보인다 */
export function workStyles(works: ArtistWork[]): string[] {
  return [...new Set(works.map(work => work.style).filter((style): style is string => !!style))]
}

/**
 * 작품 벽 — 같은 높이로 걸고 폭은 작품의 원래 비율대로.
 * 족자는 세로가 길어 정사각 카드에 넣으면 대부분이 잘린다. 벽에 걸듯 옆으로 넘겨 본다.
 */
export function ArtistWorksWall({ works, titleOf, t }: ArtistWorksWallProps) {
  const styles = useMemo(() => workStyles(works), [works])
  const [style, setStyle] = useState<string | null>(null)
  // 이미지가 있는 작품부터 건다 — 빈 대지로 벽이 시작되지 않게
  const shown = [...(style ? works.filter(work => work.style === style) : works)].sort(
    (a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl))
  )

  return (
    <>
      {styles.length > 1 && (
        <div className='ap-filter' role='group' aria-label={t('adFilterLabel')}>
          {[null, ...styles].map(value => (
            <button
              key={value ?? '__all'}
              type='button'
              className='ap-chip'
              aria-pressed={style === value}
              onClick={() => setStyle(value)}
            >
              {value ?? t('adFilterAll')}
            </button>
          ))}
        </div>
      )}
      <ul className='ap-wall' aria-label={t('adWallHint')} tabIndex={0}>
        {shown.map(work => (
          <li key={work.id} className='ap-wall__item'>
            <WallWork work={work} title={titleOf(work)} />
          </li>
        ))}
      </ul>
    </>
  )
}

// 벽의 액자 높이 clamp(280px, 34vw, 440px) — artist-profile.css 의 .ap-wall .ap-work__frame 과 같이 바꿀 것
const FRAME_MIN = 280
const FRAME_MAX = 440
const FRAME_VW = 0.34

/** 액자는 높이가 고정이고 폭은 작품 비율을 따른다 — 가로로 긴 작품은 320px 보다 훨씬 넓게 그려진다 */
export function wallImageSizes(width: number | null, height: number | null): string {
  const ratio = width && height ? width / height : 3 / 4
  const lowBreak = Math.round(FRAME_MIN / FRAME_VW)
  const highBreak = Math.round(FRAME_MAX / FRAME_VW)
  return [
    `(max-width: ${lowBreak}px) ${Math.ceil(FRAME_MIN * ratio)}px`,
    `(max-width: ${highBreak}px) ${+(FRAME_VW * 100 * ratio).toFixed(2)}vw`,
    `${Math.ceil(FRAME_MAX * ratio)}px`,
  ].join(', ')
}

function WallWork({ work, title }: { work: ArtistWork; title: string }) {
  const ratio = work.width && work.height ? `${work.width} / ${work.height}` : '3 / 4'
  const meta = [work.year ? `${work.year}` : null, work.style].filter(Boolean).join(' · ')

  return (
    <Link href={`/artworks/${work.id}`} className='ap-work'>
      <figure className='ap-work__figure'>
        <span className='ap-work__mat'>
          <span className='ap-work__frame' style={{ aspectRatio: ratio }}>
            {work.imageUrl ? (
              <Image
                src={work.imageUrl}
                alt={title}
                fill
                sizes={wallImageSizes(work.width, work.height)}
                className='ap-work__img'
              />
            ) : (
              <span className='ap-work__blank' aria-hidden='true'>
                {work.title}
              </span>
            )}
          </span>
        </span>
        <figcaption className='ap-work__caption'>
          <span className='ap-work__title'>{title}</span>
          {(meta || work.award) && (
            <span className='ap-work__meta'>
              {meta && <span>{meta}</span>}
              {work.award && (
                <span className='ap-work__award' lang='zh-Hant'>
                  {work.award}
                </span>
              )}
            </span>
          )}
        </figcaption>
      </figure>
    </Link>
  )
}

/** 공유 — 휴대폰은 시스템 공유 창, 아니면 주소 복사 */
export function ShareButton({ title, t }: { title: string; t: Translate }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  function announce(next: 'copied' | 'failed') {
    setStatus(next)
    window.setTimeout(() => setStatus('idle'), next === 'failed' ? 6000 : 2400)
  }

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // 사용자가 공유 창을 닫은 경우 — 알릴 것이 없다. 그 밖의 실패는 주소 복사로 넘어간다
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      announce('copied')
    } catch {
      announce('failed')
    }
  }

  return (
    <>
      <button type='button' className='ap-btn ap-btn--ghost' onClick={share}>
        {t('adShare')}
      </button>
      <span className='ap-actions__status' role='status' aria-live='polite'>
        {status === 'copied' ? t('adShareCopied') : status === 'failed' ? t('adShareFailed') : ''}
      </span>
    </>
  )
}
