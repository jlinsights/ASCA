/**
 * 개발 환경용 모의 데이터 및 API 모킹 시스템
 */

import { log } from '@/lib/utils/logger'

// 모의 데이터 생성 옵션
interface MockOptions {
  count?: number
  delay?: number
  error?: boolean
  errorRate?: number
}

// 모의 아티스트 데이터
export const mockArtists = [
  {
    id: 'mock-artist-1',
    name: '김정호',
    name_en: 'Kim Jung-ho',
    name_ja: 'キム・ジョンホ',
    name_zh: '金正浩',
    bio: '전통 한국 서예의 현대적 해석으로 유명한 서예가입니다. 40여 년간 서예에 매진하며 독창적인 작품 세계를 구축했습니다.',
    bio_en: 'A calligrapher famous for modern interpretations of traditional Korean calligraphy.',
    profile_image: '/placeholder-user.jpg',
    birth_year: 1955,
    nationality: '대한민국',
    specialties: ['한국 서예', '현대 서예', '문인화'],
    awards: ['2020년 대한민국 서예대전 대상', '2018년 아시아 서예 비엔날레 금상'],
    exhibitions: ['2023년 국립현대미술관 개인전', '2022년 서울시립미술관 "현대 서예의 흐름"'],
    membership_type: '정회원' as const,
    artist_type: '초대작가' as const,
    title: '이사장' as const,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mock-artist-2',
    name: '다나카 히로시',
    name_en: 'Tanaka Hiroshi',
    name_ja: '田中裕',
    name_zh: '田中寬',
    bio: '일본 전통 서도를 바탕으로 현대적 감각을 접목한 작품 활동을 하고 있는 서예가입니다.',
    bio_en: 'A calligrapher who incorporates modern sensibilities into traditional Japanese shodo.',
    profile_image: '/placeholder-user.jpg',
    birth_year: 1962,
    nationality: '일본',
    specialties: ['일본 서도', '현대 서예', '추상 표현'],
    awards: ['2019년 일본 서도협회 최우수상', '2017년 국제 서예 비엔날레 특별상'],
    exhibitions: ['2023년 도쿄국립박물관 기획전', '2022년 교토국립근대미술관 개인전'],
    membership_type: '정회원' as const,
    artist_type: '추천작가' as const,
    title: '이사' as const,
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'mock-artist-3',
    name: '왕메이링',
    name_en: 'Wang Mei-ling',
    name_ja: 'ワン・メイリン',
    name_zh: '王美玲',
    bio: '중국 전통 서법의 정신을 현대적으로 재해석하는 작업을 하고 있는 서예가입니다.',
    bio_en:
      'A calligrapher who reinterprets the spirit of traditional Chinese calligraphy in a modern context.',
    profile_image: '/placeholder-user.jpg',
    birth_year: 1970,
    nationality: '중국',
    specialties: ['중국 서법', '현대 서예', '수묵화'],
    awards: ['2021년 중국 서법가협회 우수상', '2019년 베이징 국제 서예전 금상'],
    exhibitions: ['2023년 중국국가박물관 기획전', '2022년 상하이미술관 개인전'],
    membership_type: '정회원' as const,
    artist_type: '일반작가' as const,
    title: null,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
]

// 모의 작품 데이터
export const mockArtworks = [
  {
    id: 'mock-artwork-1',
    title: '봄날의 시',
    title_en: 'Spring Day Poem',
    title_ja: '春の日の詩',
    title_zh: '春日詩',
    description:
      '봄의 정취를 담은 한국 전통 서예 작품입니다. 유려한 필선과 조화로운 구성이 돋보입니다.',
    description_en: 'A traditional Korean calligraphy work capturing the essence of spring.',
    artist_id: 'mock-artist-1',
    category: 'calligraphy' as const,
    style: 'traditional' as const,
    year: 2023,
    materials: ['한지', '먹', '붓'],
    dimensions: { width: 50, height: 70, unit: 'cm' as const },
    price: { amount: 1500000, currency: 'KRW' as const },
    availability: 'available' as const,
    featured: true,
    tags: ['봄', '시', '전통', '한국서예'],
    images: ['/placeholder.jpg', '/placeholder.jpg'],
    thumbnail: '/placeholder.jpg',
    exhibition_history: ['2023년 서울시립미술관', '2024년 국립현대미술관'],
    condition: '최상',
    technique: '전통 붓글씨',
    authenticity_certificate: true,
    views: 1250,
    likes: 89,
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'mock-artwork-2',
    title: '바람의 선율',
    title_en: 'Wind Melody',
    title_ja: '風のメロディ',
    title_zh: '風的旋律',
    description: '현대적 감각으로 재해석한 추상 서예 작품입니다.',
    description_en: 'An abstract calligraphy work reinterpreted with modern sensibilities.',
    artist_id: 'mock-artist-2',
    category: 'calligraphy' as const,
    style: 'contemporary' as const,
    year: 2022,
    materials: ['화선지', '먹', '붓'],
    dimensions: { width: 60, height: 80, unit: 'cm' as const },
    price: { amount: 2000000, currency: 'KRW' as const },
    availability: 'available' as const,
    featured: true,
    tags: ['바람', '추상', '현대', '일본서도'],
    images: ['/placeholder.jpg'],
    thumbnail: '/placeholder.jpg',
    exhibition_history: ['2022년 도쿄국립박물관'],
    condition: '양호',
    technique: '추상 표현',
    authenticity_certificate: true,
    views: 892,
    likes: 67,
    created_at: '2022-06-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
]

// 모의 전시회 데이터
export const mockExhibitions = [
  {
    id: 'mock-exhibition-1',
    title: '정법의 계승, 창신의 조화',
    title_en: 'Tradition and Innovation in Harmony',
    description: '동양서예협회 2024년 정기전시회입니다.',
    description_en: 'ASCA 2024 Annual Exhibition.',
    start_date: '2024-03-01',
    end_date: '2024-03-31',
    location: '서울시립미술관',
    location_en: 'Seoul Museum of Art',
    status: 'current' as const,
    featured: true,
    poster_image: '/placeholder.jpg',
    gallery_images: ['/placeholder.jpg', '/placeholder.jpg'],
    curator: '김정호',
    artist_count: 25,
    artwork_count: 78,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
]

// API 응답 지연 시뮬레이션
const simulateDelay = async (delay: number = 0) => {
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// 에러 시뮬레이션
const simulateError = (errorRate: number = 0) => {
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new Error('시뮬레이션된 API 에러')
  }
}

// 모의 API 클래스
export class MockAPI {
  private static instance: MockAPI
  private isEnabled: boolean

  private constructor() {
    this.isEnabled = process.env.USE_MOCK_DATA === 'true'
  }

  public static getInstance(): MockAPI {
    if (!MockAPI.instance) {
      MockAPI.instance = new MockAPI()
    }
    return MockAPI.instance
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    log.info(`모의 API ${enabled ? '활성화' : '비활성화'}됨`)
  }

  public isUsingMockData(): boolean {
    return this.isEnabled
  }

  // 아티스트 모의 API
  public async getArtists(options: MockOptions = {}): Promise<any> {
    if (!this.isEnabled) return null

    const { count = 10, delay = 0, errorRate = 0 } = options

    await simulateDelay(delay)
    simulateError(errorRate)

    log.debug('모의 아티스트 데이터 반환', { count, delay })

    return {
      artists: mockArtists.slice(0, count),
      total: mockArtists.length,
      page: 1,
      limit: count,
    }
  }

  public async getArtist(id: string, options: MockOptions = {}): Promise<any> {
    if (!this.isEnabled) return null

    const { delay = 0, errorRate = 0 } = options

    await simulateDelay(delay)
    simulateError(errorRate)

    const artist = mockArtists.find(a => a.id === id)
    if (!artist) {
      throw new Error('아티스트를 찾을 수 없습니다')
    }

    log.debug('모의 아티스트 상세 데이터 반환', { id })
    return artist
  }

  // 작품 모의 API
  public async getArtworks(options: MockOptions = {}): Promise<any> {
    if (!this.isEnabled) return null

    const { count = 10, delay = 0, errorRate = 0 } = options

    await simulateDelay(delay)
    simulateError(errorRate)

    log.debug('모의 작품 데이터 반환', { count, delay })

    return {
      artworks: mockArtworks.slice(0, count),
      total: mockArtworks.length,
      page: 1,
      limit: count,
    }
  }

  public async getArtwork(id: string, options: MockOptions = {}): Promise<any> {
    if (!this.isEnabled) return null

    const { delay = 0, errorRate = 0 } = options

    await simulateDelay(delay)
    simulateError(errorRate)

    const artwork = mockArtworks.find(a => a.id === id)
    if (!artwork) {
      throw new Error('작품을 찾을 수 없습니다')
    }

    log.debug('모의 작품 상세 데이터 반환', { id })
    return artwork
  }

  // 전시회 모의 API
  public async getExhibitions(options: MockOptions = {}): Promise<any> {
    if (!this.isEnabled) return null

    const { count = 10, delay = 0, errorRate = 0 } = options

    await simulateDelay(delay)
    simulateError(errorRate)

    log.debug('모의 전시회 데이터 반환', { count, delay })

    return {
      exhibitions: mockExhibitions.slice(0, count),
      total: mockExhibitions.length,
      page: 1,
      limit: count,
    }
  }
}

// 모의 API 인스턴스 export
export const mockAPI = MockAPI.getInstance()

// 개발 환경에서 모의 데이터 초기화
export const initializeMockData = () => {
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DATA === 'true') {
    log.info('🎭 모의 데이터 시스템 초기화됨')
    mockAPI.setEnabled(true)
  }
}

// 모의 데이터 상태 확인
export const getMockDataStatus = () => {
  return {
    enabled: mockAPI.isUsingMockData(),
    artistCount: mockArtists.length,
    artworkCount: mockArtworks.length,
    exhibitionCount: mockExhibitions.length,
  }
}
