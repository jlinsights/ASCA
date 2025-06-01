import React, { useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  FileText, 
  Star, 
  Calendar, 
  Users, 
  Palette, 
  Folder, 
  RefreshCw,
  Settings 
} from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface AdminNavigationProps {
  currentPage: 'notices' | 'exhibitions' | 'events' | 'files' | 'artists' | 'artworks' | 'migration'
}

export const AdminNavigation = React.memo(({ currentPage }: AdminNavigationProps) => {
  const { language } = useLanguage()

  const navItems = useMemo(() => [
    {
      key: 'notices',
      href: '/admin/notices',
      icon: FileText,
      label: language === 'ko' ? '공지사항' : 'Notices'
    },
    {
      key: 'exhibitions', 
      href: '/admin/exhibitions',
      icon: Star,
      label: language === 'ko' ? '전시회' : 'Exhibitions'
    },
    {
      key: 'events',
      href: '/admin/events', 
      icon: Calendar,
      label: language === 'ko' ? '행사' : 'Events'
    },
    {
      key: 'files',
      href: '/admin/files',
      icon: Folder,
      label: language === 'ko' ? '파일' : 'Files'
    },
    {
      key: 'artists',
      href: '/admin/artists',
      icon: Users, 
      label: language === 'ko' ? '작가' : 'Artists'
    },
    {
      key: 'artworks',
      href: '/admin/artworks',
      icon: Palette,
      label: language === 'ko' ? '작품' : 'Artworks'
    },
    {
      key: 'migration',
      href: '/admin/migration',
      icon: RefreshCw,
      label: language === 'ko' ? '마이그레이션' : 'Migration'
    }
  ], [language])

  const currentItem = useMemo(() => 
    navItems.find(item => item.key === currentPage),
    [navItems, currentPage]
  )

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3 overflow-x-auto">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
              <Settings className="h-4 w-4" />
              {language === 'ko' ? 'Admin Dashboard' : 'Admin Dashboard'}
            </Button>
          </Link>
          
          <div className="w-px h-6 bg-border flex-shrink-0"></div>
          
          {navItems.map((item) => {
            const Icon = item.icon
            const isCurrent = item.key === currentPage
            
            return (
              <Link key={item.key} href={item.href} prefetch={true}>
                <Button 
                  variant={isCurrent ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`gap-2 flex-shrink-0 ${isCurrent ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          
          {currentItem && (
            <>
              <div className="w-px h-6 bg-border flex-shrink-0"></div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                <currentItem.icon className="h-4 w-4" />
                <span>{language === 'ko' ? `${currentItem.label} 관리` : `${currentItem.label} Management`}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

AdminNavigation.displayName = 'AdminNavigation' 