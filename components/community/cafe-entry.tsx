'use client'

/**
 * /community - CafeEntry 섹션 (D5)
 *
 * design §3·§6.4 — 2 카드 (네이버 카페 / 카카오톡 오픈채팅).
 * SSOT: community-marketing-playbook §3 채널 아키텍처.
 *
 * OQ#2 deferred 운영: URL placeholder ('#')일 때 aria-disabled.
 * D4 ImseoCard에서 검증된 placeholder 패턴 재사용.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'

type CafeChannel = {
  urlKey: string
  labelKey: string
}

const CAFE_CHANNELS: readonly CafeChannel[] = [
  { urlKey: 'communityCafeNaverUrl', labelKey: 'communityCafeNaverLabel' },
  { urlKey: 'communityKakaoUrl', labelKey: 'communityCafeKakaoLabel' },
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

function isPlaceholder(url: string, key: string): boolean {
  return url === '#' || url === key
}

export function CafeEntry() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='community-cafe-heading'
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
              id='community-cafe-heading'
              variants={itemVariants}
              className='text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-foreground text-center mb-4 tracking-wide leading-tight'
            >
              {t('communityCafeTitle')}
            </m.h2>

            <m.div
              variants={itemVariants}
              aria-hidden='true'
              className='w-12 h-px bg-foreground/30 mx-auto mb-10'
            />

            <m.p
              variants={itemVariants}
              className='text-base md:text-lg text-muted-foreground leading-loose tracking-[0.02em] text-center max-w-2xl mx-auto mb-14'
            >
              {t('communityCafeBody')}
            </m.p>

            <m.nav
              aria-label='Cafe and open chat entries'
              variants={itemVariants}
              className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto'
            >
              {CAFE_CHANNELS.map(channel => {
                const url = t(channel.urlKey)
                const placeholder = isPlaceholder(url, channel.urlKey)
                return (
                  <Link
                    key={channel.urlKey}
                    href={placeholder ? '#' : url}
                    aria-disabled={placeholder}
                    tabIndex={placeholder ? -1 : undefined}
                    target={placeholder ? undefined : '_blank'}
                    rel={placeholder ? undefined : 'noopener noreferrer'}
                    className={placeholder ? 'pointer-events-none' : 'block'}
                  >
                    <Button
                      size='lg'
                      disabled={placeholder}
                      className='w-full h-12 md:h-14 px-4 text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50'
                    >
                      {t(channel.labelKey)}
                    </Button>
                  </Link>
                )
              })}
            </m.nav>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
