/** @jest-environment node */
import { renderToString } from 'react-dom/server'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../theme-toggle'

jest.mock('next-themes', () => ({ useTheme: jest.fn() }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}))

it('keeps pre-mount markup identical when the browser restores a saved dark preference', () => {
  const setTheme = jest.fn()
  jest.mocked(useTheme).mockReturnValue({ theme: undefined, setTheme } as any)
  const server = renderToString(<ThemeToggle />)
  jest.mocked(useTheme).mockReturnValue({ theme: 'dark', resolvedTheme: 'dark', setTheme } as any)
  const beforeMount = renderToString(<ThemeToggle />)
  expect(beforeMount).toBe(server)
})
