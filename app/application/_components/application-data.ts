/**
 * 출품원서 페이지 데이터 — 금액·인원·규격은 규정 원문 그대로 옮긴다.
 * __tests__/application-data.test.ts 가 regulations/*.md 와 한 글자씩 대조하므로,
 * 규정이 바뀌면 테스트가 먼저 깨진다. 날짜·접수 기간처럼 규정에 없는 값은 여기 두지 않고 공모요강(플립북)에 맡긴다.
 */
import { reg, type DownloadItem, type LedgerRow } from '@/components/apply/apply-parts'

const R2_FORMS = 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D'
const ENTRY_FORM_FILE =
  '%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%91%E1%85%AE%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8'

/** 옛 사이트(orientalcalligraphy.org/application)가 실제로 받는 출품원서 Tally 양식 */
export const ENTRY_TALLY_FORM_ID = '68qAXP'

export const ENTRY_DOWNLOADS: readonly DownloadItem[] = [
  {
    type: 'MS WORD',
    title: '출품원서 Word 양식',
    note: 'PC 의 Word 에서 입력해 작성',
    href: `${R2_FORMS}/${ENTRY_FORM_FILE}.docx`,
  },
  {
    type: 'ADOBE PDF',
    title: '출품원서 PDF 양식',
    note: '내려받아 인쇄한 뒤 손으로 작성',
    href: `${R2_FORMS}/${ENTRY_FORM_FILE}.pdf`,
  },
]

export const PODCAST_EMBED =
  'https://open.spotify.com/embed/episode/1yd6KxiQs8nCpVkRB5QKe5?utm_source=generator'

export interface Division {
  mark: string
  title: string
  body: string
}

/** 운영 및 심사 규정 제5조 — 공모 5개 부문 */
export const DIVISIONS: readonly Division[] = [
  {
    mark: '한',
    title: '한글',
    body: '한글정자ㆍ정자혼용ㆍ한글반흘림ㆍ반흘림혼용ㆍ한글진흘림ㆍ판본체, 민체 등',
  },
  { mark: '漢', title: '한문', body: '갑골ㆍ금문ㆍ 전서ㆍ예서ㆍ해서ㆍ행서ㆍ초서' },
  { mark: '今', title: '현대서예ㆍ 캘리그라피', body: '현대 한국화 포함' },
  { mark: '印', title: '전각ㆍ서각', body: '목각ㆍ석각 포함' },
  { mark: '畵', title: '문인화·동양화', body: '문인화, 동양화, 채색화, 수묵화, 민화' },
]

/** 운영 및 심사 규정 제5조 — 공모작품 규격 */
export const SIZES = [
  { name: '국전지', size: '70×200cm' },
  { name: '전지', size: '70×136cm' },
  { name: '반지', size: '35×136cm' },
] as const

export const DIVISION_SOURCES = [reg('operation-judging', '5', '운영 및 심사 규정 제5조')]

/** 회원 및 회비 규정 제6조 — [구분, 1점, 2~9번째] */
export const ENTRY_FEES: readonly LedgerRow[] = [
  { cells: ['청년작가', '5만원', '4만원'] },
  { cells: ['일반작가', '6만원', '5만원'] },
  { cells: ['추천작가', '10만원', '9만원'] },
  { cells: ['초대작가', '20만원', '19만원'] },
]

/** 회원 및 회비 규정 제8조 — [규격, 표준가(비회원), 회원가(정회원)]. 규격 이름만 쓴다(cm 는 제5조와 표기가 달라 생략) */
export const FRAMING_FEES: readonly LedgerRow[] = [
  { cells: ['반절지', '작품당 8만원', '작품당 6만원'] },
  { cells: ['전지', '작품당 10만원', '작품당 8만원'] },
  { cells: ['국전지', '작품당 12만원', '작품당 10만원'] },
]

export const FEE_SOURCES = [
  reg('membership-dues', '6', '회원 및 회비 규정 제6조'),
  reg('membership-dues', '8', '제8조'),
]

export interface Criterion {
  name: string
  han: string
  score: string
  elements: string
}

/** 운영 및 심사 규정 제6조 ④ — 네 항목 각 25점 */
export const CRITERIA: readonly Criterion[] = [
  { name: '점획', han: '點劃', score: '25점', elements: '방원, 곡직, 경중, 장로, 형질 등' },
  { name: '결구', han: '結構', score: '25점', elements: '대소, 소밀, 허실, 향배, 호응 등' },
  { name: '장법', han: '章法', score: '25점', elements: '농담, 강유, 완급, 여백, 구성 등' },
  { name: '조화', han: '調和', score: '25점', elements: '기운, 아속, 미추, 통변, 창신 등' },
]

/** 운영 및 심사 규정 제6조 ⑥ 나 — [최종점수, 등급 후보] */
export const GRADE_THRESHOLDS: readonly LedgerRow[] = [
  { cells: ['90점 이상', '대상 및 최우수상 후보'] },
  { cells: ['85점 이상', '우수상 후보'] },
  { cells: ['80점 이상', '특선 후보'] },
  { cells: ['75점 이상', '입선 후보'] },
]

export const JUDGING_SOURCES = [
  reg('operation-judging', '6', '운영 및 심사 규정 제6조'),
  reg('operation-judging', '3-2', '제3조의2'),
]

export interface Award {
  tier: '본상' | '특별상' | '기타 입상'
  name: string
  count: string
  prize: string
}

/** 운영 및 심사 규정 제7조 ③ */
export const AWARDS: readonly Award[] = [
  { tier: '본상', name: '대상', count: '1명', prize: '상장 및 상금 200만원' },
  { tier: '본상', name: '최우수상', count: '1명', prize: '상장 및 상금 100만원' },
  { tier: '본상', name: '우수상', count: '2명', prize: '상장 및 상금 30만원' },
  { tier: '특별상', name: '오체상', count: '3명', prize: '상장 및 상금 20만원' },
  { tier: '특별상', name: '삼체상', count: '4명', prize: '상장 및 상금 15만원' },
  { tier: '기타 입상', name: '특선', count: '30명(조정 가능)', prize: '상장' },
  { tier: '기타 입상', name: '입선', count: '50명(조정 가능)', prize: '상장' },
]

export const AWARD_SOURCES = [reg('operation-judging', '7', '운영 및 심사 규정 제7조')]

/** 이 페이지에 보여 줄 공용 FAQ(lib/content/site-faq.ts) */
export const ENTRY_FAQ_IDS = [
  'entry-fees',
  'awards',
  'artist-selection',
  'special-appointment',
] as const
