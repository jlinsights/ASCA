'use client'

/**
 * /community - Hero 섹션 (D2)
 *
 * design §3·§6.1 — SealMark 인장 모티프 + L1 슬로건 + body.
 * SSOT: communityHeroL1·communityHeroBody (community-marketing-playbook §1.1).
 *
 * parent 사이클 PhilosophySection 패턴 재사용 — whileInView once:true, 분리선,
 * leading-loose. 다만 페이지 진입 직후라 initial='hidden' animate='visible' 즉시 표시.
 */

import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { SealMark } from '@/components/brand/seal-mark'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
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

export function CommunityHero() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='community-hero-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            className='max-w-3xl mx-auto text-center'
          >
            <m.div variants={itemVariants} className='mb-10 flex justify-center'>
              <SealMark variant='hero' text='同道' />
            </m.div>

            <m.h1
              id='community-hero-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground mb-6 tracking-wide leading-tight'
            >
              {t('communityHeroL1')}
            </m.h1>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-8'
            />

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em]'
            >
              {t('communityHeroBody')}
            </m.p>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
