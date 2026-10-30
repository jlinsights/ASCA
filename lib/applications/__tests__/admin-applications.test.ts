import { draftConflicts } from '../admin-applications'

describe('draftConflicts', () => {
  const row = { status: 'reviewing' as const, reviewed_at: '2026-10-30T03:00:00.123+00:00' }

  it('초안이 없거나 기준 버전이 같으면 충돌이 아니다 — 시각 표기만 달라도 같게 본다', () => {
    expect(draftConflicts(undefined, row)).toBe(false)
    expect(
      draftConflicts({ note: 'x', from: 'reviewing', seen: '2026-10-30T03:00:00.123Z' }, row)
    ).toBe(false)
    expect(
      draftConflicts(
        { note: 'x', from: 'received', seen: null },
        { status: 'received', reviewed_at: null }
      )
    ).toBe(false)
  })

  it('상태나 처리 시각이 바뀌었으면 충돌이다', () => {
    expect(
      draftConflicts({ note: 'x', from: 'received', seen: '2026-10-30T03:00:00.123Z' }, row)
    ).toBe(true)
    expect(
      draftConflicts({ note: 'x', from: 'reviewing', seen: '2026-10-30T02:00:00Z' }, row)
    ).toBe(true)
    expect(draftConflicts({ note: 'x', from: 'reviewing', seen: null }, row)).toBe(true)
  })
})
