import { reg, type LedgerRow, type RegSource } from '@/components/apply/apply-parts'

/**
 * /fundraising 에 옮긴 숫자·문구 — 원문은 regulations/01-membership-and-dues.md 와 정관(00).
 * 규정이 바뀌면 여기를 같이 고친다. __tests__/fundraising-parity.test.ts 가 원문과 대조한다.
 *
 * 규정이 정한 돈은 회비·등록비·발전기금·출품비뿐이다. "정기후원·기업후원" 같은 후원 상품은
 * 규정에 없으므로 만들지 않는다. 협회는 세제적격단체가 아니어서 기부금영수증도 없다(FAQ).
 */

export const BANK_ACCOUNT = {
  bank: '신한은행',
  number: '100-028-611714',
  holder: '사단법인 동양서예협회',
} as const

export const DONUS_PAYMENT_URL = 'https://secure.donus.org/orientalcalligraphy/pay'
export const DONUS_MYPAGE_URL = 'https://secure.donus.org/orientalcalligraphy/mypage'

export const CMS_PDF_URL =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC_CMS%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%B3%E1%86%B7%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A6_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.pdf'

/** 회원 및 회비 규정 제3조 ①·② — 연회비와 등록비를 한 장부에 */
export const DUES: readonly LedgerRow[] = [
  { cells: ['청년작가', '3만원', '1만원', '최초 가입 시'] },
  { cells: ['일반작가', '5만원', '2만원', '최초 가입 시'] },
  { cells: ['추천작가', '8만원', '3만원', '청년·일반작가에서 승급 시'] },
  { cells: ['초대작가', '10만원', '5만원', '추천작가에서 승급 시'] },
  { cells: ['임원', '20만원', '—', '취임 시 발전기금 200만원'] },
]

/** 회원 및 회비 규정 제5조 ② — 연회비 미납에 따른 조치 */
export const ARREARS: readonly LedgerRow[] = [
  { cells: ['당해 연도 미납', '미납 사실 통보 후 회원 활동 권한 제한'] },
  { cells: ['연속 2년 미납', '회원 자격 정지, 모든 혜택·권한 중단'] },
  { cells: ['연속 3년 미납', '이사회 의결을 거쳐 이사장이 제명할 수 있음'] },
]

export const DUES_SOURCES: readonly RegSource[] = [
  reg('membership-dues', '2', '회원 및 회비 규정 제2조'),
  reg('membership-dues', '3', '제3조'),
  reg('membership-dues', '4', '제4조'),
  reg('membership-dues', '5', '제5조'),
]

export const PAYMENT_SOURCES: readonly RegSource[] = [
  reg('membership-dues', '11', '회원 및 회비 규정 제11조'),
  reg('membership-dues', '4', '제4조 ②'),
]

/** 정관 제4조 — 회비가 쓰이는 협회 사업 (5호 "기타 목적달성에 필요한 사업"은 따로 적는다) */
export const PROGRAMS: readonly { title: string; han: string }[] = [
  { title: '한·중·일 연합전 개최와 전국 단위 공모전을 통한 신진작가 발굴', han: '展' },
  { title: '서예문화를 알리는 국내외 교류전시와 학술발표', han: '交' },
  { title: '한국적 서체개발 육성', han: '體' },
  { title: '서예에 관한 해외문헌의 연구조사와 발표', han: '硏' },
]

export const PROGRAM_SOURCES: readonly RegSource[] = [
  reg('articles', '4', '정관 제4조'),
  reg('articles', '32', '제32조'),
  reg('articles', '37', '제37조'),
]

export interface AccountabilityStep {
  when: string
  title: string
  body: string
}

/** 정관 제33~36조·제39조, 운영 및 심사 규정 제9조 — 돈의 흐름을 누가 언제 확인하는가 */
export const ACCOUNTABILITY: readonly AccountabilityStep[] = [
  {
    when: '회계연도 개시 1월 전',
    title: '예산 편성',
    body: '세입·세출 예산을 편성해 이사회 의결을 거쳐 총회의 승인을 얻습니다. 회계연도는 정부의 회계연도를 따릅니다.',
  },
  {
    when: '총회 7일 전',
    title: '안건 사전 공개',
    body: '총회에 올릴 주요 안건을 홈페이지와 온라인 채널로 전체 회원(준회원 포함)에게 공개하고, 등급과 무관하게 의견을 받습니다.',
  },
  {
    when: '연 2회 이상',
    title: '회계감사',
    body: '감사가 회계감사를 실시합니다.',
  },
  {
    when: '회계연도 종료 후 2월 이내',
    title: '결산',
    body: '결산서를 작성해 이사회 의결을 거쳐 총회의 승인을 얻습니다.',
  },
]

export const ACCOUNTABILITY_SOURCES: readonly RegSource[] = [
  reg('articles', '33', '정관 제33조'),
  reg('articles', '34', '제34조'),
  reg('articles', '35', '제35조'),
  reg('articles', '36', '제36조'),
  reg('articles', '39', '제39조'),
  reg('operation-judging', '9', '운영 및 심사 규정 제9조'),
]

export const FUNDRAISING_FAQ_IDS = [
  'dues',
  'lifetime',
  'dues-usage',
  'benefits',
  'donation-receipt',
] as const
