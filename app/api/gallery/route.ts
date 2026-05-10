import { NextRequest, NextResponse } from 'next/server'
import { GalleryItem } from '@/lib/types/gallery/gallery-legacy'

const PAGE_SIZE = 24

// 연도별 JSON 파일을 동적으로 로드 (서버사이드, 청크별 로드)
async function loadGalleryItems(year?: string): Promise<GalleryItem[]> {
  if (year && year !== 'all') {
    try {
      const data = await import(`@/lib/data/gallery-${year}.json`)
      return (data.default as { items: GalleryItem[] }).items ?? []
    } catch {
      // 해당 연도 파일이 없으면 전체에서 필터
    }
  }

  // 전체 로드 (폴백)
  const data = await import('@/lib/data/gallery-data.json')
  const items = (data.default as { items: GalleryItem[] }).items ?? []
  if (year && year !== 'all') {
    return items.filter(item => item.eventYear === Number(year))
  }
  return items
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const year = searchParams.get('year') ?? 'all'
  const category = searchParams.get('category') ?? 'all'
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(48, Math.max(12, Number(searchParams.get('limit') ?? PAGE_SIZE)))

  try {
    let items = await loadGalleryItems(year)

    // 카테고리 필터
    if (category !== 'all') {
      items = items.filter(item => item.category === category)
    }

    // 검색 필터
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    // 최신순 정렬
    items = items.sort((a, b) => {
      const da = a.eventDate ?? a.modifiedTime ?? ''
      const db = b.eventDate ?? b.modifiedTime ?? ''
      return db.localeCompare(da)
    })

    const totalCount = items.length
    const totalPages = Math.ceil(totalCount / limit)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)

    return NextResponse.json(
      {
        items: pageItems,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('[Gallery API]', error)
    return NextResponse.json({ error: 'Failed to load gallery data' }, { status: 500 })
  }
}
