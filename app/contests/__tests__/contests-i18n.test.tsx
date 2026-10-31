import { render } from '@testing-library/react'
import type { Language } from '@/lib/i18n/types'
import { SIMPLIFIED_ONLY_CHARS } from '@/lib/i18n/simplified-only'
import { ENTRY_FEES, AWARDS } from '@/app/application/_components/application-data'
import { ContestsView } from '../_components/contests-view'
import { Daejeon23HubView } from '../23/_components/daejeon-23-hub-view'
import { GUIDELINE_COPY } from '../_components/contest-23-copy'
import { contestDate, editionLabel, parseManwon } from '../_components/contest-i18n'

let language: Language = 'ko'
jest.mock('@/contexts/language-context', () => ({
  useLanguage: () => ({ t: (key: string) => key, language }),
}))
jest.mock('@/components/contests/contest-flipbook', () => ({
  ContestFlipbook: () => null,
  CONTEST_FLIPBOOK_URL: 'https://online.fliphtml5.com/orientalcalligraphy/ulsw/',
}))

const FOREIGN = ['en', 'ja', 'zh'] as const
const HANGUL = /[가-힣]/g

/** lang='ko' 로 표시한 곳(우편 주소·예금주·사이트 FAQ 등)을 빼고 화면에 남은 한글 */
function hangulOutsideKo(container: HTMLElement): string[] {
  const clone = container.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[lang="ko"]').forEach(node => node.remove())
  return clone.textContent?.match(HANGUL) ?? []
}

function renderBoth(lang: Language) {
  language = lang
  const contests = render(<ContestsView />)
  const hub = render(<Daejeon23HubView calendarOpen />)
  return [contests.container, hub.container] as const
}

describe('공모전 날짜 표기', () => {
  it.each([
    ['en', 'Sun, Jan 31, 2027'],
    ['ja', '2027年1月31日(日)'],
    ['zh', '2027年1月31日(週日)'],
    ['ko', '2027년 1월 31일(일)'],
  ] as const)('%s', (lang, label) => {
    expect(contestDate('2027-01-31', lang)).toBe(label)
  })

  it('연도를 뺄 수 있다', () => {
    expect(contestDate('2027-04-30', 'en', false)).toBe('Fri, Apr 30')
  })

  it('회차 서수', () => {
    expect([1, 2, 3, 11, 12, 13, 21, 22, 23].map(n => editionLabel(n, 'en'))).toStrictEqual([
      '1st',
      '2nd',
      '3rd',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
    ])
  })
})

describe('공모요강 번역은 원본과 같은 사실을 쓴다', () => {
  it.each(FOREIGN)('%s — 표의 행 수가 한국어와 같다', lang => {
    const ko = GUIDELINE_COPY.ko
    const copy = GUIDELINE_COPY[lang]
    expect(copy.next.rows).toHaveLength(ko.next.rows.length)
    expect(copy.entry.rules).toHaveLength(ko.entry.rules.length)
    expect(copy.entry.divisions).toHaveLength(ko.entry.divisions.length)
    expect(copy.specs.rows).toHaveLength(ko.specs.rows.length)
    expect(copy.how.rules).toHaveLength(ko.how.rules.length)
    expect(copy.prizes.rows).toHaveLength(ko.prizes.rows.length)
    expect(copy.notice.items).toHaveLength(ko.notice.items.length)
  })

  it('영문 출품료·상금은 원본 금액과 같다', () => {
    const fees = GUIDELINE_COPY.en.fees.rows
    ENTRY_FEES.forEach((row, index) => {
      const amount = parseManwon(row.cells[1] ?? '')!
      expect(fees[index]?.cells[1]).toBe(`KRW ${amount.toLocaleString('en-US')}`)
    })
    expect(GUIDELINE_COPY.en.prizes.rows[0]?.cells[3]).toContain(
      (parseManwon(AWARDS[0]!.prize)! as number).toLocaleString('en-US')
    )
  })
})

describe('번역 화면에 한국어가 새지 않는다', () => {
  // 검사가 실제로 한글을 세는지 — 한국어 화면에서는 많이 나와야 한다
  it('ko 대조군에는 한글이 있다', () => {
    for (const container of renderBoth('ko')) {
      expect(hangulOutsideKo(container).length).toBeGreaterThan(100)
    }
  })

  it.each(FOREIGN)('%s 화면의 lang=ko 밖 한글은 0', lang => {
    for (const container of renderBoth(lang)) {
      expect(hangulOutsideKo(container).join('')).toBe('')
    }
  })

  it('zh 화면에 간체 전용 글자가 없다', () => {
    const text = renderBoth('zh')
      .map(container => container.textContent ?? '')
      .join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(char => text.includes(char))).toStrictEqual([])
  })
})
