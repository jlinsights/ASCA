"use client"

import { useState, useCallback, memo } from "react"
import Link from "next/link"
import { Menu, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import type { NavigationItem } from "@/types/globals"
import type { MouseEventHandler } from "react"
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs"

// 네비게이션 링크 컴포넌트 메모화
const NavigationLink = memo(({ 
  href, 
  children, 
  onClick,
  className = "relative text-navy-primary/80 dark:text-white/80 hover:text-navy-primary dark:hover:text-white font-medium transition-fo group"
}: {
  href: string
  children: React.ReactNode
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined
  className?: string
}) => {
  // 외부 링크인지 확인
  const isExternal = href.startsWith('http')
  
  return (
    <Link 
      href={href} 
      className={className} 
      {...(onClick ? { onClick } : {})}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {/* 호버 언더라인 효과 */}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-bronze group-hover:w-full transition-fo" />
    </Link>
  )
})

NavigationLink.displayName = "NavigationLink"

export const Header = memo(function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useUser()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback<MouseEventHandler<HTMLAnchorElement>>(() => {
    setIsMenuOpen(false)
  }, [])

  // 특정 이메일인지 확인
  const isAdminUser = user?.emailAddresses?.some(
    email => email.emailAddress === "jhlim725@gmail.com"
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-fo">
      {/* 글래스모피즘 배경 */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/80 dark:bg-navy-primary/80 border-b border-white/20 dark:border-white/10">
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-primary/5 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 relative">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center group">
            <span className="text-xl md:text-2xl font-heading font-bold">
              <span className="text-navy-primary dark:text-white group-hover:text-forest-primary dark:group-hover:text-bronze-primary transition-fo">
                FamilyOffice
              </span>
              <span className="text-gradient-bronze"> S</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile - ThemeToggle과 햄버거 메뉴 */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                className="glass-card hover:glass hover:scale-105 transition-fo w-8 h-8" 
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {/* Desktop menu */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {NAVIGATION_ITEMS.map(({ href, label }: NavigationItem) => (
                <NavigationLink key={href} href={href}>
                  {label}
                </NavigationLink>
              ))}
              
              {/* 로그아웃 상태 - 로그인/회원가입 버튼 */}
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    variant="ghost" 
                    className="relative text-navy-primary dark:text-white hover:text-forest-primary dark:hover:text-bronze-primary transition-fo font-medium text-sm lg:text-base"
                  >
                    로그인
                  </Button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <Button 
                    variant="default" 
                    className="relative bg-gradient-forest hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 text-white shadow-forest hover:shadow-forest-hover hover:scale-105 transition-fo overflow-hidden group text-sm lg:text-base px-4 lg:px-6"
                  >
                    회원가입
                  </Button>
                </SignUpButton>
              </SignedOut>
              
              {/* 로그인 상태 - 상담 신청 버튼과 사용자 버튼 */}
              <SignedIn>
                {/* 관리자 전용 설정 아이콘 */}
                {isAdminUser && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative text-navy-primary dark:text-white hover:text-forest-primary dark:hover:text-bronze-primary transition-fo"
                    asChild
                  >
                    <Link href="/dashboard" title="대시보드">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                
                <Button 
                  variant="default" 
                  className="relative bg-gradient-forest hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 text-white shadow-forest hover:shadow-forest-hover hover:scale-105 transition-fo overflow-hidden group text-sm lg:text-base px-4 lg:px-6"
                  asChild
                >
                  <Link href="/contact">
                    상담 신청
                  </Link>
                </Button>
                
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full border-2 border-white/20 shadow-lg hover:border-gold-primary/50 transition-all",
                      userButtonPopoverCard: "glass-card border border-white/20",
                      userButtonPopoverActionButton: "hover:bg-burgundy-primary/10 text-navy-primary dark:text-white"
                    }
                  }}
                />
              </SignedIn>
              
              {/* Desktop ThemeToggle - 맨 오른쪽 */}
              <ThemeToggle />
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-3 pb-3 space-y-2 animate-slide-down">
            {/* 모바일 메뉴 배경 */}
            <div className="glass-card p-4 space-y-3">
              {NAVIGATION_ITEMS.map(({ href, label }: NavigationItem) => (
                <NavigationLink 
                  key={href} 
                  href={href} 
                  onClick={closeMenu}
                  className="block py-2 text-navy-primary dark:text-white hover:text-gradient-brand font-medium transition-fo group text-base"
                >
                  {label}
                </NavigationLink>
              ))}
              
              {/* 구분선 */}
              <hr className="border-white/20 dark:border-white/10 my-3" />
              
              {/* 로그아웃 상태 - 로그인/회원가입 버튼 */}
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="w-full text-navy-primary dark:text-white hover:text-forest-primary dark:hover:text-bronze-primary transition-fo font-medium py-3"
                    onClick={toggleMenu}
                  >
                    로그인
                  </Button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <Button
                    variant="default"
                    className="w-full bg-gradient-forest hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 text-white shadow-forest hover:shadow-forest-hover transition-fo py-3"
                    onClick={toggleMenu}
                  >
                    회원가입
                  </Button>
                </SignUpButton>
              </SignedOut>
              
              {/* 로그인 상태 - 사용자 정보와 상담 신청 */}
              <SignedIn>
                <div className="flex items-center justify-between py-2">
                  <span className="text-navy-primary dark:text-white font-medium text-base">내 계정</span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 rounded-full border-2 border-white/20 shadow-lg hover:border-gold-primary/50 transition-all",
                        userButtonPopoverCard: "glass-card border border-white/20",
                        userButtonPopoverActionButton: "hover:bg-burgundy-primary/10 text-navy-primary dark:text-white"
                      }
                    }}
                  />
                </div>
                
                {/* 관리자 전용 설정 메뉴 */}
                {isAdminUser && (
                  <Button
                    variant="ghost"
                    className="w-full text-navy-primary dark:text-white hover:text-forest-primary dark:hover:text-bronze-primary transition-fo font-medium py-3 flex items-center justify-center gap-2"
                    onClick={toggleMenu}
                    asChild
                  >
                    <Link href="/dashboard">
                      <Settings className="h-4 w-4" />
                      대시보드
                    </Link>
                  </Button>
                )}
                
                <Button
                  variant="default"
                  className="w-full bg-gradient-forest hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 text-white shadow-forest hover:shadow-forest-hover transition-fo py-3"
                  onClick={toggleMenu}
                  asChild
                >
                  <Link href="/contact">상담 신청</Link>
                </Button>
              </SignedIn>
              
              {/* 모바일 메뉴 내 테마 토글 */}
              <div className="flex items-center justify-between py-2">
                <span className="text-navy-primary dark:text-white font-medium text-base">테마 설정</span>
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
})
