'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

import { HeaderAuthSection } from './header-auth-section'
import { HeaderMobileAuth } from './header-mobile-auth'
import { ThemeToggle } from '../theme-toggle'
import { ThemeTransition } from '../theme-transition'
import { LanguageSelector } from '../language-selector'
import { Logo } from '../brand/logo'
import { useLanguage } from '@/contexts/language-context'
import { headerMenu as menuStructure } from '../layout/site-menu'
import { usePathname } from 'next/navigation'

// 메뉴 구조는 components/layout/site-menu.ts 에서 푸터와 함께 관리한다
export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({})
  const headerRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    // Check initial scroll
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      [key]: !prev[key],
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

  // 모바일 메뉴 열림 시 body 스크롤 잠금 + focus trap
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      const menu = document.getElementById('mobile-menu')
      if (!menu) return
      const focusable = menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0] as HTMLElement | undefined
      const last = focusable[focusable.length - 1] as HTMLElement | undefined
      if (!first || !last) return
      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      menu.addEventListener('keydown', trap)
      first.focus()
      return () => {
        menu.removeEventListener('keydown', trap)
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

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

  // Header Style Calculation
  const isTargetPage = isHome || transparentOnTop

  // Use fixed positioning on target pages (Home) to overlay content
  // Use sticky on other pages to push content
  const positionClass = isTargetPage ? 'fixed top-0 left-0 right-0' : 'sticky top-0'

  const isTransparent = (isHome || transparentOnTop) && !isScrolled && !isMenuOpen

  // Hide header on admin pages
  if (pathname?.startsWith('/admin')) return null

  const headerClass = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white/70 dark:bg-black/70 backdrop-blur-md border-white/10 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/40 shadow-sm'

  return (
    <>
      <ThemeTransition clickPosition={clickPosition} />
      <header
        ref={headerRef}
        className={`${positionClass} z-50 transition-all duration-300 border-b ${headerClass}`}
      >
        <div className='container'>
          <div className='flex items-center justify-between h-14 md:h-16'>
            <Link href='/' className='flex shrink-0 items-center'>
              <Logo width={150} height={50} className='h-10 md:h-12 lg:h-14 w-auto' />
            </Link>

            {/* Desktop Navigation — 4개 언어 메뉴가 한 줄에 들어가는 xl(1280px) 이상에서만. 그 아래는 햄버거 메뉴 */}
            <nav
              className='hidden xl:flex items-center space-x-1 2xl:space-x-6'
              role='navigation'
              aria-label={t('siteMainNav')}
            >
              {menuStructure.map(menu => (
                <div
                  key={menu.key}
                  className='relative group'
                  onMouseEnter={menu.items?.length ? () => handleMouseEnter(menu.key) : undefined}
                  onMouseLeave={menu.items?.length ? handleMouseLeave : undefined}
                >
                  <Link
                    href={menu.href}
                    className="flex items-center gap-1 whitespace-nowrap text-sm font-medium hover:text-celadon-green transition-colors py-4 px-2 relative after:content-[''] after:absolute after:bottom-2 after:left-0 after:w-0 after:h-0.5 after:bg-celadon-green after:transition-all after:duration-300 hover:after:w-full"
                    aria-haspopup={menu.items?.length ? 'menu' : undefined}
                    aria-expanded={menu.items?.length ? activeDropdown === menu.key : undefined}
                  >
                    {t(menu.labelKey)}
                    {(menu.items?.length ?? 0) > 0 && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === menu.key ? 'rotate-180' : ''}`}
                        aria-hidden='true'
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {(menu.items?.length ?? 0) > 0 && (
                    <div
                      role='menu'
                      aria-label={`${t(menu.labelKey)} ${t('siteSubmenu')}`}
                      className={`absolute top-full left-0 w-48 glass-panel rounded-lg transition-all duration-200 z-50 ${
                        activeDropdown === menu.key
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible -translate-y-2'
                      }`}
                    >
                      <div className='py-2'>
                        {menu.items?.map((subItem, index) => {
                          const isExternalLink = subItem.href.startsWith('http')
                          return isExternalLink ? (
                            <a
                              key={index}
                              href={subItem.href}
                              target='_blank'
                              rel='noopener noreferrer'
                              role='menuitem'
                              className='block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset'
                            >
                              {t(subItem.labelKey)}
                            </a>
                          ) : (
                            <Link
                              key={index}
                              href={subItem.href}
                              role='menuitem'
                              className='block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset'
                            >
                              {t(subItem.labelKey)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Additional Menu Items */}
              <Link
                href='/search'
                className='whitespace-nowrap text-sm font-medium hover:text-foreground/80 transition-colors py-4 px-2'
              >
                {t('siteNavSearch')}
              </Link>
            </nav>

            {/* Desktop Auth & Controls */}
            <div
              data-testid='header-desktop-controls'
              className='hidden xl:flex items-center space-x-3'
            >
              <HeaderAuthSection />

              <LanguageSelector variant='compact' />

              <ThemeToggle onToggle={handleThemeToggle} />
            </div>

            {/* Mobile Controls */}
            <div className='xl:hidden flex items-center gap-2'>
              <ThemeToggle onToggle={handleThemeToggle} />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-foreground hover:bg-foreground/10 active:bg-foreground/20 transition-colors'
                aria-label={isMenuOpen ? t('siteMenuClose') : t('siteMenuOpen')}
                aria-expanded={isMenuOpen}
                aria-controls='mobile-menu'
              >
                {isMenuOpen ? (
                  <X className='h-5 w-5' aria-hidden='true' />
                ) : (
                  <Menu className='h-5 w-5' aria-hidden='true' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id='mobile-menu'
            className='xl:hidden bg-background border-t border-[#222222]/10 dark:border-[#fcfcfc]/10 shadow-lg'
          >
            <nav
              className='container py-6 space-y-2'
              role='navigation'
              aria-label={t('siteMobileNav')}
            >
              {menuStructure.map(menu => (
                <div key={menu.key} className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <Link
                      href={menu.href}
                      className='flex-1 text-sm font-medium py-3 px-2 hover:bg-foreground/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(menu.labelKey)}
                    </Link>
                    {(menu.items?.length ?? 0) > 0 && (
                      <button
                        onClick={() => toggleMobileDropdown(menu.key)}
                        className='p-2 hover:bg-foreground/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green'
                        aria-label={`${t(menu.labelKey)} ${t('siteSubmenu')}`}
                        aria-expanded={mobileDropdowns[menu.key]}
                        aria-controls={`mobile-submenu-${menu.key}`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileDropdowns[menu.key] ? 'rotate-180' : ''
                          }`}
                          aria-hidden='true'
                        />
                      </button>
                    )}
                  </div>
                  {(menu.items?.length ?? 0) > 0 && (
                    <div
                      id={`mobile-submenu-${menu.key}`}
                      role='menu'
                      aria-label={`${t(menu.labelKey)} ${t('siteSubmenu')}`}
                      className={`pl-4 space-y-1 overflow-hidden transition-all duration-200 ${
                        mobileDropdowns[menu.key]
                          ? 'max-h-[40rem] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      {menu.items?.map((subItem, index) => {
                        const isExternalLink = subItem.href.startsWith('http')
                        return isExternalLink ? (
                          <a
                            key={index}
                            href={subItem.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            role='menuitem'
                            className='block text-sm text-muted-foreground py-3 px-3 min-h-[44px] flex items-center hover:bg-foreground/5 hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset'
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {t(subItem.labelKey)}
                          </a>
                        ) : (
                          <Link
                            key={index}
                            href={subItem.href}
                            role='menuitem'
                            className='block text-sm text-muted-foreground py-3 px-3 min-h-[44px] flex items-center hover:bg-foreground/5 hover:text-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-celadon-green focus:ring-inset'
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {t(subItem.labelKey)}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className='pt-4 border-t border-border/50'>
                <LanguageSelector variant='mobile' />
              </div>

              <HeaderMobileAuth onCloseMenu={() => setIsMenuOpen(false)} />
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
