'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

// Focus Management Hook
export function useFocusManagement() {
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)

  const captureFocus = React.useCallback(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus()
      previousActiveElementRef.current = null
    }
  }, [])

  const trapFocus = React.useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return { captureFocus, restoreFocus, trapFocus }
}

// Skip Link Component
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {children}
    </a>
  )
}

// Screen Reader Only Text
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  )
}

// Accessible Alert Component
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  live?: 'polite' | 'assertive'
  className?: string
}

export function AccessibleAlert({
  type,
  title,
  children,
  onDismiss,
  live = 'polite',
  className,
}: AccessibleAlertProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
  }

  const Icon = icons[type]

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  }

  return (
    <div
      role="alert"
      aria-live={live}
      className={cn(
        'border rounded-lg p-4',
        colors[type],
        className
      )}
    >
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto -m-1.5 p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Accessible Button with enhanced keyboard support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    loading = false, 
    loadingText = 'Loading...', 
    disabled,
    onClick,
    onKeyDown,
    className,
    ...props 
  }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle space key activation
      if (e.key === ' ') {
        e.preventDefault()
        onClick?.(e as any)
      }
      onKeyDown?.(e)
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
AccessibleButton.displayName = 'AccessibleButton'

// Accessible Modal/Dialog
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  closeOnEscape = true,
  closeOnBackdropClick = true,
}: AccessibleModalProps) {
  const { captureFocus, restoreFocus, trapFocus } = useFocusManagement()
  const modalRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    if (isOpen) {
      captureFocus()
      document.body.style.overflow = 'hidden'
      
      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current)
        return cleanup
      }
    } else {
      document.body.style.overflow = ''
      restoreFocus()
    }
  }, [isOpen, captureFocus, restoreFocus, trapFocus])

  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-background border rounded-lg shadow-lg max-w-md w-full mx-4',
          'focus:outline-none',
          className
        )}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible Form Field with proper labeling
interface AccessibleFormFieldProps {
  id: string
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactElement
  className?: string
}

export function AccessibleFormField({
  id,
  label,
  description,
  error,
  required = false,
  children,
  className,
}: AccessibleFormFieldProps) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const childWithProps = React.cloneElement(children, {
    id,
    'aria-describedby': cn(
      description && descriptionId,
      error && errorId
    ),
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required,
  })

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {childWithProps}
      
      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible Tabs with keyboard navigation
interface AccessibleTabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  orientation: 'horizontal' | 'vertical'
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export function AccessibleTabs({ 
  defaultValue, 
  children, 
  className,
  orientation = 'horizontal' 
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface AccessibleTabsListProps {
  children: React.ReactNode
  className?: string
}

export function AccessibleTabsList({ children, className }: AccessibleTabsListProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('AccessibleTabsList must be used within AccessibleTabs')

  const { orientation } = context
  const listRef = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const tabs = listRef.current?.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>
    if (!tabs) return

    const currentIndex = Array.from(tabs).findIndex(tab => tab === document.activeElement)
    
    let nextIndex = currentIndex
    
    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
      }
    } else {
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length
      } else if (e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
      }
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault()
      tabs[nextIndex].focus()
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        orientation === 'vertical' && 'flex-col',
        className
      )}
    >
      {children}
    </div>
  )
}

interface AccessibleTabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccessibleTabsTrigger({ value, children, className }: AccessibleTabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('AccessibleTabsTrigger must be used within AccessibleTabs')

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive && 'bg-background text-foreground shadow-sm',
        className
      )}
    >
      {children}
    </button>
  )
}

interface AccessibleTabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccessibleTabsContent({ value, children, className }: AccessibleTabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('AccessibleTabsContent must be used within AccessibleTabs')

  const { activeTab } = context
  const isActive = activeTab === value

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
    >
      {children}
    </div>
  )
}

// Live Region for announcements
interface LiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive'
  className?: string
}

export function LiveRegion({ message, priority = 'polite', className }: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

// Accessibility utilities
export const a11yUtils = {
  // Generate unique IDs for form fields
  generateId: (prefix = 'field') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if element is focusable
  isFocusable: (element: HTMLElement) => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    return element.matches(focusableElements) && !element.hasAttribute('disabled')
  },
  
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  // Trap focus within container
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}