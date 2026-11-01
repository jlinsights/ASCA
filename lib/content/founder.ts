import type { Language } from '@/lib/i18n/types'

/**
 * 협회 창립자 — 성곡 惺谷 林炫圻 (2026년 8월 별세).
 * 작가 상세에서 창립자 표시와 창립자 띠(작업 사진·홈페이지)를 보여 줄 때 쓴다.
 * 🔴 slug 로만 찾는다 — 같은 이름의 비공개 회원이 있다(이름으로 찾으면 엉뚱한 사람이 걸린다).
 * 사실은 사용자 확인분만 적는다: 창립자·名譽理事長(2026-11-01 확인)·2026년 8월 별세·seonggok.com.
 */
export const FOUNDER_SLUG = 'lim-hyun-ki'

export const FOUNDER = {
  slug: FOUNDER_SLUG,
  /** 직위 — DB title 이 비어 있어 여기서 준다. 임원 조직도·인사말 이력(#99·#100)과 같은 '명예이사장' */
  role: {
    ko: '동양서예협회 창립자 · 명예이사장',
    en: 'Founder and Honorary Chairman, Asian Society of Calligraphic Arts',
    ja: '東洋書芸協会 創立者・名誉理事長',
    zh: '東洋書藝協會 創會者・名譽理事長',
  },
  /** 짧은 표지 — 이름 위 띠 */
  badge: { ko: '창립자', en: 'Founder', ja: '創立者', zh: '創會者' },
  heading: {
    ko: '협회를 세운 분',
    en: 'The founder of the Society',
    ja: '協会を創った人',
    zh: '創立協會的人',
  },
  body: {
    ko: '성곡 임현기 선생은 동양서예협회를 세우고 명예이사장으로 협회를 이끌었습니다. 2026년 8월 별세하셨습니다. 선생의 작품과 삶은 개인 홈페이지에 정리되어 있습니다.',
    en: 'Seonggok Lim Hyun-ki founded the Asian Society of Calligraphic Arts and guided it as Honorary Chairman. He passed away in August 2026. His works and life are gathered on his personal website.',
    ja: '惺谷 林炫圻 先生は東洋書芸協会を創立し、名誉理事長として協会を導きました。2026年8月に逝去されました。作品と歩みは個人ホームページにまとめられています。',
    zh: '惺谷 林炫圻 先生創立東洋書藝協會，並以名譽理事長身分引領協會。先生於2026年8月辭世。其作品與生平整理於個人網站。',
  },
  homepage: {
    url: 'https://seonggok.com',
    label: {
      ko: '성곡 홈페이지 보기',
      en: 'Visit the Seonggok website',
      ja: '惺谷のホームページへ',
      zh: '前往惺谷網站',
    },
    newTab: { ko: ' (새 탭)', en: ' (opens in a new tab)', ja: '（新しいタブ）', zh: '（新分頁）' },
  },
  /** 작업실 사진 — 저장소에 함께 싣는다(388×532) */
  photo: {
    src: '/images/artists/lim-hyun-ki/studio.jpg',
    width: 388,
    height: 532,
    alt: {
      ko: '두루마기 차림으로 붓을 들고 작업대 위 행서 작품을 살피는 성곡 임현기',
      en: 'Seonggok Lim Hyun-ki in a traditional coat, brush in hand, looking over a running-script work on his table',
      ja: '周衣姿で筆を持ち、机上の行書作品を見る惺谷 林炫圻',
      zh: '身著周衣、手執毛筆審視案上行書作品的惺谷 林炫圻',
    },
  },
} as const satisfies {
  slug: string
  role: Record<Language, string>
  badge: Record<Language, string>
  heading: Record<Language, string>
  body: Record<Language, string>
  homepage: { url: string; label: Record<Language, string>; newTab: Record<Language, string> }
  photo: { src: string; width: number; height: number; alt: Record<Language, string> }
}

export const isFounder = (slug: string | null | undefined): boolean => slug === FOUNDER_SLUG
