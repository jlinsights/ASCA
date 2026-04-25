import {
  Artwork,
  ArtworkFilters,
  SortOption,
  Currency,
  ArtworkCategory,
  ArtworkStyle,
} from '@/lib/types/artwork'

/**
 * 가격을 통화에 맞춰 포맷팅하는 함수
 */
export function formatPrice(price: number, currency: Currency): string {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    KRW: new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    EUR: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    JPY: new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  }

  return formatters[currency]?.format(price) || `${currency} ${price.toLocaleString()}`
}

/**
 * 간단한 가격 포맷팅 (통화 기호만)
 */
export function formatPriceSimple(price: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    KRW: '₩',
    USD: '$',
    EUR: '€',
    JPY: '¥',
  }

  return `${symbols[currency]}${price.toLocaleString()}`
}

/**
 * 작품 배열을 필터링하는 함수
 */
export function filterArtworks(artworks: Artwork[], filters: ArtworkFilters): Artwork[] {
  return artworks.filter(artwork => {
    // 카테고리 필터
    if (filters.category && filters.category !== 'all') {
      if (artwork.category !== filters.category) return false
    }

    // 스타일 필터
    if (filters.style && filters.style !== 'all') {
      if (artwork.style !== filters.style) return false
    }

    // 가격 범위 필터
    if (filters.minPrice && (artwork.price === undefined || artwork.price < filters.minPrice))
      return false
    if (filters.maxPrice && (artwork.price === undefined || artwork.price > filters.maxPrice))
      return false

    // 연도 범위 필터
    if (filters.minYear && artwork.year < filters.minYear) return false
    if (filters.maxYear && artwork.year > filters.maxYear) return false

    // 구매 가능 여부 필터
    if (filters.isAvailable !== undefined && artwork.isAvailable !== filters.isAvailable)
      return false

    // 추천 작품 필터
    if (filters.isFeatured !== undefined && artwork.isFeatured !== filters.isFeatured) return false

    // 작가 필터
    if (filters.artist && !artwork.artist.toLowerCase().includes(filters.artist.toLowerCase()))
      return false

    // 검색어 필터
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      const searchableText = [
        artwork.title,
        artwork.titleEn,
        artwork.artist,
        artwork.artistEn,
        artwork.description,
        artwork.descriptionEn,
        artwork.medium,
        artwork.mediumEn,
        ...artwork.tags,
        ...artwork.tagsEn,
      ]
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(searchTerm)) return false
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        artwork.tags.some(artworkTag => artworkTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) return false
    }

    return true
  })
}

/**
 * 작품 배열을 정렬하는 함수
 */
export function sortArtworks(artworks: Artwork[], sortOption: SortOption): Artwork[] {
  const sorted = [...artworks]

  switch (sortOption) {
    case 'featured':
      return sorted.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return b.views - a.views // 추천 작품들 중에서는 조회수 순
      })

    case 'newest':
      return sorted.sort((a, b) => b.year - a.year)

    case 'oldest':
      return sorted.sort((a, b) => a.year - b.year)

    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))

    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))

    case 'popular':
      return sorted.sort((a, b) => b.views - a.views)

    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    case 'artist':
      return sorted.sort((a, b) => a.artist.localeCompare(b.artist))

    default:
      return sorted
  }
}

/**
 * 작품 검색 함수 (가중치 기반 스코어링)
 */
export function searchArtworks(artworks: Artwork[], searchTerm: string): Artwork[] {
  if (!searchTerm.trim()) return artworks

  const term = searchTerm.toLowerCase().trim()

  const scoredArtworks = artworks.map(artwork => {
    let score = 0

    // 제목 매칭 (높은 가중치)
    if (artwork.title.toLowerCase().includes(term)) score += 10
    if (artwork.titleEn.toLowerCase().includes(term)) score += 8

    // 작가명 매칭 (높은 가중치)
    if (artwork.artist.toLowerCase().includes(term)) score += 10
    if (artwork.artistEn.toLowerCase().includes(term)) score += 8

    // 카테고리 매칭
    if (artwork.category.toLowerCase().includes(term)) score += 6

    // 스타일 매칭
    if (artwork.style.toLowerCase().includes(term)) score += 5

    // 재료 매칭
    if (artwork.medium.toLowerCase().includes(term)) score += 4
    if (artwork.mediumEn.toLowerCase().includes(term)) score += 4

    // 태그 매칭
    artwork.tags.forEach(tag => {
      if (tag.toLowerCase().includes(term)) score += 3
    })
    artwork.tagsEn.forEach(tag => {
      if (tag.toLowerCase().includes(term)) score += 3
    })

    // 설명 매칭 (낮은 가중치)
    if (artwork.description.toLowerCase().includes(term)) score += 2
    if (artwork.descriptionEn.toLowerCase().includes(term)) score += 2

    // 완전 일치 보너스
    if (artwork.title.toLowerCase() === term) score += 20
    if (artwork.artist.toLowerCase() === term) score += 20

    return { artwork, score }
  })

  return scoredArtworks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.artwork)
}

/**
 * 카테고리 정보를 가져오는 함수
 */
export function getCategoryInfo(category: ArtworkCategory) {
  const categoryData = {
    calligraphy: {
      title: '서예',
      titleEn: 'Calligraphy',
      titleJa: '書道',
      titleZh: '书法',
      description: '전통과 현대를 아우르는 한국, 중국, 일본의 서예 작품',
      descriptionEn:
        'Korean, Chinese, and Japanese calligraphy works spanning tradition and modernity',
      descriptionJa: '伝統と現代を包括する韓国、中国、日本の書道作品',
      descriptionZh: '涵盖传统与现代的韩国、中国、日本书法作品',
      color: '#2563eb',
      icon: '筆',
    },
    painting: {
      title: '회화',
      titleEn: 'Painting',
      titleJa: '絵画',
      titleZh: '绘画',
      description: '산수화부터 현대 동양화까지, 다채로운 회화 작품',
      descriptionEn: 'Diverse paintings from traditional landscapes to contemporary oriental art',
      descriptionJa: '山水画から現代東洋画まで、多彩な絵画作品',
      descriptionZh: '从山水画到现代东方绘画的多彩作品',
      color: '#dc2626',
      icon: '🎨',
    },
    sculpture: {
      title: '조각',
      titleEn: 'Sculpture',
      titleJa: '彫刻',
      titleZh: '雕塑',
      description: '동양의 정신성을 담은 입체 예술 작품',
      descriptionEn: 'Three-dimensional artworks embodying Oriental spirituality',
      descriptionJa: '東洋の精神性を込めた立体芸術作品',
      descriptionZh: '体现东方精神性的立体艺术作品',
      color: '#059669',
      icon: '🗿',
    },
    'mixed-media': {
      title: '혼합매체',
      titleEn: 'Mixed Media',
      titleJa: 'ミクストメディア',
      titleZh: '混合媒体',
      description: '전통과 현대 기법이 만나는 실험적 작품',
      descriptionEn: 'Experimental works where traditional and modern techniques converge',
      descriptionJa: '伝統と現代技法が出会う実験的作品',
      descriptionZh: '传统与现代技法交汇的实验性作品',
      color: '#7c3aed',
      icon: '🎭',
    },
  }

  return categoryData[category]
}

/**
 * 스타일 정보를 가져오는 함수
 */
export function getStyleInfo(style: ArtworkStyle) {
  const styleData = {
    traditional: {
      title: '전통',
      titleEn: 'Traditional',
      titleJa: '伝統',
      titleZh: '传统',
      description: '고전적인 기법과 양식을 따르는 작품',
      color: '#92400e',
    },
    contemporary: {
      title: '현대',
      titleEn: 'Contemporary',
      titleJa: '現代',
      titleZh: '现代',
      description: '현대적 감각으로 재해석한 작품',
      color: '#1f2937',
    },
    modern: {
      title: '모던',
      titleEn: 'Modern',
      titleJa: 'モダン',
      titleZh: '现代',
      description: '혁신적인 기법과 표현을 사용한 작품',
      color: '#059669',
    },
  }

  return styleData[style]
}

/**
 * 관련 작품을 찾는 함수
 */
export function findRelatedArtworks(
  targetArtwork: Artwork,
  allArtworks: Artwork[],
  limit: number = 6
): Artwork[] {
  const related = allArtworks
    .filter(artwork => artwork.id !== targetArtwork.id)
    .map(artwork => {
      let score = 0

      // 같은 작가 (높은 점수)
      if (artwork.artist === targetArtwork.artist) score += 50

      // 같은 카테고리
      if (artwork.category === targetArtwork.category) score += 30

      // 같은 스타일
      if (artwork.style === targetArtwork.style) score += 20

      // 비슷한 가격대 (±30%)
      if (targetArtwork.price !== undefined && artwork.price !== undefined) {
        const priceRange = targetArtwork.price * 0.3
        if (Math.abs(artwork.price - targetArtwork.price) <= priceRange) score += 15
      }

      // 공통 태그
      const commonTags = artwork.tags.filter(tag => targetArtwork.tags.includes(tag)).length
      score += commonTags * 5

      // 비슷한 연도 (±5년)
      if (Math.abs(artwork.year - targetArtwork.year) <= 5) score += 10

      // 같은 재료
      if (artwork.medium === targetArtwork.medium) score += 8

      return { artwork, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.artwork)

  return related
}

/**
 * 작품 URL 생성 함수
 */
export function getArtworkUrl(artwork: Artwork): string {
  return `/artworks/${artwork.id}`
}

/**
 * 작품 공유 URL 생성 함수
 */
export function getArtworkShareUrl(artwork: Artwork, baseUrl: string = ''): string {
  return `${baseUrl}/artworks/${artwork.id}`
}

/**
 * 작품 썸네일 URL 생성 함수
 */
export function getArtworkThumbnail(
  artwork: Artwork,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  if (artwork.thumbnailUrl) return artwork.thumbnailUrl

  // 기본 이미지에 크기 파라미터 추가
  const dimensions = {
    small: '200x150',
    medium: '400x300',
    large: '800x600',
  }

  return `${artwork.imageUrl}?w=${dimensions[size]}`
}

/**
 * 작품 가용성 상태 확인 함수
 */
export function getArtworkAvailabilityStatus(artwork: Artwork): {
  status: 'available' | 'sold' | 'reserved' | 'on-loan'
  label: string
  color: string
} {
  if (!artwork.isAvailable) {
    return {
      status: 'sold',
      label: '판매완료',
      color: 'text-red-600',
    }
  }

  return {
    status: 'available',
    label: '구매가능',
    color: 'text-green-600',
  }
}

/**
 * 작품 메타데이터 생성 함수 (SEO용)
 */
export function generateArtworkMetadata(artwork: Artwork) {
  return {
    title: `${artwork.title} - ${artwork.artist} | ASCA`,
    description: artwork.description.slice(0, 160),
    keywords: [
      artwork.title,
      artwork.artist,
      artwork.category,
      artwork.style,
      ...artwork.tags,
    ].join(', '),
    og: {
      title: artwork.title,
      description: artwork.description,
      image: artwork.imageUrl,
      type: 'article',
    },
  }
}
