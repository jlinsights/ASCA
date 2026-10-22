import { artistDisplayName, lifeYearsLabel } from '../artist-life'

describe('artistDisplayName', () => {
  it('고인이면 이름 앞에 故 를 붙인다', () => {
    expect(artistDisplayName('임현기', 2026)).toBe('故 임현기')
  })

  it('생존 작가는 이름을 그대로 둔다', () => {
    expect(artistDisplayName('김정호', null)).toBe('김정호')
  })
})

describe('lifeYearsLabel', () => {
  it('생몰년이 모두 있으면 1940–2026', () => {
    expect(lifeYearsLabel(1940, 2026)).toBe('1940–2026')
  })

  it('출생연도를 모르는 고인은 † 2026', () => {
    expect(lifeYearsLabel(null, 2026)).toBe('† 2026')
  })

  it('생존 작가는 기존처럼 b. 1960', () => {
    expect(lifeYearsLabel(1960, null)).toBe('b. 1960')
  })

  it('둘 다 없으면 null', () => {
    expect(lifeYearsLabel(null, null)).toBeNull()
  })
})
