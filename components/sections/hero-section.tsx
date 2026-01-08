'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { GSAP_CONFIG } from '@/lib/utils/gsap-utils'

gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin)

export function HeroSection() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  
  // Refs for animation targets
  const logoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: GSAP_CONFIG.ease.smooth } })

    // Initial Entrance Animation
    tl.fromTo(logoRef.current, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: GSAP_CONFIG.duration.slow }
    )
    .fromTo(titleRef.current?.children || [], 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: GSAP_CONFIG.duration.slow, stagger: GSAP_CONFIG.stagger.medium },
      "-=0.4"
    )
    // Subtitle Text Reveal (Typewriter/Calligraphy effect)
    .fromTo(subtitleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.1 }, // Quick fade in before typing starts
      "-=0.2"
    )
    .to(subtitleRef.current, {
      text: {
        value: "전통 서예의 정법을 계승하고 현대적 창신을 통해<br />동양서예의 새로운 미래를 열어갑니다",
        delimiter: "" 
      },
      duration: 3,
      ease: "none",
    })
    .fromTo(buttonsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: GSAP_CONFIG.duration.base },
      "-=0.5"
    )
    .fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: GSAP_CONFIG.duration.slow },
      "-=0.2"
    )

    // Parallax Background Effect
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        yPercent: 30, // Move background down 30% as user scrolls
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      })
    }

  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Calligraphy Artwork with Overlay - Parallax Target */}
      <div ref={bgRef} className="absolute inset-0 z-0 scale-110"> {/* Scale up slightly to prevent whitespace during parallax */}
        <Image
          src="/images/hero_bg_calligraphy.png"
          alt="Traditional Calligraphy Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-[url('/patterns/korean-pattern.png')] bg-repeat" />
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-white/30 dark:bg-black/30 mix-blend-overlay" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div ref={logoRef} className="mb-12 opacity-0">
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

          {/* Main Heading */}
          <h1 ref={titleRef} className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-foreground mb-6 tracking-wide">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-celadon-green via-scholar-red to-temple-gold opacity-0">
              正法의 계승
            </span>
            <span className="block mt-2 opacity-0">創新의 조화</span>
          </h1>

          {/* Subtitle - Empty initially for TextPlugin */}
          <p ref={subtitleRef} className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed opacity-0 min-h-[3.5rem] md:min-h-[4rem]">
            {/* Content populated by GSAP TextPlugin */}
          </p>

          {/* Enhanced CTA Buttons */}
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0">
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
          <div ref={scrollRef} className="mt-16 md:mt-20 opacity-0">
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
