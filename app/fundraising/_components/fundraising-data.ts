export const BANK_ACCOUNT = {
  bank: '신한은행',
  number: '100-028-611714',
  holder: '사단법인 동양서예협회',
} as const

export const DONUS_PAYMENT_URL = 'https://secure.donus.org/orientalcalligraphy/pay'
export const DONUS_MYPAGE_URL = 'https://secure.donus.org/orientalcalligraphy/mypage'

export const CMS_PDF_URL =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC_CMS%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%B3%E1%86%B7%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A6_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.pdf'

export const ANNUAL_FEES = [
  {
    tier: '청년작가',
    fee: '30,000원',
    entry: '가입 시 등록비 10,000원',
    note: '1월 1일 기준 만 40세 이하',
  },
  {
    tier: '일반작가',
    fee: '50,000원',
    entry: '가입 시 등록비 20,000원',
    note: '1월 1일 기준 만 41세 이상',
  },
  {
    tier: '추천작가',
    fee: '80,000원',
    entry: '승급시 등록비 30,000원',
    note: '정회원 3년 이상 + 10점 이상',
  },
  {
    tier: '초대작가',
    fee: '100,000원',
    entry: '승급시 등록비 50,000원',
    note: '추천작가 5년 이상 + 15점 이상',
  },
  {
    tier: '임원',
    fee: '200,000원',
    entry: '임원 취임 발전기금 2,000,000원',
    note: '초대작가 + 이사회 추천 + 총회 선출',
  },
] as const

export const SIDEBAR_SECTIONS = [
  { id: 'payment', label: '온라인 결제' },
  { id: 'consultation', label: '문의·상담' },
  { id: 'cms-form', label: 'CMS 신청서' },
  { id: 'faq', label: '자주 묻는 질문' },
] as const
