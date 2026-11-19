import {
  exhibitionToday,
  getExhibitionListings,
  type ExhibitionPromotion,
} from '../exhibition-listings'

const copy = { title: 'Test exhibition', venue: 'Test venue', organizer: 'Independent organizer' }
const promotion: ExhibitionPromotion = {
  id: 'test-only',
  publication: 'approved',
  startDate: '2026-11-10',
  endDate: '2026-11-20',
  publishFrom: '2026-10-01',
  publishUntil: '2027-01-31',
  paidPromotion: true,
  href: 'https://example.com/exhibition',
  copy: { ko: copy, en: copy, ja: copy, zh: copy },
}

describe('외부 전시와 실제 연혁을 구분한 공개 목록', () => {
  it('서울 기준 자정과 날짜 경계를 사용한다', () => {
    expect(exhibitionToday(new Date('2026-11-09T15:00:00Z'))).toBe('2026-11-10')
    expect(exhibitionToday(new Date('2026-11-09T14:59:59Z'))).toBe('2026-11-09')
  })

  it.each([
    ['2026-11-09', 'upcoming'],
    ['2026-11-10', 'current'],
    ['2026-11-20', 'current'],
    ['2026-11-21', 'past'],
  ])('%s: 외부 전시의 실제 시작·종료일로 분류한다', (today, expected) => {
    const [item] = getExhibitionListings('en', today, [], [promotion])
    expect(item).toMatchObject({
      source: 'external',
      organizer: copy.organizer,
      paidPromotion: true,
      status: expected,
    })
  })

  it('미승인·잘못된 날짜·종료 역전 자료는 공개하지 않는다', () => {
    const variants: ExhibitionPromotion[] = [
      { ...promotion, publication: 'draft' },
      { ...promotion, startDate: '2026-02-30' },
      { ...promotion, endDate: '2026-11-01' },
    ]
    expect(getExhibitionListings('ko', '2026-11-15', [], variants)).toEqual([])
  })

  it('같은 외부 전시는 한 번만 표시하고 위험한 링크를 제거한다', () => {
    const unsafe = { ...promotion, href: 'javascript:alert(1)', poster: '//example.com/image.png' }
    const items = getExhibitionListings('ko', '2026-11-15', [], [unsafe, unsafe])
    expect(items).toHaveLength(1)
    expect(items[0]?.href).toBeUndefined()
    expect(items[0]?.poster).toBeUndefined()
  })

  it('계약한 공개 기간 전·후에는 외부 홍보를 노출하지 않는다', () => {
    expect(getExhibitionListings('ko', '2026-09-30', [], [promotion])).toEqual([])
    expect(getExhibitionListings('ko', '2027-02-01', [], [promotion])).toEqual([])
    expect(getExhibitionListings('ko', '2026-10-01', [], [promotion])).toHaveLength(1)
    expect(getExhibitionListings('ko', '2027-01-31', [], [promotion])).toHaveLength(1)
  })

  it('공식 공모전은 월 전체 대신 확인된 전시 기간에만 현재 전시로 분류한다', () => {
    expect(
      getExhibitionListings('ko', '2027-04-01').find(item => item.id === 'contest-23')?.status
    ).toBe('upcoming')
    expect(
      getExhibitionListings('ko', '2027-04-21').find(item => item.id === 'contest-23')?.status
    ).toBe('current')
    expect(
      getExhibitionListings('ko', '2027-05-01').find(item => item.id === 'contest-23')?.status
    ).toBe('past')
  })

  it('아직 의뢰된 외부 광고가 없으며 목업은 실제 목록·통계에 들어가지 않는다', () => {
    const items = getExhibitionListings('ko', '2026-11-08')
    expect(items.some(item => item.source === 'external')).toBe(false)
    expect(items.some(item => /먹의 산책|겹쳐진 시간|획의 풍경/.test(item.title))).toBe(false)
  })
})
