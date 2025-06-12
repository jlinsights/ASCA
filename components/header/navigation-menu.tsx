"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface NavigationMenuProps {
  onItemClick?: () => void
}

// 메뉴 구조 정의
const menuStructure = [
  {
    key: 'exhibition',
    href: '/exhibitions',
    submenu: [
      { key: 'currentExhibitions', href: '/exhibitions' },
      { key: 'upcomingExhibitions', href: '/exhibitions?status=upcoming' },
      { key: 'pastExhibitions', href: '/exhibitions?status=past' },
      { key: 'onlineExhibitions', href: '/exhibitions?type=online' }
    ]
  },
  {
    key: 'artworks',
    href: '/artworks',
    submenu: [
      { key: 'hangeulCalligraphy', href: '/artworks?category=hangeul' },
      { key: 'hanjaCalligraphy', href: '/artworks?category=hanja' },
      { key: 'literatiPainting', href: '/artworks?category=literati' },
      { key: 'inkPainting', href: '/artworks?category=ink' },
      { key: 'orientalPainting', href: '/artworks?category=oriental' },
      { key: 'folkPainting', href: '/artworks?category=folk' },
      { key: 'modernCalligraphy', href: '/artworks?category=modern' },
      { key: 'calligraphyArt', href: '/artworks?category=calligraphy-art' },
      { key: 'sealEngraving', href: '/artworks?category=seal' },
      { key: 'woodEngraving', href: '/artworks?category=wood' }
    ]
  },
  {
    key: 'artists',
    href: '/artists',
    submenu: [
      { key: 'openCallArtists', href: '/artists?type=open-call' },
      { key: 'youngArtists', href: '/artists?type=young' },
      { key: 'recommendedArtists', href: '/artists?type=recommended' },
      { key: 'invitedArtists', href: '/artists?type=invited' }
    ]
  },
  {
    key: 'about',
    href: '/about',
    submenu: [
      { key: 'overview', href: '/about' },
      { key: 'regulations', href: '/about/regulations' },
      { key: 'articles', href: '/about/articles' },
      { key: 'operationJudging', href: '/about/operation' },
      { key: 'history', href: '/about/history' },
      { key: 'organizationChart', href: '/about/organization' },
      { key: 'brandGuidelines', href: '/brand' }
    ]
  }
]

export function NavigationMenu({ onItemClick }: NavigationMenuProps) {
  const { t } = useLanguage()

  return (
    <nav className="py-4">
      {menuStructure.map((menu) => (
        <div key={menu.key} className="border-b border-border/50 last:border-b-0">
          {/* 메인 메뉴 아이템 */}
          <Link 
            href={menu.href}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            {...(onItemClick && { onClick: onItemClick })}
          >
            <span className="font-medium">{t(menu.key)}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Link>
          
          {/* 서브메뉴 */}
          {menu.submenu && (
            <div className="bg-muted/30">
              {menu.submenu.map((subItem) => (
                <Link
                  key={subItem.key}
                  href={subItem.href}
                  className="block py-3 px-6 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  {...(onItemClick && { onClick: onItemClick })}
                >
                  {t(subItem.key)}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
} 