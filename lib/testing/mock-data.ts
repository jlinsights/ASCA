/**
 * Mock Data Generators
 *
 * Factory functions for creating test data
 */

/**
 * Membership Level mock data
 */
export function createMockMembershipLevel(overrides: Partial<any> = {}) {
  return {
    id: crypto.randomUUID(),
    name_ko: '테스트 레벨',
    name_en: 'Test Level',
    description_ko: '테스트용 멤버십 레벨',
    description_en: 'Test membership level',
    annual_fee: 100000,
    benefits: { test: true },
    max_artworks: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Member mock data
 */
export function createMockMember(overrides: Partial<any> = {}) {
  const timestamp = Date.now()
  return {
    id: crypto.randomUUID(),
    email: `test${timestamp}@example.com`,
    first_name_ko: '철수',
    last_name_ko: '김',
    first_name_en: 'Chulsoo',
    last_name_en: 'Kim',
    phone: '010-1234-5678',
    birth_date: '1990-01-01',
    membership_level_id: crypto.randomUUID(),
    status: 'active',
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Artist mock data
 */
export function createMockArtist(overrides: Partial<any> = {}) {
  return {
    id: crypto.randomUUID(),
    member_id: crypto.randomUUID(),
    artist_name_ko: '김철수 작가',
    artist_name_en: 'Artist Chulsoo Kim',
    bio_ko: '한국을 대표하는 작가',
    bio_en: 'Representative Korean artist',
    specialization: 'Contemporary Art',
    website: 'https://example.com',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Artwork mock data
 */
export function createMockArtwork(overrides: Partial<any> = {}) {
  return {
    id: crypto.randomUUID(),
    artist_id: crypto.randomUUID(),
    title_ko: '무제',
    title_en: 'Untitled',
    description_ko: '현대 미술 작품',
    description_en: 'Contemporary artwork',
    year: 2024,
    medium: 'Oil on Canvas',
    dimensions: '100x100cm',
    price: 5000000,
    status: 'approved',
    image_url: 'https://example.com/image.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Exhibition mock data
 */
export function createMockExhibition(overrides: Partial<any> = {}) {
  return {
    id: crypto.randomUUID(),
    title_ko: '테스트 전시회',
    title_en: 'Test Exhibition',
    description_ko: '현대 미술 전시',
    description_en: 'Contemporary art exhibition',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    venue: 'ASCA Gallery',
    status: 'active',
    featured_image: 'https://example.com/featured.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * API Response mock data
 */
export function createMockApiResponse<T = any>(data: T, overrides: Partial<any> = {}) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * API Error Response mock data
 */
export function createMockErrorResponse(error: string, code?: string, details?: any) {
  return {
    success: false,
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Pagination Response mock data
 */
export function createMockPaginationResponse<T = any>(
  items: T[],
  options: {
    page?: number
    limit?: number
    total?: number
  } = {}
) {
  const { page = 1, limit = 20, total = items.length } = options

  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Cursor Pagination Response mock data
 */
export function createMockCursorResponse<T = any>(
  items: T[],
  options: {
    limit?: number
    hasNext?: boolean
    nextCursor?: string | null
  } = {}
) {
  const { limit = 20, hasNext = false, nextCursor = null } = options

  return {
    success: true,
    data: {
      items,
      pageInfo: {
        hasNext,
        nextCursor,
        limit,
      },
    },
    timestamp: new Date().toISOString(),
  }
}

/**
 * GraphQL Response mock data
 */
export function createMockGraphQLResponse<T = any>(data: T) {
  return {
    data,
  }
}

/**
 * GraphQL Error Response mock data
 */
export function createMockGraphQLError(message: string, path?: string[]) {
  return {
    errors: [
      {
        message,
        path,
      },
    ],
  }
}

/**
 * Create multiple mock items
 */
export function createMockArray<T>(factory: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, index) => factory(index))
}

/**
 * Create mock members array
 */
export function createMockMembers(count: number = 10) {
  return createMockArray(
    index =>
      createMockMember({
        email: `member${index}@example.com`,
        first_name_ko: `회원${index}`,
      }),
    count
  )
}

/**
 * Create mock artworks array
 */
export function createMockArtworks(count: number = 10) {
  return createMockArray(
    index =>
      createMockArtwork({
        title_ko: `작품 ${index}`,
        title_en: `Artwork ${index}`,
      }),
    count
  )
}
