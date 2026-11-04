import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { NoticeRow } from '@/lib/notices/notice-view'
import { NoticeArchive } from '../_components/notice-archive'
import { NOTICE_COPY } from '../_components/notice-copy'
import { NoticeShare } from '../_components/notice-share'
import { NoticeView } from '../_components/notice-view'

let language = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ language, t: (key: string) => key }),
}))
const replace = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: () => '/notice',
  useRouter: () => ({ replace }),
}))

afterEach(() => {
  language = 'ko'
  replace.mockClear()
})

function row(overrides: Partial<NoticeRow>): NoticeRow {
  return {
    id: 'n',
    title: '공지',
    summary: '',
    category: 'announcement',
    pinned: false,
    published: '2026-10-23',
    year: 2026,
    monthDay: '10.23',
    period: null,
    phase: null,
    place: '',
    ...overrides,
  }
}

const ROWS: NoticeRow[] = [
  row({
    id: 'tour',
    title: '대만 서예 문화 기행',
    summary: '대만의 서예 유적을 둘러보는 기행입니다.',
    category: 'event',
    pinned: true,
    period: { start: '2027-04-07', end: '2027-04-11' },
    phase: 'upcoming',
    place: '대만 타이베이',
  }),
  row({
    id: 'office',
    title: '사무국 휴무 안내',
    published: '2025-12-24',
    year: 2025,
    monthDay: '12.24',
  }),
  row({
    id: 'exam',
    title: '정기 총회 개최',
    category: 'event',
    published: '2021-03-02',
    year: 2021,
    monthDay: '03.02',
  }),
]

describe('공지 장부', () => {
  it('해마다 묶고, 공지가 있는 분류만 칩으로 보인다', () => {
    render(<NoticeArchive rows={ROWS} />)
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2021' })).toBeInTheDocument()
    const chips = within(screen.getByRole('group', { name: '공지 분류' })).getAllByRole('button')
    expect(chips.map(chip => chip.textContent)).toEqual(['전체3', '공지1', '행사2'])
  })

  it('분류를 누르면 거르고 주소에 남긴다', () => {
    render(<NoticeArchive rows={ROWS} />)
    fireEvent.click(screen.getByRole('button', { name: /행사/ }))
    expect(screen.queryByText('사무국 휴무 안내')).not.toBeInTheDocument()
    expect(screen.getByText('3건 가운데 2건')).toBeInTheDocument()
    expect(replace).toHaveBeenLastCalledWith('/notice?category=event#archive', { scroll: false })
  })

  it('주소의 분류·검색어로 첫 화면부터 거르고, 모르는 분류는 무시한다', () => {
    const { unmount } = render(
      <NoticeArchive rows={ROWS} initialCategory='event' initialQuery='총회' />
    )
    expect(screen.getByText('정기 총회 개최')).toBeInTheDocument()
    expect(screen.queryByText('대만 서예 문화 기행')).not.toBeInTheDocument()
    unmount()
    render(<NoticeArchive rows={ROWS} initialCategory='exhibition' />)
    expect(screen.getByText('3건')).toBeInTheDocument()
  })

  it('맞는 공지가 없으면 조건을 지울 수 있다', () => {
    render(<NoticeArchive rows={ROWS} initialQuery='없는말' />)
    expect(screen.getByText('조건에 맞는 공지가 없습니다.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '조건 지우기' }))
    expect(screen.getByText('3건')).toBeInTheDocument()
    expect(replace).toHaveBeenLastCalledWith('/notice#archive', { scroll: false })
  })

  it('예정 공지에는 기간과 상태를, 공지 제목에는 한국어 표시를 단다', () => {
    render(<NoticeArchive rows={ROWS} />)
    const link = screen.getByRole('link', { name: /대만 서예 문화 기행/ })
    expect(link).toHaveAttribute('href', '/notice/tour')
    expect(within(link).getByText('예정')).toBeInTheDocument()
    expect(link).toHaveTextContent('2027년 4월 7일(수) – 4월 11일(일) · 대만 타이베이')
    expect(within(link).getByText('대만 서예 문화 기행')).toHaveAttribute('lang', 'ko')
  })
})

describe('공지 화면', () => {
  it('고정 공지를 맨 위 띠에 따로 세운다', () => {
    render(<NoticeView rows={ROWS} />)
    const pinned = screen.getByRole('region', { name: '고정 공지' })
    expect(within(pinned).getAllByRole('listitem')).toHaveLength(1)
    expect(within(pinned).getByRole('link', { name: '대만 서예 문화 기행' })).toBeInTheDocument()
  })

  it('다른 언어에서는 화면 틀을 번역하고 공지 원문은 그대로 둔다', () => {
    language = 'en'
    render(<NoticeView rows={ROWS} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Notices' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Event/ })).toBeInTheDocument()
    expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0)
    expect(screen.getAllByText('대만 서예 문화 기행').length).toBeGreaterThan(0)
  })
})

describe('공유', () => {
  it('주소를 복사하고 결과를 화면 안 문장으로 알린다', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<NoticeShare title='공지' labels={NOTICE_COPY.ko.detail} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '주소 복사' })))
    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(screen.getByRole('status')).toHaveTextContent('공지 주소를 복사했습니다.')
  })

  it('복사하지 못하면 직접 복사하라고 알린다', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error()) } })
    render(<NoticeShare title='공지' labels={NOTICE_COPY.ko.detail} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '주소 복사' })))
    expect(screen.getByRole('status')).toHaveTextContent('주소를 복사하지 못했습니다.')
  })
})

describe('공지 문구', () => {
  const keysOf = (value: unknown, prefix = ''): string[] =>
    value && typeof value === 'object'
      ? Object.entries(value).flatMap(([key, child]) => keysOf(child, `${prefix}${key}.`))
      : [prefix]

  it('네 언어가 같은 항목을 빠짐없이 갖는다', () => {
    const ko = keysOf(NOTICE_COPY.ko).sort()
    for (const lang of ['en', 'ja', 'zh'] as const) {
      expect(keysOf(NOTICE_COPY[lang]).sort()).toEqual(ko)
    }
  })

  it('빈 문구가 없다', () => {
    for (const copy of Object.values(NOTICE_COPY)) {
      const strings = JSON.stringify(copy, (_key, value) =>
        typeof value === 'function' ? String(value('1', '2')) : value
      )
      expect(strings).not.toContain('""')
    }
  })
})
