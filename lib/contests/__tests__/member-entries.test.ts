import {
  MEMBER_ENTRY_COLUMNS,
  mergeMemberEntries,
  memberEmail,
  type MemberEntry,
} from '../member-entries'

const entry = (id: string, year: number, submitted: string | null = null): MemberEntry => ({
  id,
  contest_year: year,
  contest_name: '대한민국 동양서예대전 공모전',
  title: `작품 ${id}`,
  division: '한문서예',
  script_style: '행서',
  fee_status: 'pending',
  result_status: 'pending',
  result_raw: null,
  submitted_at: submitted,
  synced_at: '2026-10-25T00:00:00.000Z',
})

describe('MEMBER_ENTRY_COLUMNS', () => {
  it('never exposes the entrant email, names or raw fee text to members', () => {
    const columns = MEMBER_ENTRY_COLUMNS.split(',')
    for (const hidden of [
      'entrant_email',
      'entrant_name',
      'entrant_name_hanja',
      'fee_status_raw',
      'artist_id',
      'matched_by',
      'airtable_record_id',
    ])
      expect(columns).not.toContain(hidden)
  })
})

describe('mergeMemberEntries', () => {
  it('drops duplicates found by both email and linked artist, newest year first', () => {
    const byEmail = [entry('a', 2024), entry('b', 2025, '2025-04-01T00:00:00Z')]
    const byArtist = [
      entry('b', 2025, '2025-04-01T00:00:00Z'),
      entry('c', 2025, '2025-05-01T00:00:00Z'),
    ]
    expect(mergeMemberEntries(byEmail, byArtist).map(row => row.id)).toEqual(['c', 'b', 'a'])
  })

  it('handles empty inputs', () => {
    expect(mergeMemberEntries([], [])).toEqual([])
  })
})

describe('memberEmail', () => {
  it('normalizes the verified login email the same way the sync stores it', () => {
    expect(memberEmail(' Artist@Example.TEST ')).toBe('artist@example.test')
    expect(memberEmail('')).toBeNull()
    expect(memberEmail(null)).toBeNull()
  })
})
