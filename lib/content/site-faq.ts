import { MEMBERSHIP_FAQ } from './faq/membership'
import { CONTESTS_FAQ } from './faq/contests'
import { EXHIBITIONS_FAQ } from './faq/exhibitions'
import { ARTISTS_FAQ } from './faq/artists'
import { LEARNING_FAQ } from './faq/learning'
import { ACCOUNT_FAQ } from './faq/account'

/**
 * 자주 묻는 질문의 공통 진입점 — /faq·/contact·/fundraising·출품 안내가 공유한다.
 * 한국어 본문은 faq/의 주제별 파일에서 관리한다.
 * 두 페이지가 각자 사본을 들고 있다가 삼체상 상금·평생회원 요건 등이 서로, 그리고 규정과 어긋났다.
 * 규정에 근거가 있는 답은 sources 에 조문을 달아 /regulations 원문으로 잇는다. 규정이 바뀌면 여기를 같이 고친다.
 */

export interface FaqSource {
  label: string
  href: string
}

export interface FaqItem {
  /** 다른 페이지가 일부만 골라 보여 줄 때 쓰는 고정 키(질문 문구·순서가 바뀌어도 유지) */
  id?: string
  q: string
  a: string
  sources?: readonly FaqSource[]
}

export const SITE_FAQ: readonly FaqItem[] = [
  ...MEMBERSHIP_FAQ,
  ...CONTESTS_FAQ,
  ...EXHIBITIONS_FAQ,
  ...ARTISTS_FAQ,
  ...LEARNING_FAQ,
  ...ACCOUNT_FAQ,
]

export interface FaqGroup {
  key: string
  /** lib/i18n/translations/faq.ts 의 번역 키 */
  titleKey: string
  ids: readonly string[]
}

/** /faq 의 주제 묶음과 순서. 질문을 더하면 여기 한 곳에도 넣는다(테스트가 빠짐을 잡는다) */
export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    key: 'membership',
    titleKey: 'faqGroupMembership',
    ids: [
      'membership-join',
      'benefits',
      'dues',
      'dues-payment',
      'dues-unpaid',
      'dues-exemption',
      'lifetime',
      'dues-usage',
      'membership-withdrawal',
    ],
  },
  {
    key: 'contests',
    titleKey: 'faqGroupContests',
    ids: [
      'contest-apply',
      'contest-eligibility',
      'entry-fees',
      'contest-sizes',
      'awards',
      'artist-selection',
      'portfolio',
      'special-appointment',
      'committee',
      'objections',
    ],
  },
  {
    key: 'exhibitions',
    titleKey: 'faqGroupExhibitions',
    ids: [
      'solo-booth',
      'exhibition-plan',
      'mounting',
      'catalogue',
      'personal-catalogue',
      'exhibition-sales',
      'exhibition-proof',
    ],
  },
  {
    key: 'artists',
    titleKey: 'faqGroupArtists',
    ids: [
      'artist-website',
      'website-group',
      'english-name',
      'artist-link',
      'artist-profile',
      'artwork-upload',
    ],
  },
  {
    key: 'learning',
    titleKey: 'faqGroupLearning',
    ids: ['classes', 'class-discount', 'exchanges'],
  },
  {
    key: 'account',
    titleKey: 'faqGroupAccount',
    ids: [
      'login',
      'email-verification',
      'password-reset',
      'inquiry',
      'support-method',
      'donation-receipt',
    ],
  },
]

export function faqGroups(): (FaqGroup & { items: FaqItem[] })[] {
  return FAQ_GROUPS.map(group => ({
    ...group,
    items: group.ids.flatMap(id => SITE_FAQ.filter(item => item.id === id)),
  }))
}
