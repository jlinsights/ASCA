"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Settings } from "lucide-react"

import { HeaderAuthSection } from "./header-auth-section"
import { HeaderMobileAuth } from "./header-mobile-auth"
import { ThemeToggle } from "./theme-toggle"
import { ThemeTransition } from "./theme-transition"
import { LanguageSelector } from "./language-selector"
import { Logo } from "./logo"
import { useLanguage } from "@/contexts/language-context"

// 메뉴 구조 정의

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({})
  const headerRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  const menuStructure = [
    {
      title: t("exhibition"),
      key: "exhibition",
      href: "/exhibitions",
      subItems: [
        { title: t("currentExhibitions"), href: "/exhibitions/current" },
        { title: t("upcomingExhibitions"), href: "/exhibitions/upcoming" },
        { title: t("pastExhibitions"), href: "/exhibitions/past" },
        { title: t("onlineExhibitions"), href: "/exhibitions/online" }
      ]
    },
    {
      title: t("artworks"),
      key: "artworks", 
      href: "/artworks",
      subItems: [
        { title: t("hangeulCalligraphy"), href: "/artworks?category=한글서예" },
        { title: t("hanjaCalligraphy"), href: "/artworks?category=한자서예" },
        { title: t("literatiPainting"), href: "/artworks?category=문인화" },
        { title: t("inkPainting"), href: "/artworks?category=수묵화" },
        { title: t("folkPainting"), href: "/artworks?category=민화" },
        { title: t("modernCalligraphy"), href: "/artworks?category=현대서예" },
        { title: t("calligraphyArt"), href: "/artworks?category=캘리그라피" },
        { title: t("sealEngraving"), href: "/artworks?category=전각" },
        { title: t("woodEngraving"), href: "/artworks?category=서각" }
      ]
    },
    {
      title: t("artists"),
      key: "artists",
      href: "/artists", 
      subItems: [
        { title: t("openCallArtists"), href: "/artists?type=공모작가" },
        { title: t("youngArtists"), href: "/artists?type=청년작가" },
        { title: t("recommendedArtists"), href: "/artists?type=추천작가" },
        { title: t("invitedArtists"), href: "/artists?type=초대작가" }
      ]
    },
    {
      title: t("events"),
      key: "events", 
      href: "/events",
      subItems: [
        { title: t("currentEvents"), href: "/events" },
        { title: t("calligraphyContest2025"), href: "/events/calligraphy-contest-2025" },
        { title: t("calligraphyContest2024"), href: "/events/calligraphy-contest-2024" }
      ]
    },
    {
      title: t("about"),
      key: "about",
      href: "/about",
      subItems: [
        { title: t("overview"), href: "/about" },
        { title: t("history"), href: "/history" },
        { title: t("organizationPage"), href: "/organization" },
        { title: t("brandGuidelines"), href: "/brand" }
      ]
    },
    {
      title: t("regulations"),
      key: "regulations",
      href: "/regulations",
      subItems: [
        { title: t("articles"), href: "/regulations/articles" },
        { title: t("operationJudging"), href: "/regulations/operation-judging" },
        { title: t("judgingSystem"), href: "https://jury.orientalcalligraphy.org" },
        { title: t("artistSelection"), href: "/regulations/artist-selection" },
        { title: t("qualifications"), href: "/regulations/qualifications" }
      ]
    },
    {
      title: t("guide"),
      key: "guide",
      href: "/notice",
      subItems: [
        { title: t("notices"), href: "/notice" },
        { title: t("news"), href: "/news" },
        { title: t("calligraphyLessons"), href: "/lessons" },
        { title: t("gallery"), href: "/gallery" },
        { title: t("fundraising"), href: "/fundraising" },
        { title: t("shop"), href: "/shop" }
      ]
    }
  ]

  const handleThemeToggle = (position: { x: number; y: number }) => {
    setClickPosition(position)
  }

  const handleMouseEnter = (key: string) => {
    setActiveDropdown(key)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  const toggleMobileDropdown = (key: string) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [])

  return (
    <>
      <ThemeTransition clickPosition={clickPosition} />
      <header ref={headerRef} className="border-b border-[#222222]/10 dark:border-[#fcfcfc]/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center">
              <Logo 
                width={150} 
                height={50} 
                className="h-10 md:h-12 lg:h-14 w-auto" 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {menuStructure.map((menu) => (
                <div
                  key={menu.key}
                  className="relative group"
                  onMouseEnter={menu.subItems.length > 0 ? () => handleMouseEnter(menu.key) : undefined}
                  onMouseLeave={menu.subItems.length > 0 ? handleMouseLeave : undefined}
                >
                  <Link 
                    href={menu.href}
                    className="flex items-center gap-1 text-sm font-medium hover:text-foreground/80 transition-colors py-4 px-2"
                  >
                    {menu.title}
                    {menu.subItems.length > 0 && (
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {menu.subItems.length > 0 && (
                    <div className={`absolute top-full left-0 w-48 bg-background border border-border rounded-lg shadow-lg transition-all duration-200 z-50 ${
                      activeDropdown === menu.key 
                        ? 'opacity-100 visible translate-y-0' 
                        : 'opacity-0 invisible -translate-y-2'
                    }`}>
                      <div className="py-2">
                        {menu.subItems.map((subItem, index) => {
                          const isExternalLink = subItem.href.startsWith('http')
                          return isExternalLink ? (
                            <a
                              key={index}
                              href={subItem.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                              {subItem.title}
                            </a>
                          ) : (
                            <Link
                              key={index}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                              {subItem.title}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Additional Menu Items */}
              <Link href="/search" className="text-sm font-medium hover:text-foreground/80 transition-colors py-4 px-2">
                {t("search")}
              </Link>
            </nav>

            {/* Desktop Auth & Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              <HeaderAuthSection />
              <ThemeToggle onToggle={handleThemeToggle} />
              <LanguageSelector />
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded text-foreground hover:bg-foreground/10 transition-colors"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle onToggle={handleThemeToggle} />
              <LanguageSelector />
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded text-foreground hover:bg-foreground/10 transition-colors ml-2"
                aria-label="메뉴 열기"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-background border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 shadow-lg">
            <nav className="container mx-auto px-4 py-6 space-y-2">
              {menuStructure.map((menu) => (
                <div key={menu.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={menu.href}
                      className="flex-1 text-sm font-medium py-3 px-2 hover:bg-foreground/5 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                    {menu.subItems.length > 0 && (
                      <button
                        onClick={() => toggleMobileDropdown(menu.key)}
                        className="p-2 hover:bg-foreground/5 rounded transition-colors"
                        aria-label={`${menu.title} 하위 메뉴 토글`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          mobileDropdowns[menu.key] ? 'rotate-180' : ''
                        }`} />
                      </button>
                    )}
                  </div>
                  {menu.subItems.length > 0 && (
                    <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-200 ${
                      mobileDropdowns[menu.key] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {menu.subItems.map((subItem, index) => {
                        const isExternalLink = subItem.href.startsWith('http')
                        return isExternalLink ? (
                          <a
                            key={index}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-muted-foreground py-2 px-2 hover:bg-foreground/5 hover:text-foreground rounded transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.title}
                          </a>
                        ) : (
                          <Link
                            key={index}
                            href={subItem.href}
                            className="block text-sm text-muted-foreground py-2 px-2 hover:bg-foreground/5 hover:text-foreground rounded transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-2 border-t border-border/50">
                <Link
                  href="/search"
                  className="block text-sm font-medium py-3 px-2 hover:bg-foreground/5 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  검색
                </Link>
              </div>
              
              <HeaderMobileAuth onCloseMenu={() => setIsMenuOpen(false)} />
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
