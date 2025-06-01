import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface StatsData {
  notices: number
  exhibitions: number
  events: number
  artists: number
  artworks: number
  files: number
  totalViews: number
  recentActivity: {
    type: string
    title: string
    date: string
    author?: string
  }[]
}

interface UseAdminStatsReturn {
  stats: StatsData | null
  isLoading: boolean
  error: string | null
  mutate: () => void
}

const fetcher = async (url: string): Promise<StatsData> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('통계 데이터를 불러오는데 실패했습니다.')
  }
  return response.json()
}

export const useAdminStats = (): UseAdminStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR<StatsData>(
    '/api/admin/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30초 중복 제거
      refreshInterval: 60000, // 1분마다 자동 갱신
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      shouldRetryOnError: (error) => {
        // 4xx 에러는 재시도하지 않음
        return error.status >= 500
      }
    }
  )

  return {
    stats: data || null,
    isLoading,
    error: error?.message || null,
    mutate: useCallback(() => mutate(), [mutate])
  }
} 