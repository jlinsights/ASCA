import type { ImageProps } from 'next/image'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar, GalleryCard, Lightbox } from '../GalleryPageParts'
import { cardRatio, photoDescription } from '../gallery-photo'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, unoptimized, priority, ...props }: ImageProps) => {
    const React = jest.requireActual<typeof import('react')>('react')
    void priority
    return React.createElement('img', {
      ...props,
      'data-fill': String(fill),
      'data-unoptimized': String(unoptimized),
    })
  },
}))

function photo(id: string, overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id,
    title: `2026년 전시장 풍경 ${id}`,
    description: '예술의전당 전시장 이모저모',
    category: 'sac',
    src: `https://example.test/${id}/web.webp`,
    thumbnail: `https://example.test/${id}/thumb.webp`,
    eventDate: '2026-04-19',
    eventYear: 2026,
    dimensions: { width: 1600, height: 1200, aspectRatio: '1600/1200' },
    tags: [],
    ...overrides,
  } as GalleryItem
}

const frames = ['a', 'b', 'c'].map(id => ({
  id,
  src: `https://example.test/${id}/web.webp`,
  thumbnail: `https://example.test/${id}/thumb.webp`,
  width: 1600,
  height: 1200,
}))

describe('갤러리 카드 — 비슷한 사진 묶음', () => {
  it('묶인 사진 수를 배지와 접근 이름으로 알린다', () => {
    render(
      <GalleryCard
        item={photo('a', { similar: frames })}
        index={0}
        showCategory
        onClick={jest.fn()}
      />
    )
    expect(
      screen.getByRole('button', {
        name: /전시장 풍경 · 2026-04-19 사진 크게 보기 \(비슷한 사진 3장\)/,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('묶음이 없으면 배지가 없다', () => {
    render(<GalleryCard item={photo('a')} index={0} showCategory onClick={jest.fn()} />)
    expect(screen.getByRole('button').getAttribute('aria-label')).not.toMatch(/비슷한 사진/)
  })

  it('분류로 거른 목록에서는 분류 표시를 반복하지 않는다', () => {
    const { rerender } = render(
      <GalleryCard item={photo('a')} index={0} showCategory onClick={jest.fn()} />
    )
    expect(screen.getByText(/🏛️/)).toBeInTheDocument()
    rerender(<GalleryCard item={photo('a')} index={0} showCategory={false} onClick={jest.fn()} />)
    expect(screen.queryByText(/🏛️/)).not.toBeInTheDocument()
  })

  // 회귀: 480px 썸네일을 Next 이미지 최적화가 w=3840 으로 다시 요청했다
  it('Storage 썸네일을 그대로 쓴다', () => {
    render(<GalleryCard item={photo('a')} index={0} showCategory onClick={jest.fn()} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.test/a/thumb.webp')
    expect(img).toHaveAttribute('data-unoptimized', 'true')
  })
})

describe('라이트박스 — 비슷한 사진 넘겨 보기', () => {
  it('필름 띠에서 고른 사진을 크게 보여 준다', async () => {
    const user = userEvent.setup()
    const item = photo('a', { similar: frames })
    render(<Lightbox item={item} items={[item]} onClose={jest.fn()} onNavigate={jest.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/비슷한 사진 1 \/ 3/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '비슷한 사진 3번 보기' }))
    expect(within(dialog).getByText(/비슷한 사진 3 \/ 3/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '비슷한 사진 3번 보기' })).toHaveAttribute(
      'aria-current',
      'true'
    )
    const large = within(dialog)
      .getAllByRole('img')
      .find(img => img.getAttribute('src')?.endsWith('web.webp'))
    expect(large).toHaveAttribute('src', 'https://example.test/c/web.webp')
  })

  it('묶음이 없으면 필름 띠가 없다', () => {
    const item = photo('a')
    render(<Lightbox item={item} items={[item]} onClose={jest.fn()} onNavigate={jest.fn()} />)
    expect(screen.queryByRole('button', { name: /비슷한 사진 \d번 보기/ })).not.toBeInTheDocument()
  })
})

describe('필터 막대 — 건수와 펼쳐 보기', () => {
  const base = {
    availableYears: [2026],
    categories: [],
    year: 'all',
    category: 'all',
    search: '',
  }

  it('묶어 둔 장수를 알리고, 누르면 similar=all 로 펼친다', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <FilterBar
        {...base}
        totalCount={479}
        photoCount={582}
        showAllSimilar={false}
        onChange={onChange}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      '479장 · 연속 촬영한 비슷한 사진 103장은 묶어 두었습니다'
    )
    await user.click(screen.getByRole('button', { name: '비슷한 사진도 모두 보기' }))
    expect(onChange).toHaveBeenCalledWith({ similar: 'all' })
  })

  it('펼친 상태에서는 다시 묶을 수 있다', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(
      <FilterBar {...base} totalCount={582} photoCount={582} showAllSimilar onChange={onChange} />
    )
    expect(screen.getByRole('status')).toHaveTextContent('582장의 사진')
    await user.click(screen.getByRole('button', { name: '비슷한 사진 묶기' }))
    expect(onChange).toHaveBeenCalledWith({ similar: '' })
  })

  it('묶인 사진이 없으면 토글을 보이지 않는다', () => {
    render(
      <FilterBar
        {...base}
        totalCount={12}
        photoCount={12}
        showAllSimilar={false}
        onChange={jest.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /비슷한 사진/ })).not.toBeInTheDocument()
  })
})

describe('사진 표시 도우미', () => {
  it('날짜가 연도 자리에 들어간 설명을 연도로 되돌린다', () => {
    expect(
      photoDescription(photo('a', { description: '2026-04-19년 개막식 및 시상식 현장' }))
    ).toBe('2026년 개막식 및 시상식 현장')
    expect(photoDescription(photo('a', { description: '심사위원회 (2025. 4. 19.)' }))).toBe(
      '심사위원회 (2025. 4. 19.)'
    )
  })

  it('실제 비율을 쓰되 너무 길쭉한 사진은 잘라 맞춘다', () => {
    expect(cardRatio(photo('a'))).toBe(`${1600 / 1200}`)
    expect(
      cardRatio(photo('a', { dimensions: { width: 3000, height: 500, aspectRatio: '' } }))
    ).toBe('1.8')
    expect(
      cardRatio(
        photo('a', {
          dimensions: { width: null, height: null, aspectRatio: '1:1' },
        } as unknown as Partial<GalleryItem>)
      )
    ).toBe('4 / 3')
  })
})
