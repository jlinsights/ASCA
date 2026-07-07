/**
 * use-accessibility-settings 동작 테스트 — asca-gallery-cultural-bugfix E-1·E-2
 *
 * E-1: colorScheme 'auto'는 prefers-color-scheme를 반영해야 하고, dark→auto
 * 전환 시 이전 dark 클래스가 잔존하면 안 된다. (fail-first)
 * E-2: 언마운트 시 documentElement 인라인 스타일·클래스가 복원돼야 한다.
 * (fail-first)
 */
import { act, renderHook } from '@testing-library/react'

import { useAccessibilitySettings } from '@/components/cultural/cultural-accessibility/use-accessibility-settings'

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: jest.fn((_: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb)
    }),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  }
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(() => mql),
  })
  return { mql, listeners }
}

describe('useAccessibilitySettings — 전역 스타일 관리 (E-1·E-2)', () => {
  afterEach(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'focus-visible')
    root.removeAttribute('style')
  })

  it('E-1: dark → auto 전환 시 시스템이 라이트면 dark 클래스가 제거된다', () => {
    mockMatchMedia(false) // 시스템 = 라이트
    const { result } = renderHook(() => useAccessibilitySettings({}))

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'auto')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('E-1: auto에서 시스템이 다크면 dark 클래스가 적용된다', () => {
    mockMatchMedia(true) // 시스템 = 다크
    const { result } = renderHook(() => useAccessibilitySettings({}))

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'auto')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('E-2: 언마운트 시 인라인 스타일·focus-visible이 제거되고 dark는 마운트 시점 상태로 복원된다', () => {
    mockMatchMedia(false)
    const root = document.documentElement
    root.classList.remove('dark') // 마운트 전: dark 없음

    const { result, unmount } = renderHook(() =>
      useAccessibilitySettings({ initialSettings: { fontSize: 20, focusVisible: true } })
    )

    expect(root.style.fontSize).toBe('20px')
    expect(root.classList.contains('focus-visible')).toBe(true)

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'dark')
    })
    expect(root.classList.contains('dark')).toBe(true)

    unmount()

    expect(root.style.fontSize).toBe('')
    expect(root.classList.contains('focus-visible')).toBe(false)
    expect(root.classList.contains('dark')).toBe(false) // 마운트 시점 상태(없음) 복원
  })
})
