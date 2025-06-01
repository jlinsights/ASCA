'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

// Error 타입 확장
interface ExtendedError extends Error {
  status?: number
  info?: string
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // 글로벌 fetcher 설정
        fetcher: async (resource: string, init?: RequestInit) => {
          const res = await fetch(resource, init)
          if (!res.ok) {
            const errorInfo = await res.text()
            const error = new Error(`An error occurred while fetching the data: ${errorInfo}`) as ExtendedError
            error.status = res.status
            error.info = errorInfo
            throw error
          }
          return res.json()
        },
        
        // 캐시 및 재검증 설정
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        revalidateIfStale: false,
        
        // 에러 재시도 설정
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        
        // 성능 최적화
        dedupingInterval: 10000, // 10초 중복 제거
        focusThrottleInterval: 5000, // 포커스 스로틀링
        loadingTimeout: 30000, // 30초 로딩 타임아웃
        
        // 전역 에러 처리
        onError: (error: ExtendedError, key: string) => {
          if (error.status !== 403 && error.status !== 404) {
            console.error('SWR Error:', error, 'Key:', key)
          }
        },
        
        // 전역 성공 처리
        onSuccess: (data: any, key: string, config: any) => {
          // 성공 시 로그 (개발 환경에서만)
          if (process.env.NODE_ENV === 'development') {
            console.log('SWR Success:', key, data)
          }
        },
        
        // 전역 로딩 시작
        onLoadingSlow: (key: string, config: any) => {
          console.warn('SWR Slow Loading:', key)
        },
        
        // 캐시 크기 제한
        provider: () => new Map(),
        
        // 서스펜스 모드 비활성화 (성능 상 이유)
        suspense: false,
      }}
    >
      {children}
    </SWRConfig>
  )
} 