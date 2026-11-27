// 종이 도록 가견적 정책 — 한 버전을 한 파일로 둔다.
//
// 정책을 바꿀 때는 이 객체를 새 버전으로 교체한다(version·source·approved 를 함께 고친다).
// 계산 코드(calculate.ts)는 이 객체만 읽으므로 다른 파일은 고치지 않는다.
//
// 금액은 원 단위 정수, 비율은 bp(1% = 100bp) 정수다.
// 출처: 협회 내부 도록 가격 검토안(2026-11-15)과 회원 및 회비 규정 제7조·제9조(2026-11-27 개정: 1부 기준가 정회원 3만원·비회원 5만원).
// 계산기 공개는 별도 승인 전이므로 approved=false.

export interface Bracket {
  /** 이 구간의 하한(포함) */
  readonly from: number
  readonly rateBp: number
}

export interface CatalogQuotePolicy {
  readonly version: string
  readonly source: string
  /** 이사회 의결로 확정되었는가 — false 면 화면에 "검토안·가견적"을 표시한다 */
  readonly approved: boolean
  readonly minWorks: number
  /** 기본 인쇄 사양 — 확정 원가는 이 사양(또는 주문마다 승인한 사양) id 와 같은 견적만 쓴다 */
  readonly defaultSpec: {
    readonly id: string
    readonly format: string
    /** 아래는 승인 전 미정 — 판본·쪽수·종이·색도·제본·코팅을 주문마다 승인한다 */
    readonly pages: number | null
    readonly paper: string | null
    readonly colors: string | null
    readonly binding: string | null
    readonly coating: string | null
  }
  /** 출품비 (회비 규정 제7조) — 구간 단가를 승인 작품 전체에 곱한다 */
  readonly entryFee: {
    readonly brackets: readonly { from: number; member: number; nonMember: number }[]
  }
  readonly catalog: {
    readonly basePrice: { readonly member: number; readonly nonMember: number }
    /** 신청자에게 보여 줄 추가 유료 부수 선택지 */
    readonly paidOptions: readonly number[]
    /** 출품 작품 수 할인 (정회원) */
    readonly workBrackets: readonly Bracket[]
    /** 추가 유료 부수 순번 구간 할인 — from 은 1부터 센 순번 */
    readonly copyBrackets: readonly Bracket[]
    readonly discountCapBp: number
    /** 정회원 승인 작품 1점당 무료 부수 */
    readonly freeCopiesPerWork: number
    /** 비회원 할인·무료분 — 정책 승인 전에는 false */
    readonly nonMemberBenefits: boolean
  }
  /** 협회 내부 원가 검토용 — 규정에 두지 않는 내부 운영 기준(관리자 API 에서만 쓴다) */
  readonly internal: {
    readonly paymentFeeRateBp: number
    readonly targetMarginBp: number
  }
}

export const CATALOG_QUOTE_POLICY: CatalogQuotePolicy = {
  version: '2026-11-27-review',
  source: '협회 내부 도록 가격 검토안 (2026-11-15) · 회비 규정 제7조·제9조 (2026-11-27 개정)',
  approved: false,
  minWorks: 10,
  defaultSpec: {
    id: 'A4-STD',
    format: 'A4 국배판 (210×297mm)',
    pages: null,
    paper: null,
    colors: null,
    binding: null,
    coating: null,
  },
  entryFee: {
    brackets: [
      { from: 10, member: 160_000, nonMember: 180_000 },
      { from: 20, member: 140_000, nonMember: 160_000 },
      { from: 30, member: 120_000, nonMember: 140_000 },
      { from: 40, member: 100_000, nonMember: 120_000 },
    ],
  },
  catalog: {
    basePrice: { member: 30_000, nonMember: 50_000 },
    paidOptions: [100, 150, 200, 250, 300, 350, 400, 450, 500],
    workBrackets: [
      { from: 10, rateBp: 0 },
      { from: 20, rateBp: 300 },
      { from: 30, rateBp: 500 },
      { from: 40, rateBp: 700 },
    ],
    copyBrackets: [
      { from: 1, rateBp: 0 },
      { from: 100, rateBp: 800 },
      { from: 300, rateBp: 1500 },
      { from: 500, rateBp: 2200 },
    ],
    discountCapBp: 2500,
    freeCopiesPerWork: 1,
    nonMemberBenefits: false,
  },
  internal: {
    paymentFeeRateBp: 250,
    targetMarginBp: 1500,
  },
}
