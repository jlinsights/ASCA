/**
 * Accessibility options share the user's explicit site theme. Old 'auto' means light.
 * Font/focus cleanup must never undo a manual theme choice.
 */
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { ThemeProvider } from '@/components/theme-provider'

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
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'focus-visible')
    root.removeAttribute('style')
  })

  it('legacy auto explicitly returns to light even when the operating system is dark', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useAccessibilitySettings({}), { wrapper })

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.updateAccessibilitySetting('colorScheme', 'auto')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('starts light on a dark operating system and follows the shared manual theme', () => {
    mockMatchMedia(true) // 시스템 = 다크
    const { result } = renderHook(
      () => ({ settings: useAccessibilitySettings({}), theme: useTheme() }),
      { wrapper }
    )
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    act(() => {
      result.current.theme.setTheme('dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(result.current.settings.accessibilitySettings.colorScheme).toBe('dark')
    act(() => result.current.settings.updateAccessibilitySetting('fontSize', 20))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('cleans up page-local styles while retaining a chosen dark theme on unmount', () => {
    mockMatchMedia(false)
    const root = document.documentElement
    root.classList.remove('dark') // 마운트 전: dark 없음

    const { result, unmount } = renderHook(
      () => useAccessibilitySettings({ initialSettings: { fontSize: 20, focusVisible: true } }),
      { wrapper }
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
    expect(root.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
