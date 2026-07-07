/**
 * use-stroke-animation 동작 테스트 — asca-gallery-cultural-bugfix A-2·A-3
 *
 * A-2: loopMode 'single'은 현재 stroke를 반복해야 한다(다음 stroke로 진행 금지).
 * A-3: stop()·unmount 후 loop 재시작 setTimeout이 남아 있으면 안 된다.
 * (fail-first — RAF 큐 수동 제어 + canvas 2d 스텁)
 */
import { act, renderHook } from '@testing-library/react'

import { useStrokeAnimation } from '@/components/gallery/stroke-animation/use-stroke-animation'
import type { AnimatedStroke } from '@/components/gallery/stroke-animation/types'

const strokeFixture = (id: string): AnimatedStroke => ({
  id,
  points: [
    { x: 0.1, y: 0.1, pressure: 0.5 },
    { x: 0.9, y: 0.9, pressure: 0.5 },
  ],
  duration: 0.001, // 1ms — 첫 유효 프레임에 완료
  brush_type: 'regular',
  ink_flow: [1, 1],
  educational_notes: [],
})

/** RAF 큐를 수동 제어하고 canvas 2d 컨텍스트를 스텁한다 */
function setupAnimationHarness() {
  const rafQueue: FrameRequestCallback[] = []
  let rafId = 0
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    rafQueue.push(cb)
    return ++rafId
  })
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

  const ctxStub = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn(),
    setLineDash: jest.fn(),
    lineCap: '',
    lineJoin: '',
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctxStub as never)

  const stepFrame = (timestamp: number) => {
    const pending = rafQueue.splice(0, rafQueue.length)
    act(() => {
      pending.forEach(cb => cb(timestamp))
    })
  }

  return { stepFrame }
}

describe('useStrokeAnimation — loop·타이머 (A-2·A-3)', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  function mountHook(strokes: AnimatedStroke[], loopMode: 'single' | 'all') {
    const harness = setupAnimationHarness()
    const rendered = renderHook(() => useStrokeAnimation({ strokes }))

    // 훅 canvasRef에 실제 canvas 연결 (컴포넌트 없이 훅만 렌더하므로 수동 부착)
    const canvas = document.createElement('canvas')
    ;(
      rendered.result.current.canvasRef as React.MutableRefObject<HTMLCanvasElement | null>
    ).current = canvas

    act(() => {
      rendered.result.current.setSettings(prev => ({ ...prev, loopMode }))
    })
    return { ...rendered, ...harness }
  }

  it('A-2: loopMode single은 완료 후 같은 stroke를 유지한다 (진행 금지)', () => {
    const { result, stepFrame } = mountHook([strokeFixture('s1'), strokeFixture('s2')], 'single')

    act(() => {
      result.current.play()
    })
    stepFrame(1000) // startTime 초기화 (0은 falsy라 재초기화 루프에 빠짐 — 양수 사용)
    stepFrame(1100) // 1ms 초과 — stroke 완료 분기 진입

    expect(result.current.playbackState.currentStroke).toBe(0)
    expect(result.current.playbackState.isComplete).toBe(false)
  })

  it('A-3: 마지막 stroke 완료(loop all) 후 stop()하면 pending 타이머가 없다', () => {
    const { result, stepFrame } = mountHook([strokeFixture('s1')], 'all')

    act(() => {
      result.current.play()
    })
    stepFrame(1000)
    stepFrame(1100) // 완료 → loop 재시작 setTimeout 예약됨

    expect(jest.getTimerCount()).toBeGreaterThan(0)

    act(() => {
      result.current.stop()
    })
    expect(jest.getTimerCount()).toBe(0)
  })

  it('A-1: pause 후 play는 진행 위치를 보존한다 (처음부터 재생 금지)', () => {
    const { result, stepFrame } = mountHook([strokeFixture('s1'), strokeFixture('s2')], 'single')

    act(() => {
      result.current.play()
    })
    stepFrame(1000) // startTime = 1000
    stepFrame(1000.5) // elapsed 0.5ms → progress 0.5

    expect(result.current.playbackState.currentProgress).toBeCloseTo(0.5, 1)

    act(() => {
      result.current.pause()
    })
    act(() => {
      result.current.play()
    })
    stepFrame(2000) // 재개 첫 프레임 — 수정 전엔 progress 0으로 리셋됐다

    expect(result.current.playbackState.currentProgress).toBeGreaterThanOrEqual(0.4)
  })

  it('A-3: unmount 시에도 loop 타이머가 정리된다', () => {
    const { result, stepFrame, unmount } = mountHook([strokeFixture('s1')], 'all')

    act(() => {
      result.current.play()
    })
    stepFrame(1000)
    stepFrame(1100)

    expect(jest.getTimerCount()).toBeGreaterThan(0)

    unmount()
    expect(jest.getTimerCount()).toBe(0)
  })
})
