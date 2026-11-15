import 'server-only'

// 협회 내부 원가·손익 — 관리자 API 에서만 쓴다. 공개 응답·화면·로그에 내보내지 않는다.
// 확정 원가는 같은 사양·실제 총 인쇄부수로 받은 제작업체 견적만 인정한다.
// 출품비는 도록 손익에 섞지 않는다. 목표 미달이어도 무료분·가격을 자동 조정하지 않는다.

import { z } from 'zod'
import { CATALOG_QUOTE_POLICY, type CatalogQuotePolicy } from './policy'
import { computeQuote, roundHalfUp, type Quote } from './calculate'

const won = z.number().int().nonnegative()

export const vendorQuoteSchema = z.object({
  specId: z.string().trim().min(1).max(40),
  printRun: z.number().int().positive(),
  productionCost: won,
  quotedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  taxIncluded: z.boolean(),
  deliveryIncluded: z.boolean(),
})

export const internalCostInputSchema = z.object({
  quote: z.unknown(),
  /** 이 주문에 승인한 인쇄 사양 id — 기본은 정책의 기본 사양 */
  approvedSpecId: z.string().trim().min(1).max(40).optional(),
  /** 승인된 별도 예비부수 (해당 시) */
  spareCopies: z.number().int().nonnegative().default(0),
  vendorQuote: vendorQuoteSchema.nullable().default(null),
  /** 견적에 포함되지 않은 추가 비용만 넣는다. 배송·부가세는 견적에 없으면 0 이라도 직접 입력해야 한다(공란 = 미확인) */
  extraDelivery: won.nullable().default(null),
  extraEditing: won.default(0),
  extraVat: won.nullable().default(null),
  /** 과거 주문 참고치 — 같은 사양·권당 원가 유지 가정으로 단순 환산한다. 확정 원가가 아니다 */
  reference: z
    .object({ pastTotal: won, pastPrintRun: z.number().int().positive() })
    .nullable()
    .default(null),
})

export type InternalCostStatus =
  | 'NO_VENDOR_QUOTE'
  | 'SPEC_MISMATCH'
  | 'PRINT_RUN_MISMATCH'
  | 'DOUBLE_COUNTED'
  | 'EXTRA_COSTS_UNCONFIRMED'
  | 'BELOW_TARGET'
  | 'OK'

export interface InternalCost {
  status: InternalCostStatus
  /** 운영 검토가 필요한가 — 자동 조정은 하지 않는다 */
  needsReview: boolean
  orderPrintRun: number
  revenue: number
  paymentFee: number
  confirmed: null | {
    productionCost: number
    extraDelivery: number
    extraEditing: number
    extraVat: number
    totalCost: number
    profit: number
    marginBp: number | null
    quotedAt: string
    taxIncluded: boolean
    deliveryIncluded: boolean
  }
  reference: null | {
    assumption: string
    pastTotal: number
    pastPrintRun: number
    productionCost: number
    totalCost: number
    profit: number
    marginBp: number | null
  }
}

function marginBp(profit: number, revenue: number): number | null {
  if (revenue <= 0) return null
  const sign = profit < 0 ? -1 : 1
  return sign * roundHalfUp(Math.abs(profit) * 10_000, revenue)
}

export type InternalCostResult =
  | { ok: true; quote: Quote; cost: InternalCost }
  | { ok: false; error: 'INVALID_INPUT' | 'QUOTE_NOT_ESTIMATE' }

export function computeInternalCost(
  input: unknown,
  policy: CatalogQuotePolicy = CATALOG_QUOTE_POLICY
): InternalCostResult {
  const parsed = internalCostInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'INVALID_INPUT' }
  const value = parsed.data
  const result = computeQuote(value.quote, policy)
  if (!result.ok) return { ok: false, error: 'QUOTE_NOT_ESTIMATE' }
  const { quote } = result

  const orderPrintRun = quote.catalog.totalPrintRun + value.spareCopies
  const revenue = quote.catalog.amount
  const paymentFee = roundHalfUp(revenue * policy.internal.paymentFeeRateBp, 10_000)
  const vendor = value.vendorQuote

  let status: InternalCostStatus = 'OK'
  let confirmed: InternalCost['confirmed'] = null
  const specId = value.approvedSpecId ?? policy.defaultSpec.id
  if (!vendor) status = 'NO_VENDOR_QUOTE'
  else if (vendor.specId !== specId) status = 'SPEC_MISMATCH'
  else if (vendor.printRun !== orderPrintRun) status = 'PRINT_RUN_MISMATCH'
  else if (
    (vendor.deliveryIncluded && (value.extraDelivery ?? 0) > 0) ||
    (vendor.taxIncluded && (value.extraVat ?? 0) > 0)
  )
    status = 'DOUBLE_COUNTED'
  else if (
    (!vendor.deliveryIncluded && value.extraDelivery === null) ||
    (!vendor.taxIncluded && value.extraVat === null)
  )
    // 견적에 없는 배송비·부가세를 입력하지 않았으면 0 으로 보고 손익을 내지 않는다
    status = 'EXTRA_COSTS_UNCONFIRMED'
  else {
    const extraDelivery = value.extraDelivery ?? 0
    const extraVat = value.extraVat ?? 0
    const totalCost =
      vendor.productionCost + extraDelivery + value.extraEditing + extraVat + paymentFee
    const profit = revenue - totalCost
    const margin = marginBp(profit, revenue)
    confirmed = {
      productionCost: vendor.productionCost,
      extraDelivery,
      extraEditing: value.extraEditing,
      extraVat,
      totalCost,
      profit,
      marginBp: margin,
      quotedAt: vendor.quotedAt,
      taxIncluded: vendor.taxIncluded,
      deliveryIncluded: vendor.deliveryIncluded,
    }
    if (margin === null || margin < policy.internal.targetMarginBp) status = 'BELOW_TARGET'
  }

  let reference: InternalCost['reference'] = null
  if (value.reference) {
    const { pastTotal, pastPrintRun } = value.reference
    const productionCost = roundHalfUp(pastTotal * orderPrintRun, pastPrintRun)
    const totalCost = productionCost + paymentFee
    const profit = revenue - totalCost
    reference = {
      assumption:
        '과거 주문 총액을 같은 사양·같은 권당 원가로 단순 환산한 참고치 — 수량 할인 미반영, 확정 원가 아님',
      pastTotal,
      pastPrintRun,
      productionCost,
      totalCost,
      profit,
      marginBp: marginBp(profit, revenue),
    }
  }

  return {
    ok: true,
    quote,
    cost: {
      status,
      needsReview: status !== 'OK',
      orderPrintRun,
      revenue,
      paymentFee,
      confirmed,
      reference,
    },
  }
}
