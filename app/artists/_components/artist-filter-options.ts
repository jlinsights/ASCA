import type { Language } from '@/lib/i18n/types'

// Values stay in the database language; only the visible labels are translated.
const options = {
  // 규정(회원 및 회비 규정)의 작가 등급만 보여 준다 — 준회원·공모작가·원로작가·명예회원은 등급이 아니다.
  // 청년작가는 등록자가 없어 싣지 않는다(사이트 메뉴와 같음). 임원은 '직함' 필터로 찾는다.
  membership: [
    ['일반작가', 'General artist', '一般作家', '一般作家'],
    ['추천작가', 'Recommended artist', '推薦作家', '推薦作家'],
    ['초대작가', 'Invited artist', '招待作家', '特邀作家'],
  ],
  specialty: [
    ['전통서예', 'Traditional calligraphy', '伝統書道', '傳統書藝'],
    ['현대서예', 'Modern calligraphy', '現代書道', '現代書藝'],
    ['캘리그라피', 'Calligraphy art', 'カリグラフィー', '藝術書法'],
    ['한문서예', 'Hanja calligraphy', '漢字書道', '漢字書藝'],
    ['한글서예', 'Hangeul calligraphy', 'ハングル書道', '韓文書藝'],
    ['문인화', 'Literati painting', '文人画', '文人畫'],
    ['수묵화', 'Ink painting', '水墨画', '水墨畫'],
    ['민화', 'Folk painting', '民画', '民畫'],
    ['동양화', 'Oriental painting', '東洋画', '東洋畫'],
    ['전각', 'Seal engraving', '篆刻', '篆刻'],
    ['서각', 'Wood engraving', '書刻', '書刻'],
  ],
  // 값은 DB nationality 표기(한자) 그대로
  nationality: [
    ['韓國', 'Korea', '韓国', '韓國'],
    ['中國', 'China', '中国', '中國'],
    ['日本', 'Japan', '日本', '日本'],
  ],
  title: [
    ['회장', 'President', '会長', '會長'],
    ['부회장', 'Vice president', '副会長', '副會長'],
    ['명예이사장', 'Honorary chair', '名誉理事長', '名譽理事長'],
    ['이사장', 'Chair', '理事長', '理事長'],
    ['심사위원장', 'Jury chair', '審査委員長', '評審委員長'],
    ['운영위원장', 'Operations chair', '運営委員長', '運營委員長'],
    ['상임고문', 'Standing advisor', '常任顧問', '常任顧問'],
    ['고문', 'Advisor', '顧問', '顧問'],
    ['상임이사', 'Executive director', '常任理事', '常任理事'],
    ['이사', 'Director', '理事', '理事'],
    ['감사', 'Auditor', '監査', '監事'],
    ['자문위원', 'Advisory member', '諮問委員', '諮詢委員'],
    ['심사위원', 'Jury member', '審査委員', '評審委員'],
    ['운영위원', 'Operations member', '運営委員', '運營委員'],
  ],
} as const

// DB 에 다른 이름으로 저장된 등급 — 일반작가는 membership_type '회원작가' 로 들어 있다
// (옛 사이트도 일반작가 목록을 /members/member-calligrapher 에 두었다)
const STORED_AS: Partial<Record<keyof typeof options, Record<string, string>>> = {
  membership: { 일반작가: '회원작가' },
}

/**
 * 저장된 membership_type('초대작가, 운영위원' 처럼 쉼표로 이어짐)에서 규정 작가 등급을 뽑는다.
 * 준회원·공모작가·원로작가 등 규정 등급이 아닌 값이면 null.
 */
export function regulationGrade(membershipType?: string | null): string | null {
  if (!membershipType) return null
  const parts = membershipType.split(',').map(part => part.replace(/\s/g, ''))
  if (parts.includes('초대작가')) return '초대작가'
  if (parts.includes('추천작가')) return '추천작가'
  if (parts.includes('회원작가') || parts.includes('일반작가')) return '일반작가'
  if (parts.includes('청년작가')) return '청년작가'
  return null
}

export function getArtistFilterOptions(group: keyof typeof options, language: Language) {
  const index = ({ ko: 0, en: 1, ja: 2, zh: 3 } as const)[language]
  return options[group].map(option => ({
    value: STORED_AS[group]?.[option[0]] ?? option[0],
    label: option[index],
  }))
}
