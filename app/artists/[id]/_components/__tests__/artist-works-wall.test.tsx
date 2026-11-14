import { act, fireEvent, render, screen } from '@testing-library/react'
import { ShareButton, wallImageSizes, workStyles } from '../artist-works-wall'
import type { ArtistWork } from '../artist-works'

const t = (key: string) => key

describe('wallImageSizes', () => {
  it('가로로 긴 작품은 액자 높이 × 비율만큼 넓은 이미지를 요청한다', () => {
    // 3:1 작품 — 데스크톱 액자 높이 440px 이면 1320px 폭
    expect(wallImageSizes(3000, 1000)).toBe(
      '(max-width: 824px) 840px, (max-width: 1294px) 102vw, 1320px'
    )
  })

  it('세로로 긴 족자는 좁은 이미지를 요청한다', () => {
    expect(wallImageSizes(1000, 3000)).toBe(
      '(max-width: 824px) 94px, (max-width: 1294px) 11.33vw, 147px'
    )
  })

  it('크기를 모르면 3:4 로 본다', () => {
    expect(wallImageSizes(null, null)).toBe(
      '(max-width: 824px) 210px, (max-width: 1294px) 25.5vw, 330px'
    )
  })
})

describe('workStyles', () => {
  it('작품 style 값을 중복 없이 모은다', () => {
    const works = [
      { style: '해서' },
      { style: null },
      { style: '해서' },
      { style: '예서' },
    ] as ArtistWork[]
    expect(workStyles(works)).toEqual(['해서', '예서'])
  })
})

describe('ShareButton', () => {
  const originalShare = navigator.share
  const originalClipboard = navigator.clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true })
  })

  async function click() {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'adShare' }))
    })
  }

  it('복사에 실패하면 알린다', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
      configurable: true,
    })
    render(<ShareButton title='민문자' t={t} />)
    await click()
    expect(screen.getByRole('status')).toHaveTextContent('adShareFailed')
  })

  it('복사에 성공하면 알린다', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true,
    })
    render(<ShareButton title='민문자' t={t} />)
    await click()
    expect(screen.getByRole('status')).toHaveTextContent('adShareCopied')
  })

  it('공유 창을 닫으면 아무것도 알리지 않는다', async () => {
    const writeText = jest.fn()
    Object.defineProperty(navigator, 'share', {
      value: () => Promise.reject(new DOMException('cancel', 'AbortError')),
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<ShareButton title='민문자' t={t} />)
    await click()
    expect(writeText).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('공유가 다른 이유로 실패하면 주소 복사로 넘어간다', async () => {
    Object.defineProperty(navigator, 'share', {
      value: () => Promise.reject(new DOMException('nope', 'NotAllowedError')),
      configurable: true,
    })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true,
    })
    render(<ShareButton title='민문자' t={t} />)
    await click()
    expect(screen.getByRole('status')).toHaveTextContent('adShareCopied')
  })
})
