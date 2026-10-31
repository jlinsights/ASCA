import { render, screen, within } from '@testing-library/react'
import Daejeon23HubPage, { metadata } from '../page'
import { CONTEST_23, SCHEDULE, koDate } from '../../_components/contest-23-data'
import { ENTRY_PATHS, HUB_PATH, buildEventJsonLd } from '../_components/daejeon-23-hub-data'

jest.mock('@/components/layout/layout-footer', () => ({ LayoutFooter: () => null }))
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'ko' }),
}))

describe('제23회 대전 허브 — 구조화 데이터', () => {
  const event = buildEventJsonLd()

  it('전시 기간을 ExhibitionEvent 로, 날짜는 공모요강 값에서 읽는다', () => {
    expect(event['@type']).toBe('ExhibitionEvent')
    expect(event.startDate).toBe(CONTEST_23.exhibitionStart)
    expect(event.endDate).toBe(CONTEST_23.exhibitionEnd)
    expect(event.isAccessibleForFree).toBe(true)
    expect(event.location.address.postalCode).toBe('06757')
    expect(event.url).toBe(`https://orientalcalligraphy.org${HUB_PATH}`)
  })

  it('개막·시상식은 KST 시각을 가진 하위 행사다', () => {
    expect(event.subEvent.startDate).toBe(`${CONTEST_23.ceremony}T14:00:00+09:00`)
    expect(event.subEvent.endDate).toBe(`${CONTEST_23.ceremony}T16:00:00+09:00`)
  })

  // 후원 명칭은 승인 확인 전이다 — 구조화 데이터에 싣지 않는다
  it('후원·재정 지원 기관을 싣지 않는다', () => {
    const json = JSON.stringify(event)
    expect(json).not.toMatch(/"(sponsor|funder)"/)
    expect(json).not.toContain('문화체육관광부')
  })
})

describe('제23회 대전 허브 — 화면', () => {
  beforeEach(() => render(<Daejeon23HubPage />))

  it('h1 은 대전 이름 하나다', () => {
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent(`제${CONTEST_23.edition}회 대한민국 동양서예대전`)
  })

  it('일정 표는 공모요강 일정을 그대로 쓴다', () => {
    const table = screen.getByRole('table', { name: /일정/ })
    for (const row of SCHEDULE) expect(within(table).getByText(row.label)).toBeInTheDocument()
    expect(
      screen.getAllByText(new RegExp(koDate(CONTEST_23.deadline).replace(/[()]/g, '\\$&'))).length
    ).toBeGreaterThan(0)
  })

  it('출품원서·공모요강 전문으로 잇는다', () => {
    expect(screen.getAllByRole('link', { name: /출품원서 작성하기/ })[0]).toHaveAttribute(
      'href',
      '/application'
    )
    expect(screen.getAllByRole('link', { name: /공모요강 전문/ })[0]).toHaveAttribute(
      'href',
      '/contests'
    )
  })

  it('출품 경로마다 공모요강의 실제 절로 잇는다', () => {
    for (const path of ENTRY_PATHS) {
      expect(screen.getByText(path.title)).toBeInTheDocument()
      for (const link of path.links) {
        expect(
          screen.getAllByRole('link', { name: new RegExp(link.label.replace(/[()]/g, '\\$&')) })
            .length
        ).toBeGreaterThan(0)
      }
    }
  })

  it('구조화 데이터 스크립트가 파싱된다', () => {
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(JSON.parse(script?.textContent ?? '')).toMatchObject({ '@type': 'ExhibitionEvent' })
  })
})

describe('제23회 대전 허브 — 메타데이터', () => {
  it('고유 canonical 과 공유 이미지를 단다', () => {
    expect(metadata.alternates?.canonical).toBe(HUB_PATH)
    expect(JSON.stringify(metadata.openGraph)).toContain('og-default.jpg')
  })
})
