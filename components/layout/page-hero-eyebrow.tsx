'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { findMenuGroupForEyebrow } from './menu-section'

export interface PageHeroCrumb {
  label: string
  href?: string
}

/**
 * 머리 맨 위 한 줄. 경로(crumbs)를 받은 상세 페이지는 경로를, 아니면 소개 묶음처럼
 * 'ASCA · 메뉴 이름' 을 단다. 메뉴에 없는 페이지(약관·검색)는 'ASCA' 만.
 */
export function PageHeroEyebrow({ crumbs }: { crumbs?: PageHeroCrumb[] }) {
  const pathname = usePathname()
  const { t } = useLanguage()

  if (crumbs && crumbs.length > 0) {
    return (
      <nav aria-label='breadcrumb'>
        <ol className='ab-hero__eyebrow ab-ph__crumbs'>
          {crumbs.map(crumb => (
            <li key={crumb.label}>
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  const group = findMenuGroupForEyebrow(pathname)
  return <p className='ab-hero__eyebrow'>{group ? `ASCA · ${t(group.labelKey)}` : 'ASCA'}</p>
}
