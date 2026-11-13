/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '../route'
import { runDonusSignups } from '@/lib/donus/signups'
import { createDonusFormsClient } from '@/lib/donus/forms-client'

jest.mock('@/lib/donus/signup-store', () => ({ createSupabaseSignupStore: jest.fn(() => ({})) }))
jest.mock('@/lib/donus/forms-client', () => ({ createDonusFormsClient: jest.fn(() => ({})) }))
jest.mock('@/lib/donus/signups', () => ({ runDonusSignups: jest.fn() }))
jest.mock('@/lib/logging', () => ({ error: jest.fn(), info: jest.fn() }))

const run = runDonusSignups as jest.MockedFunction<typeof runDonusSignups>
const request = (auth?: string) =>
  new NextRequest('https://orientalcalligraphy.org/api/cron/donus-signups', {
    headers: auth ? { authorization: auth } : {},
  })

const env = process.env
beforeEach(() => {
  process.env = {
    ...env,
    CRON_SECRET: 'cron-secret',
    DONUS_FORM_KEY: 'form-key',
    DONUS_SIGNUP_SINCE: '2026-11-20',
  }
  run.mockReset()
  ;(createDonusFormsClient as jest.Mock).mockClear()
})
afterAll(() => {
  process.env = env
})

describe('GET /api/cron/donus-signups', () => {
  it('rejects a missing or wrong bearer token, and everything without CRON_SECRET', async () => {
    expect((await GET(request())).status).toBe(401)
    expect((await GET(request('Bearer nope'))).status).toBe(401)
    delete process.env.CRON_SECRET
    expect((await GET(request('Bearer undefined'))).status).toBe(401)
    expect(run).not.toHaveBeenCalled()
  })

  it.each(['DONUS_FORM_KEY', 'DONUS_SIGNUP_SINCE'])(
    'sends nothing while %s is not set',
    async name => {
      delete process.env[name]
      const response = await GET(request('Bearer cron-secret'))
      expect(await response.json()).toEqual({ skipped: 'donus_signups_not_configured' })
      expect(createDonusFormsClient).not.toHaveBeenCalled()
      expect(run).not.toHaveBeenCalled()
    }
  )

  it('runs with the configured since date and returns counts', async () => {
    run.mockResolvedValue({ submitted: 1 } as Awaited<ReturnType<typeof runDonusSignups>>)
    const response = await GET(request('Bearer cron-secret'))
    expect(await response.json()).toEqual({ ok: true, report: { submitted: 1 } })
    expect(run.mock.calls[0][0].since).toBe('2026-11-20')
    expect((createDonusFormsClient as jest.Mock).mock.calls[0][0].formKey).toBe('form-key')
  })

  it('returns 502 without details on failure', async () => {
    run.mockRejectedValue(new Error('record submissions failed: secret detail'))
    const response = await GET(request('Bearer cron-secret'))
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'Donus signups failed' })
  })
})

describe('deployment wiring', () => {
  const read = (file: string) =>
    require('node:fs').readFileSync(require('node:path').join(process.cwd(), file), 'utf8')

  it('runs daily, before the Donus → site sync so new members link the same night', () => {
    const crons = JSON.parse(read('vercel.json')).crons as { path: string; schedule: string }[]
    const toMinutes = (path: string) => {
      const [m, h] = crons
        .find(c => c.path === path)!
        .schedule.split(' ')
        .map(Number)
      return h * 60 + m
    }
    expect(toMinutes('/api/cron/donus-signups')).toBeLessThan(toMinutes('/api/cron/donus-sync'))
  })

  it('documents every env var the route reads in .env.example', () => {
    const example = read('.env.example')
    const route = read('app/api/cron/donus-signups/route.ts') + read('lib/donus/cron-auth.ts')
    const used = [...new Set([...route.matchAll(/process\.env\.([A-Z_]+)/g)].map(m => m[1]))]
    expect(used.sort()).toEqual(['CRON_SECRET', 'DONUS_FORM_KEY', 'DONUS_SIGNUP_SINCE'])
    for (const name of used) expect(example).toMatch(new RegExp(`^${name}=`, 'm'))
  })
})
