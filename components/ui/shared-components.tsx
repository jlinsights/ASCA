"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader } from "./card"

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className)}>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="text-6xl mb-4 opacity-20">📝</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success'
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusVariants = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    success: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }

  return (
    <Badge className={cn(statusVariants[status], className)}>
      {children}
    </Badge>
  )
}

// Expandable Card Component
interface ExpandableCardProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function ExpandableCard({ title, children, defaultExpanded = false, className }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Button variant="ghost" size="sm">
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

// Data Table Row Component
interface DataRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div className={cn("flex justify-between items-center py-2 border-b border-border/50 last:border-0", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

// Progress Bar Component
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, label, showPercentage = true, className }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Tag List Component
interface TagListProps {
  tags: string[]
  onTagClick?: (tag: string) => void
  className?: string
}

export function TagList({ tags, onTagClick, className }: TagListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag, index) => (
        <Badge 
          key={index}
          variant="secondary"
          className={cn(
            "cursor-pointer hover:bg-secondary/80 transition-colors",
            onTagClick && "hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}