import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

/**
 * 정적 fallback 전시 데이터.
 * DB에 없거나 fetch 전에도 즉시 렌더 가능한 전시.
 * mockup-port v1.0 — 서경(書境) 새로운 지평 6점 작품 포함.
 */
export const STATIC_EXHIBITIONS: Record<string, ExhibitionFull> = {
  '3': {
    id: '3',
    title: '서경(書境) 새로운 지평 - 동양서예의 현재와 미래',
    subtitle: 'New Horizons in East Asian Calligraphy',
    description:
      '사단법인 동양서예협회가 주최하는 2026년 특별 기획전입니다. 개인전뿐만 아니라 소규모 서예단체들의 부스전, 연합전, 그리고 작품 1점만 출품하는 것도 가능한 열린 전시입니다. 실력있는 작가들을 발굴하고 품격있는 전시공간에서 새로운 서예의 지평을 엽니다. 서경(書境) 1부와 2부로 나누어 진행되며, 동양서예의 현재와 미래를 조망할 수 있는 귀중한 자리가 될 것입니다.',
    content: null,
    startDate: '2026-04-15T00:00:00.000Z',
    endDate: '2026-04-28T00:00:00.000Z',
    location: '예술의전당',
    venue: '서울서예박물관 제1전시실 (2층)',
    curator: '(사)동양서예협회 운영위원회',
    featuredImageUrl: '/images/exhibitions/poster-main.png',
    galleryImages: [],
    status: 'upcoming',
    isFeatured: true,
    isPublished: true,
    views: 0,
    ticketPrice: 0,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
    artworks: [
      {
        relationId: 'static-rel-1', id: 'static-art-1',
        title: '逍遙游', titleEn: 'Wandering Free', titleHanja: '逍遙游',
        images: [], imageUrl: null,
        artistId: 'static-artist-1', artistName: '徐景 김재호',
        displayOrder: 0, isFeatured: true,
        style: 'zhuan', medium: '화선지에 먹', dimensions: '136 × 70 cm', year: 2025,
      },
      {
        relationId: 'static-rel-2', id: 'static-art-2',
        title: '松柏之操', titleEn: 'The Constancy of Pine and Cypress', titleHanja: '松柏之操',
        images: [], imageUrl: null,
        artistId: 'static-artist-2', artistName: '墨香 이정민',
        displayOrder: 1, isFeatured: false,
        style: 'li', medium: '비단에 먹', dimensions: '180 × 90 cm', year: 2026,
      },
      {
        relationId: 'static-rel-3', id: 'static-art-3',
        title: '致虛守靜', titleEn: 'Empty the Self, Hold Stillness', titleHanja: '致虛守靜',
        images: [], imageUrl: null,
        artistId: 'static-artist-3', artistName: '淸潭 박순영',
        displayOrder: 2, isFeatured: true,
        style: 'kai', medium: '화선지에 먹', dimensions: '200 × 100 cm', year: 2026,
      },
      {
        relationId: 'static-rel-4', id: 'static-art-4',
        title: '入木三分', titleEn: 'Three-tenths Through the Wood', titleHanja: '入木三分',
        images: [], imageUrl: null,
        artistId: 'static-artist-4', artistName: '白雲 정대현',
        displayOrder: 3, isFeatured: false,
        style: 'xing', medium: '한지에 먹·낙관', dimensions: '136 × 35 cm', year: 2025,
      },
      {
        relationId: 'static-rel-5', id: 'static-art-5',
        title: '飛白', titleEn: 'Flying-White', titleHanja: '飛白',
        images: [], imageUrl: null,
        artistId: 'static-artist-5', artistName: '韓松 윤지환',
        displayOrder: 4, isFeatured: false,
        style: 'cao', medium: '화선지에 먹', dimensions: '234 × 53 cm', year: 2026,
      },
      {
        relationId: 'static-rel-6', id: 'static-art-6',
        title: '훈민정음 서문', titleEn: 'Preface of Hunminjeongeum', titleHanja: null,
        images: [], imageUrl: null,
        artistId: 'static-artist-6', artistName: '蘭谷 최은영',
        displayOrder: 5, isFeatured: true,
        style: 'hangul', medium: '한지에 먹', dimensions: '70 × 200 cm', year: 2026,
      },
    ],
    artists: [],
    artworkCount: 6,
    artistCount: 0,
    featuredArtworkCount: 3,
  },
}
