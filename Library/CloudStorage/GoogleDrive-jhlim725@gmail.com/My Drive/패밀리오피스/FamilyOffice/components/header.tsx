"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-dark-bg-primary border-b border-gray-200 dark:border-dark-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-heading font-bold text-navy-primary dark:text-dark-text-primary">
              패밀리오피스<span className="text-gold-primary">VIP</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">메뉴 토글</span>
            </Button>

            {/* Desktop menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/services"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              >
                서비스
              </Link>
              <Link
                href="/about"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              >
                소개
              </Link>
              <Link
                href="/case-studies"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              >
                사례
              </Link>
              <Link
                href="/contact"
                className="text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              >
                연락처
              </Link>
              <Button variant="default" className="bg-burgundy-primary hover:bg-burgundy-light text-white">
                상담 신청
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-4 animate-accordion-down">
            <Link
              href="/services"
              className="block py-2 text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              서비스
            </Link>
            <Link
              href="/about"
              className="block py-2 text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              소개
            </Link>
            <Link
              href="/case-studies"
              className="block py-2 text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              사례
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-light-text-primary dark:text-dark-text-primary hover:text-burgundy-primary dark:hover:text-burgundy-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              연락처
            </Link>
            <Button
              variant="default"
              className="w-full bg-burgundy-primary hover:bg-burgundy-light text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              상담 신청
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
