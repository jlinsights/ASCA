import { historyEvents } from '../history-events'
import { localizeHistoryDate, localizeHistoryEvent } from '../history-i18n'

const HANGUL = /[가-힣]/

describe('localizeHistoryDate', () => {
  it('ko 는 원문 그대로다', () => {
    const raw = '2025년 11월 27일(토) 오후 1시 ~ 7시'
    expect(localizeHistoryDate(raw, 'ko')).toBe(raw)
  })

  it.each([
    ['2025년 11월 27일(토) 오후 1시 ~ 7시', 'Nov 27, 2025 (Sat) 1–7 PM'],
    ['2025년 6월 18일(수) ~ 6월 24일(화)', 'Jun 18, 2025 (Wed) – Jun 24 (Tue)'],
    ['2025년 4월 19일(토) | 2025년 4월 26일(토)', 'Apr 19, 2025 (Sat) | Apr 26, 2025 (Sat)'],
    ['1997년 9월', 'Sep 1997'],
    [
      '2020년 10월 10일 ~ 10월 20일 (코로나19로 인터넷 전시 대체)',
      'Oct 10, 2020 – Oct 20 (held online due to COVID-19)',
    ],
  ])('en: %s', (raw, expected) => {
    expect(localizeHistoryDate(raw, 'en')).toBe(expected)
  })

  it.each([
    ['2025년 11월 27일(토) 오후 1시 ~ 7시', 'ja', '2025年11月27日(土) 午後1時〜7時'],
    ['2025년 6월 18일(수) ~ 6월 24일(화)', 'ja', '2025年6月18日(水)〜6月24日(火)'],
    ['2025년 11월 27일(토) 오후 1시 ~ 7시', 'zh', '2025年11月27日(六) 下午1時至7時'],
    ['1997년 9월', 'zh', '1997年9月'],
  ] as const)('%s → %s', (raw, lang, expected) => {
    expect(localizeHistoryDate(raw, lang)).toBe(expected)
  })
})

describe('localizeHistoryEvent — 실제 연혁 데이터 전체', () => {
  it('ko 는 원문 객체와 같다', () => {
    for (const event of historyEvents) {
      expect(localizeHistoryEvent(event, 'ko')).toStrictEqual(event)
    }
  })

  it.each(['en', 'ja', 'zh'] as const)('%s: 제목·부제·장소·날짜에 한글이 남지 않는다', lang => {
    expect(historyEvents.length).toBeGreaterThan(30)
    const leftovers = historyEvents.flatMap(event => {
      const out = localizeHistoryEvent(event, lang)
      return [out.title, out.subtitle, out.venue, out.date]
        .filter((v): v is string => typeof v === 'string' && HANGUL.test(v))
        .map(v => `${event.id}: ${v}`)
    })
    expect(leftovers).toStrictEqual([])
  })

  it('한자 공식 전시명은 바꾸지 않는다', () => {
    const grand = historyEvents.find(e => e.id === '2025-6')
    expect(grand).toBeDefined()
    expect(localizeHistoryEvent(grand!, 'en').title).toBe('第22回 大韓民國 東洋書藝大展')
  })
})
