/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { archiveWriter } from '@/lib/archive/writer'
import { checkOrigin } from '@/lib/security/origin-check'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { auditTrail } from '@/lib/audit/audit-trail'
import { GET, PATCH } from '../route'

jest.mock('server-only', () => ({}))
jest.mock('@/lib/archive/writer', () => ({ archiveWriter: jest.fn() }))
jest.mock('@/lib/security/origin-check', () => ({ checkOrigin: jest.fn() }))
jest.mock('@/lib/audit/audit-trail', () => ({ auditTrail: { trackDataChange: jest.fn() } }))
jest.mock('@/lib/security/rate-limit', () => ({
  rateLimit: () => ({ check: async () => null }),
}))

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const accountId = '11111111-1111-4111-8111-111111111111'
const account = { id: accountId, role: 'member', artistIds: [id] }
const row = {
  id,
  name: '작가',
  name_en: 'Artist',
  bio: '소개',
  bio_en: 'Biography',
  birth_year: 1970,
  specialties: ['해서'],
  profile_image: null,
  visibility: 'hidden',
  claimed_by_user_id: accountId,
  dues_status: '자격 정지',
  membership_type: '준회원',
}
let query: Record<string, jest.Mock>
beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getAccount).mockResolvedValue(account as any)
  jest.mocked(checkOrigin).mockReturnValue({ ok: true })
  query = {}
  for (const method of ['from', 'select', 'eq', 'update']) query[method] = jest.fn(() => query)
  query.maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null })
  query.rpc = jest.fn().mockResolvedValue({ data: 'revision-1', error: null })
  jest.mocked(archiveWriter).mockReturnValue(query as any)
})
const context = (value = id) => ({ params: Promise.resolve({ id: value }) })
const read = () => GET(new NextRequest(`https://asca.example/api/profile/artists/${id}`), context())
const patch = (body: unknown, value = id) =>
  PATCH(
    new NextRequest(`https://asca.example/api/profile/artists/${value}`, {
      method: 'PATCH',
      headers: { origin: 'https://asca.example' },
      body: JSON.stringify(body),
    }),
    context(value)
  )

it('rejects a bad Origin before authentication or service-role access', async () => {
  jest.mocked(checkOrigin).mockReturnValue({ ok: false })
  expect((await patch({ bio: 'new' })).status).toBe(403)
  expect(getAccount).not.toHaveBeenCalled()
  expect(archiveWriter).not.toHaveBeenCalled()
})

it.each(['GET', 'PATCH'])('requires a native account for %s', async method => {
  jest.mocked(getAccount).mockResolvedValue(null)
  expect((await (method === 'GET' ? read() : patch({ bio: 'new' }))).status).toBe(401)
  expect(archiveWriter).not.toHaveBeenCalled()
})

it.each(['member', 'admin'])('requires artistIds ownership even for %s', async role => {
  jest.mocked(getAccount).mockResolvedValue({ ...account, role, artistIds: [] } as any)
  expect((await patch({ bio: 'new' })).status).toBe(403)
  expect((await read()).status).toBe(403)
  expect(archiveWriter).not.toHaveBeenCalled()
})

it('maps only supported camelCase fields and scopes the write to the current owner', async () => {
  const response = await patch({
    nameEn: ' New name ',
    bio: '새 소개',
    bioEn: null,
    birthYear: null,
    specialization: ['행서'],
  })
  expect(response.status).toBe(200)
  // 쓰기는 소유권 확인·이력 기록을 함께 하는 DB 함수로만 — 직접 update 하지 않는다
  expect(query.update).not.toHaveBeenCalled()
  expect(query.rpc).toHaveBeenCalledWith('apply_artist_profile_edit', {
    p_artist: id,
    p_account: accountId,
    p_patch: {
      name_en: 'New name',
      bio: '새 소개',
      bio_en: null,
      birth_year: null,
      specialties: ['행서'],
    },
  })
  expect(query.eq).toHaveBeenCalledWith('id', id)
  expect(query.eq).toHaveBeenCalledWith('claimed_by_user_id', accountId)
  expect(query.select).not.toHaveBeenCalledWith('*')
  expect(auditTrail.trackDataChange).toHaveBeenCalledWith(
    accountId,
    'update',
    'artist_profile',
    id,
    undefined,
    {
      fields: ['name_en', 'bio', 'bio_en', 'birth_year', 'specialties'],
      revisionId: 'revision-1',
    }
  )
  expect(JSON.stringify(jest.mocked(auditTrail.trackDataChange).mock.calls)).not.toContain(
    '새 소개'
  )
})

it('reads the owned hidden artist with a safe response projection and private caching', async () => {
  const response = await read()
  const result = await response.json()
  expect(response.status).toBe(200)
  expect(result.data).toMatchObject({
    id,
    nameEn: 'Artist',
    bioEn: 'Biography',
    birthYear: 1970,
    specialization: ['해서'],
    visibility: 'hidden',
  })
  for (const key of ['dues_status', 'claimed_by_user_id', 'membership_type'])
    expect(result.data).not.toHaveProperty(key)
  expect(query.eq).toHaveBeenCalledWith('claimed_by_user_id', accountId)
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  expect(response.headers.get('Vary')).toBe('Cookie')
  expect(auditTrail.trackDataChange).not.toHaveBeenCalled()
})

it.each([
  'name',
  'membership_type',
  'membershipType',
  'visibility',
  'isPublic',
  'dues_status',
  'duesStatus',
  'claimed_by_user_id',
  'claimedByUserId',
  'id',
  'role',
  'updated_at',
  'socialLinks',
  'email',
  'phone',
  'location',
  'yearsActive',
  'bio_en',
])('rejects the unsupported or protected field %s without opening the writer', async key => {
  expect((await patch({ bio: 'new', [key]: 'unauthorized' })).status).toBe(400)
  expect(archiveWriter).not.toHaveBeenCalled()
})

it.each([
  {},
  null,
  [],
  { name: '' },
  { bio: 'x'.repeat(10001) },
  { birthYear: '1970' },
  { specialization: [''] },
])('rejects invalid profile input', async body => {
  expect((await patch(body)).status).toBe(400)
  expect(archiveWriter).not.toHaveBeenCalled()
})

it('rejects malformed artist IDs', async () => {
  expect((await patch({ bio: 'new' }, 'not-an-id')).status).toBe(400)
  expect(archiveWriter).not.toHaveBeenCalled()
})

it('does not report success if ownership was revoked before the write', async () => {
  query.rpc.mockResolvedValueOnce({ data: null, error: { code: 'P0002' } })
  expect((await patch({ bio: 'new' })).status).toBe(404)
  expect(auditTrail.trackDataChange).not.toHaveBeenCalled()
  query.maybeSingle.mockResolvedValue({ data: null, error: null })
  expect((await patch({ bio: 'new' })).status).toBe(404)
})

it('returns a generic failure when the edit function fails', async () => {
  query.rpc.mockResolvedValueOnce({ data: null, error: { code: 'XX000', message: 'secret' } })
  const response = await patch({ bio: 'new' })
  expect(response.status).toBe(500)
  expect(JSON.stringify(await response.json())).not.toContain('secret')
})

it('returns a generic failure without exposing database errors', async () => {
  query.maybeSingle.mockResolvedValue({ data: null, error: { message: 'private database detail' } })
  const response = await patch({ bio: 'new' })
  expect(response.status).toBe(500)
  expect(JSON.stringify(await response.json())).not.toContain('private database detail')
})

it('preserves auth service failures as 503 without writer access', async () => {
  jest.mocked(getAccount).mockRejectedValueOnce(new AccountAuthError('AUTH_UNAVAILABLE', 503))
  expect((await read()).status).toBe(503)
  expect(archiveWriter).not.toHaveBeenCalled()
})
