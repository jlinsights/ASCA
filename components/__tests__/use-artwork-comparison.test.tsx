/**
 * use-artwork-comparison 동작 테스트 — asca-gallery-cultural-bugfix B-2
 *
 * requestAnalysis 진행 중 가드: 연속 호출 시 onAnalysisRequest는 1회만 발행되고
 * isAnalyzing 플래그가 true→false로 전이돼야 한다. (fail-first로 작성)
 */
import { act, renderHook, waitFor } from '@testing-library/react'

import { useArtworkComparison } from '@/components/gallery/artwork-comparison/use-artwork-comparison'
import type {
  ComparisonAnalysis,
  ComparisonMode,
} from '@/components/gallery/artwork-comparison/types'
import type { Artwork } from '@/lib/types/gallery'

const artworkFixture = (id: string) => ({ id }) as unknown as Artwork

const initialMode: ComparisonMode = {
  type: 'side-by-side',
  syncZoom: true,
  syncPan: true,
  showAnnotations: false,
  showRegions: false,
}

const analysisFixture: ComparisonAnalysis = {
  similarities: ['s'],
  differences: ['d'],
  techniques: { brushwork: 'b', composition: 'c', style: 's' },
  cultural_context: 'ctx',
  educational_notes: [],
}

describe('useArtworkComparison — requestAnalysis 가드 (B-2)', () => {
  it('분석 진행 중 연속 호출 시 onAnalysisRequest는 1회만 발행된다', async () => {
    let resolveAnalysis: (value: ComparisonAnalysis) => void = () => {}
    const onAnalysisRequest = jest.fn(
      () =>
        new Promise<ComparisonAnalysis>(resolve => {
          resolveAnalysis = resolve
        })
    )

    const { result } = renderHook(() =>
      useArtworkComparison({
        artworks: [artworkFixture('a1'), artworkFixture('a2')],
        initialMode,
        maxArtworks: 4,
        onAnalysisRequest,
      })
    )

    act(() => {
      void result.current.requestAnalysis()
      void result.current.requestAnalysis()
    })

    expect(onAnalysisRequest).toHaveBeenCalledTimes(1)
    expect(result.current.isAnalyzing).toBe(true)

    await act(async () => {
      resolveAnalysis(analysisFixture)
    })

    await waitFor(() => expect(result.current.isAnalyzing).toBe(false))
    expect(result.current.analysis).toEqual(analysisFixture)
    expect(result.current.showAnalysis).toBe(true)
  })

  it('완료 후 재호출은 다시 발행된다', async () => {
    const onAnalysisRequest = jest.fn(() => Promise.resolve(analysisFixture))

    const { result } = renderHook(() =>
      useArtworkComparison({
        artworks: [artworkFixture('a1'), artworkFixture('a2')],
        initialMode,
        maxArtworks: 4,
        onAnalysisRequest,
      })
    )

    await act(async () => {
      await result.current.requestAnalysis()
    })
    await act(async () => {
      await result.current.requestAnalysis()
    })

    expect(onAnalysisRequest).toHaveBeenCalledTimes(2)
  })
})
