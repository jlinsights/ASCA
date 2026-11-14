/** @jest-environment node */
import { TIME_BUDGET_USED } from '../client'
import { createDonusFormsClient, NAME_MAX_BYTES, truncateUtf8 } from '../forms-client'

const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response

function setup(response: Response | (() => Promise<Response>), opts: { deadline?: number } = {}) {
  const fetchImpl = jest.fn(async (..._args: unknown[]) =>
    typeof response === 'function' ? response() : response
  )
  const sleep = jest.fn(async () => {})
  let t = 1000
  const client = createDonusFormsClient({
    formKey: 'secret-form-key',
    fetchImpl: fetchImpl as unknown as typeof fetch,
    sleep,
    now: () => t,
    deadline: opts.deadline,
  })
  return { client, fetchImpl, sleep, tick: (ms: number) => (t += ms) }
}

describe('createDonusFormsClient', () => {
  it('posts one member with only name and email, never consent fields', async () => {
    const { client, fetchImpl } = setup(ok({ members: [{ memberIdx: 7, isNew: true }] }))
    const result = await client.submitMember({ name: '홍길동', email: 'a@x.org' })
    expect(result).toEqual({ memberIdx: 7, isNew: true })
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://cloud.donus.org/api/forms/v0/submit/members/secret-form-key')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      updateOnMatch: false,
      members: [{ name: '홍길동', email: 'a@x.org' }],
    })
    expect(client.callCount()).toBe(1)
  })

  it('rejects an empty form key', () => {
    expect(() => createDonusFormsClient({ formKey: '  ' })).toThrow('DONUS_FORM_KEY is empty')
  })

  it('never puts the form key in an error', async () => {
    const { client } = setup(async () => {
      throw new TypeError('fetch failed for https://.../secret-form-key')
    })
    const err = await client.submitMember({ name: 'a', email: 'a@x.org' }).catch(e => e)
    expect(err.message).toBe('Donus form submit unreachable')
    expect(err.message).not.toContain('secret-form-key')
  })

  it('reports a timeout by name (DOMException is not an Error)', async () => {
    const { client } = setup(async () => {
      throw Object.assign(Object.create(null), { name: 'TimeoutError' })
    })
    await expect(client.submitMember({ name: 'a', email: 'a@x.org' })).rejects.toThrow(
      'Donus form submit timed out'
    )
  })

  it('keeps the status and Donus reason on an error response', async () => {
    const { client } = setup({
      ok: false,
      status: 400,
      json: async () => ({ status: 'error', message: 'name required' }),
    } as unknown as Response)
    await expect(client.submitMember({ name: 'a', email: 'a@x.org' })).rejects.toMatchObject({
      message: 'Donus form submit failed (400) name required',
      status: 400,
    })
  })

  it.each([
    [{}],
    [{ members: [] }],
    [
      {
        members: [
          { memberIdx: 1, isNew: true },
          { memberIdx: 2, isNew: true },
        ],
      },
    ],
    [{ members: [{ memberIdx: '1', isNew: true }] }],
    [{ members: [{ memberIdx: 0, isNew: true }] }],
    [{ members: [{ memberIdx: 1.5, isNew: true }] }],
    [{ members: [{ memberIdx: 1 }] }],
  ])('refuses an unexpected 200 body %j', async body => {
    const { client } = setup(ok(body))
    await expect(client.submitMember({ name: 'a', email: 'a@x.org' })).rejects.toThrow(
      'unexpected shape'
    )
  })

  it('waits between calls and stops sending once the deadline passes', async () => {
    const { client, sleep, fetchImpl, tick } = setup(
      ok({ members: [{ memberIdx: 1, isNew: false }] }),
      { deadline: 1100 }
    )
    await client.submitMember({ name: 'a', email: 'a@x.org' })
    await client.submitMember({ name: 'b', email: 'b@x.org' })
    expect(sleep).toHaveBeenCalledWith(250)
    tick(200)
    await expect(client.submitMember({ name: 'c', email: 'c@x.org' })).rejects.toThrow(
      TIME_BUDGET_USED
    )
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})

describe('truncateUtf8', () => {
  it('keeps short names and cuts long Korean names on whole characters', () => {
    expect(truncateUtf8('홍길동', NAME_MAX_BYTES)).toBe('홍길동')
    const long = '가'.repeat(40) // 120 bytes
    const cut = truncateUtf8(long, NAME_MAX_BYTES)
    expect(cut).toBe('가'.repeat(33))
    expect(new TextEncoder().encode(cut).length).toBeLessThanOrEqual(NAME_MAX_BYTES)
    expect(truncateUtf8('ab😀', 5)).toBe('ab')
  })
})
