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
    <div className={`gallery-grid ${className}`}>
      {/* 현대적인 헤더 및 필터 */}
      <div className='mb-12 space-y-8'>
        {/* 헤더 섹션 */}
        <div className='text-center space-y-4'>
          <motion.h1
            className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-gray-300 dark:to-gray-100 bg-clip-text text-transparent'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            갤러리
          </motion.h1>
          <motion.p
            className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            동양서예협회의 아름다운 서예 작품들을 만나보세요
          </motion.p>
        </div>

        {/* 고급 검색 바 */}
        <motion.div
          className='relative max-w-xl mx-auto'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label htmlFor='gallery-search' className='sr-only'>
            갤러리 검색
          </label>
          <div
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500'
            aria-hidden='true'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
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
            className='w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-300 dark:focus:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-gray-900/20'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label='검색어 지우기'
              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 rounded'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </motion.div>

        {/* 현대적인 카테고리 필터 */}
        <motion.div
          role='group'
          aria-label='카테고리 필터'
          className='flex flex-wrap justify-center gap-3'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            aria-label={`전체 카테고리 (${items.length}개 작품)`}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md dark:shadow-gray-900/20'
            }`}
            whileHover={{ scale: selectedCategory === 'all' ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✨ 전체{' '}
            <span className='ml-1 text-xs opacity-75' aria-hidden='true'>
              ({items.length})
            </span>
          </motion.button>
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              aria-label={`${category.name} 카테고리 (${category.count}개 작품)`}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md dark:shadow-gray-900/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {category.icon} {category.name}{' '}
              <span className='ml-1 text-xs opacity-75' aria-hidden='true'>
                ({category.count})
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* 결과 정보 */}
        <motion.div
          id='search-results-count'
          role='status'
          aria-live='polite'
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {filteredItems.length === 0 ? (
            <div className='py-8'>
              <div className='text-6xl mb-4' aria-hidden='true'>
                🔍
              </div>
              <p className='text-xl text-gray-500 dark:text-gray-400 mb-2'>검색 결과가 없습니다</p>
              <p className='text-gray-400 dark:text-gray-500'>다른 키워드로 시도해보세요</p>
            </div>
          ) : (
            <div className='flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400'>
              <span className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {filteredItems.length}
              </span>
              <span>개의 작품</span>
              {searchQuery && (
                <span className='text-sm text-gray-500 dark:text-gray-500'>
                  "{searchQuery}" 검색 결과
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* 갤러리 그리드 - Virtual Scrolling 마사이크 레이아웃 */}
      {filteredItems.length > 0 && (
        <VirtuosoGrid
          style={{ height: '100vh', minHeight: '800px' }}
          totalCount={filteredItems.length}
          overscan={200}
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
            const isImageLoaded = loadedImages[item.id]
            const hasImageError = errorImages.has(item.id)

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 40 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  type: 'spring',
                  bounce: 0.3,
                }}
                className='group cursor-pointer gallery-card touch-manipulation'
                onClick={() => handleImageClick(item)}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role='button'
                tabIndex={0}
                aria-label={`${item.title} - ${item.description}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleImageClick(item)
                  }
                }}
              >
                <div
                  className='relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/80 transition-all duration-500'
                  style={{
                    aspectRatio: getRandomAspectRatio(index),
                    minHeight: '250px',
                  }}
                >
                  {/* 스켈레톤 로더 */}
                  {!isImageLoaded && !hasImageError && (
                    <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer'>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <svg
                          className='w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* 에러 플레이스홀더 */}
                  {hasImageError && (
                    <div className='absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center'>
                      <svg
                        className='w-16 h-16 text-gray-400 dark:text-gray-600 mb-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        이미지를 불러올 수 없습니다
                      </p>
                    </div>
                  )}

                  <Image
                    src={item.src}
                    alt={`${item.title} - ${getCategoryName(item.category)} - ${item.description}`}
                    fill
                    className={`object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700 ease-in-out ${isImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
                    sizes='(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw'
                    quality={85}
                    priority={index < 6}
                    loading={index < 6 ? undefined : 'lazy'}
                    unoptimized={false}
                    onLoad={() => handleImageLoad(item.id)}
                    onError={() => handleImageError(item.id)}
                  />
                  {/* 그라디언트 오버레이 */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500' />

                  {/* 카테고리 배지 */}
                  <div className='absolute top-4 left-4 z-10'>
                    <span className='px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-full shadow-sm'>
                      {getCategoryIcon(item.category)} {getCategoryName(item.category)}
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
              </motion.div>
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
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='relative max-w-7xl max-h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl'
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

              {/* 이미지 컨테이너 */}
              <div className='relative bg-gray-50 flex items-center justify-center min-h-[60vh] max-h-[85vh]'>
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

              {/* 하단 정보 패널 */}
              <motion.div
                className='p-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800'
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <span className='px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded-full'>
                        {getCategoryIcon(selectedImage.category)}{' '}
                        {getCategoryName(selectedImage.category)}
                      </span>
                      {selectedImage.eventDate && (
                        <span className='text-gray-500 dark:text-gray-400 text-sm'>
                          {selectedImage.eventDate}
                        </span>
                      )}
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
                      {selectedImage.title}
                    </h3>
                    <p className='text-gray-600 dark:text-gray-400 text-lg leading-relaxed'>
                      {selectedImage.description}
                    </p>
                  </div>
                </div>

                {/* 태그들 */}
                <div className='flex flex-wrap gap-2'>
                  {selectedImage.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      className='px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>

                {/* 이미지 네비게이션 정보 */}
                <div className='mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                  <span>
                    {filteredItems.findIndex(item => item.id === selectedImage.id) + 1} /{' '}
                    {filteredItems.length}
                  </span>
                  <span className='text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                    ESC로 닫기 | ← → 키로 이동
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
