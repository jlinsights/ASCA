import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { ArtistsPage, type ArtistInitialFilters } from './artists-client'

const DESCRIPTION =
  '동양서예협회의 한국·중국·일본 서예가를 만나 보세요. 이름과 회원 구분, 국적으로 작가를 찾고 작가별 소개와 작품을 볼 수 있습니다.'

export const metadata: Metadata = {
  title: '작가 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '작가 | 동양서예협회', description: DESCRIPTION, images: [defaultSEO.image] },
}

const FILTER_KEYS = ['q', 'membershipType', 'specialty', 'title', 'nationality'] as const

type SearchParams = Record<string, string | string[] | undefined>

function readFilters(params: SearchParams): ArtistInitialFilters {
  const filters: ArtistInitialFilters = {}
  for (const key of FILTER_KEYS) {
    const value = params[key]
    if (typeof value === 'string' && value) filters[key] = value
  }
  // 옛 메뉴 주소(?type=초대작가)도 회원 구분으로 받는다
  if (!filters.membershipType && typeof params.type === 'string' && params.type) {
    filters.membershipType = params.type
  }
  return filters
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const initialFilters = readFilters(await searchParams)
  // 같은 /artists 안에서 메뉴로 조건만 바꿔 이동해도 필터가 따라가도록 조건별로 다시 그린다
  return <ArtistsPage key={JSON.stringify(initialFilters)} initialFilters={initialFilters} />
}
