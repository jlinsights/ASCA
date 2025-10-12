'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { GalleryItem, GalleryCategory } from '@/types/gallery'

interface GalleryGridProps {
  items: GalleryItem[]
  categories: GalleryCategory[]
  className?: string
  onEvent?: (event: any) => void
}

const ITEMS_PER_PAGE = 24

export default function GalleryGrid({ items, categories, className = '', onEvent }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [items, selectedCategory, searchQuery])

  // 페이지네이션
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredItems, currentPage])

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((item: GalleryItem) => {
    setSelectedImage(item)
  }, [])

  // 라이트박스 네비게이션
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (!selectedImage) return

    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id)
    let newIndex

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1
    } else {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedImage(filteredItems[newIndex])
  }, [selectedImage, filteredItems])

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
  }, [selectedImage, navigateImage])

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
      {/* 헤더 및 필터 */}
      <div className="mb-8 space-y-6">
        {/* 검색 바 */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
          <input
            type="text"
            placeholder="작품 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({items.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* 결과 정보 */}
        <div className="text-center text-gray-600">
          {filteredItems.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <p>
              총 {filteredItems.length}개의 작품
              {searchQuery && ` "${searchQuery}" 검색 결과`}
            </p>
          )}
        </div>
      </div>

      {/* 갤러리 그리드 */}
      {currentItems.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8"
        >
          <AnimatePresence>
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleImageClick(item)}
              >
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    quality={item.quality?.suggested || 85}
                    priority={index < 6}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknygjLMzHkkknqTzSlT54b6bk+h0R//Z"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-white text-sm font-medium truncate">
                      {item.title}
                    </h3>
                    <p className="text-gray-200 text-xs truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ←
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (currentPage <= 4) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = currentPage - 3 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            →
          </button>
        </div>
      )}

      {/* 라이트박스 모달 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                ✕
              </button>

              {/* 이전/다음 버튼 */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                →
              </button>

              {/* 이미지 */}
              <div className="relative">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                  quality={selectedImage.quality?.isHighRes ? 95 : 90}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                />
              </div>

              {/* 이미지 정보 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-white text-xl font-bold mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-gray-200 mb-2">
                  {selectedImage.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}