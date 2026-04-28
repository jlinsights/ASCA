'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { fetchExhibitionFullById, deleteExhibition } from '@/lib/api/exhibitions'
import { STATIC_EXHIBITIONS } from '@/lib/data/static-exhibitions'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

interface UseExhibitionDetailResult {
  exhibition: ExhibitionFull | null
  loading: boolean
  error: string | null
  isOwner: boolean
  handleDelete: () => Promise<void>
}

export function useExhibitionDetail(id: string): UseExhibitionDetailResult {
  const { isLoaded, isSignedIn, user } = useUser()
  const [exhibition, setExhibition] = useState<ExhibitionFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // 1) 정적 fallback 우선
      const staticEx = STATIC_EXHIBITIONS[id]
      if (staticEx) {
        if (!cancelled) {
          setExhibition(staticEx)
          setLoading(false)
        }
        return
      }

      // 2) 동적 fetch
      const { data, error: fetchError } = await fetchExhibitionFullById(id)
      if (cancelled) return
      if (fetchError || !data) {
        setError(fetchError ?? 'Exhibition not found')
        setExhibition(null)
      } else {
        setExhibition(data)
      }
      setLoading(false)
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  // ownership 계산
  useEffect(() => {
    if (!isLoaded || !exhibition) {
      setIsOwner(false)
      return
    }
    if (!isSignedIn || !user) {
      setIsOwner(false)
      return
    }
    const owner =
      exhibition.artists?.some(
        a => a.id === user.id && (a.role === 'organizer' || a.role === 'curator')
      ) ?? false
    setIsOwner(owner)
  }, [isLoaded, isSignedIn, user, exhibition])

  const handleDelete = useCallback(async () => {
    if (!confirm('정말 이 전시를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }
    const { error: delError } = await deleteExhibition(id)
    if (delError) {
      alert('전시 삭제 중 오류가 발생했습니다.')
      return
    }
    alert('전시가 삭제되었습니다.')
    window.location.href = '/profile/exhibitions'
  }, [id])

  return { exhibition, loading, error, isOwner, handleDelete }
}
