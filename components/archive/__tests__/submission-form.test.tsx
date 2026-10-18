import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SubmissionForm } from '../submission-form'
import { archiveTranslations } from '@/lib/i18n/translations/archive'
import type { Submission } from '@/lib/archive/submission'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      require('@/lib/i18n/translations/archive').archiveTranslations.ko[key] || key,
  }),
}))
const artist = { id: 'c497df6b-4907-4fb0-811b-eedfa050fb77', name: 'Test artist' }
const t = archiveTranslations.ko
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:test-image')
  URL.revokeObjectURL = jest.fn()
  global.fetch = jest.fn()
})
it('requires login or a linked profile before showing a form', () => {
  const { rerender } = render(<SubmissionForm artists={[]} access='login' />)
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    '/sign-in?redirect_url=%2Farchive%2Fsubmit'
  )
  rerender(<SubmissionForm artists={[]} access='unclaimed' />)
  expect(screen.getByText(t.arClaimHint!)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it('does not send incomplete forms and points back to required fields', () => {
  render(<SubmissionForm artists={[artist]} access='ready' />)
  fireEvent.click(screen.getByText(t.arSaveDraft!))
  expect(screen.getByRole('alert')).toHaveTextContent(t.arRequired!)
  expect(fetch).not.toHaveBeenCalled()
})
it('submits a review request and clearly keeps it private', async () => {
  jest.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'saved', status: 'pending_review' }),
  } as Response)
  const { container } = render(<SubmissionForm artists={[artist]} access='ready' />)
  fireEvent.change(screen.getByLabelText(`${t.arPhotos} *`), {
    target: { files: [new File(['test'], 'test.png', { type: 'image/png' })] },
  })
  fireEvent.click(screen.getByText(`2. ${t.arInfoStep}`))
  for (const [name, value] of Object.entries({
    title: '작품',
    style: '해서',
    width: '35',
    height: '135',
    year: '2024',
    materials: '먹',
  }))
    fireEvent.change(container.querySelector(`[name="${name}"]`)!, { target: { value } })
  fireEvent.click(screen.getByText(`4. ${t.arRecordStep}`))
  fireEvent.click(screen.getByText(t.arRequestReview!))
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(t.arSavedReview!))
  const body = jest.mocked(fetch).mock.calls[0]?.[1]?.body as FormData
  expect(JSON.parse(String(body.get('data')))).toMatchObject({
    artistId: artist.id,
    status: 'pending_review',
  })
  expect(screen.getByRole('status')).toHaveTextContent(t.arSavedHint!)
  expect(screen.queryByText(t.arRequestReview!)).not.toBeInTheDocument()
})

const draft = {
  id: artist.id,
  updatedAt: '2026-10-18T00:00:00Z',
  values: {
    artistId: artist.id,
    title: '기존 작품',
    titleHanja: '',
    titleEn: '',
    style: '해서',
    width: 35,
    height: 135,
    year: 2024,
    materials: '먹',
    transcription: '',
    interpretation: '',
    interpretationEn: '',
    source: '',
    seal: '',
    recordTitle: '',
    organizer: '',
    contestRef: '',
    status: 'draft',
  } as Submission,
}
it('resumes a draft without uploading photos or creating another artwork', async () => {
  jest.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ id: artist.id, status: 'draft' }),
  } as Response)
  const { container } = render(<SubmissionForm artists={[artist]} access='ready' draft={draft} />)
  expect(container.querySelector('[name="title"]')).toHaveValue('기존 작품')
  expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument()
  fireEvent.change(container.querySelector('[name="title"]')!, { target: { value: '수정 작품' } })
  fireEvent.click(screen.getByText(t.arSaveDraft!))
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(t.arSavedDraft!))
  const [url, options] = jest.mocked(fetch).mock.calls[0]!
  expect(url).toBe(`/api/archive/drafts/${artist.id}`)
  expect(options?.method).toBe('PATCH')
  const payload = JSON.parse(options?.body as string)
  expect(payload).toMatchObject({ title: '수정 작품', expectedUpdatedAt: draft.updatedAt })
  expect(payload).not.toHaveProperty('artistId')
  expect(payload).not.toHaveProperty('recordTitle')
})
it('retains entered values after a stale draft conflict', async () => {
  jest
    .mocked(fetch)
    .mockResolvedValue({ ok: false, json: async () => ({ code: 'CONFLICT' }) } as Response)
  const { container } = render(<SubmissionForm artists={[artist]} access='ready' draft={draft} />)
  fireEvent.change(container.querySelector('[name="title"]')!, { target: { value: '유지할 입력' } })
  fireEvent.click(screen.getByText(t.arSaveDraft!))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(t.arDraftConflict!))
  expect(container.querySelector('[name="title"]')).toHaveValue('유지할 입력')
})
