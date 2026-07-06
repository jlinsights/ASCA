# asca-gallery-cultural-bugfix Design Document

> **Summary**: 기능 버그 17건의 코드 실사 기반 항목별 수정 명세 + 동작 테스트
> 설계. 원칙: 결함 수정에 필요한 최소 변경, 훅 외부 계약(반환 시그니처) 유지.
>
> **Project**: ASCA **Author**: Claude (PDCA design) **Date**: 2026-07-06
> **Status**: Draft **Plan**:
> `docs/01-plan/features/asca-gallery-cultural-bugfix.plan.md`

---

## 1. Overview

### 1.1 실사 결과 요약 (2026-07-06, main 기준)

17건 전부 코드 수준으로 원인 확정. plan 대비 정정 사항 없음. 추가 확인:

- `use-image-zoom.ts`에는 이미 `fullscreenchange` 리스너가 존재(상태 동기화 이중
  경로) — F-1은 수동 `setIsFullscreen` 제거 + catch가 정답
- `use-virtual-exhibition.ts`에는 리스너 자체가 없음 — D-2는 리스너 신설
- `month-view.tsx`는 `'use client'` 지시자 없음(클라이언트 부모에서 소비) — 훅
  추가 시 파일 상단에 지시자 필요 여부 빌드로 확인
- 프로젝트에 `renderHook` 사용 전례 없음 — 본 사이클이 최초 도입
- 로거 컨벤션: `import { logger } from '@/lib/utils/logger'`

### 1.2 설계 결정

| #   | 결정                                                                                           | 근거                                                                    |
| --- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| D-1 | B-1 grid 모드는 **안내 카드 폴백** (overlay/split-view 기존 패턴 복제)                         | 실구현은 기능 추가 — 본 사이클 원칙(결함 최소 수정) 위배                |
| D-2 | 훅 반환 시그니처 변경은 **추가만 허용** (`isAnalyzing` 노출), 제거·개명 금지                   | 호출부 파급 차단                                                        |
| D-3 | E-2 dark 클래스 cleanup은 **마운트 시점 상태 복원** (`initialDarkRef`)                         | 사이트 전역 테마와의 충돌 방지 — 무조건 remove는 위험                   |
| D-4 | 3 PR 분할: PR-1 gallery(B·C·F-1) → PR-2 cultural(D·E·F-2·F-3) → PR-3 stroke-animation(A)       | A그룹이 최고 리스크(RAF·타이머) — 격리·후순위. 각 PR에 해당 테스트 동봉 |
| D-5 | 테스트는 `components/__tests__/` 신규 파일, `renderHook`+`jest.useFakeTimers`                  | 기존 인프라 재사용, a11y-cleanup 테스트 배치와 일관                     |
| D-6 | C-1(scale-0 버튼)은 자동 테스트 제외 — framer-motion 애니메이션 최종값의 jsdom 단언이 비결정적 | 1줄 prop 수정 + 수동 호버 확인으로 충분, 사유 기록                      |

---

## 2. 항목별 수정 명세

### A. use-stroke-animation.ts (PR-3)

**A-1 pause→play 재개** — 현재 `play()`가 무조건 `startTimeRef.current = null` →
`animate()`가 timestamp로 재초기화 → elapsed 0부터.

- `pausedElapsedRef = useRef(0)` 신설. `animate()`가 매 프레임 스케일된
  elapsed를 기록.
- `animate()`의 초기화 분기를
  `startTimeRef.current = timestamp - pausedElapsedRef.current / settings.playbackSpeed`
  로 변경 (pausedElapsed 0이면 기존과 동일).
- `pause()`는 상태만 변경(기존 유지). `stop()`·`resetAnimation()`·
  `nextStroke()`·`previousStroke()`·stroke 전환 시
  `pausedElapsedRef.current = 0`.

**A-2 loopMode 'single'** — 완료 분기(strokeProgress >= 1) 최상단에 추가:

```
if (settings.loopMode === 'single') {
  startTimeRef.current = timestamp   // 같은 stroke 처음부터
  pausedElapsedRef.current = 0
  animationRef.current = requestAnimationFrame(animate)
  return                             // advance/complete 분기 진입 금지
}
```

**A-3 loop 타이머 정리** —
`loopTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])` 신설.
`loopMode === 'all'` 분기의 outer·inner `setTimeout` 핸들 모두 push. `stop()`과
unmount cleanup(기존 `cancelAnimationFrame` 옆)에서 전부 `clearTimeout` 후 배열
비움.

**A-4 RAF 내 Image 캐시** —
`characterImageRef = useRef<HTMLImageElement | null>(null)` 신설 +
`characterImage` 의존 `useEffect`에서 1회 로드(`onload` 후 ref 저장, cleanup에서
`onload` 해제). `animate()`와 `initializeAnimation()`의 `new Image()` 경로를
`characterImageRef.current?.complete` 참조로 교체.

### B. artwork-comparison (PR-1)

**B-1 grid 폴백** — switch에 `case 'grid':` 추가, 기존 overlay/split-view
"Coming soon" Card 패턴 복제(문구
`Grid mode is under development. Coming soon!`). `default: return null` 유지.

**B-2 isAnalyzing 가드** — `use-artwork-comparison.ts`:

```
const [isAnalyzing, setIsAnalyzing] = useState(false)
const requestAnalysis = async () => {
  if (!onAnalysisRequest || selectedArtworks.length < 2 || isAnalyzing) return
  setIsAnalyzing(true)
  try { ... 기존 로직 ... } catch { ... 기존 logger ... }
  finally { setIsAnalyzing(false) }
}
```

반환 객체에 `isAnalyzing` 추가. `ArtworkComparison.tsx` 툴바의 Analyze 버튼에
`disabled={isAnalyzing}` 배선(버튼 위치는 renderToolbar — 구현 시 확인).

**B-3 콜백 ref null 정리** — `comparison-viewer.tsx`:

```
ref={(el: HTMLImageElement | null) => {
  imageRefs.current[index] = el   // null도 그대로 대입
}}
```

### C. gallery-grid (PR-1)

**C-1 scale-0 버튼** — `gallery-item.tsx` 공유·전체화면 `motion.button` 2개의
`animate`를 `{ scale: 1, rotate: 0 }`으로 변경(`initial`·`whileHover` 유지 —
등장 애니메이션 복원). 가시성 게이트는 부모 `opacity-0 group-hover:opacity-100`
그대로.

**C-2 onEvent 배선** — `GalleryGrid.tsx`에서 훅 반환 핸들러를 래핑(훅 무변경):

| 지점                         | 이벤트                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| 이미지 클릭(라이트박스 열기) | `{ type: 'gallery:image_open', payload: { itemId, category } }` |
| 공유 클릭                    | `{ type: 'gallery:share', payload: { itemId, category } }`      |
| 라이트박스 이전/다음         | `{ type: 'gallery:navigate', payload: { direction } }`          |

`useCallback`으로 래핑, `onEvent?.()` 옵셔널 호출. payload 형태는
GalleryClient의 gtag 소비부(`event.payload.category || event.payload.itemId`)와
호환.

### D. virtual-exhibition (PR-2)

**D-1 audio ref 분리** — `VirtualExhibition.tsx`에
`const guideAudioRef = useRef<HTMLAudioElement | null>(null)` 신설,
`<DetailView audioRef={guideAudioRef} ...>`로 교체. 훅의 `audioRef`는 배경음악
전용으로 남음(훅 무변경). DetailView props 타입은 기존
`RefObject<HTMLAudioElement | null>` 그대로.

**D-2 fullscreen 동기화** — `use-virtual-exhibition.ts`:

- `toggleFullscreen`에서 수동 `setIsFullscreen(!isFullscreen)` 제거,
  `requestFullscreen()?.catch(...)`·`exitFullscreen().catch(...)` 로깅.
- `fullscreenchange` 리스너 `useEffect` 신설(use-image-zoom.ts 기존 패턴 복제):
  `setIsFullscreen(!!document.fullscreenElement)` + cleanup.

**D-3 audio.play() 실패 처리** — `toggleAudio`:

```
if (audioEnabled) { audioRef.current.pause(); setAudioEnabled(false) }
else {
  audioRef.current.play()
    .then(() => setAudioEnabled(true))
    .catch(err => logger.warn('Background audio playback rejected', err))
}
```

상태가 실제 재생 결과를 따르도록 변경.

### E. use-accessibility-settings.ts (PR-2)

**E-1 auto 색상 스킴** — colorScheme 분기 교체:

```
if (accessibilitySettings.colorScheme === 'auto') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  root.classList.toggle('dark', mq.matches)
  const onChange = (e: MediaQueryListEvent) => root.classList.toggle('dark', e.matches)
  mq.addEventListener('change', onChange)
  // effect cleanup에서 removeEventListener
} else {
  root.classList.toggle('dark', accessibilitySettings.colorScheme === 'dark')
}
```

리스너 해제는 해당 effect의 cleanup으로 편입(설정 변경·언마운트 시 자동 해제).

**E-2 언마운트 전역 스타일 복원** — 마운트 1회 effect에서
`initialDarkRef.current = root.classList.contains('dark')` 캡처. 메인 effect에
cleanup 추가:

- `root.style.removeProperty('font-size' | 'line-height' | 'letter-spacing' | 'filter')`
- `root.style.removeProperty('--transition-duration')`
- `root.classList.remove('focus-visible')`
- `root.classList.toggle('dark', initialDarkRef.current)` — 마운트 시점 상태
  복원(D-3 결정)

주의: 이 cleanup은 effect 재실행 시에도 돌므로, 재실행 직후 본문이 다시 적용하는
순서(React 보장)에 의존 — 시각 플리커 없음(jsdom 테스트로 최종 상태 단언).

### F. 개별 (F-1 PR-1 / F-2·F-3 PR-2)

**F-1 use-image-zoom fullscreen** — `toggleFullscreen`에서 수동
`setIsFullscreen` 2곳 제거(기존 `fullscreenchange` 리스너가 단일 소스),
`requestFullscreen()?.catch`·`exitFullscreen().catch` 로깅 추가.

**F-2 month-view isToday** — 컴포넌트에
`const [todayKey, setTodayKey] = useState<string | null>(null)` +
`useEffect(() => setTodayKey(new Date().toDateString()), [])`. 셀 판정은
`todayKey !== null && date.toDateString() === todayKey`. 초기(서버·첫 클라)
렌더에는 하이라이트 없음 — **의도된 트레이드오프**(plan §5). `useState`/
`useEffect` import 추가, 클라이언트 컨텍스트는 부모가 보장(빌드로 검증).

**F-3 use-learning-hub switch 스코프** — `case 'duration': {` ... `}` 블록으로
감싸기 (동작 무변경).

---

## 3. Test Plan (스코프 G — `components/__tests__/`)

`renderHook`(@testing-library/react)·`jest.useFakeTimers` 프로젝트 최초 도입.
jsdom 미지원 API는 테스트 로컬 mock: `HTMLCanvasElement.prototype.getContext`
(최소 2d 스텁), `window.matchMedia`, `HTMLMediaElement.play/pause`,
`fullscreenchange`/`document.fullscreenElement`.

| 파일                                  | 케이스                                                                                                                                                   | 대상                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `use-stroke-animation.test.tsx`       | ① stop() 후 fake timer 진행 시 재생 재개 없음(타이머 정리) ② unmount 후 pending 타이머 0 (`jest.getTimerCount`) ③ single 모드 완료 시 currentStroke 불변 | A-2·A-3 (A-1은 RAF timestamp 제어 가능 범위에서 resume elapsed 보존 시도 — 불안정 시 제외하고 사유 기록) |
| `use-artwork-comparison.test.tsx`     | deferred promise로 requestAnalysis 2연속 호출 → onAnalysisRequest 1회 / isAnalyzing true→false 전이                                                      | B-2                                                                                                      |
| `gallery-grid-events.test.tsx`        | GalleryGrid 렌더 + 이미지 클릭·공유 클릭 → onEvent spy가 type·payload로 호출됨                                                                           | C-2                                                                                                      |
| `use-accessibility-settings.test.tsx` | ① dark→auto 전환 시 matchMedia 결과 반영(잔존 dark 제거) ② unmount 후 documentElement 인라인 스타일·focus-visible 제거, dark는 초기 상태 복원            | E-1·E-2                                                                                                  |
| `use-virtual-exhibition.test.tsx`     | ① play() reject 시 audioEnabled false 유지·unhandled rejection 없음 ② fullscreenchange 디스패치로 isFullscreen 동기화                                    | D-2·D-3                                                                                                  |
| `use-learning-hub.test.tsx`           | duration 필터 short/medium/long 경계값 회귀                                                                                                              | F-3                                                                                                      |
| `month-view-today.test.tsx`           | 마운트 후 오늘 셀에 ring 클래스 존재                                                                                                                     | F-2                                                                                                      |

- **fail-first**: B-2·D-3·E-1·A-③은 수정 전 RED 확인 가능 — 구현 순서에서 테스트
  먼저 작성.
- 자동 테스트 제외: C-1(D-6), B-1(정적 폴백 — switch 케이스는 tsc로 충분),
  B-3·F-1(단순 정리·기존 리스너 의존), D-1(ref 배선 — 수동 확인), A-1(불안정
  시).

### 게이트 매트릭스

| 검증             | 기준                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| 신규 동작 테스트 | 전 케이스 GREEN (fail-first 항목은 RED 선확인)                                                  |
| 기존 회귀        | test:ci 401+ GREEN, a11y 게이트(lint 5룰·axe 9) 유지                                            |
| 타입/빌드/포맷   | tsc 0 · build · prettier (**PDCA md 포함**)                                                     |
| 수동 스팟 체크   | stroke 재생(pause→resume·single loop·stop), gallery 호버 버튼, exhibition 음악 토글+상세뷰 왕복 |

---

## 4. 구현 순서 및 PR 분할 (D-4)

| PR                | 스코프                                   | 파일                                                                                                              |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **PR-1 gallery**  | B-1·B-2·B-3·C-1·C-2·F-1 + 테스트 2건     | comparison-viewer, use-artwork-comparison, ArtworkComparison(disabled), gallery-item, GalleryGrid, use-image-zoom |
| **PR-2 cultural** | D-1·D-2·D-3·E-1·E-2·F-2·F-3 + 테스트 4건 | VirtualExhibition, use-virtual-exhibition, use-accessibility-settings, month-view, use-learning-hub               |
| **PR-3 stroke**   | A-1·A-2·A-3·A-4 + 테스트 1건             | use-stroke-animation                                                                                              |

각 PR 독립(base main, stacked 아님 — 파일 겹침 없음). 각 PR:
`.commit_message.txt` 갱신, prettier, CodeRabbit 스레드 커밋 참조.

---

## 5. Security Considerations

해당 없음 — 클라이언트 로직 결함 수정. 신규 외부 입력·네트워크 경로 없음.

---

## 6. Out of Scope 재확인

- grid 모드 실구현(폴백만), overlay/split-view TODO — 기존 유지
- JSDoc·perf(next/dynamic·memo)·타입/중복 — plan §2.2 동결
- 수정 파일을 만지더라도 동일 파일 내 다른 결함 클래스 수정 금지(스코프 크리프
  방지)

---

## Version History

| Version | Date       | Changes                                                     | Author |
| ------- | ---------- | ----------------------------------------------------------- | ------ |
| 0.1     | 2026-07-06 | 초안 — 17건 코드 실사 명세, D-1~D-6 결정, 테스트 7파일 설계 | Claude |
