'use client'

/**
 * /community - ImseoCard 섹션 (D4)
 *
 * design §3·§6.3 — 100일 임서 챌린지 안내. 카드 박스 X (DaoArchitecture와 시각 차별).
 * SSOT: community-marketing-playbook §7. OQ#3 채택 — 카페 댓글 신청 + 사무국 메일 보조.
 *
 * OQ#2 deferred 운영: communityCafeNaverUrl placeholder ('#')일 때 CTA aria-disabled.
 * 사무국 결정 시 i18n 1줄 갱신으로 4언어 모두 자동 활성.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

export function ImseoCard() {
  const { t } = useLanguage()
  const cafeUrl = t('communityCafeNaverUrl')
  const isCafePlaceholder = cafeUrl === '#' || cafeUrl === 'communityCafeNaverUrl'

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='community-imseo-heading'
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
              id='community-imseo-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground mb-6 tracking-wide leading-tight'
            >
              {t('communityImseoTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-8'
            />

            <m.p
              variants={itemVariants}
              className='text-sm md:text-base text-muted-foreground/80 mb-6 tracking-[0.05em]'
            >
              {t('communityImseoMeta')}
            </m.p>

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em] mb-12'
            >
              {t('communityImseoBody')}
            </m.p>

            <m.div variants={itemVariants} className='flex flex-col items-center gap-4'>
              <Link
                href={isCafePlaceholder ? '#' : cafeUrl}
                aria-disabled={isCafePlaceholder}
                tabIndex={isCafePlaceholder ? -1 : undefined}
                target={isCafePlaceholder ? undefined : '_blank'}
                rel={isCafePlaceholder ? undefined : 'noopener noreferrer'}
                className={isCafePlaceholder ? 'pointer-events-none' : ''}
              >
                <Button
                  size='lg'
                  disabled={isCafePlaceholder}
                  className='h-12 md:h-14 px-8 text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50'
                >
                  {t('communityImseoCtaLabel')}
                </Button>
              </Link>

              <a
                href='mailto:info@orientalcalligraphy.org'
                className='text-sm text-muted-foreground/80 hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline'
              >
                {t('communityImseoMailLabel')}
              </a>
            </m.div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
