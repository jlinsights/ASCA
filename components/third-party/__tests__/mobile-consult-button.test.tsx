import { fireEvent, render, screen } from '@testing-library/react'
import { MobileConsultButton } from '../mobile-consult-button'

interface CalStubWindow extends Window {
  Cal?: { ns?: Record<string, unknown> }
}

let openSpy: jest.SpyInstance

beforeEach(() => {
  openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  openSpy.mockRestore()
  delete (window as CalStubWindow).Cal
})

describe('MobileConsultButton', () => {
  it('embed.js 가 차단돼 Cal 네임스페이스만 있을 때도 예약 페이지를 새 탭으로 연다', () => {
    // 인라인 스니펫은 embed.js 도착 전에 Cal.ns.meeting 을 만든다 — 로드 신호가 아니다
    ;(window as CalStubWindow).Cal = { ns: { meeting: () => undefined } }
    render(<MobileConsultButton />)

    fireEvent.click(screen.getByRole('button', { name: '상담 예약' }))

    expect(openSpy).toHaveBeenCalledWith(
      'https://cal.com/orientalcalligraphy',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('embed.js 가 로드돼 cal-modal-box 가 등록돼 있으면 Cal API 로 예약 창을 열고 새 탭은 열지 않는다', () => {
    if (!customElements.get('cal-modal-box')) {
      customElements.define('cal-modal-box', class extends HTMLElement {})
    }
    const meeting = jest.fn()
    ;(window as CalStubWindow).Cal = { ns: { meeting } }
    render(<MobileConsultButton />)

    fireEvent.click(screen.getByRole('button', { name: '상담 예약' }))

    expect(meeting).toHaveBeenCalledWith('modal', {
      calLink: 'orientalcalligraphy',
      config: { layout: 'month_view' },
    })
    expect(openSpy).not.toHaveBeenCalled()
  })
})
