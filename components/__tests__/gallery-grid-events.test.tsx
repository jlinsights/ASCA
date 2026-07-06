/**
 * GalleryGrid onEvent 배선 테스트 — asca-gallery-cultural-bugfix C-2
 *
 * GalleryClient가 넘기는 onEvent 콜백이 이미지 열기·공유 인터랙션에서 실제로
 * 발행되는지 검증한다 (기존에는 prop만 받고 미호출 → 트래킹 무음 단절).
 */
import { fireEvent, render, screen } from '@testing-library/react'

import GalleryGrid from '@/components/gallery/GalleryGrid'
import type { GalleryCategory, GalleryItem } from '@/lib/types/gallery/gallery-legacy'

// jsdom에는 레이아웃이 없어 VirtuosoGrid 가상화가 아이템을 렌더하지 않음 — 전체 렌더 스텁
jest.mock('react-virtuoso', () => ({
  VirtuosoGrid: ({ totalCount, itemContent }: any) => (
    <div data-testid='virtuoso-stub'>
      {Array.from({ length: totalCount }, (_, i) => (
        <div key={i}>{itemContent(i)}</div>
      ))}
    </div>
  ),
}))

// 공유 모달은 본 테스트 관심 밖 — 렌더 차단
jest.mock('@/components/gallery/SocialShare', () => ({
  __esModule: true,
  default: () => null,
}))

const item: GalleryItem = {
  id: 'g1',
  title: '난정서',
  description: '행서 대표작',
  category: 'calligraphy',
  src: '/img/g1.jpg',
  thumbnail: '/img/g1-thumb.jpg',
  originalSize: 1000,
  modifiedTime: '2026-01-01',
  eventYear: 2026,
  tags: ['행서'],
}

const categories: GalleryCategory[] = [
  { id: 'calligraphy', name: '서예', icon: '🖌️', count: 1 } as GalleryCategory,
]

describe('GalleryGrid — onEvent 배선 (C-2)', () => {
  it('전체화면(이미지 열기) 클릭 시 gallery:image_open 이벤트가 발행된다', () => {
    const onEvent = jest.fn()
    render(<GalleryGrid items={[item]} categories={categories} onEvent={onEvent} />)

    fireEvent.click(screen.getByRole('button', { name: '전체화면 보기' }))

    expect(onEvent).toHaveBeenCalledWith({
      type: 'gallery:image_open',
      payload: { itemId: 'g1', category: 'calligraphy' },
    })
  })

  it('공유 클릭 시 gallery:share 이벤트가 발행된다', () => {
    const onEvent = jest.fn()
    render(<GalleryGrid items={[item]} categories={categories} onEvent={onEvent} />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(onEvent).toHaveBeenCalledWith({
      type: 'gallery:share',
      payload: { itemId: 'g1', category: 'calligraphy' },
    })
  })

  it('onEvent 미제공 시에도 인터랙션이 정상 동작한다', () => {
    render(<GalleryGrid items={[item]} categories={categories} />)
    expect(() => fireEvent.click(screen.getByRole('button', { name: '공유하기' }))).not.toThrow()
  })
})
