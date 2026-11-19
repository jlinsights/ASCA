'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { GalleryCategory, GalleryItem } from '@/lib/types/gallery/gallery-legacy'
import { cardRatio, catIcon, catName, photoCaption, photoDescription } from './gallery-photo'

export const PAGE_SIZE = 24

export interface GalleryPaginationData {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
  /** 비슷한 사진을 접기 전 사진 수 */
  photoCount?: number
}

export function FilterBar({
  availableYears,
  categories,
  year,
  category,
  search,
  totalCount,
  photoCount,
  showAllSimilar,
  onChange,
}: {
  availableYears: number[]
  categories: GalleryCategory[]
  year: string
  category: string
  search: string
  totalCount: number
  /** 접기 전 사진 수 — 대표 사진 수와 다르면 비슷한 사진이 묶여 있다 */
  photoCount: number
  showAllSimilar: boolean
  onChange: (updates: Record<string, string>) => void
}) {
  const folded = photoCount - totalCount
  const [localSearch, setLocalSearch] = useState(search)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const handleSearch = (v: string) => {
    setLocalSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ search: v })
    }, 400)
  }

  return (
    <div className='space-y-5'>
      <div className='relative max-w-lg mx-auto'>
        {/* 자리표시자는 입력하면 사라지므로 이름이 될 수 없다 — 화면 낭독기용 이름표 */}
        <label htmlFor='gallery-search' className='sr-only'>
          사진 검색
        </label>
        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </span>
        <input
          id='gallery-search'
          type='search'
          value={localSearch}
          onChange={e => handleSearch(e.target.value)}
          placeholder='제목, 설명, 태그로 검색...'
          className='w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-base md:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'
        />
        {localSearch && (
          <button
            onClick={() => handleSearch('')}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            aria-label='검색어 지우기'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>

      <div className='flex flex-wrap justify-center gap-2'>
        {(['all', ...availableYears.map(String)] as string[]).map(y => (
          <button
            key={y}
            onClick={() => onChange({ year: y })}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              year === y
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary/50'
            }`}
          >
            {y === 'all' ? '전체 연도' : `${y}년`}
          </button>
        ))}
      </div>

      <div className='flex flex-wrap justify-center gap-2' role='group' aria-label='카테고리 필터'>
        <button
          onClick={() => onChange({ category: 'all' })}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            category === 'all'
              ? 'bg-accent text-accent-foreground border-accent'
              : 'bg-background text-foreground border-border hover:border-accent/60'
          }`}
        >
          ✨ 전체
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onChange({ category: cat.id })}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              category === cat.id
                ? 'bg-accent text-accent-foreground border-accent'
                : 'bg-background text-foreground border-border hover:border-accent/60'
            }`}
          >
            {cat.icon} {cat.name}
            <span className='ml-1 opacity-60'>({cat.count})</span>
          </button>
        ))}
      </div>

      <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
        <p role='status' aria-live='polite'>
          {totalCount === 0 ? (
            '검색 결과가 없습니다'
          ) : showAllSimilar || folded === 0 ? (
            <>
              <strong className='text-foreground'>{totalCount}</strong>장의 사진
            </>
          ) : (
            <>
              <strong className='text-foreground'>{totalCount}</strong>장 · 연속 촬영한 비슷한 사진{' '}
              {folded}장은 묶어 두었습니다
            </>
          )}
        </p>
        {(folded > 0 || showAllSimilar) && (
          <button
            type='button'
            aria-pressed={showAllSimilar}
            onClick={() => onChange({ similar: showAllSimilar ? '' : 'all' })}
            className='min-h-11 px-1 font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground'
          >
            {showAllSimilar ? '비슷한 사진 묶기' : '비슷한 사진도 모두 보기'}
          </button>
        )}
      </div>
    </div>
  )
}

export function GalleryCard({
  item,
  index,
  showCategory,
  onClick,
}: {
  item: GalleryItem
  index: number
  /** 분류로 거르지 않은 목록에서만 분류 표시 — 거른 목록에선 모든 카드가 같은 말을 반복한다 */
  showCategory: boolean
  onClick: (item: GalleryItem) => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const similarCount = item.similar?.length ?? 0
  const caption = photoCaption(item)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.6) }}
      className='group cursor-pointer'
      onClick={() => onClick(item)}
      role='button'
      tabIndex={0}
      aria-label={`${caption} 사진 크게 보기${similarCount > 1 ? ` (비슷한 사진 ${similarCount}장)` : ''}`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(item)
        }
      }}
    >
      <div
        className='relative bg-muted rounded-xl overflow-hidden'
        style={{ aspectRatio: cardRatio(item) }}
      >
        {!loaded && !errored && (
          <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted' />
        )}
        {errored && (
          <div className='absolute inset-0 flex items-center justify-center text-muted-foreground text-xs'>
            이미지 없음
          </div>
        )}
        <Image
          src={item.thumbnail || item.src}
          alt={`${photoDescription(item)} — ${caption}`}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          // Storage 썸네일은 이미 가로 480px WebP(평균 19KB)다. 다시 최적화하면 같은 화질을 w=3840 로 재인코딩할 뿐
          unoptimized
          loading={index < 8 ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        {showCategory && (
          <div className='absolute top-2 left-2'>
            <span className='text-xs px-2 py-0.5 bg-background/90 backdrop-blur-sm rounded-full font-medium text-foreground'>
              {catIcon(item.category)} {catName(item.category)}
            </span>
          </div>
        )}
        {similarCount > 1 && (
          <div className='absolute top-2 right-2'>
            <span className='inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full font-medium text-white'>
              <svg
                aria-hidden='true'
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <rect x='7' y='7' width='13' height='13' rx='2' strokeWidth={2} />
                <path d='M4 16V6a2 2 0 0 1 2-2h10' strokeWidth={2} strokeLinecap='round' />
              </svg>
              {similarCount}
            </span>
          </div>
        )}
        <div className='absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
          <p className='text-white text-sm font-semibold line-clamp-2'>{photoDescription(item)}</p>
          {item.eventDate && <p className='text-white/70 text-xs mt-0.5'>{item.eventDate}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export function Lightbox({
  item,
  items,
  onClose,
  onNavigate,
}: {
  item: GalleryItem
  items: GalleryItem[]
  onClose: () => void
  onNavigate: (dir: 'prev' | 'next') => void
}) {
  const idx = items.findIndex(i => i.id === item.id)
  const frames = item.similar ?? []
  const [frameIndex, setFrameIndex] = useState(0)
  const frame = frames[frameIndex]
  const shown = frame ? { src: frame.src, width: frame.width, height: frame.height } : null

  useEffect(() => {
    setFrameIndex(
      Math.max(
        0,
        frames.findIndex(f => f.id === item.id)
      )
    )
    // 대표 사진이 바뀔 때만 처음 장으로
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate('prev')
      if (e.key === 'ArrowRight') onNavigate('next')
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, onNavigate])

  return (
    <motion.div
      role='dialog'
      aria-modal='true'
      aria-label={`${photoCaption(item)} 사진`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className='relative w-full max-w-5xl bg-card rounded-2xl overflow-hidden shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between p-4 border-b border-border'>
          <div>
            <h2 className='text-base font-semibold text-foreground line-clamp-1'>
              {photoDescription(item)}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {catIcon(item.category)} {photoCaption(item)}
              {frames.length > 1 && ` · 비슷한 사진 ${frameIndex + 1} / ${frames.length}`}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {idx + 1} / {items.length}
            </span>
            <button
              onClick={onClose}
              className='p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
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
            </button>
          </div>
        </div>

        <div
          className='relative bg-black flex items-center justify-center'
          style={{ minHeight: 400, maxHeight: '70vh' }}
        >
          <button
            onClick={() => onNavigate('prev')}
            className='absolute left-3 z-10 p-2 bg-background/60 backdrop-blur-sm rounded-full hover:bg-background/90 transition text-foreground'
            aria-label='이전 이미지'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </button>
          <Image
            key={shown?.src ?? item.src}
            src={shown?.src ?? item.src}
            alt={`${photoDescription(item)} — ${photoCaption(item)}`}
            width={shown?.width ?? item.dimensions?.width ?? 1600}
            height={shown?.height ?? item.dimensions?.height ?? 1200}
            className='max-w-full max-h-[70vh] w-auto h-auto object-contain'
            // Storage 의 web.webp 는 이미 가로 1600px — 다시 최적화하지 않는다
            unoptimized
            priority
          />
          <button
            onClick={() => onNavigate('next')}
            className='absolute right-3 z-10 p-2 bg-background/60 backdrop-blur-sm rounded-full hover:bg-background/90 transition text-foreground'
            aria-label='다음 이미지'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>

        {frames.length > 1 && (
          <div className='border-t border-border p-3'>
            <p className='sr-only'>비슷한 사진 {frames.length}장</p>
            <ol className='flex gap-2 overflow-x-auto'>
              {frames.map((f, i) => (
                <li key={f.id} className='flex-none'>
                  <button
                    type='button'
                    onClick={() => setFrameIndex(i)}
                    aria-label={`비슷한 사진 ${i + 1}번 보기`}
                    aria-current={i === frameIndex ? 'true' : undefined}
                    className={`relative block h-16 w-20 overflow-hidden rounded-md border-2 transition ${
                      i === frameIndex
                        ? 'border-primary'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={f.thumbnail} alt='' fill unoptimized className='object-cover' />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </motion.div>

      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs'>
        ESC 닫기 &nbsp;|&nbsp; ← → 이동
      </div>
    </motion.div>
  )
}

export function GalleryPagination({
  pagination,
  onPage,
}: {
  pagination: GalleryPaginationData
  onPage: (p: number) => void
}) {
  const { page, totalPages } = pagination
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <nav aria-label='페이지 이동' className='flex items-center justify-center gap-1.5 mt-12'>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className='px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition'
        aria-label='이전 페이지'
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className='px-2 text-muted-foreground text-sm'>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-muted text-foreground'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className='px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition'
        aria-label='다음 페이지'
      >
        →
      </button>
    </nav>
  )
}

export function SkeletonGrid() {
  return (
    <div className='columns-2 md:columns-3 lg:columns-4 gap-3'>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className='mb-3 break-inside-avoid rounded-xl bg-muted animate-pulse'
          style={{ height: [200, 160, 220, 180][i % 4] }}
        />
      ))}
    </div>
  )
}
