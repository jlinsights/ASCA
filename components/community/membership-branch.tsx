'use client'

/**
 * /community - MembershipBranch 섹션 (D6, 페이지 마지막)
 *
 * design §3·§6.5 — OQ#4 채택: 좌측 인주색 세로선 (BrandMessage 패턴 재사용).
 * SSOT: community-marketing-playbook §1.1 (위계 없이 평등한 동도 정신과의 분기 절제).
 *
 * 격조 의도: 페이지 면적 < 15% — 분기는 보조 영역, 동도 정체성을 압도하지 않음.
 * h3로 강등(BrandMessage h2 → h3), padding 축소, 본문 한 단락.
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
      staggerChildren: 0.14,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { y: 18, opacity: 0 },
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

export function MembershipBranch() {
  const { t } = useLanguage()

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby='community-membership-heading'
        className='py-16 md:py-20 lg:py-24 bg-background'
      >
        <div className='container mx-auto px-4'>
          <m.blockquote
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-80px' }}
            className='max-w-3xl mx-auto pl-6 md:pl-8 border-l-2 border-[color:var(--vermillion)]/70'
          >
            <m.h3
              id='community-membership-heading'
              variants={itemVariants}
              className='text-xl md:text-2xl font-serif font-medium text-foreground mb-4 tracking-wide leading-snug'
            >
              {t('communityMembershipTitle')}
            </m.h3>

            <m.p
              variants={itemVariants}
              className='text-base text-muted-foreground leading-relaxed mb-6'
            >
              {t('communityMembershipBody')}
            </m.p>

            <m.div variants={itemVariants}>
              <Link href='/membership' className='inline-block'>
                <Button
                  variant='outline'
                  size='default'
                  className='h-10 px-5 text-sm border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-colors duration-200'
                >
                  {t('communityMembershipCtaLabel')}
                </Button>
              </Link>
            </m.div>
          </m.blockquote>
        </div>
      </section>
    </LazyMotion>
  )
}
