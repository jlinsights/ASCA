import { ArtistsPage, type ArtistInitialFilters } from './artists-client'

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
