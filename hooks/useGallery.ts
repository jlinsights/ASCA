'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { GalleryItem, GalleryCategory, GalleryFilterState, GalleryViewState, GalleryEvent } from '@/types/gallery'

interface UseGalleryProps {
  items: GalleryItem[]
  categories: GalleryCategory[]
  onEvent?: (event: GalleryEvent) => void
}

interface UseGalleryReturn {
  // 상태
  filterState: GalleryFilterState
  viewState: GalleryViewState
  
  // 계산된 값
  filteredItems: GalleryItem[]
  totalPages: number
  currentItems: GalleryItem[]
  
  // 액션
  setCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
  setSortBy: (sortBy: GalleryFilterState['sortBy']) => void
  toggleSortOrder: () => void
  setViewMode: (mode: GalleryViewState['viewMode']) => void
  openLightbox: (item: GalleryItem) => void
  closeLightbox: () => void
  navigateImage: (direction: 'prev' | 'next') => void
  
  // 유틸리티
  resetFilters: () => void
  getItemIndex: (item: GalleryItem) => number
}

const DEFAULT_FILTER_STATE: GalleryFilterState = {
  category: 'all',
  year: 'all',
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  itemsPerPage: 24
}

const DEFAULT_VIEW_STATE: GalleryViewState = {
  viewMode: 'grid',
  selectedImage: null,
  isLightboxOpen: false,
  isLoading: false
}

export function useGallery({ items, categories, onEvent }: UseGalleryProps): UseGalleryReturn {
  const [filterState, setFilterState] = useState<GalleryFilterState>(DEFAULT_FILTER_STATE)
  const [viewState, setViewState] = useState<GalleryViewState>(DEFAULT_VIEW_STATE)

  // 이벤트 발생 헬퍼
  const emitEvent = useCallback((type: GalleryEvent['type'], payload: Partial<GalleryEvent['payload']>) => {
    const event: GalleryEvent = {
      type,
      payload: {
        timestamp: Date.now(),
        ...payload
      }
    }
    onEvent?.(event)
  }, [onEvent])

  // 필터링 및 정렬된 아이템
  const filteredItems = useMemo(() => {
    let filtered = [...items]

    // 카테고리 필터
    if (filterState.category !== 'all') {
      filtered = filtered.filter(item => item.category === filterState.category)
    }

    // 검색 필터
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (filterState.sortBy) {
        case 'date':
          aValue = new Date(a.modifiedTime).getTime()
          bValue = new Date(b.modifiedTime).getTime()
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        default:
          aValue = new Date(a.modifiedTime).getTime()
          bValue = new Date(b.modifiedTime).getTime()
      }

      if (filterState.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [items, filterState])

  // 페이지네이션
  const totalPages = Math.ceil(filteredItems.length / filterState.itemsPerPage)
  const currentItems = useMemo(() => {
    const startIndex = (filterState.page - 1) * filterState.itemsPerPage
    return filteredItems.slice(startIndex, startIndex + filterState.itemsPerPage)
  }, [filteredItems, filterState.page, filterState.itemsPerPage])

  // 카테고리 변경
  const setCategory = useCallback((category: string) => {
    setFilterState(prev => ({ ...prev, category, page: 1 }))
    emitEvent('category_changed', { category })
  }, [emitEvent])

  // 검색어 변경
  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilterState(prev => ({ ...prev, searchQuery, page: 1 }))
    emitEvent('search_performed', { searchQuery })
  }, [emitEvent])

  // 페이지 변경
  const setPage = useCallback((page: number) => {
    setFilterState(prev => ({ ...prev, page }))
  }, [])

  // 정렬 기준 변경
  const setSortBy = useCallback((sortBy: GalleryFilterState['sortBy']) => {
    setFilterState(prev => ({ ...prev, sortBy, page: 1 }))
  }, [])

  // 정렬 순서 토글
  const toggleSortOrder = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    }))
  }, [])

  // 뷰 모드 변경
  const setViewMode = useCallback((viewMode: GalleryViewState['viewMode']) => {
    setViewState(prev => ({ ...prev, viewMode }))
  }, [])

  // 라이트박스 열기
  const openLightbox = useCallback((item: GalleryItem) => {
    setViewState(prev => ({
      ...prev,
      selectedImage: item,
      isLightboxOpen: true
    }))
    emitEvent('lightbox_opened', { itemId: item.id })
    
    // 키보드 이벤트 방지
    document.body.style.overflow = 'hidden'
  }, [emitEvent])

  // 라이트박스 닫기
  const closeLightbox = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      selectedImage: null,
      isLightboxOpen: false
    }))
    emitEvent('lightbox_closed', {})
    
    // 키보드 이벤트 복원
    document.body.style.overflow = 'unset'
  }, [emitEvent])

  // 이미지 네비게이션
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!viewState.selectedImage) return

    const currentIndex = filteredItems.findIndex(item => item.id === viewState.selectedImage!.id)
    if (currentIndex === -1) return

    let newIndex
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1
    } else {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0
    }

    const newItem = filteredItems[newIndex]
    if (newItem) {
      setViewState(prev => ({ ...prev, selectedImage: newItem }))
      emitEvent('item_clicked', { itemId: newItem.id })
    }
  }, [viewState.selectedImage, filteredItems, emitEvent])

  // 필터 리셋
  const resetFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE)
  }, [])

  // 아이템 인덱스 가져오기
  const getItemIndex = useCallback((item: GalleryItem) => {
    return filteredItems.findIndex(i => i.id === item.id)
  }, [filteredItems])

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewState.isLightboxOpen) return

      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          navigateImage('prev')
          break
        case 'ArrowRight':
          navigateImage('next')
          break
      }
    }

    if (viewState.isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewState.isLightboxOpen, closeLightbox, navigateImage])

  // 컴포넌트 언마운트 시 스타일 복원
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return {
    // 상태
    filterState,
    viewState,
    
    // 계산된 값
    filteredItems,
    totalPages,
    currentItems,
    
    // 액션
    setCategory,
    setSearchQuery,
    setPage,
    setSortBy,
    toggleSortOrder,
    setViewMode,
    openLightbox,
    closeLightbox,
    navigateImage,
    
    // 유틸리티
    resetFilters,
    getItemIndex
  }
}