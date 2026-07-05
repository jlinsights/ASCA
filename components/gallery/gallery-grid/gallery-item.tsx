'use client'

import type { MouseEvent } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'
import { getRandomAspectRatio, getCategoryIcon, getCategoryName } from './gallery-grid.utils'

interface GalleryItemCardProps {
  item: GalleryItem
  index: number
  isImageLoaded: boolean
  hasImageError: boolean
  onImageClick: (item: GalleryItem) => void
  onShareClick: (e: MouseEvent, item: GalleryItem) => void
  onImageLoad: (id: string) => void
  onImageError: (id: string) => void
}

export function GalleryItemCard({
  item,
  index,
  isImageLoaded,
  hasImageError,
  onImageClick,
  onShareClick,
  onImageLoad,
  onImageError,
}: GalleryItemCardProps) {
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
      onClick={() => onImageClick(item)}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role='button'
      tabIndex={0}
      aria-label={`${item.title} - ${item.description}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onImageClick(item)
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
            <p className='text-sm text-gray-500 dark:text-gray-400'>이미지를 불러올 수 없습니다</p>
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
          onLoad={() => onImageLoad(item.id)}
          onError={() => onImageError(item.id)}
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
            onClick={e => onShareClick(e, item)}
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
              onImageClick(item)
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
              <span className='text-white/70 text-xs self-center'>+{item.tags.length - 3}</span>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
