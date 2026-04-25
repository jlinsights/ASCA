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

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='min-h-[400px] flex items-center justify-center p-8'>
            <div className='gallery-card gallery-card-bordered max-w-md mx-auto'>
              <div className='p-8 text-center'>
                <div className='w-16 h-16 bg-scholar-red/10 dark:bg-scholar-red/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-scholar-red text-2xl' aria-hidden='true'>
                    !
                  </span>
                </div>
                <h2 className='text-lg font-semibold text-foreground mb-2'>문제가 발생했습니다</h2>
                <p className='text-muted-foreground text-sm mb-4'>
                  {this.state.error?.message || '일시적인 오류가 발생했습니다.'}
                </p>
                <button
                  onClick={this.handleRetry}
                  className='gallery-btn gallery-btn-md gallery-btn-outline'
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
