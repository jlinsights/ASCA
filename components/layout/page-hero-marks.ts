/**
 * 페이지별 題簽 — 히어로의 漢字 이름과 층위를 한곳에 둔다.
 * 글자를 바꾸려면 여기만 고치면 된다(각 페이지는 이 표를 읽는다).
 * 정체자(번체)로 쓴다. 협회 낙관은 page-hero.tsx 의 ASCA_SEAL.
 */
export type PageHeroTier = 'feature' | 'band'

export interface PageHeroMark {
  tier: PageHeroTier
  tc: string
}

export const PAGE_HERO_MARKS = {
  // 둘러보기 — 실제 작품·사진·숫자를 단다
  artists: { tier: 'feature', tc: '作家' },
  artworks: { tier: 'feature', tc: '作品' },
  exhibitions: { tier: 'feature', tc: '展覽' },
  exhibitionsCurrent: { tier: 'feature', tc: '現展' },
  exhibitionsUpcoming: { tier: 'feature', tc: '豫展' },
  exhibitionsPast: { tier: 'feature', tc: '往展' },
  exhibitionsOnline: { tier: 'feature', tc: '線上展' },
  gallery: { tier: 'feature', tc: '畫廊' },
  awards: { tier: 'feature', tc: '授賞' },
  history: { tier: 'feature', tc: '沿革' },

  // 협회
  introductions: { tier: 'band', tc: '槪要' },
  greetings: { tier: 'band', tc: '致辭' },
  mission: { tier: 'band', tc: '使命' },
  boardMembers: { tier: 'band', tc: '任員' },
  partners: { tier: 'band', tc: '協力' },
  businessPlan: { tier: 'band', tc: '事業' },
  taxonomy: { tier: 'band', tc: '分類' },
  fairness: { tier: 'band', tc: '公正' },
  bylaws: { tier: 'band', tc: '定款' },

  // 참여·신청
  academy: { tier: 'band', tc: '講座' },
  contests: { tier: 'band', tc: '公募' },
  application: { tier: 'band', tc: '出品' },
  recommendedApplication: { tier: 'band', tc: '推薦' },
  commissioning: { tier: 'band', tc: '委囑' },
  membership: { tier: 'band', tc: '會員' },
  members: { tier: 'band', tc: '會員' },
  membersApply: { tier: 'band', tc: '入會' },
  forms: { tier: 'band', tc: '書式' },
  fundraising: { tier: 'band', tc: '後援' },
  culturalExchange: { tier: 'band', tc: '交流' },
  services: { tier: 'band', tc: '服務' },

  // 소식
  notice: { tier: 'band', tc: '公告' },
  events: { tier: 'band', tc: '行事' },
  blog: { tier: 'band', tc: '消息' },
  contact: { tier: 'band', tc: '問議' },
  search: { tier: 'band', tc: '檢索' },

  // 약관
  privacy: { tier: 'band', tc: '個人情報' },
  terms: { tier: 'band', tc: '約款' },
  donationTerms: { tier: 'band', tc: '約款' },
  copyright: { tier: 'band', tc: '著作權' },
  emailRefuse: { tier: 'band', tc: '拒否' },
} as const satisfies Record<string, PageHeroMark>

export type PageHeroKey = keyof typeof PAGE_HERO_MARKS
