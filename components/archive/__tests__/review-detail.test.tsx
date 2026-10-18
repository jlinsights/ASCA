import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReviewDetail } from '../review-detail'
import { archiveTranslations } from '@/lib/i18n/translations/archive'
const push = jest.fn(),
  refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      require('@/lib/i18n/translations/archive').archiveTranslations.ko[key] || key,
  }),
}))
const id = 'c497df6b-4907-4fb0-811b-eedfa050fb77'
const work = {
  id,
  artist_id: id,
  title: '검토 작품',
  title_en: null,
  title_hanja: null,
  style: '해서',
  transcription: '석문',
  interpretation: null,
  interpretation_en: null,
  source_text: null,
  seal_description: null,
  width_cm: 35,
  height_cm: 135,
  materials: ['먹'],
  year_created: 2026,
  status: 'pending_review',
  updated_at: '2026-10-18T00:00:00Z',
  artists: { name: '작가', visibility: 'public' },
}
const t = archiveTranslations.ko
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => id })
})
it('requires confirmation and a reason before returning a work', async () => {
  render(<ReviewDetail work={work} previews={[]} history={[]} />)
  expect(screen.getByText(t.arReviewReturn!)).toBeDisabled()
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByText(t.arReviewReturn!))
  expect(screen.getByRole('alert')).toHaveTextContent(t.arReviewReasonRequired!)
  expect(fetch).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '석문을 확인해 주세요' } })
  jest
    .mocked(fetch)
    .mockResolvedValue({ ok: true, json: async () => ({ state: 'completed' }) } as Response)
  fireEvent.click(screen.getByText(t.arReviewReturn!))
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/archive/reviews'))
  const body = JSON.parse(jest.mocked(fetch).mock.calls[0]?.[1]?.body as string)
  expect(body).toMatchObject({ action: 'return', reason: '석문을 확인해 주세요', operationId: id })
})
it('retries with the same operation ID and preserves the note after failure', async () => {
  jest
    .mocked(fetch)
    .mockResolvedValue({ ok: false, json: async () => ({ code: 'REVIEW_FAILED' }) } as Response)
  render(<ReviewDetail work={work} previews={[]} history={[]} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '확인 완료' } })
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(screen.getByText(t.arReviewPublish!))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(t.arReviewFailed!))
  expect(screen.getByRole('textbox')).toHaveValue('확인 완료')
  expect(screen.getByRole('textbox')).toBeDisabled()
  fireEvent.click(screen.getByText(t.arReviewPublish!))
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  const ids = jest
    .mocked(fetch)
    .mock.calls.map(([, options]) => JSON.parse(options?.body as string).operationId)
  expect(ids).toEqual([id, id])
})
it('cannot approve a work belonging to a nonpublic artist', () => {
  render(
    <ReviewDetail
      work={{ ...work, artists: { name: '작가', visibility: 'hidden' } }}
      previews={[]}
      history={[]}
    />
  )
  fireEvent.click(screen.getByRole('checkbox'))
  expect(screen.getByText(t.arReviewPublish!)).toBeDisabled()
})
