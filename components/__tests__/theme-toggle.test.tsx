import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { useTheme } from 'next-themes'

jest.mock('next-themes', () => ({ useTheme: jest.fn() }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}))

const setTheme = jest.fn()
beforeEach(() => jest.clearAllMocks())

it('switches from the actually rendered dark theme even when the old preference is system', () => {
  jest.mocked(useTheme).mockReturnValue({ theme: 'system', resolvedTheme: 'dark', setTheme } as any)
  render(<ThemeToggle onToggle={() => {}} />)
  fireEvent.click(screen.getByRole('button'))
  expect(setTheme).toHaveBeenCalledWith('light')
})

it.each([
  ['light', 'dark'],
  ['dark', 'light'],
])('switches %s to %s with a native keyboard-operable button', (current, next) => {
  jest.mocked(useTheme).mockReturnValue({ theme: current, resolvedTheme: current, setTheme } as any)
  render(<ThemeToggle onToggle={() => {}} />)
  const button = screen.getByRole('button')
  expect(button).toHaveAccessibleName('siteDarkMode')
  expect(button).toHaveAttribute('aria-pressed', String(current === 'dark'))
  expect(button).toHaveAttribute('type', 'button')
  fireEvent.click(button)
  expect(setTheme).toHaveBeenCalledWith(next)
})
