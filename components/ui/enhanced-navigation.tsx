'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Search,
  User,
  Settings,
  Globe,
  Palette
} from 'lucide-react'
import { useFocusManagement } from './accessibility'

// Navigation item types
interface NavigationItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavigationItem[]
  external?: boolean
  description?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

// Enhanced Mobile Navigation
interface EnhancedMobileNavProps {
  isOpen: boolean
  onClose: () => void
  navigation: NavigationSection[]
  className?: string
}

export function EnhancedMobileNav({ 
  isOpen, 
  onClose, 
  navigation,
  className 
}: EnhancedMobileNavProps) {
  const pathname = usePathname()
  const { trapFocus, captureFocus, restoreFocus } = useFocusManagement()
  const navRef = React.useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({})

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      captureFocus()
      document.body.style.overflow = 'hidden'
      
      if (navRef.current) {
        const cleanup = trapFocus(navRef.current)
        return cleanup
      }
    } else {
      document.body.style.overflow = ''
      restoreFocus()
    }
  }, [isOpen, captureFocus, restoreFocus, trapFocus])

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const toggleItem = (itemHref: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemHref]: !prev[itemHref]
    }))
  }

  const isActiveItem = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isActive = isActiveItem(item.href)
    const isExpanded = expandedItems[item.href]

    return (
      <div key={item.href} className={cn('border-l-2 border-transparent', depth > 0 && 'ml-4')}>
        <div className="flex items-center">
          {item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive && 'bg-accent text-accent-foreground border-l-primary'
              )}
              onClick={onClose}
            >
              {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
              <Globe className="w-4 h-4 text-muted-foreground" />
            </a>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isActive && 'bg-accent text-accent-foreground border-l-primary'
              )}
              onClick={onClose}
            >
              {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
          
          {hasChildren && (
            <button
              onClick={() => toggleItem(item.href)}
              className="p-2 hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.title} submenu`}
              aria-expanded={isExpanded}
            >
              <ChevronRight 
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, depth + 1))}
          </div>
        )}

        {item.description && isExpanded && (
          <p className="px-4 py-2 text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Navigation Panel */}
      <div
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background border-r shadow-lg lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-6">
            {navigation.map(section => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full p-2 text-left text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                  aria-expanded={expandedSections[section.title]}
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      expandedSections[section.title] && 'rotate-180'
                    )}
                  />
                </button>
                
                {expandedSections[section.title] && (
                  <div className="mt-2 space-y-1">
                    {section.items.map(item => renderNavigationItem(item))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Korean Calligraphy Association</span>
            <span>v2.0</span>
          </div>
        </div>
      </div>
    </>
  )
}

// Breadcrumb Navigation
interface BreadcrumbItem {
  title: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
}

export function Breadcrumb({ 
  items, 
  className,
  separator = <ChevronRight className="w-4 h-4 text-muted-foreground" />
}: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {index > 0 && separator}
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              >
                {item.title}
              </Link>
            ) : (
              <span 
                className={cn(
                  item.current 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Quick Navigation/Command Palette
interface QuickNavProps {
  isOpen: boolean
  onClose: () => void
  items: NavigationItem[]
  className?: string
}

export function QuickNav({ isOpen, onClose, items, className }: QuickNavProps) {
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query) return items.slice(0, 8) // Show first 8 items when no query

    const searchQuery = query.toLowerCase()
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery)
    ).slice(0, 8)
  }, [query, items])

  // Reset selection when filtered items change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          window.location.href = filteredItems[selectedIndex].href
          onClose()
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Command Palette */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-background border rounded-lg shadow-lg',
          'mx-4',
          className
        )}
        role="combobox"
        aria-expanded="true"
        aria-haspopup="listbox"
        aria-labelledby="quick-nav-label"
      >
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search navigation..."
            className="flex-1 py-4 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            id="quick-nav-label"
            aria-autocomplete="list"
            aria-controls="quick-nav-list"
            aria-activedescendant={`quick-nav-item-${selectedIndex}`}
          />
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="quick-nav-list"
          role="listbox"
          className="max-h-80 overflow-y-auto py-2"
        >
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                id={`quick-nav-item-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors',
                  'focus:outline-none focus:bg-accent',
                  index === selectedIndex && 'bg-accent'
                )}
                onClick={onClose}
              >
                {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, ↵ to select, esc to close</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab Navigation
interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  disabled?: boolean
}

interface TabNavigationProps {
  tabs: TabItem[]
  defaultTab?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  className?: string
  onTabChange?: (tabId: string) => void
}

export function TabNavigation({
  tabs,
  defaultTab,
  orientation = 'horizontal',
  variant = 'default',
  className,
  onTabChange,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          variant === 'default' && 'border-b',
          variant === 'pills' && 'p-1 bg-muted rounded-lg',
          variant === 'underline' && 'border-b'
        )}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              
              // Default variant
              variant === 'default' && [
                'border-b-2 border-transparent hover:text-foreground hover:border-border',
                activeTab === tab.id && 'text-foreground border-primary'
              ],
              
              // Pills variant
              variant === 'pills' && [
                'rounded-md hover:bg-background hover:text-foreground',
                activeTab === tab.id && 'bg-background text-foreground shadow-sm'
              ],
              
              // Underline variant
              variant === 'underline' && [
                'border-b-2 border-transparent hover:border-border',
                activeTab === tab.id && 'border-primary text-primary'
              ],
              
              // Orientation
              orientation === 'vertical' && 'justify-start w-full'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-4"
        >
          {activeTabContent}
        </div>
      )}
    </div>
  )
}

// Navigation utilities
export const navigationUtils = {
  // Check if current path matches navigation item
  isActiveRoute: (pathname: string, href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  },
  
  // Generate breadcrumbs from pathname
  generateBreadcrumbs: (pathname: string, routes: Record<string, string>) => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const title = routes[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === segments.length - 1
      
      breadcrumbs.push({
        title,
        href: isLast ? undefined : currentPath,
        current: isLast
      })
    })
    
    return breadcrumbs
  },
  
  // Flatten nested navigation for search
  flattenNavigation: (navigation: NavigationSection[]): NavigationItem[] => {
    const flattened: NavigationItem[] = []
    
    const flatten = (items: NavigationItem[]) => {
      items.forEach(item => {
        flattened.push(item)
        if (item.children) {
          flatten(item.children)
        }
      })
    }
    
    navigation.forEach(section => flatten(section.items))
    return flattened
  }
}