import {
  EVENT_TYPE_CLASSES,
  SEASONAL_ACCENT_CLASSES,
  STATUS_CLASSES,
  SEASONAL_BG,
  WALL_BG,
  DIFFICULTY_BG,
} from '../color-classes'

// 완성된 리터럴 클래스만 허용 — 동적 보간(${) 절대 불가
const VALID_CLASS = /^(hover:)?(bg|text|border)-[a-z-]+(\/\d+)?$/

describe('color-classes 정적 맵', () => {
  it('동적으로 깨졌던 토큰의 클래스가 리터럴로 존재한다', () => {
    expect(EVENT_TYPE_CLASSES.performance.bg).toBe('bg-plum-purple')
    expect(EVENT_TYPE_CLASSES.festival.bg).toBe('bg-spring-blossom')
    expect(SEASONAL_ACCENT_CLASSES.winter.hoverBg).toBe('hover:bg-winter-snow/80')
    expect(WALL_BG.modern).toBe('bg-west-metal')
  })

  it('모든 맵의 모든 클래스 문자열이 완성된 리터럴이다', () => {
    const all: string[] = []
    for (const s of Object.values(EVENT_TYPE_CLASSES)) all.push(...Object.values(s))
    for (const s of Object.values(SEASONAL_ACCENT_CLASSES)) all.push(...Object.values(s))
    for (const s of Object.values(STATUS_CLASSES)) all.push(...Object.values(s))
    all.push(
      ...Object.values(SEASONAL_BG),
      ...Object.values(WALL_BG),
      ...Object.values(DIFFICULTY_BG)
    )

    expect(all.length).toBe(89)
    for (const cls of all) {
      expect(cls).not.toContain('${')
      expect(cls).toMatch(VALID_CLASS)
    }
  })

  it('모든 맵에 default 키가 있다 (fallback 보장)', () => {
    expect(EVENT_TYPE_CLASSES.default).toBeDefined()
    expect(SEASONAL_ACCENT_CLASSES.default).toBeDefined()
    expect(STATUS_CLASSES.default).toBeDefined()
    expect(SEASONAL_BG.default).toBeDefined()
    expect(WALL_BG.default).toBeDefined()
    expect(DIFFICULTY_BG.default).toBeDefined()
  })
})
