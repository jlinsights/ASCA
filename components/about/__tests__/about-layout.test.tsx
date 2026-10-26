import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/contexts/language-context'
import { AboutPage } from '../about-layout'
import { AboutMarquee } from '../about-marquee'
import { AboutMotion } from '../about-motion'
import { AboutNav } from '../about-nav'
import { MissionTabs } from '@/app/mission/_components/mission-tabs'

jest.mock('next/navigation', () => ({ usePathname: () => '/mission' }))

afterEach(() => {
  window.localStorage.clear()
})

describe('소개 묶음 목차', () => {
  it('헤더 소개 메뉴의 여덟 쪽을 차례로 싣고 지금 쪽을 표시한다', async () => {
    render(
      <LanguageProvider>
        <AboutNav />
      </LanguageProvider>
    )
    const nav = await screen.findByRole('navigation', { name: '소개' })
    const links = within(nav).getAllByRole('link')
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/introductions',
      '/greetings',
      '/mission',
      '/history',
      '/board-members',
      '/business-plan',
      '/partners',
      '/brand',
    ])
    expect(within(nav).getByRole('link', { name: /사명/ })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: /인사말씀/ })).not.toHaveAttribute('aria-current')
  })
})

describe('사명 — 본문 언어', () => {
  it('English 를 누르면 세 장이 모두 영어로 바뀐다', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <AboutPage>
          <MissionTabs />
        </AboutPage>
      </LanguageProvider>
    )
    expect(screen.getByRole('heading', { name: '핵심 가치' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /통합과 혁신/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Core Values' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Key Objectives' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Integration & Innovation/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '핵심 가치' })).toBeNull()
  })
})

describe('이름 띠', () => {
  it('끊김 없이 두 번 싣되 띠 전체를 화면 읽기에서 빼고, 멈춤 단추를 둔다', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <AboutMarquee names={['예술의전당', '국립중앙박물관']} label='이름 띠' />
    )
    const track = container.querySelector('.ab-marquee__track')
    expect(track).toHaveAttribute('aria-hidden', 'true')
    expect(track?.querySelectorAll('li')).toHaveLength(4)

    const toggle = screen.getByRole('button', { name: '이름 띠 멈추기' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: '이름 띠 다시 흐르기' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(container.querySelector('.ab-marquee')).toHaveAttribute('data-paused', 'true')
  })
})

describe('나타남', () => {
  const setReducedMotion = (reduce: boolean) => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: reduce }) as never
  }
  const observe = jest.fn()
  beforeEach(() => {
    observe.mockClear()
    window.IntersectionObserver = jest.fn(() => ({
      observe,
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as never
  })

  it('움직임 줄이기를 켜면 숨기지 않는다', () => {
    setReducedMotion(true)
    const { container } = render(
      <AboutPage>
        <p data-reveal>본문</p>
        <AboutMotion />
      </AboutPage>
    )
    expect(container.querySelector('.ab')).not.toHaveAttribute('data-motion')
    expect(observe).not.toHaveBeenCalled()
  })

  it('켜져 있으면 행을 지켜보고, 나중에 그려진 행도 마저 지켜본다', async () => {
    setReducedMotion(false)
    const { container, rerender } = render(
      <AboutPage>
        <p data-reveal>첫 행</p>
        <AboutMotion />
      </AboutPage>
    )
    expect(container.querySelector('.ab')).toHaveAttribute('data-motion', 'on')
    expect(observe).toHaveBeenCalledTimes(1)

    rerender(
      <AboutPage>
        <p data-reveal>첫 행</p>
        <p data-reveal>새 행</p>
        <AboutMotion />
      </AboutPage>
    )
    await new Promise(resolve => setTimeout(resolve, 0))
    const watched = observe.mock.calls.map(([el]) => (el as HTMLElement).textContent)
    expect(watched).toContain('새 행')
  })
})
