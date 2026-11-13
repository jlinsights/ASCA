import {
  createdWindows,
  duesPaidYear,
  indexMembersByEmail,
  INCOME_COMPLETED,
  MAX_WINDOW_DAYS,
  normalizeEmail,
  parseCodeList,
  planLinks,
  type MemberLink,
} from '../member-links'

const member = (memberIdx: number, email: string | null, memberCode = `C${memberIdx}`) => ({
  memberIdx,
  memberCode,
  email,
})
const link = (
  account_id: string,
  member_idx: number,
  link_source: 'email' | 'manual' = 'email'
): MemberLink => ({
  account_id,
  member_idx,
  member_code: `C${member_idx}`,
  link_source,
})

/** 별도 지정이 없으면 시험에 나오는 구성원(10·20)을 모두 이번에 읽은 것으로 본다 */
const planSeen = (
  ...args:
    | [...Parameters<typeof planLinks>]
    | [
        Parameters<typeof planLinks>[0],
        Parameters<typeof planLinks>[1],
        Parameters<typeof planLinks>[2],
      ]
) => planLinks(args[0], args[1], args[2], args[3] ?? new Set([10, 20]))

describe('normalizeEmail', () => {
  it('lowercases and trims, and drops blanks or non-emails', () => {
    expect(normalizeEmail('  Kim@Example.ORG ')).toBe('kim@example.org')
    expect(normalizeEmail('')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
    expect(normalizeEmail('010-0000-0000')).toBeNull()
  })
})

describe('createdWindows', () => {
  const days = (start: string, end: string) =>
    (Date.parse(end) - Date.parse(start)) / 86_400_000 + 1

  it('splits a range into windows of at most 30 days that cover every day once', () => {
    const windows = createdWindows('2025-01-01', '2026-11-13')
    expect(windows[0].start).toBe('2025-01-01')
    expect(windows.at(-1)?.end).toBe('2026-11-13')
    for (const w of windows) expect(days(w.start, w.end)).toBeLessThanOrEqual(MAX_WINDOW_DAYS)
    for (let i = 1; i < windows.length; i++)
      expect(days(windows[i - 1].end, windows[i].start)).toBe(2)
  })

  it('returns one window for a single day and rejects bad input', () => {
    expect(createdWindows('2026-11-13', '2026-11-13')).toEqual([
      { start: '2026-11-13', end: '2026-11-13' },
    ])
    expect(() => createdWindows('2026-11-14', '2026-11-13')).toThrow()
    expect(() => createdWindows('2026/11/13', '2026-11-13')).toThrow()
  })
})

describe('indexMembersByEmail', () => {
  it('indexes by normalized email and skips members without one', () => {
    const { index, ambiguous } = indexMembersByEmail([
      member(1, 'A@x.org'),
      member(2, ''),
      member(3, null),
    ])
    expect([...index.keys()]).toEqual(['a@x.org'])
    expect(ambiguous.size).toBe(0)
  })

  it('refuses to pick when two different members share an email', () => {
    const { index, ambiguous } = indexMembersByEmail([
      member(1, 'same@x.org'),
      member(2, 'SAME@x.org'),
      member(3, 'same@x.org'),
    ])
    expect(index.has('same@x.org')).toBe(false)
    expect([...ambiguous]).toEqual(['same@x.org'])
  })

  it('treats the same member seen twice as one', () => {
    const { index } = indexMembersByEmail([member(1, 'a@x.org'), member(1, 'a@x.org')])
    expect(index.get('a@x.org')?.memberIdx).toBe(1)
  })
})

describe('planLinks', () => {
  const index = indexMembersByEmail([member(10, 'a@x.org'), member(20, 'b@x.org')]).index

  it('links accounts whose email matches and counts the rest as unmatched', () => {
    const plan = planSeen(
      [
        { id: 'acc-a', email: 'A@x.org' },
        { id: 'acc-c', email: 'c@x.org' },
      ],
      index,
      []
    )
    expect(plan.upserts).toEqual([link('acc-a', 10)])
    expect(plan.stats).toEqual({ matched: 1, unmatched: 1, skippedClaimed: 0, keptUnseen: 0 })
  })

  it('does not rewrite an unchanged link', () => {
    const plan = planSeen([{ id: 'acc-a', email: 'a@x.org' }], index, [link('acc-a', 10)])
    expect(plan.upserts).toEqual([])
    expect(plan.removals).toEqual([])
  })

  it('removes an email link when the email no longer matches', () => {
    const plan = planSeen([{ id: 'acc-a', email: 'new@x.org' }], index, [link('acc-a', 10)])
    expect(plan.removals).toEqual(['acc-a'])
  })

  it('never touches a manual link, and does not give its member to another account', () => {
    const plan = planSeen(
      [
        { id: 'acc-m', email: 'other@x.org' },
        { id: 'acc-b', email: 'b@x.org' },
      ],
      index,
      [link('acc-m', 20, 'manual')]
    )
    expect(plan.upserts).toEqual([])
    expect(plan.removals).toEqual([])
    expect(plan.kept).toEqual([link('acc-m', 20, 'manual')])
    expect(plan.stats.skippedClaimed).toBe(1)
  })

  it('drops email links for accounts that are gone', () => {
    const plan = planSeen([], index, [link('gone', 10)])
    expect(plan.removals).toEqual(['gone'])
  })

  it('moves a member to the account that now has its email', () => {
    const moved = indexMembersByEmail([member(10, 'b@x.org')]).index
    const plan = planSeen(
      [
        { id: 'acc-a', email: 'a@x.org' },
        { id: 'acc-b', email: 'b@x.org' },
      ],
      moved,
      [link('acc-a', 10)]
    )
    expect(plan.removals).toEqual(['acc-a'])
    expect(plan.upserts).toEqual([link('acc-b', 10)])
  })
})

describe('planLinks — members not read this run', () => {
  it('keeps an email link whose member was not read (e.g. registered before DONUS_SYNC_SINCE)', () => {
    const plan = planLinks(
      [{ id: 'acc-a', email: 'a@x.org' }],
      new Map(),
      [link('acc-a', 10)],
      new Set()
    )
    expect(plan.removals).toEqual([])
    expect(plan.stats.keptUnseen).toBe(1)
  })

  it('still removes it when the member was read and its email changed', () => {
    const plan = planLinks(
      [{ id: 'acc-a', email: 'a@x.org' }],
      new Map(),
      [link('acc-a', 10)],
      new Set([10])
    )
    expect(plan.removals).toEqual(['acc-a'])
  })
})

describe('planLinks — member switch', () => {
  it('releases the old link before linking an account to a different member', () => {
    const swapped = indexMembersByEmail([member(10, 'b@x.org'), member(20, 'a@x.org')]).index
    const plan = planSeen(
      [
        { id: 'acc-a', email: 'a@x.org' },
        { id: 'acc-b', email: 'b@x.org' },
      ],
      swapped,
      [link('acc-a', 10), link('acc-b', 20)]
    )
    expect(plan.removals.sort()).toEqual(['acc-a', 'acc-b'])
    expect(plan.upserts).toEqual([link('acc-a', 20), link('acc-b', 10)])
  })
})

describe('duesPaidYear', () => {
  const pay = (payDate: string, productCode = 'DUES', incomeStatus = INCOME_COMPLETED) => ({
    paymentIdx: Math.random(),
    memberIdx: 1,
    payDate,
    productCode,
    incomeStatus,
  })
  const codes = new Set(['DUES'])

  it('returns the latest year with a completed dues payment', () => {
    expect(duesPaidYear([pay('2025-01-20'), pay('2026-01-15')], codes)).toBe(2026)
  })

  it('ignores donations, pending payments and blank dates', () => {
    expect(
      duesPaidYear(
        [
          pay('2026-01-15', 'GIFT'),
          pay('2026-01-15', 'DUES', 1),
          { paymentIdx: 1, memberIdx: 1, productCode: 'DUES', incomeStatus: 3 },
        ],
        codes
      )
    ).toBeNull()
  })

  it('matches the purpose code too', () => {
    expect(duesPaidYear([{ ...pay('2026-02-01', 'X'), purposeCode: 'DUES' }], codes)).toBe(2026)
  })

  it('returns null when dues codes are not configured', () => {
    expect(duesPaidYear([pay('2026-01-15')], new Set())).toBeNull()
  })
})

describe('parseCodeList', () => {
  it('splits on commas and drops blanks', () => {
    expect([...parseCodeList(' P1, ,P2 ')]).toEqual(['P1', 'P2'])
    expect(parseCodeList(undefined).size).toBe(0)
  })
})
