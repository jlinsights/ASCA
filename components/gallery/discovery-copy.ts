import { useMemo } from 'react'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'

// 작가·작품 둘러보기 문구는 lib/i18n/locales/<언어>/discovery.ts 에 있다(키 discovery*).
// 네 언어 표를 클라이언트 번들에 싣지 않도록 t() 로 고른 언어의 표에서만 읽는다.
const DISCOVERY_FIELDS = [
  'search',
  'clearSearch',
  'filters',
  'reset',
  'remove',
  'all',
  'active',
  'artistSearch',
  'artworkSearch',
  'artistIntro',
  'artistResults',
  'artistListHeading',
  'artworkResults',
  'artworkShown',
  'loadMoreArtworks',
  'updating',
  'loadMore',
  'emptyTitle',
  'emptyHelp',
  'emptyArtists',
  'emptyArtworks',
  'errorTitle',
  'loadError',
  'retry',
  'membership',
  'nationality',
  'specialty',
  'title',
  'penName',
  'awards',
  'awardCount',
  'viewArtist',
  'viewArtistShort',
  'category',
  'style',
  'sort',
  'featured',
  'newest',
  'oldest',
  'priceHigh',
  'priceLow',
  'availableOnly',
  'availability',
  'details',
  'private',
  'museum',
  'gallery',
  'public',
] as const

export type DiscoveryField = (typeof DISCOVERY_FIELDS)[number]
export type DiscoveryCopy = Record<DiscoveryField, string>

/** 필드 이름 → 번역 키 (예: clearSearch → discoveryClearSearch) */
export function discoveryKey(field: DiscoveryField): string {
  return `discovery${field[0]!.toUpperCase()}${field.slice(1)}`
}

export function useDiscoveryCopy(): DiscoveryCopy {
  const { t } = useLanguage()
  return useMemo(
    () =>
      Object.fromEntries(
        DISCOVERY_FIELDS.map(field => [field, t(discoveryKey(field))])
      ) as DiscoveryCopy,
    [t]
  )
}

export { DISCOVERY_FIELDS }

export function formatDiscoveryCount(
  template: string,
  count: number,
  language: Language,
  total?: number
) {
  const filled = template.replace('{count}', count.toLocaleString(language))
  return total === undefined ? filled : filled.replace('{total}', total.toLocaleString(language))
}
