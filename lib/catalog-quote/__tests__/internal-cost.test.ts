jest.mock('server-only', () => ({}))
import { computeInternalCost } from '../internal-cost'

const quote = { applicationType: 'solo', membership: 'member', approvedWorks: 20, paidCopies: 300 }
const vendor = {
  specId: 'A4-STD',
  printRun: 320,
  productionCost: 3_000_000,
  quotedAt: '2026-11-15',
  taxIncluded: true,
  deliveryIncluded: true,
}

describe('협회 내부 원가', () => {
  it('견적이 없으면 확정 손익 없이 운영 검토', () => {
    const r = computeInternalCost({ quote })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.status).toBe('NO_VENDOR_QUOTE')
    expect(r.cost.needsReview).toBe(true)
    expect(r.cost.confirmed).toBeNull()
    expect(r.cost.revenue).toBe(5_497_000)
    expect(r.cost.paymentFee).toBe(137_425)
    expect(r.quote.catalog.amount).toBe(5_497_000)
  })

  it('견적 부수가 총 인쇄부수(무료+유료+예비)와 다르면 손익을 내지 않는다', () => {
    const r = computeInternalCost({ quote, vendorQuote: { ...vendor, printRun: 300 } })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.status).toBe('PRINT_RUN_MISMATCH')
    expect(r.cost.confirmed).toBeNull()
    const spare = computeInternalCost({ quote, spareCopies: 10, vendorQuote: vendor })
    if (!spare.ok) throw new Error('expected ok')
    expect(spare.cost.orderPrintRun).toBe(330)
    expect(spare.cost.status).toBe('PRINT_RUN_MISMATCH')
  })

  it('견적에 포함된 배송·부가세를 다시 더하면 막는다', () => {
    const r = computeInternalCost({ quote, vendorQuote: vendor, extraDelivery: 10_000 })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.status).toBe('DOUBLE_COUNTED')
    expect(r.cost.confirmed).toBeNull()
  })

  it('확정 손익: 출품료를 섞지 않고 결제 수수료·추가비를 뺀다', () => {
    const r = computeInternalCost({ quote, vendorQuote: vendor, extraEditing: 100_000 })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.confirmed).toMatchObject({
      totalCost: 3_000_000 + 100_000 + 137_425,
      profit: 5_497_000 - 3_237_425,
      quotedAt: '2026-11-15',
    })
    expect(r.cost.status).toBe('OK')
    expect(r.cost.needsReview).toBe(false)
  })

  it('목표 마진 미달은 운영 검토로 표시하고 가격·무료분을 바꾸지 않는다', () => {
    const r = computeInternalCost({ quote, vendorQuote: { ...vendor, productionCost: 4_900_000 } })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.status).toBe('BELOW_TARGET')
    expect(r.quote.catalog.amount).toBe(5_497_000)
    expect(r.quote.catalog.freeCopies).toBe(20)
  })

  it('과거 주문 참고치는 총액·부수로 환산하고 가정을 표시하며 확정 원가와 분리한다', () => {
    const r = computeInternalCost({ quote, reference: { pastTotal: 912_345, pastPrintRun: 100 } })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.confirmed).toBeNull()
    // 권당 9,123.45원 × 320부 = 2,919,504원 — 권당 단가를 반올림하지 않고 한 번만 반올림한다
    expect(r.cost.reference).toMatchObject({
      productionCost: 2_919_504,
      totalCost: 2_919_504 + 137_425,
    })
    expect(r.cost.reference!.assumption).toMatch(/같은 사양/)
  })

  it('승인 사양과 다른 사양의 견적은 확정 원가로 쓰지 않는다', () => {
    const r = computeInternalCost({ quote, vendorQuote: { ...vendor, specId: 'A4-ALT' } })
    if (!r.ok) throw new Error('expected ok')
    expect(r.cost.status).toBe('SPEC_MISMATCH')
    expect(r.cost.confirmed).toBeNull()
    const approved = computeInternalCost({
      quote,
      approvedSpecId: 'A4-ALT',
      vendorQuote: { ...vendor, specId: 'A4-ALT' },
    })
    if (!approved.ok) throw new Error('expected ok')
    expect(approved.cost.status).toBe('OK')
  })

  it('가견적이 아닌 입력(별도 견적·오류)은 원가 계산을 하지 않는다', () => {
    expect(computeInternalCost({ quote: { ...quote, membership: 'mixed' } })).toEqual({
      ok: false,
      error: 'QUOTE_NOT_ESTIMATE',
    })
    expect(computeInternalCost({ quote: { ...quote, paidCopies: 120 } }).ok).toBe(false)
  })

  it('견적에 없는 부가세·배송비를 입력하지 않으면 확정 손익을 내지 않는다', () => {
    const exclusive = { ...vendor, taxIncluded: false, deliveryIncluded: false }
    const missing = computeInternalCost({ quote, vendorQuote: exclusive })
    if (!missing.ok) throw new Error('expected ok')
    expect(missing.cost.status).toBe('EXTRA_COSTS_UNCONFIRMED')
    expect(missing.cost.confirmed).toBeNull()
    const onlyVat = computeInternalCost({ quote, vendorQuote: exclusive, extraVat: 300_000 })
    if (!onlyVat.ok) throw new Error('expected ok')
    expect(onlyVat.cost.status).toBe('EXTRA_COSTS_UNCONFIRMED')
    // 0 을 직접 입력하면 확인한 값으로 본다
    const confirmed = computeInternalCost({
      quote,
      vendorQuote: exclusive,
      extraVat: 300_000,
      extraDelivery: 0,
    })
    if (!confirmed.ok) throw new Error('expected ok')
    expect(confirmed.cost.confirmed).toMatchObject({
      extraVat: 300_000,
      extraDelivery: 0,
      totalCost: 3_000_000 + 300_000 + 137_425,
    })
  })
})
