'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { headerMenu } from '@/components/layout/site-menu'

// 소개 묶음 목차 — 헤더 '소개' 하위 메뉴와 같은 목록(site-menu.ts)을 쓴다
const ABOUT_LINKS = headerMenu.find(group => group.key === 'about')?.items ?? []

export function AboutNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)

  // 좁은 화면에서 지금 페이지 항목이 보이도록 목차를 옆으로 민다
  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    const list = listRef.current
    if (!current || !list) return
    list.scrollLeft = current.offsetLeft - list.clientWidth / 2 + current.clientWidth / 2
  }, [pathname])

  return (
    <nav className='ab-nav ab-tone--paper' aria-label={t('siteNavAboutShort')}>
      <ul ref={listRef} className='ab-nav__list'>
        {ABOUT_LINKS.map((item, index) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className='ab-nav__link'
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className='ab-nav__num' aria-hidden='true'>
                {String(index + 1).padStart(2, '0')}
              </span>
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
