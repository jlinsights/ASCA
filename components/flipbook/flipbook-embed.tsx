'use client'

import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

// FlipHTML5 오리진은 next.config.js 의 CSP frame-src(THIRD_PARTY.fliphtml5)에 등록돼 있어야 한다.
export const FLIPHTML5_ORIGIN = 'https://online.fliphtml5.com'

interface FlipbookEmbedProps {
  /** 제목 id 접두어 — 한 페이지에 여럿이어도 겹치지 않게 */
  id: string
  /** FlipHTML5 책 주소 (FLIPHTML5_ORIGIN 아래) */
  url: string
  /** 번역 키 — 키 이름은 `${keyPrefix}Eyebrow/Title/Lede/FrameTitle` */
  keyPrefix: string
}

export function FlipbookEmbed({ id, url, keyPrefix }: FlipbookEmbedProps) {
  const { t } = useLanguage()
  const titleId = `${id}-title`

  return (
    <section aria-labelledby={titleId} className='mb-12'>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-temple-gold'>
            {t(`${keyPrefix}Eyebrow`)}
          </p>
          <h2 id={titleId} className='font-serif text-2xl font-bold text-foreground md:text-3xl'>
            {t(`${keyPrefix}Title`)}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>{t(`${keyPrefix}Lede`)}</p>
        </div>
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-temple-gold underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-temple-gold focus-visible:ring-offset-2 rounded-sm'
        >
          {t('flipbookOpen')}
          <ExternalLink aria-hidden='true' className='h-4 w-4' />
        </a>
      </div>

      {/* 원본 임베드 비율: 가로 대비 60%, 좁은 화면에서도 최소 324px */}
      <div className='relative h-0 w-full overflow-hidden rounded-md border border-border bg-muted pt-[max(60%,324px)]'>
        <iframe
          src={url}
          title={t(`${keyPrefix}FrameTitle`)}
          className='absolute inset-0 h-full w-full border-0'
          allowFullScreen
        />
      </div>
    </section>
  )
}
