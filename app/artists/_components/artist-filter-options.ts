import type { Language } from '@/lib/i18n/types'

// Values stay in the database language; only the visible labels are translated.
const options = {
  membership: [
    ['준회원', 'Associate member', '準会員', '準會員'],
    ['공모작가', 'Open-call artist', '公募作家', '公募作家'],
    ['추천작가', 'Recommended artist', '推薦作家', '推薦作家'],
    ['회원작가', 'Member artist', '会員作家', '會員作家'],
    ['초대작가', 'Invited artist', '招待作家', '邀請作家'],
    ['원로작가', 'Senior artist', 'ベテラン作家', '資深作家'],
    ['명예회원', 'Honorary member', '名誉会員', '名譽會員'],
  ],
  artistType: [
    ['일반작가', 'General artist', '一般作家', '一般作家'],
    ['공모작가', 'Open-call artist', '公募作家', '公募作家'],
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

export function getArtistFilterOptions(group: keyof typeof options, language: Language) {
  const index = ({ ko: 0, en: 1, ja: 2, zh: 3 } as const)[language]
  return options[group].map(option => ({ value: option[0], label: option[index] }))
}
