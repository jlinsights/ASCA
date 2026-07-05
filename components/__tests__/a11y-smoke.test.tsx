/**
 * a11y 스모크 테스트 — asca-a11y-cleanup (design §3 FR-06)
 *
 * 수정된 gallery·cultural 컴포넌트를 최소 props로 렌더해 axe 위반 0을 단언한다.
 * lint(jsx-a11y)가 잡지 못하는 결함(SVG 자식만 가진 버튼의 접근 가능한 이름 부재 등)을
 * 커버하는 상호보완 게이트.
 */
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'

import { PlaybackControls } from '@/components/gallery/stroke-animation/playback-controls'
import { SettingsPanel } from '@/components/gallery/stroke-animation/settings-panel'
import { AnalysisPanel } from '@/components/gallery/artwork-comparison/analysis-panel'
import { AccessibilityPanel } from '@/components/cultural/cultural-accessibility/accessibility-panel'
import { CulturalPanel } from '@/components/cultural/cultural-accessibility/cultural-panel'
import { LanguagePanel } from '@/components/cultural/cultural-accessibility/language-panel'
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LANGUAGE_SETTINGS,
  DEFAULT_CULTURAL_SETTINGS,
} from '@/components/cultural/cultural-accessibility/accessibility-defaults'
import { ResourcesTab } from '@/components/cultural/learning-hub/resources-tab'
import { OverviewTab } from '@/components/cultural/learning-hub/overview-tab'
import { GalleryView } from '@/components/cultural/virtual-exhibition/gallery-view'
import type { AnimationSettings, PlaybackState } from '@/components/gallery/stroke-animation/types'
import type { ComparisonAnalysis } from '@/components/gallery/artwork-comparison/types'
import type { LearningPath, UserProgress } from '@/components/cultural/learning-hub/types'
import type { Exhibition } from '@/components/cultural/virtual-exhibition/types'

const animationSettings: AnimationSettings = {
  playbackSpeed: 1,
  showPressure: false,
  showDirection: false,
  showTiming: false,
  loopMode: 'none',
  autoAdvance: false,
  soundEnabled: false,
}

const playbackState: PlaybackState = {
  isPlaying: false,
  currentStroke: 0,
  currentProgress: 0,
  totalProgress: 0,
  isComplete: false,
}

const analysis: ComparisonAnalysis = {
  similarities: ['Both use bold brushwork'],
  differences: ['Different ink density'],
  techniques: { brushwork: 'bold', composition: 'balanced', style: 'cursive' },
  cultural_context: 'Joseon dynasty calligraphy tradition',
  educational_notes: ['Note the stroke order'],
}

const userProgress: UserProgress = {
  resourcesCompleted: [],
  pathsEnrolled: [],
  pathsCompleted: [],
  achievements: [],
  streakDays: 0,
  totalHours: 0,
  level: 1,
  experience: 0,
}

const learningPath: LearningPath = {
  id: 'path-1',
  title: 'Calligraphy Basics',
  description: 'Introduction to brush handling',
  level: 'beginner',
  estimated_duration: 4,
  modules: [],
  cultural_significance: 'Foundation of East Asian calligraphy',
}

const exhibition: Exhibition = {
  id: 'ex-1',
  title: 'Masterpieces of Korean Calligraphy',
  description: 'A virtual walk through classic works',
  curator: 'ASCA',
  theme: 'Tradition',
  period: '2026',
  artworks: [
    {
      id: 'art-1',
      title: { original: '蘭亭序', romanized: 'Nanjeongseo', english: 'Orchid Pavilion Preface' },
      artist: { name: 'Kim Jeong-hui', period: 'Joseon', school: 'Chusa' },
      image: { url: '/img/a.jpg', highRes: '/img/a-hi.jpg', details: [] },
      description: { cultural: 'c', technical: 't', historical: 'h' },
      dimensions: { width: 100, height: 40, unit: 'cm' },
      year: '1840',
      medium: 'Ink on paper',
      provenance: 'ASCA collection',
      position: { x: 30, y: 40, wall: 'north' },
    },
  ],
  galleryLayout: { width: 1000, height: 600, style: 'traditional' },
  ambiance: { lighting: 'warm', music: false },
}

describe('a11y smoke (axe, violations 0)', () => {
  it('PlaybackControls', async () => {
    const { container } = render(
      <PlaybackControls
        playbackState={playbackState}
        strokesCount={3}
        settings={animationSettings}
        setSettings={jest.fn()}
        showSettings={false}
        setShowSettings={jest.fn()}
        onPrevious={jest.fn()}
        onPlay={jest.fn()}
        onPause={jest.fn()}
        onStop={jest.fn()}
        onNext={jest.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('SettingsPanel', async () => {
    const { container } = render(
      <SettingsPanel showSettings settings={animationSettings} setSettings={jest.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('AnalysisPanel', async () => {
    const { container } = render(
      <AnalysisPanel showAnalysis analysis={analysis} onClose={jest.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('AccessibilityPanel', async () => {
    const { container } = render(
      <AccessibilityPanel settings={DEFAULT_ACCESSIBILITY_SETTINGS} updateSetting={jest.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('CulturalPanel', async () => {
    const { container } = render(
      <CulturalPanel settings={DEFAULT_CULTURAL_SETTINGS} updateSetting={jest.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('LanguagePanel', async () => {
    const { container } = render(
      <LanguagePanel settings={DEFAULT_LANGUAGE_SETTINGS} updateSetting={jest.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('ResourcesTab', async () => {
    const { container } = render(
      <ResourcesTab
        searchTerm=''
        setSearchTerm={jest.fn()}
        filters={{}}
        setFilters={jest.fn()}
        filteredResources={[]}
        isResourceCompleted={jest.fn(() => false)}
        isResourceUnlocked={jest.fn(() => true)}
        onSelectResource={jest.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('OverviewTab', async () => {
    const { container } = render(
      <OverviewTab
        userProgress={userProgress}
        resources={[]}
        learningPaths={[learningPath]}
        isResourceCompleted={jest.fn(() => false)}
        isResourceUnlocked={jest.fn(() => true)}
        onSelectResource={jest.fn()}
        onSelectPath={jest.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('GalleryView', async () => {
    const { container } = render(
      <GalleryView
        exhibition={exhibition}
        zoom={1}
        position={{ x: 0, y: 0 }}
        wallColor='bg-rice-paper'
        lightingEffect='none'
        onMouseDown={jest.fn()}
        onMouseMove={jest.fn()}
        onMouseUp={jest.fn()}
        onSelectArtwork={jest.fn()}
      />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
