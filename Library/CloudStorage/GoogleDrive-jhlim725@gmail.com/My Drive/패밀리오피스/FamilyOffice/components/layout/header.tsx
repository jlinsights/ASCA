"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-fo">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-navy-primary dark:text-white">
              FamilyOffice<span className="text-bronze-primary"> S</span>
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
                className="text-slate-700 dark:text-white hover:text-bronze-primary dark:hover:text-bronze-primary transition-fo"
              >
                서비스
              </Link>
              <Link
                href="/about"
                className="text-slate-700 dark:text-white hover:text-bronze-primary dark:hover:text-bronze-primary transition-fo"
              >
                소개
              </Link>
              <Link
                href="/brand-guidelines"
                className="text-slate-700 dark:text-white hover:text-forest-primary dark:hover:text-forest-primary transition-fo"
              >
                브랜드 가이드라인
              </Link>
              {/* 상담 신청 버튼: asChild+Button 대신 Link에 직접 스타일 적용, ml-8로 간격 확보 */}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-bronze-primary px-6 py-2 text-base font-semibold text-white shadow-sm hover:bg-bronze-primary/80 transition ml-8"
              >
                상담 신청
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
            <Link
              href="/services"
              className="block py-3 text-base font-semibold text-slate-700 dark:text-white hover:text-bronze-primary dark:hover:text-bronze-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              서비스
            </Link>
            <Link
              href="/about"
              className="block py-3 text-base font-semibold text-slate-700 dark:text-white hover:text-bronze-primary dark:hover:text-bronze-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              소개
            </Link>
            <Link
              href="/brand-guidelines"
              className="block py-3 text-base font-semibold text-slate-700 dark:text-white hover:text-forest-primary dark:hover:text-forest-primary transition-fo"
              onClick={() => setIsMenuOpen(false)}
            >
              브랜드 가이드라인
            </Link>
            {/* 상담 신청 버튼: asChild+Button 대신 Link에 직접 스타일 적용, mt-4로 간격 확보 */}
            <Link
              href="/contact"
              className="block w-full text-center rounded-md bg-bronze-primary py-3 text-base font-semibold text-white shadow-sm hover:bg-bronze-primary/80 transition mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              상담 신청
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
