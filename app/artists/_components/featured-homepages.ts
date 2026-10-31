import type { Language } from '@/lib/i18n/types'
import { regulationHref } from '@/lib/regulations/catalog'

/**
 * 사무국이 구축·운영하는 작가 홈페이지 — /artists 맨 위에 먼저 보인다.
 * 🔴 slug 로만 찾는다. 같은 이름의 비공개 회원이 있어(임현기) 이름으로 찾으면 엉뚱한 사람이 걸린다.
 * 이름·호·사진은 DB(anon, RLS)에서 읽고, 여기엔 주소만 둔다. 2026-10-31 개인 홈페이지 세 곳 접속 확인.
 */
export interface FeaturedSite {
  url: string
  /** personal: 작가 개인 홈페이지, group: 작가가 이끄는 단체 홈페이지 */
  kind: 'personal' | 'group'
  /** 단체 이름 — 단체 홈페이지만 */
  name?: Record<Language, string>
}

export interface FeaturedHomepage {
  slug: string
  /** 첫 번째가 개인 홈페이지 */
  sites: readonly FeaturedSite[]
  /** DB 직위(title)가 비어 있는 작가의 협회 내 자리 — 사용자 확인 사실만 */
  role?: Record<Language, string>
  /** 홈페이지를 새로 단장했으면 'renewed' */
  note?: 'renewed'
}

export const FEATURED_HOMEPAGES: readonly FeaturedHomepage[] = [
  // 협회 창립자·명예회장, 2026년 8월 별세. 2026-10 홈페이지 새 단장 (사용자 확인 2026-10-31)
  {
    slug: 'lim-hyun-ki',
    sites: [{ url: 'https://seonggok.com', kind: 'personal' }],
    role: {
      ko: '협회 창립자 · 명예회장',
      en: 'Founder and Honorary Chairman of the Society',
      ja: '協会創立者・名誉会長',
      zh: '協會創會者・名譽會長',
    },
    note: 'renewed',
  },
  { slug: 'anam', sites: [{ url: 'https://anam.orientalcalligraphy.org', kind: 'personal' }] },
  {
    slug: 'heelang',
    sites: [
      { url: 'https://heelang.orientalcalligraphy.org', kind: 'personal' },
      // 희랑 공경순 작가가 이끄는 현대서예 작가그룹
      {
        url: 'https://brushways.org',
        kind: 'group',
        name: { ko: '브러시웨이즈', en: 'Brushways', ja: 'ブラッシュウェイズ', zh: 'Brushways' },
      },
    ],
  },
]

/** 홈페이지 주소에서 화면에 보일 이름만 — https:// 와 끝 / 를 뗀다 */
export function homepageHost(url: string): string {
  return new URL(url).host
}

/** 안내 띠의 근거 링크 — 비용 숫자는 쓰지 않고 규정·자주 묻는 질문으로 보낸다 */
export const INVITE_LINKS = {
  shogyeong: '/contests/23#paths',
  entryFees: '/contests#fees',
  homepageRule: `${regulationHref('membership-dues')}#a10`,
  benefitRule: `${regulationHref('membership-dues')}#a10-2`,
  contact: '/contact',
} as const
