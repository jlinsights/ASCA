'use client'

/**
 * /community - DaoArchitecture 섹션 (D3)
 *
 * design §3·§6.2 — 3 카드 (法古·創新·人書俱老).
 * SSOT: community-marketing-playbook §1.1·§1.3.
 *
 * 격조: 카드 좌상단 인주색 점 1개 (도장 모티프 재현).
 * 모바일 stack, 데스크톱 3-col grid. whileInView once:true + stagger 0.12.
 */

import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'

type DaoCard = {
  titleKey: string
  bodyKey: string
}

const DAO_CARDS: readonly DaoCard[] = [
  { titleKey: 'communityDaoBeopgoTitle', bodyKey: 'communityDaoBeopgoBody' },
  { titleKey: 'communityDaoChangsinTitle', bodyKey: 'communityDaoChangsinBody' },
  { titleKey: 'communityDaoInseoGunoTitle', bodyKey: 'communityDaoInseoGunoBody' },
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
  hidden: { y: 24, opacity: 0 },
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

export function DaoArchitecture() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='community-dao-heading'
        className='py-24 md:py-32 lg:py-40 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.div
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            className='max-w-5xl mx-auto'
          >
            <m.h2
              id='community-dao-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground text-center mb-4 tracking-wide leading-tight'
            >
              {t('communityDaoTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-16'
            />

            <m.div
              variants={itemVariants}
              className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'
            >
              {DAO_CARDS.map(card => (
                <m.article
                  key={card.titleKey}
                  variants={itemVariants}
                  className='relative bg-card border border-border rounded-sm p-8 md:p-10'
                >
                  <span
                    aria-hidden='true'
                    className='absolute top-5 right-5 inline-block w-2.5 h-2.5 rounded-sm bg-[color:var(--vermillion)]'
                  />
                  <h3 className='text-xl md:text-2xl font-serif font-medium text-foreground mb-4 tracking-wide leading-snug'>
                    {t(card.titleKey)}
                  </h3>
                  <p className='text-base text-muted-foreground leading-relaxed'>
                    {t(card.bodyKey)}
                  </p>
                </m.article>
              ))}
            </m.div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
