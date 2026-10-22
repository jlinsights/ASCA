import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ArtistCv } from '../artist-cv'
import { archiveTranslations } from '@/lib/i18n/translations/archive'
import type { Artist, RecordEntry } from '@/lib/archive/queries'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    language: 'ko',
    t: (key: string) =>
      require('@/lib/i18n/translations/archive').archiveTranslations.ko[key] || key,
  }),
}))
const artist: Artist = {
  id: 'artist',
  name: '작가',
  name_en: null,
  name_ja: null,
  name_zh: null,
  art_name_ko: '청운',
  art_name_hanja: '靑雲',
  calligraphy_styles: ['해서'],
  teacher_name: null,
  branch_name: null,
  certification_grade: null,
  certified_at: null,
  archive_bio: null,
  archive_bio_en: null,
  profile_image_path: null,
}
const entry: RecordEntry = {
  id: 'award',
  artist_id: 'artist',
  artwork_id: null,
  record_type: 'award',
  title: '협회 수상',
  organizer: '협회',
  year: 2025,
  award_level: null,
  is_asca_verified: true,
  source: 'asca_archive',
}
const records = [
  entry,
  {
    ...entry,
    id: 'show',
    record_type: 'exhibition',
    title: '개인전',
    year: 2026,
    is_asca_verified: false,
    source: 'self_reported',
  },
]
const t = archiveTranslations.ko
beforeEach(() => {
  window.print = jest.fn()
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
})
it('groups public career by year and separates verification from provenance', () => {
  render(<ArtistCv artist={artist} records={records} complete />)
  expect(screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual([
    '2026',
    '2025',
  ])
  expect(screen.getByText(/靑雲/)).toBeInTheDocument()
  expect(screen.getByText(new RegExp(t.axSourceSelf!))).toHaveTextContent(t.arUnverified!)
  fireEvent.click(screen.getByRole('checkbox'))
  expect(screen.queryByText('개인전')).not.toBeInTheDocument()
  expect(screen.getByText('협회 수상')).toBeInTheDocument()
})
it('filters the document by record type and invokes browser printing after fonts load', async () => {
  render(<ArtistCv artist={artist} records={records} complete />)
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'exhibition' } })
  expect(screen.queryByText('협회 수상')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: t.axPrint! }))
  await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1))
})
it('does not offer a silently incomplete PDF', () => {
  render(<ArtistCv artist={artist} records={records} complete={false} />)
  expect(screen.getByRole('button', { name: t.axPrint! })).toBeDisabled()
  expect(screen.getByRole('alert')).toHaveTextContent(t.axIncomplete!)
})
