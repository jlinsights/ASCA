import { readFileSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { Daejeon23HubView } from '../_components/daejeon-23-hub-view'

jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'en' }),
}))

// 감사 2차 P3: '증정 행사 안내 →' 링크가 148×16 으로 터치 대상(44px)보다 작았다
describe('제23회 허브 — 달력 증정 안내 링크', () => {
  it('터치 대상 클래스를 단다', () => {
    render(<Daejeon23HubView calendarOpen />)
    const link = screen.getByRole('link', { name: 'About the calendar gift →' })
    expect(link).toHaveAttribute('href', '/events/calendar-2027')
    expect(link).toHaveClass('asca-apply__note-link')
  })

  it('그 클래스는 높이 44px 이상을 보장한다', () => {
    const css = readFileSync(path.join(process.cwd(), 'components/apply/apply.css'), 'utf8')
    const rule = /\.asca-apply__note-link\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(rule).toMatch(/min-height:\s*44px/)
    expect(rule).toMatch(/display:\s*inline-flex/)
  })
})
