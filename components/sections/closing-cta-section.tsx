'use client'

/**
 * 홈 - Closing CTA 섹션 (D5)
 *
 * brand-guidelines §2 Section 5 + design §6 — OQ#5 채택: 데스크톱 4-in-row, 모바일 2x2 stack.
 * CTA 라우트 4종:
 *  - /about (asca-about-page-rollout 후속)
 *  - /exhibitions (기존)
 *  - /community (asca-community-page-rollout 후속, OQ#4 2-layer)
 *  - /academy (기존, brand-guidelines "교육"에 매핑)
 *
 * design §3 컴포넌트 트리. i18n: homeClosingCta* 6키.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'

type ClosingCta = {
  href: string
  labelKey: string
}

const CLOSING_CTAS: readonly ClosingCta[] = [
  { href: '/about', labelKey: 'homeClosingCtaButtonAbout' },
  { href: '/exhibitions', labelKey: 'homeClosingCtaButtonExhibitions' },
  { href: '/community', labelKey: 'homeClosingCtaButtonCommunity' },
  { href: '/academy', labelKey: 'homeClosingCtaButtonEducation' },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export function ClosingCtaSection() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='closing-cta-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.div
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            className='max-w-4xl mx-auto text-center'
          >
            <m.h2
              id='closing-cta-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground mb-6 tracking-wide leading-tight'
            >
              {t('homeClosingCtaTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-10'
            />

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em] max-w-2xl mx-auto mb-14 md:mb-16'
            >
              {t('homeClosingCtaBody')}
            </m.p>

            <m.nav
              aria-label='Closing call-to-action'
              variants={itemVariants}
              className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 max-w-3xl mx-auto'
            >
              {CLOSING_CTAS.map(cta => (
                <Link key={cta.href} href={cta.href} className='block'>
                  <Button
                    size='lg'
                    className='w-full h-12 md:h-14 px-4 text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300'
                  >
                    {t(cta.labelKey)}
                  </Button>
                </Link>
              ))}
            </m.nav>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
