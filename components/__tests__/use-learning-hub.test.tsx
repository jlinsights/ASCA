/**
 * use-learning-hub 필터 회귀 테스트 — asca-gallery-cultural-bugfix F-3
 *
 * duration 필터 경계값(15/60분)이 case 블록 스코프 정리 후에도 동일하게
 * 동작하는지 회귀 검증.
 */
import { act, renderHook } from '@testing-library/react'

import { useLearningHub } from '@/components/cultural/learning-hub/use-learning-hub'
import type { LearningResource, UserProgress } from '@/components/cultural/learning-hub/types'

const resourceFixture = (id: string, duration: number) =>
  ({
    id,
    title: { original: id, romanized: id, english: id },
    description: 'desc',
    type: 'video',
    difficulty: 'beginner',
    duration,
    prerequisites: [],
    tags: [],
  }) as unknown as LearningResource

const userProgress = {
  resourcesCompleted: [],
  pathsEnrolled: [],
  pathsCompleted: [],
  achievements: [],
  streakDays: 0,
  totalHours: 0,
  level: 1,
  experience: 0,
} as unknown as UserProgress

const resources = [
  resourceFixture('r-short', 15),
  resourceFixture('r-medium', 60),
  resourceFixture('r-long', 61),
]

describe('useLearningHub — duration 필터 (F-3)', () => {
  it.each([
    ['short', ['r-short']],
    ['medium', ['r-medium']],
    ['long', ['r-long']],
  ])('duration=%s 필터가 경계값을 정확히 분류한다', (duration, expected) => {
    const { result } = renderHook(() =>
      useLearningHub({ resources, userProgress, showProgressiveDisclosure: false })
    )

    act(() => {
      result.current.setFilters({ duration })
    })

    expect(result.current.filteredResources.map(r => r.id)).toEqual(expected)
  })

  it('필터 없음이면 전체가 반환된다', () => {
    const { result } = renderHook(() =>
      useLearningHub({ resources, userProgress, showProgressiveDisclosure: false })
    )
    expect(result.current.filteredResources).toHaveLength(3)
  })
})
