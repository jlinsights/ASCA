'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { TypewriterEffect } from '@/components/ui/typewriter-effect'
import { HanjaMark } from '@/components/brand/hanja-mark'

export function HeroSection() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLElement>(null)

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 50,
        damping: 20,
      },
    },
  }

  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={containerRef}
        className='relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden'
      >
        {/* Hero Content */}
        <m.div
          className='relative z-10 container mx-auto px-4 py-20 md:py-32'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <div className='max-w-5xl mx-auto text-center'>
            {/* Logo */}
            <m.div variants={itemVariants} className='mb-12'>
              <div className='relative w-64 h-24 md:w-80 md:h-32 lg:w-96 lg:h-36 mx-auto mb-8'>
                <Image
                  src='/logo/Logo & Tagline_white BG.png'
                  alt='동양서예협회'
                  fill
                  className='object-contain dark:invert drop-shadow-lg'
                  priority
                />
              </div>
            </m.div>

            {/* Main Heading — Hanja Mark (法古創新 · 人書俱老) */}
            <m.h1
              variants={itemVariants}
              aria-label={t('homeHeroL1')}
              className='mb-8 flex justify-center'
            >
              <HanjaMark variant='hero' color='ink' />
            </m.h1>

            {/* L1 Slogan (brand-guidelines §8) */}
            <m.p
              variants={itemVariants}
              className='text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground mb-8 tracking-wide leading-snug'
            >
              {t('homeHeroL1')}
            </m.p>

            {/* L2 Subcopy — Typewriter Effect */}
            <m.div
              variants={itemVariants}
              className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed min-h-[3.5rem] md:min-h-[4rem]'
            >
              <TypewriterEffect text={t('homeHeroL2')} duration={3} delay={1} />
            </m.div>

            {/* Enhanced CTA Buttons */}
            <m.div
              variants={itemVariants}
              className='flex flex-col sm:flex-row gap-4 justify-center items-center'
            >
              <Link href='/exhibitions'>
                <Button
                  size='lg'
                  className='group h-14 px-8 text-lg bg-celadon-green hover:bg-celadon-green/90 text-rice-paper shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
                >
                  <Sparkles className='mr-2 h-5 w-5 group-hover:rotate-12 transition-transform' />
                  전시회 둘러보기
                  <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
                </Button>
              </Link>

              <Link href='/artworks'>
                <Button
                  size='lg'
                  variant='outline'
                  className='group h-14 px-8 text-lg border-2 border-scholar-red text-scholar-red hover:bg-scholar-red hover:text-rice-paper shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
                >
                  작품 감상하기
                  <ArrowRight className='ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform' />
                </Button>
              </Link>
            </m.div>

            {/* Scroll Indicator */}
            <m.div variants={itemVariants} className='mt-16 md:mt-20'>
              <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                <span className='text-sm tracking-wider uppercase'>Scroll</span>
                <div className='w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2'>
                  <div className='w-1 h-3 bg-muted-foreground/50 rounded-full animate-bounce' />
                </div>
              </div>
            </m.div>
          </div>
        </m.div>

        {/* Decorative Elements */}
        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10' />
      </section>
    </LazyMotion>
  )
}
