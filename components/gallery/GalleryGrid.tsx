'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { VirtuosoGrid } from 'react-virtuoso'
import { GalleryItem, GalleryCategory } from '@/lib/types/gallery/gallery-legacy'
import SocialShare from './SocialShare'

interface GalleryGridProps {
  items: GalleryItem[]
  categories: GalleryCategory[]
  className?: string
  onEvent?: (event: any) => void
}

// 마사이크 레이아웃을 위한 헬퍼 함수들
const getRandomAspectRatio = (index: number) => {
  const ratios = ['1/1', '4/5', '3/4', '5/4', '16/9']
  return ratios[index % ratios.length]
}

const getCategoryIcon = (category: string) => {
  const icons = {
    committee: '👥',
    contest: '🏆',
    invited: '🎨',
    nominee: '⭐',
    exhibition: '🖼️',
    workshop: '📚',
    group: '👨‍👩‍👧‍👦',
    award: '🏅',
    ceremony: '🎉',
    event: '📸',
    people: '👤',
    sac: '🏛️',
  }
  return icons[category as keyof typeof icons] || '📷'
}

const getCategoryName = (category: string) => {
  const names = {
    committee: '심사위원회',
    contest: '휘호대회',
    invited: '초대작가',
    nominee: '추천작가',
    exhibition: '전시회',
    workshop: '워크샵',
    group: '단체사진',
    award: '시상기념',
    ceremony: '개막식 및 시상식',
    event: '행사 이모저모',
    people: '인물/참석자',
    sac: '전시장 풍경',
  }
  return names[category as keyof typeof names] || '기타'
}

export default function GalleryGrid({
  items,
  categories,
  className = '',
  onEvent,
}: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shareItem, setShareItem] = useState<GalleryItem | null>(null)

  // 이미지 로딩 상태 — 로드 완료된 id만 Set에 추가 (초기화 비용 없음)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  // 이미지 로드 핸들러
  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
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
  React.useEffect(() => {
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

  return (
    <div
      className={`gallery-grid ${className}`}
      style={{ backgroundColor: 'var(--framer-canvas)', padding: '0 30px' }}
    >
      {/* ── 필터 영역 */}
      <div style={{ marginBottom: '48px' }}>

        {/* 검색 바 — Framer surface-1 */}
        <motion.div
          style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 24px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <label htmlFor='gallery-search' className='sr-only'>갤러리 검색</label>
          <div
            aria-hidden='true'
            style={{
              position: 'absolute', left: '16px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--framer-ink-muted)',
            }}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </div>
          <input
            id='gallery-search'
            type='search'
            placeholder='작품명, 설명, 태그로 검색...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label='갤러리 작품 검색'
            aria-describedby='search-results-count'
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: '44px',
              paddingTop: '12px', paddingBottom: '12px',
              backgroundColor: 'var(--framer-surface-1)',
              border: '1px solid var(--framer-hairline)',
              borderRadius: '100px',
              color: 'var(--framer-ink)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px', letterSpacing: '-0.14px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--framer-accent-blue)'
              e.currentTarget.style.boxShadow = 'var(--framer-shadow-selected)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--framer-hairline)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label='검색어 지우기'
              style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--framer-ink-muted)', padding: '4px',
              }}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </motion.div>

        {/* 카테고리 필터 — Framer pill chips */}
        <div
          role='group'
          aria-label='카테고리 필터'
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}
        >
          {[{ id: 'all', name: '전체', count: items.length, icon: '' }, ...categories].map(cat => {
            const isActive = selectedCategory === cat.id
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isActive}
                aria-label={`${cat.name} (${cat.count}개)`}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '100px',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px', fontWeight: 500, letterSpacing: '-0.13px',
                  transition: 'background-color 0.15s, color 0.15s',
                  backgroundColor: isActive ? 'var(--framer-primary)' : 'var(--framer-surface-1)',
                  color: isActive ? 'var(--framer-on-primary)' : 'var(--framer-ink-muted)',
                }}
              >
                {cat.icon && <span aria-hidden='true'>{cat.icon}</span>}
                {cat.name}
                <span style={{ opacity: 0.6, fontSize: '11px' }}>({cat.count})</span>
              </motion.button>
            )
          })}
        </div>

        {/* 결과 카운트 — Framer caption */}
        <div
          id='search-results-count'
          role='status'
          aria-live='polite'
          style={{ textAlign: 'center', marginTop: '20px' }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '48px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'var(--framer-ink-muted)', marginBottom: '8px' }}>검색 결과가 없습니다</p>
              <p className='framer-caption'>다른 키워드로 시도해보세요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--framer-ink)' }}>
                {filteredItems.length}
              </span>
              <span className='framer-caption'>개의 사진</span>
              {searchQuery && (
                <span className='framer-caption'>&ldquo;{searchQuery}&rdquo; 검색 결과</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 갤러리 그리드 - Virtual Scrolling 마사이크 레이아웃 */}
      {filteredItems.length > 0 && (
        <VirtuosoGrid
          useWindowScroll
          totalCount={filteredItems.length}
          overscan={600}
          listClassName='masonry-grid'
          itemClassName='gallery-card'
          components={{
            List: React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
              function MasonryGridList(props, ref) {
                return (
                  <div
                    ref={ref}
                    {...props}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px',
                      gridAutoRows: 'auto',
                      ...props.style,
                    }}
                  />
                )
              }
            ),
          }}
          itemContent={index => {
            const item = filteredItems[index]!
            const isImageLoaded = loadedImages.has(item.id)
            const hasImageError = errorImages.has(item.id)

            return (
              <div
                key={item.id}
                className='group cursor-pointer gallery-card touch-manipulation'
                onClick={() => handleImageClick(item)}
                role='button'
                tabIndex={0}
                aria-label={`${item.title} - ${item.description}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleImageClick(item)
                  }
                }}
                style={{ animation: `framer-fade-up 0.3s ease both`, animationDelay: `${Math.min(index, 12) * 30}ms` }}
              >
                <div
                  style={{
                    position: 'relative',
                    backgroundColor: 'var(--framer-surface-1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: getRandomAspectRatio(index),
                    minHeight: '240px',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {/* 스켈레톤 로더 — Framer surface-2 */}
                  {!isImageLoaded && !hasImageError && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'var(--framer-surface-2)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}

                  {/* 에러 플레이스홀더 */}
                  {hasImageError && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'var(--framer-surface-2)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg className='w-12 h-12' style={{ color: 'var(--framer-hairline)' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      <p className='framer-micro' style={{ marginTop: '8px' }}>이미지를 불러올 수 없습니다</p>
                    </div>
                  )}

                  <Image
                    src={item.thumbnail || item.src}
                    alt={`${item.title} - ${getCategoryName(item.category)}`}
                    fill
                    className={`object-cover group-hover:scale-105 transition-all duration-500 ease-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    quality={75}
                    priority={index < 8}
                    loading={index < 8 ? 'eager' : 'lazy'}
                    unoptimized={false}
                    onLoad={() => handleImageLoad(item.id)}
                    onError={() => handleImageError(item.id)}
                  />
                  {/* 그라디언트 오버레이 */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500' />

                  {/* 카테고리 배지 — Framer eyebrow */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(20,20,20,0.85)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--framer-ink-muted)',
                        fontSize: '11px', fontWeight: 500,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.11px',
                      }}
                    >
                      {getCategoryName(item.category)}
                    </span>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className='absolute top-4 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300'>
                    <motion.button
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 0, rotate: 45 }}
                      whileHover={{ scale: 1.1, rotate: 0 }}
                      className='p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300'
                      onClick={e => handleShareClick(e, item)}
                      aria-label='공유하기'
                    >
                      <svg
                        className='w-4 h-4 text-gray-700 dark:text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                        />
                      </svg>
                    </motion.button>

                    <motion.button
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 0, rotate: 45 }}
                      whileHover={{ scale: 1.1, rotate: 0 }}
                      className='p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300'
                      onClick={e => {
                        e.stopPropagation()
                        handleImageClick(item)
                      }}
                      aria-label='전체화면 보기'
                    >
                      <svg
                        className='w-4 h-4 text-gray-700 dark:text-gray-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                        />
                      </svg>
                    </motion.button>
                  </div>

                  {/* 정보 오버레이 */}
                  <motion.div
                    className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500'
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                  >
                    <h3 className='text-white text-lg font-bold mb-2 line-clamp-2'>{item.title}</h3>
                    <p className='text-gray-200 text-sm mb-3 line-clamp-2'>{item.description}</p>
                    <div className='flex flex-wrap gap-1'>
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className='px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-md'
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className='text-white/70 text-xs self-center'>
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )
          }}
        />
      )}

      {/* 현대적인 라이트박스 모달 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            role='dialog'
            aria-modal='true'
            aria-labelledby='lightbox-title'
            aria-describedby='lightbox-description'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4'
            onClick={() => setSelectedImage(null)}
          >
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-gradient-to-br from-black/80 via-black/90 to-black/95'
              aria-hidden='true'
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{
                position: 'relative',
                maxWidth: '1100px', width: '95vw',
                maxHeight: '95vh',
                backgroundColor: 'var(--framer-surface-1)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* 상단 헤더 */}
              <div className='absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/60 to-transparent'>
                <div className='flex items-center justify-between'>
                  <div className='text-white'>
                    <h2 id='lightbox-title' className='text-2xl font-bold mb-1'>
                      {selectedImage.title}
                    </h2>
                    <p id='lightbox-description' className='text-gray-200 text-sm'>
                      {selectedImage.description}
                    </p>
                  </div>

                  <div className='flex items-center space-x-3'>
                    {/* 공유 버튼 */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => {
                        e.stopPropagation()
                        handleShareClick(e, selectedImage)
                      }}
                      className='p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg'
                      aria-label='공유하기'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                        />
                      </svg>
                    </motion.button>

                    {/* 닫기 버튼 */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedImage(null)}
                      className='p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-red-500/70 transition-all duration-300 shadow-lg'
                      aria-label='닫기'
                    >
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼들 */}
              <motion.button
                onClick={() => navigateImage('prev')}
                aria-label='이전 이미지 보기'
                className='absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50'
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
              </motion.button>

              <motion.button
                onClick={() => navigateImage('next')}
                aria-label='다음 이미지 보기'
                className='absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50'
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </motion.button>

              {/* 이미지 콘테이너 */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--framer-canvas)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: '60vh', maxHeight: '80vh',
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    width={1600}
                    height={1200}
                    className='max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl'
                    quality={100}
                    priority
                    sizes='100vw'
                  />
                </motion.div>
              </div>

              {/* 하단 정보 패널 — Framer surface-1 */}
              <motion.div
                style={{
                  padding: '24px 28px',
                  backgroundColor: 'var(--framer-surface-1)',
                  borderTop: '1px solid var(--framer-hairline-soft)',
                }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'var(--framer-surface-2)',
                          color: 'var(--framer-ink-muted)',
                          fontSize: '11px', fontWeight: 500,
                          padding: '3px 9px', borderRadius: '6px',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {getCategoryName(selectedImage.category)}
                      </span>
                      {selectedImage.eventDate && (
                        <span className='framer-caption'>{selectedImage.eventDate}</span>
                      )}
                    </div>
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '18px',
                        fontWeight: 600, letterSpacing: '-0.5px',
                        color: 'var(--framer-ink)', marginBottom: '6px',
                      }}
                    >
                      {selectedImage.title}
                    </h3>
                    <p className='framer-body' style={{ color: 'var(--framer-ink-muted)' }}>
                      {selectedImage.description}
                    </p>
                  </div>
                </div>

                {/* 태그 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedImage.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--framer-surface-2)',
                        color: 'var(--framer-ink-muted)',
                        fontSize: '12px', fontWeight: 500,
                        borderRadius: '6px',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.12px',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 네비게이션 정보 */}
                <div
                  style={{
                    marginTop: '16px', paddingTop: '14px',
                    borderTop: '1px solid var(--framer-hairline-soft)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span className='framer-caption'>
                    {filteredItems.findIndex(item => item.id === selectedImage.id) + 1} / {filteredItems.length}
                  </span>
                  <span className='framer-caption'>
                    ESC로 닫기 · ← → 키로 이동
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SNS 공유 모달 */}
      <AnimatePresence>
        {shareItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4'
            onClick={handleShareClose}
          >
            <div onClick={e => e.stopPropagation()}>
              <SocialShare item={shareItem} isOpen={!!shareItem} onClose={handleShareClose} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
