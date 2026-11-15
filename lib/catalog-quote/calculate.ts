// 종이 도록 가견적 — 순수 산식. 화면·API·테스트가 모두 이 파일을 쓴다.
// 클라이언트가 보낸 단가는 받지 않는다. 금액은 항상 정책에서 다시 계산한다.

import { z } from 'zod'
import { CATALOG_QUOTE_POLICY, type Bracket, type CatalogQuotePolicy } from './policy'

export type ApplicationType = 'solo' | 'groupBooth'
export type Membership = 'member' | 'nonMember' | 'mixed'

/** 양수 원 단위 반올림(ROUND 와 같은 0.5 올림) — numerator/denominator 는 0 이상 정수 */
export function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator))
}

function bracketFor<T extends { from: number }>(brackets: readonly T[], value: number): T {
  let found = brackets[0]!
  for (const bracket of brackets) if (value >= bracket.from) found = bracket
  return found
}

/** 순번 구간별 부수 — P 부를 [1–99, 100–299, 300–499, 500–] 로 나눈다 */
export function copyBlocks(paidCopies: number, brackets: readonly Bracket[]) {
  return brackets.map((bracket, index) => {
    const next = brackets[index + 1]
    const start = bracket.from - 1
    const end = next ? next.from - 1 : Infinity
    const quantity = Math.max(0, Math.min(paidCopies, end) - start)
    return { from: bracket.from, to: next ? next.from - 1 : null, rateBp: bracket.rateBp, quantity }
  })
}

export interface CatalogBlock {
  from: number
  to: number | null
  quantity: number
  rateBp: number
  unitPrice: number
  amount: number
}

/** 도록 대금 — 임의의 0 이상 정수 부수에 대해 계산한다(경계 검증용). 화면 선택지 검증은 하지 않는다 */
export function catalogAmount(
  paidCopies: number,
  approvedWorks: number,
  membership: 'member' | 'nonMember',
  policy: CatalogQuotePolicy = CATALOG_QUOTE_POLICY
): { amount: number; blocks: CatalogBlock[] } {
  const { catalog } = policy
  const base = catalog.basePrice[membership]
  const discounted = membership === 'member' || catalog.nonMemberBenefits
  const workRate = discounted ? bracketFor(catalog.workBrackets, approvedWorks).rateBp : 0
  const blocks = copyBlocks(paidCopies, catalog.copyBrackets).map(block => {
    const rateBp = discounted ? Math.min(catalog.discountCapBp, workRate + block.rateBp) : 0
    const unitPrice = roundHalfUp(base * (10_000 - rateBp), 10_000)
    return { ...block, rateBp, unitPrice, amount: unitPrice * block.quantity }
  })
  return { amount: blocks.reduce((sum, block) => sum + block.amount, 0), blocks }
}

/** 출품비 — 구간 단가 × 승인 작품 전체 (회비 규정 제7조 현행 구조) */
export function entryFee(
  approvedWorks: number,
  membership: 'member' | 'nonMember',
  policy: CatalogQuotePolicy = CATALOG_QUOTE_POLICY
): { unitPrice: number; amount: number } {
  const unitPrice = bracketFor(policy.entryFee.brackets, approvedWorks)[membership]
  return { unitPrice, amount: unitPrice * approvedWorks }
}

// 화면·API 입력. 단가·금액 필드는 스키마에 없으므로 보내도 버려진다.
export const quoteInputSchema = z.object({
  applicationType: z.enum(['solo', 'groupBooth']),
  membership: z.enum(['member', 'nonMember', 'mixed']),
  approvedWorks: z.number(),
  /** 0 은 "추가 주문 없음" 내부 상태 */
  paidCopies: z.number(),
  splitDelivery: z.boolean().optional().default(false),
  multipleEditions: z.boolean().optional().default(false),
})
export type QuoteInput = z.input<typeof quoteInputSchema>

export type QuoteError =
  | 'INVALID_INPUT'
  | 'WORKS_NOT_INTEGER'
  | 'WORKS_BELOW_MINIMUM'
  | 'COPIES_NOT_INTEGER'
  | 'COPIES_NOT_OPTION'
  | 'COPIES_ABOVE_MAXIMUM'

export type SeparateQuoteReason = 'MIXED_MEMBERSHIP' | 'SPLIT_DELIVERY' | 'MULTIPLE_EDITIONS'

export interface Quote {
  status: 'estimate'
  provisional: boolean
  /** 회원 구분은 신청자 신고 기준이다 — 서버가 회원 자격을 확인하지 못한다 */
  membershipVerified: false
  policyVersion: string
  applicationType: ApplicationType
  membership: 'member' | 'nonMember'
  approvedWorks: number
  entryFee: { unitPrice: number; amount: number }
  catalog: {
    freeCopies: number
    paidCopies: number
    totalPrintRun: number
    amount: number
    /** 유료 0부면 null */
    averagePaidUnit: number | null
    blocks: CatalogBlock[]
  }
  totalExcludingExtras: number
  excluded: string[]
}

export type QuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; status: 'separateQuote'; reasons: SeparateQuoteReason[] }
  | { ok: false; status: 'invalid'; errors: QuoteError[] }

export const EXCLUDED_ITEMS = [
  '표구비 (회비 규정 제8조)',
  '승인된 별도 예비부수',
  '사양 변경·추가 편집·촬영',
  '500부를 넘는 수량 (별도 견적)',
] as const

export function validateQuote(input: unknown, policy: CatalogQuotePolicy = CATALOG_QUOTE_POLICY) {
  const parsed = quoteInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, errors: ['INVALID_INPUT' as const] }
  const value = parsed.data
  const errors: QuoteError[] = []
  if (!Number.isInteger(value.approvedWorks)) errors.push('WORKS_NOT_INTEGER')
  else if (value.approvedWorks < policy.minWorks) errors.push('WORKS_BELOW_MINIMUM')
  const max = Math.max(...policy.catalog.paidOptions)
  if (!Number.isInteger(value.paidCopies)) errors.push('COPIES_NOT_INTEGER')
  else if (value.paidCopies > max) errors.push('COPIES_ABOVE_MAXIMUM')
  else if (value.paidCopies !== 0 && !policy.catalog.paidOptions.includes(value.paidCopies))
    errors.push('COPIES_NOT_OPTION')
  return errors.length ? { ok: false as const, errors } : { ok: true as const, value }
}

export function computeQuote(
  input: unknown,
  policy: CatalogQuotePolicy = CATALOG_QUOTE_POLICY
): QuoteResult {
  const checked = validateQuote(input, policy)
  if (!checked.ok) return { ok: false, status: 'invalid', errors: checked.errors }
  const value = checked.value

  const reasons: SeparateQuoteReason[] = []
  if (value.membership === 'mixed') reasons.push('MIXED_MEMBERSHIP')
  if (value.applicationType === 'groupBooth' && value.splitDelivery) reasons.push('SPLIT_DELIVERY')
  if (value.applicationType === 'groupBooth' && value.multipleEditions)
    reasons.push('MULTIPLE_EDITIONS')
  if (reasons.length) return { ok: false, status: 'separateQuote', reasons }
  const membership = value.membership as 'member' | 'nonMember'

  const free =
    membership === 'member' || policy.catalog.nonMemberBenefits
      ? value.approvedWorks * policy.catalog.freeCopiesPerWork
      : 0
  const catalog = catalogAmount(value.paidCopies, value.approvedWorks, membership, policy)
  const fee = entryFee(value.approvedWorks, membership, policy)
  return {
    ok: true,
    quote: {
      status: 'estimate',
      provisional: true,
      membershipVerified: false,
      policyVersion: policy.version,
      applicationType: value.applicationType,
      membership,
      approvedWorks: value.approvedWorks,
      entryFee: fee,
      catalog: {
        freeCopies: free,
        paidCopies: value.paidCopies,
        totalPrintRun: free + value.paidCopies,
        amount: catalog.amount,
        averagePaidUnit:
          value.paidCopies > 0 ? roundHalfUp(catalog.amount, value.paidCopies) : null,
        blocks: catalog.blocks.filter(block => block.quantity > 0),
      },
      totalExcludingExtras: fee.amount + catalog.amount,
      excluded: [...EXCLUDED_ITEMS],
    },
  }
}
