import { fireEvent, render, screen, within } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import type { Exhibition } from '@/lib/types/cms-legacy'
import CurrentPage from '../current/page'
import UpcomingPage from '../upcoming/page'
import PastPage from '../past/page'
import OnlinePage from '../online/page'
import ExhibitionsPage from '../page'
import { ExhibitionCard } from '../_components/exhibition-card'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }
  ) => {
    const { fill: _fill, priority: _priority, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />
  },
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))

const mockGetExhibitions = jest.fn()
jest.mock('@/lib/supabase/cms', () => ({
  getExhibitions: (...args: unknown[]) => mockGetExhibitions(...args),
}))

// 다른 언어 화면에 남은 한글. 한국어로 쓰였다고 밝힌 요소(lang="ko")는 뺀다.
function hangulLeft(container: HTMLElement): string[] {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[lang="ko"]').forEach(n => n.remove())
  return (clone.textContent ?? '').match(/[가-힣][^<]{0,15}/g) ?? []
}

function renderIn(lang: string, ui: React.ReactElement) {
  window.localStorage.setItem('asca-language', lang)
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

beforeEach(() => {
  mockGetExhibitions.mockResolvedValue({ data: [], totalPages: 1 })
})

afterEach(() => {
  window.localStorage.clear()
})

describe('전시 하위 페이지 — 실제 연혁 기록만 보여 준다', () => {
  // 회귀: 하위 페이지들이 연혁에 없는 예시 전시(가상 큐레이터·관람객 수)를 실제처럼 보여 줬다.
  it.each([
    ['current', CurrentPage],
    ['upcoming', UpcomingPage],
    ['past', PastPage],
    ['online', OnlinePage],
  ])('%s: 예시 전시가 없다', async (_name, Page) => {
    const { container } = renderIn('ko', <Page />)
    await screen.findByRole('heading', { level: 1 })
    for (const fake of [
      '김서예',
      '이한글',
      'VR 서예 체험관',
      '디지털 서예관',
      '2023 동양서예협회 정기전',
      '서예와 문학의 만남',
      '관람 예약',
    ]) {
      expect(container.textContent).not.toContain(fake)
    }
  })

  it('past: 실제 전시 기록이 최신순으로 나온다', async () => {
    renderIn('ko', <PastPage />)
    expect(
      await screen.findByText('서경(書境) 새로운 지평 - 동양서예의 현재와 미래')
    ).toBeInTheDocument()
    expect(screen.getByText('第22回 大韓民國 東洋書藝大展')).toBeInTheDocument()
  })

  it('current: 진행 중인 전시가 없으면 지난 전시·연혁으로 안내한다', async () => {
    renderIn('en', <CurrentPage />)
    expect(await screen.findByText('No exhibitions are on right now.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Past exhibitions' })).toHaveAttribute(
      'href',
      '/exhibitions/past'
    )
  })

  it('online: 인터넷 전시로 열린 2020년 회차', async () => {
    renderIn('en', <OnlinePage />)
    expect(await screen.findByText('第17回 大韓民國 東洋書藝大展')).toBeInTheDocument()
    expect(screen.getByText(/held online due to COVID-19/)).toBeInTheDocument()
  })
})

describe('전시 페이지 — 번역', () => {
  it.each([
    ['current', CurrentPage],
    ['upcoming', UpcomingPage],
    ['past', PastPage],
    ['online', OnlinePage],
  ])('%s: en/ja/zh 화면에 한글이 없다', async (_name, Page) => {
    for (const lang of ['en', 'ja', 'zh']) {
      const { container, unmount } = renderIn(lang, <Page />)
      await screen.findByRole('heading', { level: 1 })
      await screen.findByText(/./, { selector: 'h1' })
      expect(container.textContent?.length).toBeGreaterThan(50)
      expect(hangulLeft(container)).toStrictEqual([])
      unmount()
      window.localStorage.clear()
    }
  })

  // 회귀: 목록 페이지가 비어 있는 exhibitions 테이블을 읽어 "전시가 없습니다"만 보였다.
  it('목록 페이지: 연혁의 전 회차를 보여 주고 DB 를 읽지 않는다', async () => {
    const { container } = renderIn('en', <ExhibitionsPage />)
    expect(await screen.findByText('第22回 大韓民國 東洋書藝大展')).toBeInTheDocument()
    expect(screen.queryByText('No exhibitions found')).not.toBeInTheDocument()
    expect(mockGetExhibitions).not.toHaveBeenCalled()
    expect(hangulLeft(container)).toStrictEqual([])
  })

  it('전시 카드(en): 상태·큐레이터·날짜·인원이 번역된다', async () => {
    const exhibition = {
      id: 'x1',
      title: 'Sample',
      description: 'd',
      status: 'current',
      start_date: '2026-10-01',
      end_date: '2026-10-20',
      venue: 'Hall',
      curator: 'Kim',
      max_capacity: 30,
      is_featured: true,
      views: 3,
    } as unknown as Exhibition
    const { container } = renderIn('en', <ExhibitionCard exhibition={exhibition} />)
    expect(await screen.findByText('Ongoing')).toBeInTheDocument()
    expect(screen.getByText('Curator: Kim')).toBeInTheDocument()
    expect(screen.getByText(/October 1, 2026/)).toBeInTheDocument()
    expect(screen.getByText('30 people')).toBeInTheDocument()
    expect(hangulLeft(container)).toStrictEqual([])
  })
})

describe('전시 홍보 상담·광고와 전시 탐색', () => {
  it.each([CurrentPage, UpcomingPage, PastPage])(
    '실제 광고와 구분한 목업·광고 영역과 전시비 전용 안내가 있다',
    Page => {
      renderIn('ko', <Page />)
      const preview = screen.getByRole('region', { name: '이렇게 전시를 소개합니다' })
      expect(within(preview).getAllByText('가상 전시 · 홍보 예시')).toHaveLength(3)
      expect(
        within(preview).getByText(/현재 의뢰받은 유료 전시 홍보는 없습니다/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/홍보·광고 수입은 매년 열리는 전시의 운영비로 전액 사용/)
      ).toBeInTheDocument()
      expect(screen.getAllByText('광고 게재 예시 · 실제 광고 아님')).toHaveLength(2)
      const contact = screen.getByRole('link', { name: '사무국에 상담하기' })
      const target = new URL(contact.getAttribute('href')!, 'https://orientalcalligraphy.org')
      expect(target.pathname).toBe('/contact')
      expect(target.hash).toBe('#inquiry')
      expect(target.searchParams.get('topic')).toBe('exhibition')
      expect(target.searchParams.get('about')).toContain('홍보')
      expect(screen.getAllByRole('link', { name: '업체 광고 문의' })[0]).toHaveAttribute(
        'href',
        expect.stringContaining('topic=other')
      )
    }
  )

  it('검색·외부 전시 필터와 초기화가 실제 목록에만 적용된다', () => {
    renderIn('ko', <PastPage />)
    fireEvent.change(screen.getByRole('searchbox', { name: '전시 검색' }), {
      target: { value: '존재하지않는검색어' },
    })
    expect(screen.getByText('조건에 맞는 전시가 없습니다.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '검색 조건 초기화' }))
    expect(screen.getByText('第22回 大韓民國 東洋書藝大展')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: '전시 구분' }), {
      target: { value: 'external' },
    })
    expect(screen.getByText('조건에 맞는 전시가 없습니다.')).toBeInTheDocument()
    expect(screen.getByText('먹의 산책')).toBeInTheDocument()
  })
})
