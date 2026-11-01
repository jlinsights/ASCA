'use client'

import { usePathname } from 'next/navigation'
import { headerMenu } from '@/components/layout/site-menu'
import { currentMenuHref } from '@/components/layout/menu-section'
import { SectionNavList } from '@/components/layout/section-nav'

// 소개 묶음 목차 — 헤더 '소개' 하위 메뉴와 같은 목록(site-menu.ts)을 쓴다. 다른 메뉴는 SectionNav
const ABOUT_GROUP = headerMenu.find(group => group.key === 'about')

export function AboutNav() {
  const pathname = usePathname()
  if (!ABOUT_GROUP) return null
  return (
    <SectionNavList
      group={ABOUT_GROUP}
      current={currentMenuHref(ABOUT_GROUP, pathname ?? '', null)}
    />
  )
}
