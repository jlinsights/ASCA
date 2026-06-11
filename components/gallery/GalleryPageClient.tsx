'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { GalleryItem, GalleryCategory } from '@/lib/types/gallery/gallery-legacy'
import {
  FilterBar,
  GalleryCard,
  GalleryPagination,
  GalleryPaginationData,
  Lightbox,
  PAGE_SIZE,
  SkeletonGrid,
} from './GalleryPageParts'

interface ApiResponse {
  items: GalleryItem[]
  pagination: GalleryPaginationData
}

function useGalleryParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const year = searchParams.get('year') ?? 'all'
  const category = searchParams.get('category') ?? 'all'
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === '' || v === 'all' || v === '1') params.delete(k)
        else params.set(k, v)
      }
      if ('year' in updates || 'category' in updates || 'search' in updates) {
        params.delete('page')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return { year, category, search, page, setParams }
}

function useGalleryData(year: string, category: string, search: string, page: number) {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLoading(true)
    setError(null)

    const qs = new URLSearchParams({
      ...(year !== 'all' ? { year } : {}),
      ...(category !== 'all' ? { category } : {}),
      ...(search.trim() ? { search } : {}),
      page: String(page),
      limit: String(PAGE_SIZE),
    })

    fetch(`/api/gallery?${qs}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((json: ApiResponse) => {
        setData(json)
        setLoading(false)
      })
      .catch(e => {
        if (e.name !== 'AbortError') {
          setError('갤러리를 불러오지 못했습니다.')
          setLoading(false)
        }
      })

    return () => ctrl.abort()
  }, [year, category, search, page])

  return { data, loading, error }
}

interface GalleryPageClientProps {
  availableYears: number[]
  categories: GalleryCategory[]
}

export default function GalleryPageClient({ availableYears, categories }: GalleryPageClientProps) {
  const { year, category, search, page, setParams } = useGalleryParams()
  const { data, loading, error } = useGalleryData(year, category, search, page)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [, startTransition] = useTransition()

  const handleParamsChange = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => setParams(updates))
    },
    [setParams]
  )

  const navigateImage = useCallback(
    (dir: 'prev' | 'next') => {
      if (!selectedImage || !data) return
      const items = data.items
      const idx = items.findIndex(i => i.id === selectedImage.id)
      if (idx === -1) return
      const next =
        dir === 'prev'
          ? idx > 0
            ? items[idx - 1]
            : items[items.length - 1]
          : idx < items.length - 1
            ? items[idx + 1]
            : items[0]
      setSelectedImage(next!)
    },
    [selectedImage, data]
  )

  const totalCount = data?.pagination.totalCount ?? 0

  return (
    <>
      <FilterBar
        availableYears={availableYears}
        categories={categories}
        year={year}
        category={category}
        search={search}
        totalCount={totalCount}
        onChange={handleParamsChange}
      />

      <div className='mt-8'>
        {loading && <SkeletonGrid />}
        {!loading && error && (
          <div className='text-center py-20 text-muted-foreground'>{error}</div>
        )}
        {!loading && !error && data && data.items.length === 0 && (
          <div className='text-center py-20'>
            <div className='text-4xl mb-3'>🔍</div>
            <p className='text-muted-foreground'>검색 결과가 없습니다</p>
            <button
              onClick={() => handleParamsChange({ year: 'all', category: 'all', search: '' })}
              className='mt-4 text-primary text-sm underline underline-offset-2'
            >
              필터 초기화
            </button>
          </div>
        )}
        {!loading && !error && data && data.items.length > 0 && (
          <>
            <div className='columns-2 md:columns-3 lg:columns-4 gap-3'>
              {data.items.map((item, i) => (
                <div key={item.id} className='mb-3 break-inside-avoid'>
                  <GalleryCard item={item} index={i} onClick={setSelectedImage} />
                </div>
              ))}
            </div>
            <GalleryPagination
              pagination={data.pagination}
              onPage={p => handleParamsChange({ page: String(p) })}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && data && (
          <Lightbox
            item={selectedImage}
            items={data.items}
            onClose={() => setSelectedImage(null)}
            onNavigate={navigateImage}
          />
        )}
      </AnimatePresence>
    </>
  )
}
