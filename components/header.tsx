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

// @deprecated Use LayoutHeader from @/components/layout/layout-header instead
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({})
  const headerRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  const menuStructure = [
    {
      title: "작가",
      key: "artists",
      href: "/artists", 
      subItems: [
        { title: "작가 소개", href: "/artists" },
        { title: "공모작가", href: "/artists?type=공모작가" },
        { title: "청년작가", href: "/artists?type=청년작가" },
        { title: "추천작가", href: "/artists?type=추천작가" },
        { title: "초대작가", href: "/artists?type=초대작가" }
      ]
    },
    {
      title: "작품",
      key: "artworks", 
      href: "/artworks",
      subItems: [
        { title: "전체 작품", href: "/artworks" },
        { title: "한글서예", href: "/artworks?category=한글서예" },
        { title: "한자서예", href: "/artworks?category=한자서예" },
        { title: "문인화", href: "/artworks?category=문인화" },
        { title: "수묵화", href: "/artworks?category=수묵화" },
        { title: "민화", href: "/artworks?category=민화" },
        { title: "현대서예", href: "/artworks?category=현대서예" },
        { title: "캘리그라피", href: "/artworks?category=캘리그라피" },
        { title: "전각", href: "/artworks?category=전각" },
        { title: "서각", href: "/artworks?category=서각" }
      ]
    },
    {
      title: "전시회",
      key: "exhibitions",
      href: "/exhibitions",
      subItems: [
        { title: "현재 전시", href: "/exhibitions/current" },
        { title: "예정 전시", href: "/exhibitions/upcoming" },
        { title: "지난 전시", href: "/exhibitions/past" },
        { title: "온라인 전시", href: "/exhibitions/online" }
      ]
    },
    {
      title: "공모전",
      key: "contests", 
      href: "/contests",
      subItems: [
        { title: "진행중 공모전", href: "/contests?status=open" },
        { title: "마감된 공모전", href: "/contests?status=closed" },
        { title: "내 신청 현황", href: "/profile/applications" }
      ]
    },
    {
      title: "갤러리",
      key: "gallery", 
      href: "/gallery",
      subItems: [
        { title: "협회 활동", href: "/gallery" },
        { title: "행사 사진", href: "/events" }
      ]
    },
    {
      title: "블로그",
      key: "blog", 
      href: "/blog"
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
      <header ref={headerRef} className="border-b border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/40 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <a href="https://orientalcalligraphy.org" className="flex items-center">
              <Logo 
                width={150} 
                height={50} 
                className="h-10 md:h-12 lg:h-14 w-auto" 
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="주 메뉴">
              {menuStructure.map((menu) => (
                <div
                  key={menu.key}
                  className="relative group"
                  onMouseEnter={menu.subItems?.length ? () => handleMouseEnter(menu.key) : undefined}
                  onMouseLeave={menu.subItems?.length ? handleMouseLeave : undefined}
                >
                  <Link
                    href={menu.href}
                    className="flex items-center gap-1 text-sm font-medium hover:text-celadon-green transition-colors py-4 px-2 relative after:content-[''] after:absolute after:bottom-2 after:left-0 after:w-0 after:h-0.5 after:bg-celadon-green after:transition-all after:duration-300 hover:after:w-full"
                    aria-haspopup={menu.subItems?.length ? "menu" : undefined}
                    aria-expanded={menu.subItems?.length ? activeDropdown === menu.key : undefined}
                  >
                    {menu.title}
                    {(menu.subItems?.length ?? 0) > 0 && (
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" aria-hidden="true" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {(menu.subItems?.length ?? 0) > 0 && (
                    <div
                      role="menu"
                      aria-label={`${menu.title} 하위 메뉴`}
                      className={`absolute top-full left-0 w-48 glass-panel rounded-lg transition-all duration-200 z-50 ${
                        activeDropdown === menu.key
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2'
                      }`}
                    >
                      <div className="py-2">
                        {menu.subItems?.map((subItem, index) => {
                          const isExternalLink = subItem.href.startsWith('http')
                          return isExternalLink ? (
                            <a
                              key={index}
                              href={subItem.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset"
                            >
                              {subItem.title}
                            </a>
                          ) : (
                            <Link
                              key={index}
                              href={subItem.href}
                              role="menuitem"
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset"
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
                검색
              </Link>
            </nav>

            {/* Desktop Auth & Controls */}
            <div className="hidden lg:flex items-center space-x-3">
              <HeaderAuthSection />

              <ThemeToggle onToggle={handleThemeToggle} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded text-foreground hover:bg-foreground/10 transition-colors"
              aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>

            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle onToggle={handleThemeToggle} />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded text-foreground hover:bg-foreground/10 transition-colors ml-2"
                aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div id="mobile-menu" className="lg:hidden bg-background border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 shadow-lg">
            <nav className="container mx-auto px-4 py-6 space-y-2" role="navigation" aria-label="모바일 메뉴">
              {menuStructure.map((menu) => (
                <div key={menu.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={menu.href}
                      className="flex-1 text-sm font-medium py-3 px-2 hover:bg-foreground/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                    {(menu.subItems?.length ?? 0) > 0 && (
                      <button
                        onClick={() => toggleMobileDropdown(menu.key)}
                        className="p-2 hover:bg-foreground/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green"
                        aria-label={`${menu.title} 하위 메뉴 ${mobileDropdowns[menu.key] ? '닫기' : '열기'}`}
                        aria-expanded={mobileDropdowns[menu.key]}
                        aria-controls={`mobile-submenu-${menu.key}`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          mobileDropdowns[menu.key] ? 'rotate-180' : ''
                        }`} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {(menu.subItems?.length ?? 0) > 0 && (
                    <div
                      id={`mobile-submenu-${menu.key}`}
                      role="menu"
                      aria-label={`${menu.title} 하위 메뉴`}
                      className={`pl-4 space-y-1 overflow-hidden transition-all duration-200 ${
                        mobileDropdowns[menu.key] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {menu.subItems?.map((subItem, index) => {
                        const isExternalLink = subItem.href.startsWith('http')
                        return isExternalLink ? (
                          <a
                            key={index}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            role="menuitem"
                            className="block text-sm text-muted-foreground py-2 px-2 hover:bg-foreground/5 hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.title}
                          </a>
                        ) : (
                          <Link
                            key={index}
                            href={subItem.href}
                            role="menuitem"
                            className="block text-sm text-muted-foreground py-2 px-2 hover:bg-foreground/5 hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset"
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
                  href="/blog"
                  className="block text-sm font-medium py-3 px-2 hover:bg-foreground/5 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  블로그
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
