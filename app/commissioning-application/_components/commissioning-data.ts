/**
 * 위원 위촉 지원 페이지 데이터 — 자격·위촉 방법·수당은 운영 및 심사 규정 원문 그대로 옮긴다.
 * __tests__/commissioning-data.test.ts 가 regulations/02-operation-and-review.md 와 대조한다.
 */
import {
  reg,
  type DownloadItem,
  type LedgerRow,
  type RegSource,
} from '@/components/apply/apply-parts'

const R2_FORMS = 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D'
const COMMISSION_FORM_FILE =
  '%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B1%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B1%E1%84%8E%E1%85%A9%E1%86%A8%20%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5'

/** 옛 사이트와 같은 위원 위촉 지원서 Tally 양식 */
export const COMMISSION_TALLY_FORM_ID = 'vGeXgl'

export const COMMISSION_DOWNLOADS: readonly DownloadItem[] = [
  {
    type: '한컴독스 HWPX',
    title: '위원 위촉 지원서 한글 양식',
    note: 'PC 의 한컴독스에서 입력해 작성',
    href: `${R2_FORMS}/${COMMISSION_FORM_FILE}.hwpx`,
  },
  {
    type: 'ADOBE PDF',
    title: '위원 위촉 지원서 PDF 양식',
    note: '내려받아 인쇄한 뒤 손으로 작성',
    href: `${R2_FORMS}/${COMMISSION_FORM_FILE}.pdf`,
  },
]

/** 운영 및 심사 규정 제3조 — 운영위원·심사위원 자격 */
const JUROR_QUALIFICATIONS = [
  '본회 초대작가 (자문위원, 고문 포함)',
  '다른 서예 단체 초대작가',
  '본회 고문이나 자문위원이 추천한 인사',
] as const

/** 운영 및 심사 규정 제3조의3 — 모집위원 자격 */
const RECRUITER_QUALIFICATIONS = [
  '본회 정회원으로서 활동 기간이 1년 이상이고 협회 활동에 적극적으로 참여한 자',
  '미술 또는 예술 관련 분야에서 3년 이상의 홍보, 마케팅, 또는 기획 업무 경력이 있는 자',
  '본회 초대작가 1인 이상의 추천을 받아 협회 발전에 기여할 의사가 명확하다고 인정된 자',
  '본회 주관 공모전 또는 전시에 3회 이상 출품 실적이 있는 작가',
] as const

export interface Role {
  mark: string
  title: string
  duty: string
  qualifications: readonly string[]
  sources: readonly RegSource[]
}

export const ROLES: readonly Role[] = [
  {
    mark: '審査',
    title: '심사위원',
    duty: '점획·결구·장법·조화 네 항목으로 출품작을 채점하고, 부문별 심사평을 씁니다.',
    qualifications: JUROR_QUALIFICATIONS,
    sources: [reg('operation-judging', '3', '제3조'), reg('operation-judging', '6', '제6조')],
  },
  {
    mark: '運營',
    title: '운영위원',
    duty: '대한민국 동양서예대전 운영 회의에 참석합니다. 회의 한 번은 2시간을 기준으로 합니다.',
    qualifications: JUROR_QUALIFICATIONS,
    sources: [reg('operation-judging', '3', '제3조'), reg('operation-judging', '4-2', '제4조의2')],
  },
  {
    mark: '募集',
    title: '모집위원',
    duty: '협회 전시를 알리고 출품자를 모읍니다. 전시에 대한 이해와 홍보에 대한 적극성을 가장 먼저 봅니다.',
    qualifications: RECRUITER_QUALIFICATIONS,
    sources: [reg('operation-judging', '3-3', '제3조의3')],
  },
]

export interface Step {
  title: string
  body: string
}

/** 지원서 제출 → 제4조 위촉 방법 → 제8조 임기 */
export const STEPS: readonly Step[] = [
  {
    title: '지원서 제출',
    body: '온라인 지원서를 보내거나, 한글·PDF 양식을 작성해 사무국에 제출합니다.',
  },
  {
    title: '2배수 추천',
    body: '이사장이 대전 개최 1개월 전에 심사 건수를 기준으로 인원을 정하고, 그 2배수를 추천합니다.',
  },
  {
    title: '이사회 의결',
    body: '이사회 의결로 위촉을 결정하고 위촉증서를 수여합니다.',
  },
  {
    title: '임기',
    body: '위촉일부터 당해년도 대한민국 동양서예대전 종료일까지입니다. 이의제기 재검증은 처리가 끝날 때까지 맡습니다.',
  },
]

export const STEP_SOURCES = [
  reg('operation-judging', '4', '운영 및 심사 규정 제4조'),
  reg('operation-judging', '8', '제8조'),
]

/** 제4조의2 ② — [구분, 책정 기준(1인당 제안 금액), 지급 원칙] */
export const JUROR_PAY: readonly LedgerRow[] = [
  { cells: ['심사수당 (심사료)', '15만원 (1일 / 반일)', '심사 규모 및 소요 시간에 따라 지급'] },
  { cells: ['원고료 (심사평)', '10만원 (건당)', '심사평 작성 시 별도 지급'] },
  { cells: ['여비 (교통비)', '실비 정산 (KTX, 고속버스 등)', '실비 정산 지급'] },
  { cells: ['식대 (중식 / 석식)', '2만원 (1식당)', '심사 일정에 중식 or 석식이 포함될 경우 지급'] },
]

/** 제4조의2 ③ */
export const COMMITTEE_PAY: readonly LedgerRow[] = [
  { cells: ['회의 참석 수당', '10만원 (1회당)', '회의 시간(2시간 기준)에 따라 지급'] },
  { cells: ['여비 (교통비)', '실비 정산 (원칙)', '심사위원 기준 준용'] },
  { cells: ['식대 (필요시)', '2만원 (1식당)', '회의 시간에 따라 지급'] },
]

/** 제4조의2 ④ — [구분, 모집 인원, 지급 기준, 지급액(누적)] */
export const RECRUITER_PAY: readonly LedgerRow[] = [
  { cells: ['Tier 4 (심화)', '1~29명', '1인당 5,000원', '인원 × 5,000원'] },
  { cells: ['Tier 3 (숙련)', '30명', '1~30번째 1인당 10,000원', '300,000원'] },
  { cells: ['Tier 2 (우수)', '31~40명', '31~40번째 1인당 12,000원 추가', '40명 시 420,000원'] },
  { cells: ['Tier 1 (최상)', '41명 이상', '41번째부터 1인당 15,000원 추가', '50명 시 570,000원'] },
]

export const PAY_SOURCES = [reg('operation-judging', '4-2', '운영 및 심사 규정 제4조의2')]

/** 제3조의2 ① — 심사위원 제척 사유 */
export const RECUSAL_GROUNDS = [
  '심사위원이 출품자의 배우자이거나 직계 존비속인 경우',
  '심사위원이 출품자의 스승이거나, 출품자가 심사위원의 제자인 경우',
  '기타 공정한 심사를 기대하기 어려운 명백한 사유가 있는 경우',
] as const

export const FAIRNESS_SOURCES = [
  reg('operation-judging', '3-2', '운영 및 심사 규정 제3조의2'),
  reg('operation-judging', '4-2', '제4조의2 ⑤'),
]
