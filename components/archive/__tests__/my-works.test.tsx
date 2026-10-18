import { render, screen } from '@testing-library/react'
import { MyWorks } from '../my-works'
import { archiveTranslations } from '@/lib/i18n/translations/archive'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      require('@/lib/i18n/translations/archive').archiveTranslations.ko[key] || key,
  }),
}))
const t = archiveTranslations.ko
it('offers resume only for drafts and preserves pagination', () => {
  render(
    <MyWorks
      page={2}
      total={60}
      works={['draft', 'pending_review', 'published'].map(status => ({
        id: status,
        title: status,
        status,
        artists: { name: '작가' },
      }))}
    />
  )
  expect(screen.getAllByText(t.arEditDraft!)).toHaveLength(1)
  expect(screen.getByText(t.arEditDraft!).closest('a')).toHaveAttribute('href', '/archive/my/draft')
  expect(screen.getByText(t.arPrev!).closest('a')).toHaveAttribute('href', '/archive/my?page=1')
  expect(screen.getByText(t.arNext!).closest('a')).toHaveAttribute('href', '/archive/my?page=3')
})
it('explains an empty workspace and links to registration', () => {
  render(<MyWorks works={[]} page={1} total={0} />)
  expect(screen.getByRole('status')).toHaveTextContent(t.arMyEmpty!)
  expect(screen.getByText(t.arSubmit!).closest('a')).toHaveAttribute('href', '/archive/submit')
})

it('shows the private correction reason alongside a returned draft', () => {
  render(
    <MyWorks
      page={1}
      total={1}
      works={[
        {
          id: 'draft',
          title: '작품',
          status: 'draft',
          artists: { name: '작가' },
          feedback: '석문을 확인해 주세요',
        },
      ]}
    />
  )
  expect(screen.getByText(/석문을 확인해 주세요/)).toBeInTheDocument()
  expect(screen.getByText(t.arEditDraft!)).toBeInTheDocument()
})
