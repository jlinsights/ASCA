import {
  catalogAmount,
  computeQuote,
  copyBlocks,
  entryFee,
  roundHalfUp,
  type QuoteResult,
} from '../calculate'
import { CATALOG_QUOTE_POLICY } from '../policy'

const base = { applicationType: 'solo', membership: 'member', approvedWorks: 20, paidCopies: 100 }
const quote = (over: Record<string, unknown> = {}) => computeQuote({ ...base, ...over })
function estimate(result: QuoteResult) {
  if (!result.ok) throw new Error(`expected estimate, got ${JSON.stringify(result)}`)
  return result.quote
}

describe('기준 예시 (검토안 엑셀과 같은 값)', () => {
  it('정회원 20점 + 100부: 무료 20, 총 120, 도록 1,938,400원, 출품료 2,800,000원', () => {
    const q = estimate(quote())
    expect(q.catalog.freeCopies).toBe(20)
    expect(q.catalog.totalPrintRun).toBe(120)
    expect(q.catalog.amount).toBe(1_938_400)
    expect(q.entryFee.amount).toBe(2_800_000)
    expect(q.provisional).toBe(true)
    expect(q.membershipVerified).toBe(false)
  })

  it('정회원 20점 + 300부: 5,497,000원, 평균 18,323원', () => {
    const q = estimate(quote({ paidCopies: 300 }))
    expect(q.catalog.amount).toBe(5_497_000)
    expect(q.catalog.averagePaidUnit).toBe(18_323)
    expect(q.catalog.totalPrintRun).toBe(320)
  })
})

describe('화면 선택지 9개', () => {
  it.each(CATALOG_QUOTE_POLICY.catalog.paidOptions)('%i부는 가견적을 낸다', copies => {
    const q = estimate(quote({ paidCopies: copies }))
    expect(q.catalog.paidCopies).toBe(copies)
    expect(q.catalog.amount).toBe(catalogAmount(copies, 20, 'member').amount)
    expect(q.catalog.totalPrintRun).toBe(20 + copies)
  })

  it('선택지는 100~500부 50부 단위 9개뿐이다', () => {
    expect(CATALOG_QUOTE_POLICY.catalog.paidOptions).toEqual([
      100, 150, 200, 250, 300, 350, 400, 450, 500,
    ])
  })
})

describe('입력 차단', () => {
  it.each([
    [{ paidCopies: 50 }, 'COPIES_NOT_OPTION'],
    [{ paidCopies: 99 }, 'COPIES_NOT_OPTION'],
    [{ paidCopies: 120 }, 'COPIES_NOT_OPTION'],
    [{ paidCopies: 550 }, 'COPIES_ABOVE_MAXIMUM'],
    [{ paidCopies: 501 }, 'COPIES_ABOVE_MAXIMUM'],
    [{ paidCopies: -100 }, 'COPIES_NOT_OPTION'],
    [{ paidCopies: 150.5 }, 'COPIES_NOT_INTEGER'],
    [{ approvedWorks: 9 }, 'WORKS_BELOW_MINIMUM'],
    [{ approvedWorks: -10 }, 'WORKS_BELOW_MINIMUM'],
    [{ approvedWorks: 20.5 }, 'WORKS_NOT_INTEGER'],
    [{ approvedWorks: null }, 'INVALID_INPUT'],
    [{ approvedWorks: '' }, 'INVALID_INPUT'],
    [{ paidCopies: undefined }, 'INVALID_INPUT'],
    [{ membership: 'vip' }, 'INVALID_INPUT'],
  ])('%j → %s, 금액 없음', (over, code) => {
    const result = quote(over)
    expect(result).toEqual({ ok: false, status: 'invalid', errors: expect.arrayContaining([code]) })
    expect(JSON.stringify(result)).not.toMatch(/amount/)
  })

  it('0부는 추가 주문 없음: 도록 대금 0, 평균 단가 없음, 무료분은 남는다', () => {
    const q = estimate(quote({ paidCopies: 0 }))
    expect(q.catalog.amount).toBe(0)
    expect(q.catalog.averagePaidUnit).toBeNull()
    expect(q.catalog.freeCopies).toBe(20)
    expect(q.catalog.totalPrintRun).toBe(20)
    expect(q.catalog.blocks).toEqual([])
  })

  it('클라이언트가 보낸 단가·금액은 무시한다', () => {
    const tampered = estimate(
      computeQuote({ ...base, unitPrice: 1, amount: 1, basePrice: 1, catalog: { amount: 1 } })
    )
    expect(tampered.catalog.amount).toBe(1_938_400)
  })
})

describe('순수 산식 — 블록 경계', () => {
  it.each([
    [0, [0, 0, 0, 0]],
    [99, [99, 0, 0, 0]],
    [100, [99, 1, 0, 0]],
    [299, [99, 200, 0, 0]],
    [300, [99, 200, 1, 0]],
    [499, [99, 200, 200, 0]],
    [500, [99, 200, 200, 1]],
    [700, [99, 200, 200, 201]],
  ])('%i부 → %j', (copies, expected) => {
    expect(
      copyBlocks(copies, CATALOG_QUOTE_POLICY.catalog.copyBrackets).map(b => b.quantity)
    ).toEqual(expected)
  })

  it('정회원 20점의 경계 금액', () => {
    expect(catalogAmount(99, 20, 'member').amount).toBe(99 * 19_400)
    expect(catalogAmount(100, 20, 'member').amount).toBe(99 * 19_400 + 17_800)
    expect(catalogAmount(299, 20, 'member').amount).toBe(99 * 19_400 + 200 * 17_800)
    expect(catalogAmount(300, 20, 'member').amount).toBe(99 * 19_400 + 200 * 17_800 + 16_400)
    expect(catalogAmount(499, 20, 'member').amount).toBe(99 * 19_400 + 200 * 17_800 + 200 * 16_400)
    expect(catalogAmount(500, 20, 'member').amount).toBe(
      99 * 19_400 + 200 * 17_800 + 200 * 16_400 + 15_000
    )
  })

  it('합산 할인율은 25% 를 넘지 않는다 (40점 7% + 500번째 22%)', () => {
    const last = catalogAmount(500, 40, 'member').blocks.at(-1)!
    expect(last.rateBp).toBe(2500)
    expect(last.unitPrice).toBe(15_000)
  })

  it('원 단위 0.5 올림', () => {
    expect(roundHalfUp(5, 10)).toBe(1)
    expect(roundHalfUp(4, 10)).toBe(0)
    expect(roundHalfUp(18_323_33, 100)).toBe(18_323)
  })

  it.each([10, 19, 20, 29, 30, 39, 40, 60])(
    '%i점: 유료 부수가 늘면 도록 대금은 내려가지 않는다',
    works => {
      let previous = -1
      for (let copies = 0; copies <= 600; copies += 1) {
        const { amount } = catalogAmount(copies, works, 'member')
        expect(amount).toBeGreaterThanOrEqual(previous)
        previous = amount
      }
    }
  )
})

describe('작품 수 구간', () => {
  it.each([
    [19, 0, 160_000],
    [20, 300, 140_000],
    [29, 300, 140_000],
    [30, 500, 120_000],
    [39, 500, 120_000],
    [40, 700, 100_000],
  ])('%i점 → 도록 할인 %ibp, 출품료 작품당 %i원', (works, rateBp, unit) => {
    expect(catalogAmount(99, works, 'member').blocks[0]!.rateBp).toBe(rateBp)
    expect(entryFee(works, 'member')).toEqual({ unitPrice: unit, amount: unit * works })
  })

  it('현행 제7조 구조: 29점보다 30점 출품료가 낮다 (임의 변경하지 않음)', () => {
    expect(entryFee(29, 'member').amount).toBe(4_060_000)
    expect(entryFee(30, 'member').amount).toBe(3_600_000)
  })
})

describe('자격과 단체', () => {
  it('무료분은 작품 수만큼이고 기존 정회원 1권을 더하지 않는다', () => {
    expect(estimate(quote({ approvedWorks: 35 })).catalog.freeCopies).toBe(35)
  })

  it('비회원: 무료 없음, 할인 없음, 30,000원, 비회원 출품료', () => {
    const q = estimate(quote({ membership: 'nonMember', paidCopies: 300 }))
    expect(q.catalog.freeCopies).toBe(0)
    expect(q.catalog.totalPrintRun).toBe(300)
    expect(q.catalog.amount).toBe(300 * 30_000)
    expect(q.entryFee.amount).toBe(20 * 160_000)
  })

  it('단체 부스전(정회원, 한 신청·판본·납품지)은 계산한다', () => {
    expect(quote({ applicationType: 'groupBooth' }).ok).toBe(true)
  })

  it.each([
    [{ applicationType: 'groupBooth', membership: 'mixed' }, ['MIXED_MEMBERSHIP']],
    [{ applicationType: 'groupBooth', splitDelivery: true }, ['SPLIT_DELIVERY']],
    [{ applicationType: 'groupBooth', multipleEditions: true }, ['MULTIPLE_EDITIONS']],
    [{ membership: 'mixed' }, ['MIXED_MEMBERSHIP']],
  ])('%j → 별도 견적, 금액 없음', (over, reasons) => {
    const result = quote(over)
    expect(result).toEqual({ ok: false, status: 'separateQuote', reasons })
  })

  it('공개 결과에는 원가·마진이 없다', () => {
    expect(JSON.stringify(quote())).not.toMatch(/cost|margin|profit|원가|마진/i)
  })
})
