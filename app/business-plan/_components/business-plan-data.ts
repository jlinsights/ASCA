export interface ExhibitionYear {
  year: number
  title: string
  venue: string
  period: string
  posterSrc?: string
  exhibitionLink?: string
  ceremony?: string
}

export const EXHIBITION_YEARS: ExhibitionYear[] = [
  {
    year: 2025,
    title: '제22회 대한민국 동양서예대전',
    venue: '인사동 한국미술관',
    period: '2025년 6월 18일(수) ~ 6월 24일(화)',
    ceremony: '2025년 6월 21일(토) 오후 2시',
    posterSrc:
      '/webflow/orientalcalligraphy/images/Instagram-story---제22회-동양서예대전-포스터.png',
  },
  {
    year: 2024,
    title: '제21회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2024년 8월 31일 ~ 9월 8일',
    posterSrc: '/webflow/orientalcalligraphy/images/Artboard-1.png',
    exhibitionLink: '/exhibition/21-oriental-calligraphy-exhibition-2024',
  },
  {
    year: 2023,
    title: '제20회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2023년 5월 31일 ~ 6월 10일',
    posterSrc: '/webflow/orientalcalligraphy/images/예술의전당-포스터_1020x1302px_1.avif',
    exhibitionLink: '/exhibition/20-oriental-calligraphy-exhibition-2023',
  },
  {
    year: 2022,
    title: '제19회 대한민국 동양서예대전',
    venue: '인사동 한국미술관 3층 전관',
    period: '2022년 7월 20일 ~ 7월 26일',
    posterSrc: '/webflow/orientalcalligraphy/images/19회동양서예포스터.png',
    exhibitionLink: '/exhibition/19-oriental-calligraphy-exhibition-2022',
  },
  {
    year: 2021,
    title: '제18회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2021년 7월 30일 ~ 8월 8일',
    posterSrc: '/webflow/orientalcalligraphy/images/제18회전포스타2021_1.avif',
  },
  {
    year: 2020,
    title: '제17회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관 2층 전관',
    period: '2020년 10월 10일 ~ 10월 20일',
    posterSrc: '/webflow/orientalcalligraphy/images/17회동양서예포스터2020수정-확인용_1.avif',
  },
  {
    year: 2019,
    title: '제16회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2019년 7월 3일 ~ 7월 10일',
    posterSrc: '/webflow/orientalcalligraphy/images/16회포스터2019_1.avif',
  },
]

export const QUICK_LINKS = [
  { label: '문서·서식', href: '/forms' },
  { label: '연혁', href: '/history' },
  { label: '임원', href: '/board-members' },
  { label: '유관단체', href: '/partners' },
  { label: '정관', href: '/articles-of-incorporation-and-bylaws' },
] as const
