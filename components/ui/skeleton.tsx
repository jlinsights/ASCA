'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        shimmer: 'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer',
        pulse: 'bg-muted animate-pulse',
        wave: 'bg-muted relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-wave before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
      },
      size: {
        sm: 'h-4',
        default: 'h-5',
        lg: 'h-6',
        xl: 'h-8',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        default: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

function Skeleton({
  className,
  variant,
  size,
  rounded,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const inlineStyles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  }

  return (
    <div
      className={cn(skeletonVariants({ variant, size, rounded, className }))}
      style={inlineStyles}
      {...props}
    />
  )
}

// Specialized skeleton components
interface SkeletonTextProps {
  lines?: number
  className?: string
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  lastLineWidth?: string
}

function SkeletonText({ 
  lines = 3, 
  className, 
  variant = 'default',
  lastLineWidth = '60%' 
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={cn(
            'h-4',
            i === lines - 1 && lastLineWidth !== '100%' && 'w-3/5'
          )}
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
  showImage?: boolean
  showTitle?: boolean
  showDescription?: boolean
  showFooter?: boolean
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
}

function SkeletonCard({
  className,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showFooter = true,
  variant = 'default',
}: SkeletonCardProps) {
  return (
    <div className={cn('space-y-4 p-4 border rounded-lg', className)}>
      {showImage && (
        <Skeleton variant={variant} className="h-48 w-full" />
      )}
      
      <div className="space-y-2">
        {showTitle && (
          <Skeleton variant={variant} className="h-6 w-3/4" />
        )}
        
        {showDescription && (
          <div className="space-y-2">
            <Skeleton variant={variant} className="h-4 w-full" />
            <Skeleton variant={variant} className="h-4 w-5/6" />
            <Skeleton variant={variant} className="h-4 w-2/3" />
          </div>
        )}
      </div>
      
      {showFooter && (
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant={variant} className="h-4 w-20" />
          <Skeleton variant={variant} className="h-8 w-16 rounded-full" />
        </div>
      )}
    </div>
  )
}

interface SkeletonListProps {
  items?: number
  className?: string
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  showAvatar?: boolean
  showIcon?: boolean
}

function SkeletonList({
  items = 5,
  className,
  variant = 'default',
  showAvatar = false,
  showIcon = false,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-3">
          {showAvatar && (
            <Skeleton variant={variant} className="h-10 w-10 rounded-full" />
          )}
          {showIcon && (
            <Skeleton variant={variant} className="h-6 w-6" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant={variant} className="h-4 w-3/4" />
            <Skeleton variant={variant} className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading states for specific components
interface LoadingStateProps {
  type: 'page' | 'modal' | 'card' | 'list' | 'form' | 'gallery'
  className?: string
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  [key: string]: any
}

function LoadingState({ type, className, variant = 'shimmer', ...props }: LoadingStateProps) {
  const components = {
    page: () => (
      <div className={cn('space-y-8 p-6', className)}>
        <div className="space-y-2">
          <Skeleton variant={variant} className="h-8 w-64" />
          <Skeleton variant={variant} className="h-4 w-96" />
        </div>
        <SkeletonCard variant={variant} />
        <SkeletonList variant={variant} items={3} />
      </div>
    ),
    modal: () => (
      <div className={cn('space-y-6 p-6', className)}>
        <div className="space-y-2">
          <Skeleton variant={variant} className="h-6 w-48" />
          <Skeleton variant={variant} className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          <Skeleton variant={variant} className="h-10 w-full" />
          <Skeleton variant={variant} className="h-10 w-full" />
          <Skeleton variant={variant} className="h-20 w-full" />
        </div>
      </div>
    ),
    card: () => <SkeletonCard variant={variant} className={className} {...props} />,
    list: () => <SkeletonList variant={variant} className={className} {...props} />,
    form: () => (
      <div className={cn('space-y-6', className)}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant={variant} className="h-4 w-24" />
            <Skeleton variant={variant} className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end space-x-2 pt-4">
          <Skeleton variant={variant} className="h-10 w-20" />
          <Skeleton variant={variant} className="h-10 w-24" />
        </div>
      </div>
    ),
    gallery: () => (
      <div className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant={variant} className="aspect-square w-full" />
            <Skeleton variant={variant} className="h-4 w-3/4" />
            <Skeleton variant={variant} className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    ),
  }

  const Component = components[type]
  return <Component />
}

// Custom hook for managing loading states
interface UseLoadingStateOptions {
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  delay?: number
}

function useLoadingState(isLoading: boolean, options: UseLoadingStateOptions = {}) {
  const { variant = 'shimmer', delay = 200 } = options
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowSkeleton(true)
      }, delay)
    } else {
      setShowSkeleton(false)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, delay])

  return {
    showSkeleton,
    SkeletonComponent: ({ type, ...props }: { type: LoadingStateProps['type'] } & any) => (
      <LoadingState type={type} variant={variant} {...props} />
    ),
  }
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  LoadingState,
  useLoadingState,
}
