'use client'

/**
 * 홈 - Philosophy 섹션 (D2)
 *
 * brand-guidelines §2 Section 2 — 문자에 정신을 담고, 서예로 시대를 잇습니다.
 * design §3 컴포넌트 트리. i18n: homePhilosophyTitle, homePhilosophyBody.
 *
 * 격조 원칙: 충분한 여백, 절제된 분리선 1개, 보조 한자 표지 없음 (Hero 중복 회피).
 * 모션: whileInView — 스크롤 진입 시 한 번만 fade-up.
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

export function PhilosophySection() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='philosophy-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.div
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            className='max-w-3xl mx-auto text-center'
          >
            <m.h2
              id='philosophy-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground mb-6 tracking-wide leading-tight'
            >
              {t('homePhilosophyTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-10'
            />

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em]'
            >
              {t('homePhilosophyBody')}
            </m.p>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
