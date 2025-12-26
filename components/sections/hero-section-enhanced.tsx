'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export function HeroSectionEnhanced() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Calligraphy Artwork with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder background - replace with actual calligraphy artwork */}
        <div className="absolute inset-0 bg-gradient-to-br from-rice-paper via-silk-cream to-center-earth dark:from-ink-black dark:via-stone-gray dark:to-lacquer-black" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-[url('/patterns/korean-pattern.png')] bg-repeat" />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo with fade-in animation */}
          <div
            className={`mb-12 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative w-64 h-24 md:w-80 md:h-32 lg:w-96 lg:h-36 mx-auto mb-8">
              <Image
                src="/logo/Logo & Tagline_white BG.png"
                alt="동양서예협회"
                fill
                className="object-contain dark:invert drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Main Heading with staggered animation */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-foreground mb-6 tracking-wide transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-celadon-green via-scholar-red to-temple-gold">
              正法의 계승
            </span>
            <span className="block mt-2">創新의 조화</span>
          </h1>

          {/* Subtitle with animation */}
          <p
            className={`text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            전통 서예의 정법을 계승하고 현대적 창신을 통해<br className="hidden md:block" />
            동양서예의 새로운 미래를 열어갑니다
          </p>

          {/* Enhanced CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link href="/exhibitions">
              <Button
                size="lg"
                className="group h-14 px-8 text-lg bg-celadon-green hover:bg-celadon-green/90 text-rice-paper shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                전시회 둘러보기
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/artworks">
              <Button
                size="lg"
                variant="outline"
                className="group h-14 px-8 text-lg border-2 border-scholar-red text-scholar-red hover:bg-scholar-red hover:text-rice-paper shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                작품 감상하기
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`mt-16 md:mt-20 transition-all duration-1000 delay-800 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-sm tracking-wider uppercase">Scroll</span>
              <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
                <div className="w-1 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  )
}
