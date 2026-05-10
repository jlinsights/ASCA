'use client'

/**
 * 홈 - Brand Message 섹션 (D4)
 *
 * brand-guidelines §2 Section 4 — 한글의 리듬, 한문의 깊이, 서예의 정신.
 * 격조 의도: 인주색(--vermillion) 좌측 세로선으로 작가 낙관(인장) 모티프 절제 표현.
 * Philosophy 섹션과 시각적 차별을 위해 좌측 정렬 + 인용 형식 채택.
 *
 * design §3 컴포넌트 트리. i18n: homeBrandMessageTitle, homeBrandMessageBody.
 */

import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 50,
      damping: 22,
    },
  },
}

export function BrandMessageSection() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='brand-message-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.blockquote
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            className='max-w-3xl mx-auto pl-6 md:pl-10 border-l-2 border-[color:var(--vermillion)]/70'
          >
            <m.h2
              id='brand-message-heading'
              variants={itemVariants}
              className='text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground mb-6 tracking-wide leading-snug'
            >
              {t('homeBrandMessageTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mb-10'
            />

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em]'
            >
              {t('homeBrandMessageBody')}
            </m.p>
          </m.blockquote>
        </div>
      </section>
    </LazyMotion>
  )
}
