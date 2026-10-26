'use client'

import Link from 'next/link'
import type { MenuGroup, MenuLink } from '../layout/site-menu'

interface SubmenuLinksProps {
  items: MenuLink[]
  t: (key: string) => string
  className: string
  onSelect?: () => void
}

/** 하위 메뉴 링크 — 바깥 주소는 새 탭으로 연다 */
function SubmenuLinks({ items, t, className, onSelect }: SubmenuLinksProps) {
  return (
    <>
      {items.map(item =>
        item.href.startsWith('http') ? (
          <a
            key={item.href}
            href={item.href}
            target='_blank'
            rel='noopener noreferrer'
            role='menuitem'
            className={className}
            onClick={onSelect}
          >
            {t(item.labelKey)}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            role='menuitem'
            className={className}
            onClick={onSelect}
          >
            {t(item.labelKey)}
          </Link>
        )
      )}
    </>
  )
}

interface SubmenuProps {
  menu: MenuGroup
  t: (key: string) => string
  /** 'desktop' 은 칸을 옆으로 나란히, 'mobile' 은 칸 제목 아래로 이어 붙인다 */
  variant: 'desktop' | 'mobile'
  itemClassName: string
  onSelect?: () => void
}

/**
 * 메뉴 묶음의 하위 메뉴 내용. columns 가 있으면 칸마다 role=group 으로 제목을 달고,
 * 없으면 items 를 그대로 늘어놓는다.
 */
export function HeaderSubmenu({ menu, t, variant, itemClassName, onSelect }: SubmenuProps) {
  if (!menu.columns?.length) {
    return (
      <SubmenuLinks items={menu.items ?? []} t={t} className={itemClassName} onSelect={onSelect} />
    )
  }
  const desktop = variant === 'desktop'
  return (
    <div className={desktop ? 'grid grid-cols-2 divide-x divide-border/60' : 'space-y-3'}>
      {menu.columns.map(column => {
        const titleId = `${variant}-submenu-${menu.key}-${column.titleKey}`
        return (
          <div key={column.titleKey} role='group' aria-labelledby={titleId}>
            <p
              id={titleId}
              className={
                desktop
                  ? 'px-4 pt-1 pb-2 text-xs font-semibold tracking-wider text-celadon-green'
                  : 'px-3 pt-2 text-xs font-semibold tracking-wider text-celadon-green'
              }
            >
              {t(column.titleKey)}
            </p>
            <SubmenuLinks
              items={column.items}
              t={t}
              className={itemClassName}
              onSelect={onSelect}
            />
          </div>
        )
      })}
    </div>
  )
}
