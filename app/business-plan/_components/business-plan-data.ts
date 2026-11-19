export interface ExhibitionYear {
  year: number
  title: string
  venue: string
  period: string
  posterSrc?: string
  exhibitionLink?: string
  ceremony?: string
}

// 포스터는 public/images/business-plan 에 800px WebP 로 둔다 (옛 webflow 경로는 git 에 없어 배포본에서 깨졌다)
export const EXHIBITION_YEARS: ExhibitionYear[] = [
  {
    year: 2025,
    title: '제22회 대한민국 동양서예대전',
    venue: '인사동 한국미술관',
    period: '2025년 6월 18일(수) ~ 6월 24일(화)',
    ceremony: '2025년 6월 21일(토) 오후 2시',
    posterSrc: '/images/business-plan/poster-2025.webp',
  },
  {
    year: 2024,
    title: '제21회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2024년 8월 31일 ~ 9월 8일',
    posterSrc: '/images/business-plan/poster-2024.webp',
    exhibitionLink: '/exhibitions/past',
  },
  {
    year: 2023,
    title: '제20회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2023년 5월 31일 ~ 6월 10일',
    posterSrc: '/images/business-plan/poster-2023.webp',
    exhibitionLink: '/exhibitions/past',
  },
  {
    year: 2022,
    title: '제19회 대한민국 동양서예대전',
    venue: '인사동 한국미술관 3층 전관',
    period: '2022년 7월 20일 ~ 7월 26일',
    posterSrc: '/images/business-plan/poster-2022.webp',
    exhibitionLink: '/exhibitions/past',
  },
  {
    year: 2021,
    title: '제18회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2021년 7월 30일 ~ 8월 8일',
    posterSrc: '/images/business-plan/poster-2021.webp',
  },
  {
    year: 2020,
    title: '제17회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관 2층 전관',
    period: '2020년 10월 10일 ~ 10월 20일',
    posterSrc: '/images/business-plan/poster-2020.webp',
  },
  {
    year: 2019,
    title: '제16회 대한민국 동양서예대전',
    venue: '예술의전당 서울서예박물관',
    period: '2019년 7월 3일 ~ 7월 10일',
    posterSrc: '/images/business-plan/poster-2019.webp',
  },
]

// 사업계획서 장 왼쪽 표제 아래 바로 가기
export const QUICK_LINKS = [
  { label: '문서·서식', href: '/forms' },
  { label: '연혁', href: '/history' },
  { label: '임원', href: '/board-members' },
  { label: '유관단체', href: '/partners' },
  { label: '정관', href: '/regulations' },
] as const
