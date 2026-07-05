'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'

interface UseGalleryGridParams {
  items: GalleryItem[]
}

export function useGalleryGrid({ items }: UseGalleryGridParams) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shareItem, setShareItem] = useState<GalleryItem | null>(null)

  // 이미지 로딩 상태 - 스켈레톤 로더를 표시하기 위해 false로 초기화
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>(() => {
    // 초기 렌더링 시 이미지를 아직 로드하지 않은 상태로 설정
    const initialState: Record<string, boolean> = {}
    items.forEach(item => {
      initialState[item.id] = false
    })
    return initialState
  })
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  // 이미지 로드 핸들러
  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }))
  }, [])

  // 이미지 에러 핸들러
  const handleImageError = useCallback((id: string) => {
    setErrorImages(prev => new Set(prev).add(id))
  }, [])

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    let filtered = items

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [items, selectedCategory, searchQuery])

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((item: GalleryItem) => {
    setSelectedImage(item)
  }, [])

  // 공유 버튼 클릭 핸들러
  const handleShareClick = useCallback((e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation() // 이미지 클릭 이벤트 방지
    setShareItem(item)
  }, [])

  // 공유 모달 닫기
  const handleShareClose = useCallback(() => {
    setShareItem(null)
  }, [])

  // 라이트박스 네비게이션
  const navigateImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedImage) return

      const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id)
      let newIndex

      if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1
      } else {
        newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0
      }

      setSelectedImage(filteredItems[newIndex]!)
    },
    [selectedImage, filteredItems]
  )

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedImage) return

      switch (e.key) {
        case 'Escape':
          setSelectedImage(null)
          break
        case 'ArrowLeft':
          navigateImage('prev')
          break
        case 'ArrowRight':
          navigateImage('next')
          break
      }
    },
    [selectedImage, navigateImage]
  )

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage, handleKeyDown])

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedImage,
    setSelectedImage,
    shareItem,
    loadedImages,
    errorImages,
    handleImageLoad,
    handleImageError,
    handleImageClick,
    handleShareClick,
    handleShareClose,
    filteredItems,
    navigateImage,
  }
}
