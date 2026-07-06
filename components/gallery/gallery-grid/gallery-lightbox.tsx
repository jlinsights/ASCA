'use client'

import type { MouseEvent } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { getCategoryIcon, getCategoryName } from './gallery-grid.utils'

interface GalleryLightboxProps {
  selectedImage: GalleryItem | null
  filteredItems: GalleryItem[]
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onShareClick: (e: MouseEvent, item: GalleryItem) => void
}

export function GalleryLightbox({
  selectedImage,
  filteredItems,
  onClose,
  onNavigate,
  onShareClick,
}: GalleryLightboxProps) {
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: Boolean(selectedImage),
    onEscape: onClose,
  })

  return (
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
          onClick={onClose}
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
            ref={trapRef}
            tabIndex={-1}
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
                      onShareClick(e, selectedImage)
                    }}
                    className='p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg'
                    aria-label='공유하기'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                    onClick={onClose}
                    className='p-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-red-500/70 transition-all duration-300 shadow-lg'
                    aria-label='닫기'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
              onClick={() => onNavigate('prev')}
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
              onClick={() => onNavigate('next')}
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
                    key={tag}
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
  )
}
