/**
 * use-virtual-exhibition 동작 테스트 — asca-gallery-cultural-bugfix D-2·D-3
 *
 * D-3: audio.play() Promise 거부(자동재생 정책) 시 audioEnabled가 true로
 * 어긋나지 않아야 한다. (fail-first)
 * D-2: isFullscreen은 fullscreenchange 이벤트(document.fullscreenElement)
 * 기준으로 동기화돼야 한다. (fail-first)
 */
import { act, renderHook, waitFor } from '@testing-library/react'

import { useVirtualExhibition } from '@/components/cultural/virtual-exhibition/use-virtual-exhibition'
import type { Exhibition } from '@/components/cultural/virtual-exhibition/types'

const exhibition: Exhibition = {
  id: 'ex-1',
  title: 'Test Exhibition',
  description: 'desc',
  curator: 'ASCA',
  theme: 'Tradition',
  period: '2026',
  artworks: [],
  galleryLayout: { width: 1000, height: 600, style: 'traditional' },
  ambiance: { lighting: 'warm', music: false, soundscape: '/audio/bg.mp3' },
}

describe('useVirtualExhibition — 상태 동기화 (D-2·D-3)', () => {
  it('D-3: play()가 거부되면 audioEnabled는 false를 유지한다', async () => {
    const { result } = renderHook(() => useVirtualExhibition({ exhibition }))

    const audioEl = document.createElement('audio')
    audioEl.play = jest.fn(() => Promise.reject(new DOMException('NotAllowedError')))
    audioEl.pause = jest.fn()
    act(() => {
      ;(result.current.audioRef as React.MutableRefObject<HTMLAudioElement | null>).current =
        audioEl
    })

    await act(async () => {
      result.current.toggleAudio()
    })

    await waitFor(() => expect(result.current.audioEnabled).toBe(false))
  })

  it('D-3: play() 성공 시에만 audioEnabled가 true가 된다', async () => {
    const { result } = renderHook(() => useVirtualExhibition({ exhibition }))

    const audioEl = document.createElement('audio')
    audioEl.play = jest.fn(() => Promise.resolve())
    audioEl.pause = jest.fn()
    act(() => {
      ;(result.current.audioRef as React.MutableRefObject<HTMLAudioElement | null>).current =
        audioEl
    })

    await act(async () => {
      result.current.toggleAudio()
    })
    await waitFor(() => expect(result.current.audioEnabled).toBe(true))

    act(() => {
      result.current.toggleAudio()
    })
    expect(result.current.audioEnabled).toBe(false)
    expect(audioEl.pause).toHaveBeenCalled()
  })

  it('D-2: fullscreenchange 이벤트가 document.fullscreenElement 기준으로 isFullscreen을 동기화한다', () => {
    const { result } = renderHook(() => useVirtualExhibition({ exhibition }))

    expect(result.current.isFullscreen).toBe(false)

    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.createElement('div'),
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    expect(result.current.isFullscreen).toBe(true)

    act(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      })
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    expect(result.current.isFullscreen).toBe(false)
  })
})
