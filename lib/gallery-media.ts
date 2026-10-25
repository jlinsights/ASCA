import media from '@/lib/data/gallery-media.json'
import type { GalleryData, GalleryItem } from '@/lib/types/gallery/gallery-legacy'

export interface GalleryMedia {
  bucket: 'gallery'
  path: string
  thumbnailPath: string
  width: number
  height: number
  originalSize: number
}

export function galleryMediaKey(value: string): string | null {
  if (!value.startsWith('/images/gallery/') || value.split('/').includes('..')) return null
  return value
    .normalize('NFC')
    .replace(/\/(originals|thumbnails)\//, '/')
    .replace(/-\d+w(?=\.[^.]+$)/, '')
    .replace(/\.[^.]+$/, '')
}

function publicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error('갤러리 Storage URL이 설정되지 않았습니다.')
  if (
    bucket !== 'gallery' ||
    path.split('/').some(part => !part || part === '..' || part === '.')
  ) {
    throw new Error('잘못된 갤러리 Storage 경로입니다.')
  }
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`
}

export function resolveGalleryItems(
  items: GalleryItem[],
  mapping: Record<string, GalleryMedia> = media as Record<string, GalleryMedia>
): GalleryItem[] {
  const seen = new Set<string>()
  return items.flatMap(item => {
    const key = galleryMediaKey(item.src)
    const image = key ? mapping[key] : undefined
    // 업로드가 확인된 파일만 바꾼다. 미연결 항목을 임의로 제거하지 않는다.
    if (!key || !image) return [item]
    if (seen.has(key)) return []
    seen.add(key)
    return [
      {
        ...item,
        mediaKey: key,
        src: publicUrl(image.bucket, image.path),
        thumbnail: publicUrl(image.bucket, image.thumbnailPath),
        originalSize: image.originalSize,
        dimensions: {
          width: image.width,
          height: image.height,
          aspectRatio: `${image.width}/${image.height}`,
        },
      },
    ]
  })
}

export function resolveGalleryData(
  data: GalleryData,
  mapping: Record<string, GalleryMedia> = media as Record<string, GalleryMedia>
): GalleryData {
  const items = resolveGalleryItems(data.items, mapping)
  const categories = data.categories.map(category => ({
    ...category,
    count: items.filter(item => item.category === category.id).length,
  }))
  const availableYears = [...new Set(items.map(item => item.eventYear))].sort((a, b) => b - a)
  return {
    ...data,
    items,
    categories,
    metadata: {
      ...data.metadata,
      totalImages: items.length,
      availableYears,
      categories: Object.fromEntries(categories.map(category => [category.id, category])),
      yearStats: Object.fromEntries(
        availableYears.map(year => {
          const rows = items.filter(item => item.eventYear === year)
          return [
            year,
            { count: rows.length, categories: [...new Set(rows.map(item => item.category))] },
          ]
        })
      ),
    },
  }
}
