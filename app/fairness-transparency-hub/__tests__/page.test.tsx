import { render, screen, within } from '@testing-library/react'
import FairnessTransparencyHubPage from '../page'
import { JUDGING_STEPS, SECTIONS } from '@/components/fairness/fairness-content'
import { EMAIL } from '@/lib/content/contact-info'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

describe('공정·투명성 허브', () => {
  test('목차 링크마다 같은 id 의 절이 있다', () => {
    const { container } = render(<FairnessTransparencyHubPage />)
    const toc = screen.getByRole('navigation', { name: '공정·투명성 허브 목차' })
    const links = within(toc).getAllByRole('link')
    expect(links.map(link => link.getAttribute('href'))).toEqual(
      SECTIONS.map(section => `#${section.id}`)
    )
    for (const section of SECTIONS) {
      expect(container.querySelector(`section#${section.id}`)).not.toBeNull()
    }
  })

  test('심사 흐름 줄의 단계마다 설명이 있다', () => {
    const { container } = render(<FairnessTransparencyHubPage />)
    const rail = screen.getByRole('list', { name: '심사 단계 순서' })
    expect(within(rail).getAllByRole('link')).toHaveLength(JUDGING_STEPS.length)
    for (const step of JUDGING_STEPS) {
      expect(container.querySelector(`li#${step.id} h3`)?.textContent).toBe(step.title)
    }
  })

  test('이메일 접수는 협회 주소로, 필수 기재사항을 본문에 채워 연다', () => {
    render(<FairnessTransparencyHubPage />)
    const mail = screen.getByRole('link', { name: /이메일로 접수/ })
    const href = mail.getAttribute('href') ?? ''
    expect(href.startsWith(`mailto:${EMAIL}?subject=`)).toBe(true)
    expect(decodeURIComponent(href)).toContain('이의제기 사유 및 근거')
  })

  test('규정 원문으로 이어진다', () => {
    render(<FairnessTransparencyHubPage />)
    expect(screen.getByRole('link', { name: /이의제기 처리 규정 원문/ })).toHaveAttribute(
      'href',
      '/regulations/objections'
    )
  })
})
