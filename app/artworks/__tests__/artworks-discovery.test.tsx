import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArtworksClient } from '../artworks-client'
import type { ImageProps } from 'next/image'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: ImageProps) => {
    const React = jest.requireActual<typeof import('react')>('react')
    return React.createElement('img', { ...props, 'data-fill': String(fill) })
  },
}))

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/components/ui/toaster', () => ({ Toaster: () => null }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language: 'ko', t: (key: string) => key }),
}))

const fetchMock = jest.fn()
const originalFetch = global.fetch
const artworks = [
  {
    id: '1',
    title: '산수',
    artist: { name: '김작가' },
    description: '산과 물',
    materials: ['먹'],
    category: 'painting',
    style: 'traditional',
    availability: 'available',
    orientation: 'landscape',
    year: 2025,
    image_url: '/images/artworks/calligraphy-scene-1.jpg',
  },
  {
    id: '2',
    title: '묵향',
    artist: { name: '박작가' },
    description: '붓과 먹',
    materials: ['종이'],
    category: 'calligraphy',
    style: 'modern',
    availability: 'sold',
    orientation: 'portrait',
    year: 2024,
    image_url: '/images/artworks/calligraphy-scene-2.jpg',
  },
]

beforeEach(() => {
  fetchMock.mockReset()
  global.fetch = fetchMock
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('Artworks discovery states', () => {
  it('검색·구매 가능 조건과 개별 해제 후 결과 수 및 상세 링크가 일치한다', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ artworks }) })
    const user = userEvent.setup()
    render(<ArtworksClient />)
    await screen.findByRole('link', { name: '작품 보기: 산수' })
    expect(screen.getByRole('img', { name: '산수' })).toHaveAttribute('data-fill', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('작품 2점')
    await user.click(screen.getByRole('checkbox', { name: '구매 가능한 작품만' }))
    expect(screen.getByRole('status')).toHaveTextContent('작품 1점')
    expect(screen.queryByRole('link', { name: '작품 보기: 묵향' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '조건 해제: 구매 가능한 작품만' }))
    expect(screen.getByRole('status')).toHaveTextContent('작품 2점')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  산수  ' } })
    expect(screen.getByRole('link', { name: '작품 보기: 산수' })).toHaveAttribute(
      'href',
      '/artworks/1'
    )
    expect(screen.getByRole('status')).toHaveTextContent('작품 1점')
  })

  it('조회 실패 후 재시도는 검색어를 유지하고 빈 결과는 초기화로 복구한다', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ artworks }) })
    const user = userEvent.setup()
    render(<ArtworksClient />)
    await screen.findByRole('alert')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '없는작품' } })
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('조건에 맞는 결과가 없습니다')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('없는작품')
    await user.click(screen.getAllByRole('button', { name: '전체 초기화' }).at(-1)!)
    expect(screen.getByRole('link', { name: '작품 보기: 산수' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
