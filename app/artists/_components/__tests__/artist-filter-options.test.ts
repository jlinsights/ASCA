import { getArtistFilterOptions, regulationGrade } from '../artist-filter-options'

// 회귀: 작가 등급 필터에 규정에 없는 준회원·공모작가·원로작가·명예회원이 있었다
describe('작가 등급 필터 — 규정 등급만', () => {
  it('일반·추천·초대작가만 보이고, 일반작가는 DB 값 회원작가로 거른다', () => {
    expect(getArtistFilterOptions('membership', 'ko')).toStrictEqual([
      { value: '회원작가', label: '일반작가' },
      { value: '추천작가', label: '추천작가' },
      { value: '초대작가', label: '초대작가' },
    ])
  })

  it('규정에 없는 등급은 어느 언어에도 없다', () => {
    for (const language of ['ko', 'en', 'ja', 'zh'] as const) {
      const values = getArtistFilterOptions('membership', language).map(option => option.value)
      for (const banned of ['준회원', '공모작가', '원로작가', '명예회원']) {
        expect(values).not.toContain(banned)
      }
    }
  })
})

describe('regulationGrade', () => {
  it.each([
    ['초대작가, 운영위원', '초대작가'],
    ['상임이사, 운영위원, 초대작가', '초대작가'],
    ['추천작가', '추천작가'],
    ['회원작가', '일반작가'],
    ['준회원', null],
    ['공모작가', null],
    ['작고작가, 명예회원', null],
    [null, null],
  ])('%s → %s', (stored, grade) => {
    expect(regulationGrade(stored)).toBe(grade)
  })
})
