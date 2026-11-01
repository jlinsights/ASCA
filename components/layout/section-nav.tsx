'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import type { MenuGroup } from './site-menu'
import { currentMenuHref, findMenuGroup } from './menu-section'
import '@/components/about/about.css'

interface SectionNavListProps {
  group: MenuGroup
  current: string | undefined
}

/** 01–0N 번호 목차 — 소개 묶음 목차(.ab-nav)와 같은 모양. 헤더 하위 메뉴와 같은 목록을 읽는다 */
export function SectionNavList({ group, current }: SectionNavListProps) {
  const { t } = useLanguage()
  const listRef = useRef<HTMLUListElement>(null)
  const items = (group.items ?? []).filter(item => !item.external)

  // 좁은 화면에서 지금 항목이 보이도록 목차를 옆으로 민다
  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!list || !active) return
    list.scrollLeft = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2
  }, [current])

  return (
    <nav className='ab-nav ab-tone--paper' aria-label={t(group.labelKey)}>
      <ul ref={listRef} className='ab-nav__list'>
        {items.map((item, index) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className='ab-nav__link'
              aria-current={item.href === current ? 'page' : undefined}
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

function SectionNavWithSearch({ group, pathname }: { group: MenuGroup; pathname: string }) {
  const search = useSearchParams()
  return <SectionNavList group={group} current={currentMenuHref(group, pathname, search)} />
}

/**
 * 지금 주소가 헤더 메뉴 항목이면 그 묶음의 번호 목차를 보인다. 상세·약관 페이지처럼 메뉴에 없으면 그리지 않는다.
 * 쿼리로 나뉜 항목(작가 등급)을 고르려고 useSearchParams 를 쓰므로 Suspense 로 감싼다 —
 * 정적으로 만드는 페이지에서는 쿼리 없이 먼저 그린다.
 */
export function SectionNav() {
  const pathname = usePathname()
  const group = findMenuGroup(pathname)
  if (!group || !pathname) return null
  // 쿼리로 나뉜 항목이 없는 묶음은 주소 쿼리를 읽을 필요가 없다
  if (!(group.items ?? []).some(item => item.href.includes('?'))) {
    return <SectionNavList group={group} current={currentMenuHref(group, pathname, null)} />
  }
  return (
    <Suspense
      fallback={<SectionNavList group={group} current={currentMenuHref(group, pathname, null)} />}
    >
      <SectionNavWithSearch group={group} pathname={pathname} />
    </Suspense>
  )
}
