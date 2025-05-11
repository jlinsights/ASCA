"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border sticky top-0 z-50 transition-fo">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-navy-primary dark:text-dark-text-primary">
              패밀리오피스<span className="text-gold-primary">VIP</span>
            </span>
          </Link>

          <div className="flex items-center gap-16">
            {/* ThemeToggle과 햄버거 버튼 사이에 gap-4 추가 (모바일에서만) */}
            <div className="flex items-center gap-4 md:gap-0">
              <ThemeToggle />
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">메뉴 토글</span>
              </Button>
            </div>

            {/* Desktop menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/services"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              >
                서비스
              </Link>
              <Link
                href="/about"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              >
                소개
              </Link>
              <Link
                href="/case-studies"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              >
                사례
              </Link>
              <Link
                href="/bi"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-gold-primary dark:hover:text-gold-primary transition-fo"
              >
                {/* BI 가이드라인 메뉴 */}
                BI
              </Link>
              {/* '상담 신청' 버튼을 asChild+Link로 구현하여 /contact로 확실히 이동 */}
              <Button asChild variant="primary" className="ml-2">
                <Link href="/contact">상담 신청</Link>
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
            <Link
              href="/services"
              className="block py-3 text-base font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              서비스
            </Link>
            <Link
              href="/about"
              className="block py-3 text-base font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              소개
            </Link>
            <Link
              href="/case-studies"
              className="block py-3 text-base font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              사례
            </Link>
            <Link
              href="/bi"
              className="block py-3 text-base font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-gold-primary dark:hover:text-gold-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              {/* BI 가이드라인 메뉴 (모바일) */}
              BI
            </Link>
            {/* '상담 신청' 버튼을 asChild+Link로 구현하여 /contact로 확실히 이동 */}
            <Button asChild variant="primary" className="w-full py-3 text-base font-semibold mt-4">
              <Link href="/contact" onClick={() => setIsMenuOpen(false)}>상담 신청</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
