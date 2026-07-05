'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VirtuosoGrid } from 'react-virtuoso'
import { GalleryItem, GalleryCategory } from '@/lib/types/gallery/gallery-legacy'
import SocialShare from './SocialShare'
import { useGalleryGrid } from './gallery-grid/use-gallery-grid'
import { GalleryItemCard } from './gallery-grid/gallery-item'
import { GalleryLightbox } from './gallery-grid/gallery-lightbox'

interface GalleryGridProps {
  items: GalleryItem[]
  categories: GalleryCategory[]
  className?: string
  onEvent?: (event: any) => void
}

export default function GalleryGrid({
  items,
  categories,
  className = '',
  onEvent,
}: GalleryGridProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedImage,
    setSelectedImage,
    shareItem,
    loadedImages,
    errorImages,
    handleImageClick,
    handleShareClick,
    handleImageLoad,
    handleImageError,
    handleShareClose,
    filteredItems,
    navigateImage,
  } = useGalleryGrid({ items })

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
              <GalleryItemCard
                key={item.id}
                item={item}
                index={index}
                isImageLoaded={!!isImageLoaded}
                hasImageError={hasImageError}
                onImageClick={handleImageClick}
                onShareClick={handleShareClick}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
              />
            )
          }}
        />
      )}

      {/* 현대적인 라이트박스 모달 */}
      <GalleryLightbox
        selectedImage={selectedImage}
        filteredItems={filteredItems}
        onClose={() => setSelectedImage(null)}
        onNavigate={navigateImage}
        onShareClick={handleShareClick}
      />

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
