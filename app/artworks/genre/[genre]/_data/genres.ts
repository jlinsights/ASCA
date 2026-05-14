export interface GenreInfo {
  name: string
  chinese: string
  nameEn: string
  description: string
}

export interface GenreArtwork {
  id: string
  title: string
  artist: string
  medium: string
  dimensions: string
  year: number
  imageUrl: string
  isFeatured: boolean
  views: number
  likes: number
}

export const genreData: Record<string, GenreInfo> = {
  haeseo: {
    name: '해서',
    chinese: '楷書',
    nameEn: 'Regular Script',
    description:
      '정형화된 서체로 가장 기본이 되는 서체입니다. 필획이 분명하고 결구가 단정하여 서예 입문의 기초가 됩니다.',
  },
  hangseo: {
    name: '행서',
    chinese: '行書',
    nameEn: 'Semi-cursive Script',
    description:
      '해서와 초서의 중간 형태로, 실용성과 예술성을 겸비한 서체입니다. 자연스러운 필세의 흐름이 특징입니다.',
  },
  choseo: {
    name: '초서',
    chinese: '草書',
    nameEn: 'Cursive Script',
    description:
      '자유롭고 유려한 필세가 특징인 서체입니다. 빠른 속도로 쓰며 예술적 표현의 극치를 보여줍니다.',
  },
  jeonseo: {
    name: '전서',
    chinese: '篆書',
    nameEn: 'Seal Script',
    description:
      '가장 오래된 서체 중 하나로, 곡선적이고 장식적인 형태가 특징입니다. 인장(도장) 조각에 주로 사용됩니다.',
  },
  yeseo: {
    name: '예서',
    chinese: '隸書',
    nameEn: 'Clerical Script',
    description:
      '전서에서 해서로 변화하는 과도기에 나타난 서체로, 수평적인 필획과 파책(波磔)이 특징입니다.',
  },
  hangul: {
    name: '한글서예',
    chinese: '韓文書藝',
    nameEn: 'Hangul Calligraphy',
    description:
      '한글의 조형미를 극대화한 서예 분야입니다. 궁체, 민체, 판본체 등 다양한 한글 서체를 포함합니다.',
  },
  modern: {
    name: '현대서예',
    chinese: '現代書藝',
    nameEn: 'Modern Calligraphy',
    description: '전통 서예의 정신을 바탕으로 현대적 조형감각을 접목한 새로운 서예 예술입니다.',
  },
  jeongak: {
    name: '전각',
    chinese: '篆刻',
    nameEn: 'Seal Carving',
    description:
      '돌이나 나무에 문자를 새기는 예술로, 서예와 조각이 결합된 동양 고유의 예술 형식입니다.',
  },
}

export const genreArtworks: Record<string, GenreArtwork[]> = {
  haeseo: [
    {
      id: 'h1',
      title: '천자문 - 해서 전작',
      artist: '김영진',
      medium: '선지에 먹',
      dimensions: '70 × 200 cm',
      year: 2024,
      imageUrl: '/images/artworks/hwangjeguk-chode.avif',
      isFeatured: true,
      views: 312,
      likes: 48,
    },
    {
      id: 'h2',
      title: '논어 첫 구절',
      artist: '박정수',
      medium: '화선지에 먹',
      dimensions: '45 × 90 cm',
      year: 2023,
      imageUrl: '/images/artworks/choinanju-chode.avif',
      isFeatured: false,
      views: 187,
      likes: 25,
    },
    {
      id: 'h3',
      title: '반야심경 해서',
      artist: '이한영',
      medium: '순지에 먹',
      dimensions: '60 × 120 cm',
      year: 2024,
      imageUrl: '/images/artworks/limhyeongi-chode.avif',
      isFeatured: true,
      views: 256,
      likes: 41,
    },
    {
      id: 'h4',
      title: '해서 임서 - 구양순체',
      artist: '최민정',
      medium: '선지에 먹',
      dimensions: '35 × 70 cm',
      year: 2023,
      imageUrl: '/images/artworks/yeomjeongmo-chode.avif',
      isFeatured: false,
      views: 143,
      likes: 19,
    },
  ],
  hangseo: [
    {
      id: 'hg1',
      title: '난정서 행서 임서',
      artist: '한정우',
      medium: '선지에 먹',
      dimensions: '50 × 100 cm',
      year: 2024,
      imageUrl: '/images/artworks/joyeongrang-chode.avif',
      isFeatured: true,
      views: 278,
      likes: 52,
    },
    {
      id: 'hg2',
      title: '행서 자작시',
      artist: '윤서영',
      medium: '화선지에 먹',
      dimensions: '40 × 80 cm',
      year: 2023,
      imageUrl: '/images/artworks/minmunja-hancho.avif',
      isFeatured: false,
      views: 165,
      likes: 22,
    },
    {
      id: 'hg3',
      title: '봄날 행서 소품',
      artist: '정대호',
      medium: '순지에 먹',
      dimensions: '30 × 60 cm',
      year: 2024,
      imageUrl: '/images/artworks/sojeonga-hancho.avif',
      isFeatured: false,
      views: 198,
      likes: 31,
    },
  ],
  choseo: [
    {
      id: 'c1',
      title: '초서 십칠첩',
      artist: '김한수',
      medium: '선지에 먹',
      dimensions: '80 × 200 cm',
      year: 2024,
      imageUrl: '/images/artworks/sojeonga-chode.avif',
      isFeatured: true,
      views: 345,
      likes: 67,
    },
    {
      id: 'c2',
      title: '자유 초서 - 바람의 노래',
      artist: '이정화',
      medium: '순지에 먹',
      dimensions: '60 × 150 cm',
      year: 2023,
      imageUrl: '/images/artworks/contest-cover.avif',
      isFeatured: false,
      views: 221,
      likes: 38,
    },
  ],
  jeonseo: [
    {
      id: 'j1',
      title: '전서 산해경 발췌',
      artist: '박철민',
      medium: '화선지에 먹',
      dimensions: '55 × 110 cm',
      year: 2024,
      imageUrl: '/images/artworks/contest-page5.avif',
      isFeatured: true,
      views: 189,
      likes: 29,
    },
    {
      id: 'j2',
      title: '석고문 전서 임서',
      artist: '송미경',
      medium: '선지에 먹',
      dimensions: '45 × 90 cm',
      year: 2023,
      imageUrl: '/images/artworks/nakjiron-baeogyeong.avif',
      isFeatured: false,
      views: 134,
      likes: 17,
    },
  ],
  yeseo: [
    {
      id: 'y1',
      title: '예서 조전비 임서',
      artist: '최영미',
      medium: '선지에 먹',
      dimensions: '65 × 130 cm',
      year: 2024,
      imageUrl: '/images/artworks/calligraphy-scene-1.jpg',
      isFeatured: true,
      views: 201,
      likes: 33,
    },
    {
      id: 'y2',
      title: '예서 대련',
      artist: '한영수',
      medium: '화선지에 먹',
      dimensions: '35 × 140 cm',
      year: 2023,
      imageUrl: '/images/artworks/calligraphy-scene-2.jpg',
      isFeatured: false,
      views: 156,
      likes: 21,
    },
  ],
  hangul: [
    {
      id: 'hk1',
      title: '궁체 훈민정음 서문',
      artist: '김영진',
      medium: '순지에 먹',
      dimensions: '50 × 100 cm',
      year: 2024,
      imageUrl: '/images/artworks/calligraphy-scene-3.jpg',
      isFeatured: true,
      views: 287,
      likes: 44,
    },
    {
      id: 'hk2',
      title: '한글 판본체 - 용비어천가',
      artist: '윤서영',
      medium: '화선지에 먹',
      dimensions: '60 × 90 cm',
      year: 2023,
      imageUrl: '/images/artworks/calligraphy-scene-4.jpg',
      isFeatured: false,
      views: 178,
      likes: 26,
    },
    {
      id: 'hk3',
      title: '한글 민체 자작시',
      artist: '정대호',
      medium: '선지에 먹',
      dimensions: '40 × 80 cm',
      year: 2024,
      imageUrl: '/images/artworks/calligraphy-scene-5.jpg',
      isFeatured: true,
      views: 223,
      likes: 35,
    },
  ],
  modern: [
    {
      id: 'm1',
      title: '현대 서예 - 해체와 구성',
      artist: '이정화',
      medium: '혼합매체',
      dimensions: '100 × 150 cm',
      year: 2024,
      imageUrl: '/images/artworks/heelang-bw.jpg',
      isFeatured: true,
      views: 367,
      likes: 72,
    },
    {
      id: 'm2',
      title: '묵상 - 현대적 해석',
      artist: '최영미',
      medium: '한지에 먹, 아크릴',
      dimensions: '80 × 120 cm',
      year: 2023,
      imageUrl: '/images/artworks/heelang-treasure.jpg',
      isFeatured: false,
      views: 245,
      likes: 48,
    },
    {
      id: 'm3',
      title: '디지털 서예 - 흐름',
      artist: '한정우',
      medium: '디지털 프린트',
      dimensions: '90 × 90 cm',
      year: 2024,
      imageUrl: '/images/artworks/heelang-whisper.jpg',
      isFeatured: true,
      views: 312,
      likes: 59,
    },
  ],
  jeongak: [
    {
      id: 'jg1',
      title: '백문인 - 풍월',
      artist: '박정수',
      medium: '수산석',
      dimensions: '5 × 5 × 8 cm',
      year: 2024,
      imageUrl: '/images/artworks/sentence-type.avif',
      isFeatured: true,
      views: 145,
      likes: 23,
    },
    {
      id: 'jg2',
      title: '주문인 - 서예지도',
      artist: '송미경',
      medium: '청전석',
      dimensions: '4 × 4 × 7 cm',
      year: 2023,
      imageUrl: '/images/artworks/hwangjeguk-chode.avif',
      isFeatured: false,
      views: 112,
      likes: 15,
    },
  ],
}

export const validGenres = Object.keys(genreData) as Array<keyof typeof genreData>
