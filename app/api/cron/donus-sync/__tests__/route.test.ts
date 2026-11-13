/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '../route'
import { runDonusSync } from '@/lib/donus/sync'
import { createDonusClient } from '@/lib/donus/client'

jest.mock('@/lib/donus/store', () => ({ createSupabaseLinkStore: jest.fn(() => ({})) }))
jest.mock('@/lib/donus/client', () => ({ createDonusClient: jest.fn(() => ({})) }))
jest.mock('@/lib/donus/sync', () => ({
  ...jest.requireActual('@/lib/donus/sync'),
  runDonusSync: jest.fn(),
}))
jest.mock('@/lib/logging', () => ({ error: jest.fn(), info: jest.fn() }))

const run = runDonusSync as jest.MockedFunction<typeof runDonusSync>
const request = (auth?: string) =>
  new NextRequest('https://orientalcalligraphy.org/api/cron/donus-sync', {
    headers: auth ? { authorization: auth } : {},
  })

const env = process.env
beforeEach(() => {
  process.env = { ...env, CRON_SECRET: 'cron-secret', DONUS_API_KEY: 'k' }
  run.mockReset()
  ;(createDonusClient as jest.Mock).mockClear()
})
afterAll(() => {
  process.env = env
})

describe('GET /api/cron/donus-sync', () => {
  it('rejects a missing or wrong bearer token', async () => {
    expect((await GET(request())).status).toBe(401)
    expect((await GET(request('Bearer nope'))).status).toBe(401)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects everything when CRON_SECRET is not set, even "Bearer undefined"', async () => {
    delete process.env.CRON_SECRET
    expect((await GET(request('Bearer undefined'))).status).toBe(401)
    expect((await GET(request('Bearer '))).status).toBe(401)
  })

  it('skips without calling Donus when the API key is not set', async () => {
    delete process.env.DONUS_API_KEY
    const response = await GET(request('Bearer cron-secret'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ skipped: 'donus_not_configured' })
    expect(createDonusClient).not.toHaveBeenCalled()
  })

  it('runs the sync with the configured since date and dues codes', async () => {
    process.env.DONUS_SYNC_SINCE = '2020-03-01'
    process.env.DONUS_DUES_CODES = 'P1,P2'
    run.mockResolvedValue({ matched: 2 } as Awaited<ReturnType<typeof runDonusSync>>)
    const response = await GET(request('Bearer cron-secret'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, report: { matched: 2 } })
    const options = run.mock.calls[0][0]
    expect(options.since).toBe('2020-03-01')
    expect([...options.duesCodes]).toEqual(['P1', 'P2'])
    expect(options.today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('defaults the since date and returns 502 without details on failure', async () => {
    delete process.env.DONUS_SYNC_SINCE
    run.mockRejectedValue(new Error('Donus /members failed (500) secret detail'))
    const response = await GET(request('Bearer cron-secret'))
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'Donus sync failed' })
    expect(run.mock.calls[0][0].since).toBe('2015-01-01')
  })
})

describe('deployment wiring', () => {
  const read = (file: string) =>
    require('node:fs').readFileSync(require('node:path').join(process.cwd(), file), 'utf8')

  it('schedules the route once a day in vercel.json (Hobby allows daily crons)', () => {
    const crons = JSON.parse(read('vercel.json')).crons as { path: string; schedule: string }[]
    const entry = crons.find(c => c.path === '/api/cron/donus-sync')
    expect(entry?.schedule).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/)
  })

  it('documents every env var the route reads in .env.example', () => {
    const example = read('.env.example')
    const route = read('app/api/cron/donus-sync/route.ts')
    const used = [...new Set([...route.matchAll(/process\.env\.([A-Z_]+)/g)].map(m => m[1]))]
    expect(used.sort()).toEqual([
      'CRON_SECRET',
      'DONUS_API_KEY',
      'DONUS_DUES_CODES',
      'DONUS_SYNC_SINCE',
    ])
    for (const name of used) expect(example).toMatch(new RegExp(`^${name}=`, 'm'))
  })
})
