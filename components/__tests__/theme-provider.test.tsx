import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { ClientProviders } from '../client-providers'

jest.mock('@/contexts/language-context', () => ({
  LanguageProvider: ({ children }: { children: ReactNode }) => children,
}))
jest.mock('@/components/auth/session-provider', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}))
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}))

let systemDark = true
let listeners: Set<(event: { matches: boolean }) => void>
beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  systemDark = true
  listeners = new Set()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: jest.fn(() => ({
      get matches() {
        return systemDark
      },
      addListener: (listener: (event: { matches: boolean }) => void) => listeners.add(listener),
      removeListener: (listener: (event: { matches: boolean }) => void) =>
        listeners.delete(listener),
    })),
  })
})

function Controls() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Choose theme</button>
}
const app = () =>
  render(
    <ClientProviders>
      <Controls />
    </ClientProviders>
  )

it('starts light even when the operating system is dark', async () => {
  app()
  await waitFor(() => expect(document.documentElement).toHaveClass('light'))
  expect(document.documentElement).not.toHaveClass('dark')
})

it('migrates an old system preference to light', async () => {
  localStorage.setItem('theme', 'system')
  app()
  await waitFor(() => expect(localStorage.getItem('theme')).toBe('light'))
  expect(document.documentElement).toHaveClass('light')
})

it('retains an explicit dark choice, including across system changes and remounts', async () => {
  localStorage.setItem('theme', 'dark')
  const mounted = app()
  await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
  act(() => {
    systemDark = false
    listeners.forEach(listener => listener({ matches: false }))
  })
  expect(document.documentElement).toHaveClass('dark')
  fireEvent.click(screen.getByRole('button', { name: 'Choose theme' }))
  await waitFor(() => expect(document.documentElement).toHaveClass('light'))
  expect(localStorage.getItem('theme')).toBe('light')
  mounted.unmount()
  app()
  expect(document.documentElement).toHaveClass('light')
})

it('still allows manual changes when browser preference storage is blocked', async () => {
  const read = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage blocked')
  })
  const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage blocked')
  })
  try {
    app()
    await waitFor(() => expect(document.documentElement).toHaveClass('light'))
    fireEvent.click(screen.getByRole('button', { name: 'Choose theme' }))
    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
  } finally {
    read.mockRestore()
    write.mockRestore()
  }
})
