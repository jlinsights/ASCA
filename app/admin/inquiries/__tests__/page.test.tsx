import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminInquiriesPage from '../page'

type Reply = { ok: boolean; json: () => Promise<unknown> }
const pending = new Map<string, (reply: Reply) => void>()

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
  pending.clear()
  // jsdom 에는 fetch 가 없다 — 상태별 요청을 붙잡아 두고 순서를 바꿔 끝낸다
  Object.defineProperty(global, 'fetch', {
    configurable: true,
    writable: true,
    value: jest.fn(
      (url: string) =>
        new Promise<Reply>(resolve =>
          pending.set(new URL(url, 'http://x').searchParams.get('status') ?? '', resolve)
        )
    ),
  })
})

const reply = (status: string, items: unknown[]) =>
  act(async () =>
    pending.get(status)?.({ ok: true, json: async () => ({ data: items, limit: 200 }) })
  )

it('이전 탭의 늦은 응답이 현재 탭 목록을 덮지 않는다 (Codex #216)', async () => {
  const user = userEvent.setup()
  render(<AdminInquiriesPage />)
  await user.click(screen.getByRole('tab', { name: '답함' }))

  await reply('answered', [inquiry('답한사람', 'answered')])
  await reply('new', [inquiry('새사람', 'new')])

  expect(screen.getByRole('tab', { name: '답함' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('heading', { name: /답한사람/ })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /새사람/ })).not.toBeInTheDocument()
})
