'use client'

import React from 'react'
import { logger } from '@/lib/utils/logger'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error Boundary caught an error', error, { errorInfo })
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-rice-paper flex items-center justify-center">
          <div className="gallery-card gallery-card-bordered max-w-md mx-auto">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-celadon-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-calligraphy text-rice-paper font-bold text-2xl">書</span>
              </div>
              <h2 className="font-calligraphy text-xl font-bold text-ink-black mb-2">
                ASCA 동양서예협회
              </h2>
              <p className="text-stone-gray text-sm">
                페이지를 로드하는 중입니다...
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}