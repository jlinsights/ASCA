'use client'

/**
 * 홈 - What We Do 섹션 (D3)
 *
 * brand-guidelines §2 Section 3 — 동양서예협회가 하는 일.
 * 5-row 정의 리스트(dl)로 격조 있게 표현 — 카드 그리드 회피 (서예의 호흡감 우선).
 * design §3 컴포넌트 트리. i18n: homeWhatWeDo* 11키.
 *
 * 격조 원칙: divide-y로 행 구분, label은 명조, body는 담묵 회색.
 * 모션: whileInView staggerChildren 0.08s — 절제된 순차 등장.
 */

import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'

type WhatWeDoRow = {
  labelKey: string
  bodyKey: string
}

const WHAT_WE_DO_ROWS: readonly WhatWeDoRow[] = [
  { labelKey: 'homeWhatWeDoExhibitionLabel', bodyKey: 'homeWhatWeDoExhibitionBody' },
  { labelKey: 'homeWhatWeDoContestLabel', bodyKey: 'homeWhatWeDoContestBody' },
  { labelKey: 'homeWhatWeDoEducationLabel', bodyKey: 'homeWhatWeDoEducationBody' },
  { labelKey: 'homeWhatWeDoExchangeLabel', bodyKey: 'homeWhatWeDoExchangeBody' },
  { labelKey: 'homeWhatWeDoResearchLabel', bodyKey: 'homeWhatWeDoResearchBody' },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 60,
      damping: 22,
    },
  },
}

export function WhatWeDoSection() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='what-we-do-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.div
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            className='max-w-4xl mx-auto'
          >
            <m.h2
              id='what-we-do-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground text-center mb-4 tracking-wide leading-tight'
            >
              {t('homeWhatWeDoTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-16'
            />

            <m.dl variants={itemVariants} className='divide-y divide-foreground/10'>
              {WHAT_WE_DO_ROWS.map(row => (
                <m.div
                  key={row.labelKey}
                  variants={itemVariants}
                  className='grid md:grid-cols-[10rem_1fr] gap-2 md:gap-12 py-8 md:py-10'
                >
                  <dt className='text-xl md:text-2xl font-serif font-medium text-foreground tracking-wide'>
                    {t(row.labelKey)}
                  </dt>
                  <dd className='text-base md:text-lg text-muted-foreground leading-relaxed'>
                    {t(row.bodyKey)}
                  </dd>
                </m.div>
              ))}
            </m.dl>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
