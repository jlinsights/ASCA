/** @jest-environment node */
import { archiveIdentity } from '@/lib/archive/writer'
import { listHiddenThreads } from '@/lib/community/feed'
import { GET } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveIdentity: jest.fn(), archiveWriter: jest.fn() }))
jest.mock('@/lib/community/feed', () => ({ listHiddenThreads: jest.fn() }))

const identity = jest.mocked(archiveIdentity)
const list = jest.mocked(listHiddenThreads)

beforeEach(() => {
  jest.clearAllMocks()
  identity.mockResolvedValue({ userId: '22222222-2222-4222-8222-222222222222', admin: true } as any)
})

describe('GET /api/admin/community/threads', () => {
  it('401/403 without an MFA admin — never reads hidden threads', async () => {
    identity.mockResolvedValueOnce(null)
    expect((await GET()).status).toBe(401)
    identity.mockResolvedValueOnce({ userId: 'member', admin: false } as any)
    expect((await GET()).status).toBe(403)
    expect(list).not.toHaveBeenCalled()
  })

  it('returns hidden threads privately, never cached', async () => {
    list.mockResolvedValueOnce({ threads: [{ id: 't1' }] as any, total: 1 })
    const response = await GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('vary')).toBe('Cookie')
    expect(await response.json()).toEqual({ data: { threads: [{ id: 't1' }], total: 1 } })
  })

  it('answers 500 without details when the list fails', async () => {
    list.mockRejectedValueOnce(new Error('db down: secret detail'))
    const response = await GET()
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('secret')
  })
})
