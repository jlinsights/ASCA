'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

import { HeaderAuthSection } from './header-auth-section'
import { HeaderMobileAuth } from './header-mobile-auth'
import { ThemeTransition } from '../theme-transition'
import { Logo } from '../brand/logo'
import { useLanguage } from '@/contexts/language-context'

import { usePathname } from 'next/navigation'

export function Header({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({})
  const headerRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuStructure = [
    {
      title: '작가',
      key: 'artists',
      href: '/artists',
      subItems: [
        { title: '작가 소개', href: '/artists' },
        { title: '공모작가', href: '/artists?type=공모작가' },
        { title: '청년작가', href: '/artists?type=청년작가' },
        { title: '추천작가', href: '/artists?type=추천작가' },
        { title: '초대작가', href: '/artists?type=초대작가' },
      ],
    },
    {
      title: '작품',
      key: 'artworks',
      href: '/artworks',
      subItems: [
        { title: '전체 작품', href: '/artworks' },
        { title: '한글서예', href: '/artworks?category=한글서예' },
        { title: '한자서예', href: '/artworks?category=한자서예' },
        { title: '문인화', href: '/artworks?category=문인화' },
        { title: '수묵화', href: '/artworks?category=수묵화' },
        { title: '민화', href: '/artworks?category=민화' },
        { title: '현대서예', href: '/artworks?category=현대서예' },
        { title: '캘리그라피', href: '/artworks?category=캘리그라피' },
        { title: '전각', href: '/artworks?category=전각' },
        { title: '서각', href: '/artworks?category=서각' },
      ],
    },
    {
      title: '전시회',
      key: 'exhibitions',
      href: '/exhibitions',
      subItems: [
        { title: '현재 전시', href: '/exhibitions/current' },
        { title: '예정 전시', href: '/exhibitions/upcoming' },
        { title: '지난 전시', href: '/exhibitions/past' },
        { title: '온라인 전시', href: '/exhibitions/online' },
      ],
    },
    {
      title: '공모전',
      key: 'contests',
      href: '/contests',
      subItems: [
        { title: '진행중 공모전', href: '/contests?status=open' },
        { title: '마감된 공모전', href: '/contests?status=closed' },
        { title: '내 신청 현황', href: '/profile/applications' },
      ],
    },
    {
      title: '갤러리',
      key: 'gallery',
      href: '/gallery',
      subItems: [
        { title: '협회 활동', href: '/gallery' },
        { title: '행사 사진', href: '/events' },
      ],
    },
    {
      title: '강좌',
      key: 'academy',
      href: '/academy',
    },
    {
      title: '블로그',
      key: 'blog',
      href: '/blog',
    },
  ]

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

  if (pathname?.startsWith('/admin')) return null

  const isTransparentOnTop = (isHome || transparentOnTop) && !isScrolled && !isMenuOpen

  return (
    <>
      <ThemeTransition clickPosition={null} />
      <header
        ref={headerRef}
        className='fixed top-0 left-0 right-0 z-50 transition-all duration-300'
        style={{
          height: '56px',
          backgroundColor: isTransparentOnTop
            ? 'transparent'
            : isScrolled
            ? 'rgba(9,9,9,0.88)'
            : 'var(--framer-canvas)',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: isTransparentOnTop
            ? '1px solid transparent'
            : '1px solid var(--framer-hairline-soft)',
        }}
      >
        <div
          className='flex items-center justify-between h-full'
          style={{ maxWidth: '1199px', margin: '0 auto', padding: '0 30px' }}
        >
          {/* Logo — Left */}
          <a
            href='https://orientalcalligraphy.org'
            className='flex items-center flex-shrink-0'
            style={{ textDecoration: 'none' }}
          >
            <Logo width={130} height={44} className='h-9 w-auto' />
          </a>

          {/* Desktop Navigation — Center */}
          <nav
            className='hidden md:flex items-center'
            role='navigation'
            aria-label='주 메뉴'
            style={{ gap: '4px' }}
          >
            {menuStructure.map(menu => (
              <div
                key={menu.key}
                className='relative'
                onMouseEnter={menu.subItems?.length ? () => handleMouseEnter(menu.key) : undefined}
                onMouseLeave={menu.subItems?.length ? handleMouseLeave : undefined}
              >
                <Link
                  href={menu.href}
                  className='flex items-center gap-1 transition-colors duration-150'
                  style={{
                    color: 'var(--framer-ink-muted)',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '-0.14px',
                    fontFamily: 'Inter, sans-serif',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink)'
                    ;(e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--framer-surface-1)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink-muted)'
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                  aria-haspopup={menu.subItems?.length ? 'menu' : undefined}
                  aria-expanded={menu.subItems?.length ? activeDropdown === menu.key : undefined}
                >
                  {menu.title}
                  {(menu.subItems?.length ?? 0) > 0 && (
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        activeDropdown === menu.key ? 'rotate-180' : ''
                      }`}
                      aria-hidden='true'
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {(menu.subItems?.length ?? 0) > 0 && (
                  <div
                    role='menu'
                    aria-label={`${menu.title} 하위 메뉴`}
                    className={`absolute top-full left-0 transition-all duration-200 z-50 ${
                      activeDropdown === menu.key
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-1'
                    }`}
                    style={{
                      marginTop: '6px',
                      minWidth: '176px',
                      backgroundColor: 'var(--framer-surface-1)',
                      border: '1px solid var(--framer-hairline)',
                      borderRadius: '10px',
                      padding: '6px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                  >
                    {menu.subItems?.map((subItem, index) => (
                      <Link
                        key={index}
                        href={subItem.href}
                        role='menuitem'
                        style={{
                          display: 'block',
                          color: 'var(--framer-ink-muted)',
                          fontSize: '13px',
                          fontWeight: 500,
                          letterSpacing: '-0.13px',
                          fontFamily: 'Inter, sans-serif',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          transition: 'color 0.12s, background-color 0.12s',
                        }}
                        onMouseEnter={e => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--framer-ink)'
                          ;(e.currentTarget as HTMLElement).style.backgroundColor =
                            'var(--framer-surface-2)'
                        }}
                        onMouseLeave={e => {
                          ;(e.currentTarget as HTMLElement).style.color =
                            'var(--framer-ink-muted)'
                          ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        }}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Right — Pill CTAs */}
          <div className='hidden md:flex items-center' style={{ gap: '8px' }}>
            <HeaderAuthSection />
          </div>

          {/* Mobile — Hamburger */}
          <div className='md:hidden flex items-center' style={{ gap: '8px' }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='flex items-center justify-center transition-colors'
              style={{
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--framer-surface-1)',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--framer-ink)',
              }}
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id='mobile-menu'
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'var(--framer-canvas)',
              borderTop: '1px solid var(--framer-hairline-soft)',
              overflowY: 'auto',
              zIndex: 49,
            }}
          >
            <nav
              style={{ padding: '16px 20px 32px', maxWidth: '1199px', margin: '0 auto' }}
              role='navigation'
              aria-label='모바일 메뉴'
            >
              {menuStructure.map(menu => (
                <div key={menu.key} style={{ marginBottom: '2px' }}>
                  <div className='flex items-center justify-between'>
                    <Link
                      href={menu.href}
                      style={{
                        flex: 1,
                        display: 'block',
                        color: 'var(--framer-ink)',
                        fontSize: '15px',
                        fontWeight: 500,
                        letterSpacing: '-0.15px',
                        fontFamily: 'Inter, sans-serif',
                        padding: '12px 10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        minHeight: '44px',
                        lineHeight: '20px',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                    {(menu.subItems?.length ?? 0) > 0 && (
                      <button
                        onClick={() => toggleMobileDropdown(menu.key)}
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--framer-ink-muted)',
                          minWidth: '40px',
                          minHeight: '40px',
                        }}
                        aria-label={`${menu.title} 하위 메뉴 ${mobileDropdowns[menu.key] ? '닫기' : '열기'}`}
                        aria-expanded={mobileDropdowns[menu.key]}
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
                  {(menu.subItems?.length ?? 0) > 0 && (
                    <div
                      style={{
                        paddingLeft: '16px',
                        overflow: 'hidden',
                        transition: 'max-height 0.2s ease',
                        maxHeight: mobileDropdowns[menu.key] ? '400px' : '0',
                      }}
                    >
                      {menu.subItems?.map((subItem, index) => (
                        <Link
                          key={index}
                          href={subItem.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--framer-ink-muted)',
                            fontSize: '13px',
                            fontWeight: 500,
                            letterSpacing: '-0.13px',
                            fontFamily: 'Inter, sans-serif',
                            padding: '10px 10px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            minHeight: '44px',
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile auth */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--framer-hairline-soft)',
                }}
              >
                <HeaderMobileAuth onCloseMenu={() => setIsMenuOpen(false)} />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
