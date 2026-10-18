const upsert = jest.fn()
const single = jest.fn()
const select = jest.fn(() => ({ single }))
const from = jest.fn(() => ({ upsert }))
jest.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from }) }))
jest.mock('airtable', () =>
  jest.fn().mockImplementation(() => ({
    base: () => () => ({
      select: () => ({
        all: async () => [
          {
            id: 'rec1',
            fields: { name: '작가', email: 'private@example.com', visibility: 'hidden' },
          },
        ],
      }),
    }),
  }))
)
import { SyncEngine } from '../sync-engine'

describe('artist sync writes', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service'
    process.env.AIRTABLE_API_KEY = 'key'
    process.env.AIRTABLE_BASE_ID = 'base'
    jest.clearAllMocks()
    single.mockResolvedValue({ data: { id: 'artist-id' }, error: null })
    upsert.mockImplementation(data =>
      'artist_id' in data ? Promise.resolve({ error: null }) : { select }
    )
  })
  it('upserts by Airtable identity and writes contacts only to the private table', async () => {
    await new SyncEngine().syncTableData('Artists')
    expect(upsert).toHaveBeenCalledWith(
      { name: '작가', airtable_id: 'rec1' },
      { onConflict: 'airtable_id' }
    )
    expect(from).toHaveBeenCalledWith('artist_contacts')
    expect(upsert).toHaveBeenCalledWith(
      { artist_id: 'artist-id', email: 'private@example.com' },
      { onConflict: 'artist_id' }
    )
  })
  it('propagates contact failures so the caller can retry instead of reporting success', async () => {
    upsert.mockImplementation(data =>
      'artist_id' in data ? Promise.resolve({ error: new Error('contact failure') }) : { select }
    )
    await expect(new SyncEngine().syncTableData('Artists')).rejects.toThrow('contact failure')
  })
  it('preserves legacy non-artist failure isolation while reporting artist failures', async () => {
    const engine = new SyncEngine()
    // Non-artist paths have no upsert transport in this mock and used to be ignored.
    await expect(engine.syncTableData('Artworks')).resolves.toBeUndefined()
    single.mockResolvedValue({ data: null, error: new Error('artist write failed') })
    await expect(engine.syncTableData('Artists')).rejects.toThrow('artist write failed')
  })
})
