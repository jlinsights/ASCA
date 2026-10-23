import {
  galleryMediaKey,
  resolveGalleryData,
  resolveGalleryItems,
  type GalleryMedia,
} from '../gallery-media'
import type { GalleryItem, GalleryData } from '../types/gallery/gallery-legacy'

const base = {
  title: '행사 사진',
  description: '행사',
  category: 'event',
  src: '/images/gallery/2025/event/photo.jpg',
  thumbnail: '/images/gallery/2025/event/photo.jpg',
  originalSize: 1,
  modifiedTime: '2025-04-19',
  eventDate: '2025-04-19',
  eventYear: 2025,
  tags: [],
}
const rows: GalleryItem[] = [
  { ...base, id: '1' },
  { ...base, id: '2', src: '/images/gallery/2025/event/photo-750w.webp' },
]
const mapping: Record<string, GalleryMedia> = {
  '/images/gallery/2025/event/photo': {
    bucket: 'gallery',
    path: '2025/photo/web.webp',
    thumbnailPath: '2025/photo/thumb.webp',
    width: 1600,
    height: 1000,
    originalSize: 100,
  },
}
const previous = process.env.NEXT_PUBLIC_SUPABASE_URL
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
})
afterAll(() => {
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
  else process.env.NEXT_PUBLIC_SUPABASE_URL = previous
})

it('업로드된 원본만 URL로 연결하고 중복 해상도를 한 사진으로 센다', () => {
  const result = resolveGalleryItems(rows, mapping)
  expect(result).toHaveLength(1)
  expect(result[0]?.src).toBe(
    'https://example.supabase.co/storage/v1/object/public/gallery/2025/photo/web.webp'
  )
  expect(result[0]?.thumbnail).toContain('/thumb.webp')
  expect(rows[0]?.src).toBe(base.src)
})

it('아직 업로드하지 않은 항목은 기존 연결을 유지한다', () => {
  expect(resolveGalleryItems(rows, {})).toEqual(rows)
})

it('해상도 중복을 제거한 뒤 연도·카테고리·전체 통계를 함께 계산한다', () => {
  const data: GalleryData = {
    items: rows,
    categories: [{ id: 'event', name: '행사', icon: '', description: '', count: 2 }],
    metadata: {
      totalImages: 2,
      lastUpdated: '',
      categories: {},
      yearStats: {},
      availableYears: [2025],
      version: '1',
    },
  }
  const result = resolveGalleryData(data, mapping)
  expect(result.metadata.totalImages).toBe(1)
  expect(result.categories[0]?.count).toBe(1)
  expect(result.metadata.yearStats[2025]?.count).toBe(1)
})

it('상위 폴더 접근과 비공개 버킷 매핑을 허용하지 않는다', () => {
  expect(galleryMediaKey('/images/gallery/../private.jpg')).toBeNull()
  const invalid = {
    ...mapping,
    '/images/gallery/2025/event/photo': {
      ...mapping['/images/gallery/2025/event/photo']!,
      path: '../original.jpg',
    },
  }
  expect(() => resolveGalleryItems(rows, invalid)).toThrow('잘못된')
  const privateBucket = {
    '/images/gallery/2025/event/photo': {
      ...mapping['/images/gallery/2025/event/photo']!,
      bucket: 'archive-private',
    },
  } as unknown as Record<string, GalleryMedia>
  expect(() => resolveGalleryItems(rows, privateBucket)).toThrow('잘못된')
})
