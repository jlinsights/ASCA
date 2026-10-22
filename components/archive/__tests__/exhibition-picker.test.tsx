import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExhibitionPicker } from '../exhibition-picker'
import { archiveTranslations } from '@/lib/i18n/translations/archive'
const refresh = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    metadata: { locale: 'ko-KR' },
    t: (key: string) =>
      require('@/lib/i18n/translations/archive').archiveTranslations.ko[key] || key,
  }),
}))
const t = archiveTranslations.ko
const exhibition = { id: 'exhibition', title: '전시', is_published: true }
const work = {
  id: 'work',
  title: '기존 작품',
  artist: '작가',
  status: 'published',
  isPublic: true,
  linked: false,
}
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})
it('links the original artwork ID without resending artwork metadata', async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: true } as Response)
  render(
    <ExhibitionPicker
      exhibition={exhibition}
      works={[work]}
      page={1}
      total={1}
      q=''
      linked={false}
    />
  )
  fireEvent.click(screen.getByText(t.axLinkWork!))
  await waitFor(() => expect(refresh).toHaveBeenCalled())
  const [url, options] = jest.mocked(fetch).mock.calls[0]!
  expect(url).toBe('/api/admin/archive/exhibitions/exhibition')
  expect(JSON.parse(options?.body as string)).toEqual({ artworkId: 'work', link: true })
})
it('keeps the search and selection visible when saving fails', async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: false } as Response)
  render(
    <ExhibitionPicker
      exhibition={exhibition}
      works={[work]}
      page={1}
      total={1}
      q='검색어'
      linked={false}
    />
  )
  fireEvent.click(screen.getByText(t.axLinkWork!))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(t.arSaveFailed!))
  expect(screen.getByRole('textbox')).toHaveValue('검색어')
  expect(screen.getByText('기존 작품')).toBeInTheDocument()
})
it('can remove links to sources which have become private', async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: true } as Response)
  render(
    <ExhibitionPicker
      exhibition={exhibition}
      works={[{ ...work, linked: true, isPublic: false }]}
      page={1}
      total={1}
      q=''
      linked
    />
  )
  expect(screen.getByText(t.axWorkHidden!)).toBeInTheDocument()
  fireEvent.click(screen.getByText(t.axUnlinkWork!))
  await waitFor(() => expect(refresh).toHaveBeenCalled())
  expect(JSON.parse(jest.mocked(fetch).mock.calls[0]?.[1]?.body as string)).toEqual({
    artworkId: 'work',
    link: false,
  })
})
