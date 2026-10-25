import { findStaleEntries, staleLine, type MirroredEntry } from '../stale-entries'

const entry = (id: string, sourceKey = '2025-entries', extra: Partial<MirroredEntry> = {}) => ({
  airtable_record_id: id,
  source_key: sourceKey,
  contest_year: 2025,
  title: `작품 ${id.slice(-1)}`,
  artist_id: null,
  ...extra,
})

describe('findStaleEntries', () => {
  const mirrored = [
    entry('recAAAAAAAAAAAAAA'),
    entry('recBBBBBBBBBBBBBB'),
    entry('recCCCCCCCCCCCCCC'),
    entry('recDDDDDDDDDDDDDD', '2024-awards'),
  ]

  it('reports mirrored rows the latest fetch no longer contains', () => {
    const [report] = findStaleEntries(
      mirrored,
      new Map([['2025-entries', new Set(['recAAAAAAAAAAAAAA', 'recCCCCCCCCCCCCCC'])]])
    )
    expect(report.sourceKey).toBe('2025-entries')
    expect(report.fetched).toBe(2)
    expect(report.stale.map(row => row.airtable_record_id)).toEqual(['recBBBBBBBBBBBBBB'])
    expect(report.suspicious).toBe(false)
  })

  it('only judges sources that were fetched — others are left alone', () => {
    const reports = findStaleEntries(mirrored, new Map([['2025-entries', new Set<string>()]]))
    expect(reports).toHaveLength(1)
    expect(reports[0].stale.map(row => row.source_key)).not.toContain('2024-awards')
  })

  it('flags an empty fetch over a non-empty mirror as suspicious', () => {
    const [report] = findStaleEntries(mirrored, new Map([['2024-awards', new Set<string>()]]))
    expect(report.stale).toHaveLength(1)
    expect(report.suspicious).toBe(true)
  })

  it('is clean when every mirrored row came back', () => {
    const [report] = findStaleEntries(
      mirrored,
      new Map([['2024-awards', new Set(['recDDDDDDDDDDDDDD', 'recNEWNEWNEWNEWNE'])]])
    )
    expect(report.stale).toEqual([])
    expect(report.suspicious).toBe(false)
  })
})

describe('staleLine', () => {
  it('shows record, year, title and whether an artist is linked — never a name or email', () => {
    expect(staleLine(entry('recBBBBBBBBBBBBBB'))).toBe('recBBBBBBBBBBBBBB · 2025 · 작품 B')
    expect(
      staleLine(entry('recBBBBBBBBBBBBBB', '2025-entries', { title: null, artist_id: 'a1' }))
    ).toBe('recBBBBBBBBBBBBBB · 2025 · (명제 없음) · 작가 연결됨')
  })
})
