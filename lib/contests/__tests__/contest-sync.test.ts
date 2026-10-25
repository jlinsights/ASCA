import {
  CONTEST_SOURCES,
  FORBIDDEN_FIELD_IDS,
  requestedFieldIds,
  type ContestSource,
} from '../sources'
import { recordsUrl, fetchContestRecords } from '../airtable-fetch'
import { cellText, feeStatus, mapContestEntry, resultStatus } from '../entry-mapper'

const fieldsIn = (url: string) => new URL(url).searchParams.getAll('fields[]')

describe('Airtable field allowlist', () => {
  it.each(CONTEST_SOURCES.map(source => [source.key, source]))(
    '%s requests only mapped fields and none of the forbidden ones',
    (_key, source) => {
      const requested = fieldsIn(recordsUrl(source as ContestSource))
      expect(requested.length).toBeGreaterThan(0)
      expect(requested.sort()).toEqual(requestedFieldIds(source as ContestSource).sort())
      for (const id of requested) expect(FORBIDDEN_FIELD_IDS.has(id)).toBe(false)
    }
  )

  it('never requests the address, photo or judging-score fields', () => {
    const all = CONTEST_SOURCES.flatMap(source => fieldsIn(recordsUrl(source)))
    for (const id of [
      'fldU8X4Gt6VG5IoUU',
      'fldVPOYB6gAQXXd85',
      'fldBoNLMQcbGAnAjh',
      'fldszVSiPdElxMVt7',
    ])
      expect(all).not.toContain(id)
  })

  it('refuses a source config that maps a forbidden field', () => {
    const leaky: ContestSource = {
      ...CONTEST_SOURCES[0],
      fields: { ...CONTEST_SOURCES[0].fields, entrantName: 'fldszVSiPdElxMVt7' },
    }
    expect(() => requestedFieldIds(leaky)).toThrow(/Forbidden/)
    expect(() => recordsUrl(leaky)).toThrow(/Forbidden/)
  })

  it('asks Airtable to key the response by field ID', () => {
    const url = new URL(recordsUrl(CONTEST_SOURCES[0], 'itr123'))
    expect(url.searchParams.get('returnFieldsByFieldId')).toBe('true')
    expect(url.searchParams.get('offset')).toBe('itr123')
  })
})

describe('fetchContestRecords', () => {
  it('follows offsets and sends the token only in the Authorization header', async () => {
    const pages = [
      { records: [{ id: 'recAAAAAAAAAAAAAA', fields: {} }], offset: 'next' },
      { records: [{ id: 'recBBBBBBBBBBBBBB', fields: {} }] },
    ]
    const fetchImpl = jest.fn(
      async () =>
        ({ ok: true, status: 200, json: async () => pages.shift() }) as unknown as Response
    )
    const records = await fetchContestRecords(CONTEST_SOURCES[0], 'secret-token', fetchImpl)
    expect(records.map(record => record.id)).toEqual(['recAAAAAAAAAAAAAA', 'recBBBBBBBBBBBBBB'])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    for (const [url, init] of fetchImpl.mock.calls as unknown as [string, RequestInit][]) {
      expect(url).not.toContain('secret-token')
      expect(init.headers).toEqual({ Authorization: 'Bearer secret-token' })
    }
  })

  it('throws instead of returning a truncated list when pages never end', async () => {
    const fetchImpl = jest.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({
            records: [{ id: 'recAAAAAAAAAAAAAA', fields: {} }],
            offset: 'more',
          }),
        }) as unknown as Response
    )
    await expect(fetchContestRecords(CONTEST_SOURCES[0], 't', fetchImpl)).rejects.toThrow(/pages/)
  })

  it('fails loudly on an HTTP error', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: false, status: 403 }) as unknown as Response)
    await expect(fetchContestRecords(CONTEST_SOURCES[0], 't', fetchImpl)).rejects.toThrow('403')
  })
})

describe('status normalization', () => {
  it.each([
    [null, 'pending'],
    ['납부완료', 'confirmed'],
    ['10만원 납부', 'confirmed'],
    ['고문', 'confirmed'],
    ['불참', 'withdrawn'],
    ['낙선', 'unknown'],
    ['새 선택지', 'unknown'],
  ])('fee %p → %s', (raw, expected) => expect(feeStatus(raw)).toBe(expected))

  it.each([
    [null, 'pending'],
    ['대상', 'awarded'],
    ['입선', 'awarded'],
    ['A. 문체부장관상(대상)', 'awarded'],
    ['G. 입선', 'awarded'],
    ['탈락', 'not_selected'],
    ['낙선', 'not_selected'],
    ['불참', 'withdrawn'],
    ['장려상', 'unknown'],
  ])('result %p → %s', (raw, expected) => expect(resultStatus(raw)).toBe(expected))

  it('reads select objects, arrays and plain text', () => {
    expect(cellText({ id: 'sel1', name: ' 한글서예 ', color: 'blue' })).toBe('한글서예')
    expect(cellText([{ name: '해서' }, { name: '행서' }])).toBe('해서, 행서')
    expect(cellText('')).toBeNull()
    expect(cellText(undefined)).toBeNull()
  })
})

describe('mapContestEntry', () => {
  const source = CONTEST_SOURCES.find(s => s.key === '2025-entries')!
  const f = source.fields

  it('maps only configured fields, normalizes email, and strips sort prefixes', () => {
    const row = mapContestEntry(
      source,
      {
        id: 'recCCCCCCCCCCCCCC',
        createdTime: '2025-04-12T05:38:16.000Z',
        fields: {
          [f.title!]: '春江花月夜',
          [f.division!]: { name: '한문서예' },
          [f.scriptStyle!]: [{ name: '행서' }],
          [f.fee!]: { name: '납부완료' },
          [f.result!]: { name: '특선' },
          [f.entrantName!]: '시험작가',
          [f.entrantNameHanja!]: '試驗作家',
          [f.entrantEmail!]: ' Artist@Example.TEST ',
          [f.contestName!]: { name: '대한민국 동양서예대전 공모전' },
          fldBoNLMQcbGAnAjh: 87.5,
          fldszVSiPdElxMVt7: '어딘가 주소',
        },
      },
      '2026-10-25T00:00:00.000Z'
    )
    expect(row).toEqual({
      source_key: '2025-entries',
      airtable_record_id: 'recCCCCCCCCCCCCCC',
      contest_year: 2025,
      contest_name: '대한민국 동양서예대전 공모전',
      title: '春江花月夜',
      division: '한문서예',
      script_style: '행서',
      fee_status_raw: '납부완료',
      fee_status: 'confirmed',
      result_raw: '특선',
      result_status: 'awarded',
      entrant_name: '시험작가',
      entrant_name_hanja: '試驗作家',
      entrant_email: 'artist@example.test',
      submitted_at: '2025-04-12T05:38:16.000Z',
      synced_at: '2026-10-25T00:00:00.000Z',
    })
    // 심사 점수·주소가 응답에 섞여 와도 행에 들어가지 않는다
    expect(JSON.stringify(row)).not.toMatch(/87\.5|주소/)
    expect(row).not.toHaveProperty('artist_id')
  })

  it('falls back to the source contest name and drops invalid emails', () => {
    const row = mapContestEntry(
      CONTEST_SOURCES.find(s => s.key === '2024-awards')!,
      { id: 'recDDDDDDDDDDDDDD', fields: {} },
      '2026-10-25T00:00:00.000Z'
    )
    expect(row.contest_name).toBe('대한민국 동양서예대전 공모전')
    expect(row.entrant_email).toBeNull()
    expect(row.result_status).toBe('pending')
    expect(
      mapContestEntry(
        source,
        { id: 'recEEEEEEEEEEEEEE', fields: { [f.entrantEmail!]: 'not-an-email' } },
        'x'
      ).entrant_email
    ).toBeNull()
  })
})
