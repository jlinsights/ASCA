import {
  SAC_CATEGORIES,
  SAC_CLASSES,
  SAC_DAYS,
  SAC_INSTRUCTOR_COUNT,
  SAC_SLOTS,
} from '../academy-data'

/**
 * 예술의전당 「[서화] 2026 <가을정규> 수강생 모집」 수업시간표 옮겨 적기 검증.
 * 원문 표의 요일·시간대별 강좌 수를 그대로 박아 두어, 행을 빠뜨리거나 다른 칸에 넣으면 실패한다.
 */
const EXPECTED: Record<string, number> = {
  '화-am': 6,
  '수-am': 6,
  '목-am': 5,
  '금-am': 4,
  '토-am': 4,
  '화-pm': 6,
  '수-pm': 4,
  '목-pm': 4,
  '금-pm': 1,
  '토-pm': 1,
}

describe('예술의전당 서화아카데미 2026 가을정규 시간표', () => {
  it('원문 41개 강좌를 모두 옮겼다', () => {
    expect(SAC_CLASSES).toHaveLength(41)
  })

  it.each(SAC_DAYS.flatMap(day => SAC_SLOTS.map(slot => [day, slot.id] as const)))(
    '%s요일 %s 칸의 강좌 수가 원문과 같다',
    (day, slot) => {
      const count = SAC_CLASSES.filter(item => item.day === day && item.slot === slot).length
      expect(count).toBe(EXPECTED[`${day}-${slot}`])
    }
  )

  it('모든 분야에 강좌가 하나 이상 있다', () => {
    for (const category of SAC_CATEGORIES) {
      expect(SAC_CLASSES.some(item => item.category === category)).toBe(true)
    }
  })

  it('모든 강좌에 강좌명과 강사가 있다', () => {
    for (const item of SAC_CLASSES) {
      expect(item.title.trim()).not.toBe('')
      expect(item.instructor.trim()).not.toBe('')
    }
  })

  it('같은 칸에 같은 강좌가 두 번 들어가지 않았다', () => {
    const keys = SAC_CLASSES.map(
      item => `${item.day}|${item.slot}|${item.title}|${item.instructor}|${item.time ?? ''}`
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('강사 수는 중복을 뺀 인원이다', () => {
    expect(SAC_INSTRUCTOR_COUNT).toBe(27)
  })
})
