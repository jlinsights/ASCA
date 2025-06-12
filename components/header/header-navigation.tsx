'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { memo } from 'react'

// 메뉴 아이템 타입 정의
export interface MenuItem {
  title: string
  key: string
  href: string
  subItems: Array<{
    title: string
    href: string
  }>
}

interface HeaderNavigationProps {
  menuStructure: MenuItem[]
  activeDropdown: string | null
  onMouseEnter: (key: string) => void
  onMouseLeave: () => void
}

// 드롭다운 메뉴 컴포넌트
const DropdownMenu = memo(({ subItems, isActive }: { 
  subItems: MenuItem['subItems']
  isActive: boolean 
}) => (
  <div className={`
    absolute left-0 top-full mt-1 w-64 bg-background/95 backdrop-blur border border-border/50 rounded-md shadow-lg 
    transition-all duration-200 z-50
    ${isActive ? 'opacity-100 visible' : 'opacity-0 invisible'}
  `}>
    <div className="py-2">
      {subItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {item.title}
        </Link>
      ))}
    </div>
  </div>
))

DropdownMenu.displayName = 'DropdownMenu'

// 네비게이션 아이템 컴포넌트
const NavigationItem = memo(({ 
  menu, 
  isActive, 
  onMouseEnter, 
  onMouseLeave 
}: {
  menu: MenuItem
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) => (
  <div
    className="relative group"
    onMouseEnter={menu.subItems.length > 0 ? onMouseEnter : undefined}
    onMouseLeave={menu.subItems.length > 0 ? onMouseLeave : undefined}
  >
    <Link 
      href={menu.href}
      className="flex items-center gap-1 text-sm font-medium hover:text-foreground/80 transition-colors py-4 px-2"
    >
      {menu.title}
      {menu.subItems.length > 0 && (
        <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
      )}
    </Link>
    
    {menu.subItems.length > 0 && (
      <DropdownMenu subItems={menu.subItems} isActive={isActive} />
    )}
  </div>
))

NavigationItem.displayName = 'NavigationItem'

// 메인 헤더 네비게이션 컴포넌트
export const HeaderNavigation = memo(({ 
  menuStructure, 
  activeDropdown, 
  onMouseEnter, 
  onMouseLeave 
}: HeaderNavigationProps) => (
  <nav className="hidden lg:flex items-center space-x-8">
    {menuStructure.map((menu) => (
      <NavigationItem
        key={menu.key}
        menu={menu}
        isActive={activeDropdown === menu.key}
        onMouseEnter={() => onMouseEnter(menu.key)}
        onMouseLeave={onMouseLeave}
      />
    ))}
  </nav>
))

HeaderNavigation.displayName = 'HeaderNavigation' 