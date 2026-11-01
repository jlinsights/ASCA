import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminInquiriesPage from '../page'

type Reply = { ok: boolean; json: () => Promise<unknown> }
let calls: string[]
let pending: Map<string, (reply: Reply) => void>

const inquiry = (name: string, status: string) => ({
  id: `${name}-id`,
  topic: 'other',
  name,
  email: 'visitor@example.test',
  phone: null,
  subject: null,
  plan: null,
  message: '문의',
  language: 'ko',
  status,
  staff_note: null,
  handled_at: null,
  created_at: '2026-11-01T00:00:00Z',
})

beforeEach(() => {
  calls = []
  pending = new Map()
  // jsdom 에는 fetch 가 없다 — 요청을 주소별로 붙잡아 두고 순서를 바꿔 끝낸다
  Object.defineProperty(global, 'fetch', {
    configurable: true,
    writable: true,
    value: jest.fn((url: string) => {
      calls.push(url)
      return new Promise<Reply>(resolve => pending.set(url, resolve))
    }),
  })
})

const list = (status: string, page = 1) => `/api/admin/inquiries?status=${status}&page=${page}`
const reply = (url: string, data: unknown[], total = data.length) =>
  act(async () =>
    pending.get(url)?.({ ok: true, json: async () => ({ data, page: 1, pageSize: 50, total }) })
  )

it('이전 탭의 늦은 응답이 현재 탭 목록을 덮지 않는다 (Codex #216)', async () => {
  const user = userEvent.setup()
  render(<AdminInquiriesPage />)
  await user.click(screen.getByRole('tab', { name: '답함' }))

  await reply(list('answered'), [inquiry('답한사람', 'answered')])
  await reply(list('new'), [inquiry('새사람', 'new')])

  expect(screen.getByRole('tab', { name: '답함' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('heading', { name: /답한사람/ })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /새사람/ })).not.toBeInTheDocument()
})

it('처리 도중 탭을 옮기면 처리 뒤 새로고침은 지금 탭으로 한다 (Codex #216)', async () => {
  const user = userEvent.setup()
  render(<AdminInquiriesPage />)
  await reply(list('new'), [inquiry('새사람', 'new')])

  await user.click(screen.getByRole('button', { name: '종결으로' }))
  await user.click(screen.getByRole('tab', { name: '답함' }))
  await reply(list('answered'), [inquiry('답한사람', 'answered')])
  await act(async () =>
    pending.get('/api/admin/inquiries/새사람-id')?.({ ok: true, json: async () => ({ ok: true }) })
  )

  const refresh = calls.at(-1)
  expect(refresh).toBe(list('answered'))
  await reply(list('answered'), [inquiry('답한사람', 'answered')])
  expect(screen.getByRole('heading', { name: /답한사람/ })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /새사람/ })).not.toBeInTheDocument()
})

it('한 쪽을 넘는 문의는 쪽을 넘겨 오래된 것까지 본다', async () => {
  const user = userEvent.setup()
  render(<AdminInquiriesPage />)
  await reply(list('new'), [inquiry('최근', 'new')], 120)

  expect(screen.getByText('1 / 3쪽')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '이전 쪽' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: '다음 쪽' }))
  expect(calls.at(-1)).toBe(list('new', 2))
})

it('다른 문의를 처리해도 처리 중인 문의의 잠금이 풀리지 않는다 (Codex #216)', async () => {
  const user = userEvent.setup()
  render(<AdminInquiriesPage />)
  await reply(list('new'), [inquiry('가', 'new'), inquiry('나', 'new')])

  const card = (name: string) => screen.getByRole('article', { name: new RegExp(`· ${name}$`) })
  const close = (name: string) => within(card(name)).getByRole('button', { name: '종결으로' })

  await user.click(close('가'))
  await user.click(close('나'))

  expect(close('가')).toBeDisabled()
  expect(close('나')).toBeDisabled()
  expect(calls.filter(url => url === '/api/admin/inquiries/가-id')).toHaveLength(1)
})
