import { fireEvent, render, screen, within } from '@testing-library/react'
import EventsPage from '../page'
import type { Event } from '@/lib/types/cms-legacy'

const listPublishedEvents = jest.fn()
const replace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/events',
}))
jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
let mockLanguage: 'ko' | 'en' | 'ja' | 'zh' = 'ko'
jest.mock('@/contexts/language-context', () => {
  // 실제 언어별 표로 찾는다 — 키가 빠지면 키 이름이 그대로 나와 테스트가 잡는다
  const { translations } = jest.requireActual('@/lib/i18n/translations')
  return {
    useLanguage: () => ({
      language: mockLanguage,
      t: (key: string) => translations[mockLanguage][key] || key,
    }),
  }
})
jest.mock('@/lib/events/events-data', () => ({
  listPublishedEvents: () => listPublishedEvents(),
}))
jest.mock('@/lib/events/event-view', () => ({
  ...jest.requireActual('@/lib/events/event-view'),
  todayKst: () => '2026-10-25',
}))

function makeEvent(id: string, title: string, date: string, type: Event['event_type']): Event {
  return {
    id,
    title,
    description: `${title} 설명`,
    event_date: `${date}T00:00:00+09:00`,
    location: `${title} 장소`,
    organizer: '가상 주최',
    event_type: type,
    status: 'completed', // 일부러 낡은 값 — 화면은 날짜로 판단해야 한다
    is_featured: false,
    is_published: true,
    views: 0,
    current_participants: 0,
    registration_required: false,
    created_at: '',
    updated_at: '',
  }
}

const EVENTS = [
  makeEvent('future', '가상 문화 기행', '2027-04-07', 'other'),
  makeEvent('a', '가상 이사회', '2026-02-13', 'meeting'),
  makeEvent('b', '가상 개인전', '2025-10-03', 'exhibition'),
  makeEvent('c', '가상 회원전', '2025-07-13', 'exhibition'),
]

const renderPage = async (search: Record<string, string> = {}) =>
  render(await EventsPage({ searchParams: Promise.resolve(search) }))

describe('행사 목록', () => {
  beforeEach(() => {
    mockLanguage = 'ko'
    listPublishedEvents.mockResolvedValue(EVENTS)
    replace.mockReset()
  })

  it('다가오는 행사와 지난 행사를 날짜로 나눈다', async () => {
    await renderPage()
    const upcoming = screen.getByRole('region', { name: '곧 열리는 행사' })
    expect(within(upcoming).getByRole('link', { name: '가상 문화 기행' })).toBeInTheDocument()
    const archive = screen.getByRole('region', { name: /년부터의 기록/ })
    expect(within(archive).queryByText('가상 문화 기행')).not.toBeInTheDocument()
    expect(within(archive).getByText('가상 개인전')).toBeInTheDocument()
  })

  // 회귀: "불러온 행사 9" — 한 쪽의 건수를 전체처럼 보였다
  it('기록된 행사 수는 전체 건수다', async () => {
    await renderPage()
    expect(screen.getByText('4건')).toBeInTheDocument()
  })

  it('지난 행사는 해마다 묶는다', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { name: '2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '2025' })).toBeInTheDocument()
  })

  it('유형 칩으로 거르고 주소에 남긴다', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: /전시/ }))
    expect(screen.queryByText('가상 이사회')).not.toBeInTheDocument()
    expect(screen.getByText('가상 회원전')).toBeInTheDocument()
    expect(replace).toHaveBeenCalledWith('/events?type=exhibition#archive', { scroll: false })
  })

  it('주소의 유형으로 첫 화면부터 거른다', async () => {
    await renderPage({ type: 'meeting' })
    expect(screen.getByText('가상 이사회')).toBeInTheDocument()
    expect(screen.queryByText('가상 개인전')).not.toBeInTheDocument()
  })

  it('검색어는 띄어쓴 낱말을 모두 포함하는 행사만 남긴다', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox', { name: '행사 검색' }), {
      target: { value: '가상 회원전' },
    })
    expect(screen.getByText('가상 회원전')).toBeInTheDocument()
    expect(screen.queryByText('가상 개인전')).not.toBeInTheDocument()
  })

  it('맞는 행사가 없으면 조건을 지울 수 있다', async () => {
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox', { name: '행사 검색' }), {
      target: { value: '없는행사' },
    })
    fireEvent.click(screen.getByRole('button', { name: '조건 지우기' }))
    expect(screen.getByText('가상 개인전')).toBeInTheDocument()
  })
})

describe('캘린더 증정 행사 고정', () => {
  beforeEach(() => {
    mockLanguage = 'ko'
    listPublishedEvents.mockResolvedValue(EVENTS)
  })
  afterEach(() => jest.useRealTimers())

  it('신청 기간에는 다가오는 행사 맨 앞에 두고 안내 페이지로 잇는다', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-01T12:00:00+09:00') })
    await renderPage()
    const upcoming = screen.getByRole('region', { name: '곧 열리는 행사' })
    const links = within(upcoming).getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/events/calendar-2027')
  })

  it('마감 뒤에는 보이지 않는다', async () => {
    jest.useFakeTimers({ now: new Date('2026-12-16T00:00:00+09:00') })
    await renderPage()
    expect(screen.queryByRole('link', { name: '2027 동양서예 캘린더 증정 행사' })).toBeNull()
  })
})

// 회귀: 언어를 바꿔도 행사 목록의 화면 틀(제목·건수·칩·검색·안내)이 한국어로 찍혔다
describe('행사 목록 화면 틀 번역', () => {
  const HANGUL = /[가-힣]/
  beforeEach(() => {
    listPublishedEvents.mockResolvedValue(EVENTS)
    replace.mockReset()
  })
  afterEach(() => jest.useRealTimers())

  it.each([
    ['en', 'Events', 'Coming up', 'Records since 2025', 'Exhibition', 'Search events', '3 events'],
    ['ja', '行事', 'まもなく開催', '2025年からの記録', '展示', '行事を検索', '3件'],
    ['zh', '活動', '即將登場', '2025年起的記錄', '展覽', '搜尋活動', '3場'],
  ])('%s: 제목·구역·칩·검색·건수', async (lang, title, upcoming, archive, chip, search, count) => {
    mockLanguage = lang as typeof mockLanguage
    await renderPage()
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: upcoming })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: archive })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(chip) })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: search })).toBeInTheDocument()
    expect(screen.getByText(count)).toBeInTheDocument()
  })

  it.each(['en', 'ja', 'zh'] as const)(
    '%s: 행사 원문(제목·소개·장소·주최·일정) 말고는 한글이 남지 않는다',
    async lang => {
      // 캘린더 증정 행사 기간 밖 — 그 줄은 원문 한국어라 따로 본다
      jest.useFakeTimers({ now: new Date('2026-12-16T00:00:00+09:00') })
      mockLanguage = lang
      await renderPage()
      const data = EVENTS.flatMap(e => [e.title, `${e.title} 설명`, `${e.title} 장소`])
      let text = document.body.textContent ?? ''
      for (const value of [...data, '가상 주최'].sort((a, b) => b.length - a.length)) {
        text = text.replaceAll(value, '')
      }
      // 일정 칸(2027년 4월 7일(수) 같은 한국어 날짜)은 서버가 만든 원문이라 뺀다
      text = text.replace(/\d{4}년 \d{1,2}월 \d{1,2}일\([월화수목금토일]\)/g, '')
      expect(text).not.toMatch(HANGUL)
      expect(text).not.toMatch(/\bev[A-Z][A-Za-z_]+/)
    }
  )

  it('en: 거른 건수와 빈 안내도 번역한다', async () => {
    mockLanguage = 'en'
    await renderPage()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search events' }), {
      target: { value: '없는행사' },
    })
    expect(screen.getByText('0 of 3 events')).toBeInTheDocument()
    expect(screen.getByText('No events match these filters.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('가상 개인전')).toBeInTheDocument()
  })

  it('en: 예정 행사 칸 — 단계·유형·일정·장소·자세히 보기', async () => {
    jest.useFakeTimers({ now: new Date('2026-12-16T00:00:00+09:00') })
    mockLanguage = 'en'
    await renderPage()
    const upcoming = screen.getByRole('region', { name: 'Coming up' })
    expect(within(upcoming).getByText('Upcoming')).toBeInTheDocument()
    expect(within(upcoming).getByText('Trips & events')).toBeInTheDocument()
    expect(within(upcoming).getByText('Dates')).toBeInTheDocument()
    expect(within(upcoming).getByText('Venue')).toBeInTheDocument()
    expect(within(upcoming).getByRole('link', { name: 'Event details →' })).toBeInTheDocument()
  })

  it('en: 캘린더 증정 행사 줄의 유형 칸', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-01T12:00:00+09:00') })
    mockLanguage = 'en'
    await renderPage()
    expect(screen.getByText('Giveaway · application deadline')).toBeInTheDocument()
  })

  it('네 언어 표가 같은 키를 갖고, 빈 값이 없으며, 행사 유형 표와 짝이 맞다', () => {
    const { eventsTranslations } = jest.requireActual('@/lib/i18n/translations/events')
    const { EVENT_TYPE_LABELS, PHASE_LABELS } = jest.requireActual('@/lib/events/event-view')
    const keys = Object.keys(eventsTranslations.ko).sort()
    for (const lang of ['en', 'ja', 'zh']) {
      expect(Object.keys(eventsTranslations[lang]).sort()).toEqual(keys)
    }
    for (const table of Object.values(eventsTranslations) as Record<string, string>[]) {
      for (const value of Object.values(table)) expect(value.trim()).not.toBe('')
    }
    for (const type of Object.keys(EVENT_TYPE_LABELS)) {
      expect(eventsTranslations.ko[`evType_${type}`]).toBe(EVENT_TYPE_LABELS[type])
    }
    for (const phase of Object.keys(PHASE_LABELS)) {
      expect(eventsTranslations.ko[`evPhase_${phase}`]).toBe(PHASE_LABELS[phase])
    }
  })
})
