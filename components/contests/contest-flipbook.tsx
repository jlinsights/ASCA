'use client'

import { ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

// FlipHTML5 오리진은 next.config.js 의 CSP frame-src(THIRD_PARTY.fliphtml5)에 등록돼 있어야 한다.
export const CONTEST_FLIPBOOK_URL = 'https://online.fliphtml5.com/orientalcalligraphy/ulsw/'

export function ContestFlipbook() {
  const { t } = useLanguage()

  return (
    <section aria-labelledby='contest-flipbook-title' className='mb-12'>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-temple-gold'>
            {t('contestFlipbookEyebrow')}
          </p>
          <h2
            id='contest-flipbook-title'
            className='font-serif text-2xl font-bold text-foreground md:text-3xl'
          >
            {t('contestFlipbookTitle')}
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>{t('contestFlipbookLede')}</p>
        </div>
        <a
          href={CONTEST_FLIPBOOK_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-temple-gold underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-temple-gold focus-visible:ring-offset-2 rounded-sm'
        >
          {t('contestFlipbookOpen')}
          <ExternalLink aria-hidden='true' className='h-4 w-4' />
        </a>
      </div>

      {/* 원본 임베드 비율: 가로 대비 60%, 좁은 화면에서도 최소 324px */}
      <div className='relative h-0 w-full overflow-hidden rounded-md border border-border bg-muted pt-[max(60%,324px)]'>
        <iframe
          src={CONTEST_FLIPBOOK_URL}
          title={t('contestFlipbookFrameTitle')}
          className='absolute inset-0 h-full w-full border-0'
          allowFullScreen
        />
      </div>
    </section>
  )
}
