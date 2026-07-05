---
template: design
version: 1.2
feature: asca-component-split-phase-3-4
date: 2026-06-16
author: jaehong
project: ASCA (my-v0-project)
status: draft
---

# asca-component-split-phase-3-4 Design Document

> **Summary**: ESLint `max-lines`(500) 초과 **10파일** 중 9개를 **동작 보존
> 분리**, 1개(shadcn vendor sidebar)는 **eslint 예외**. 각 파일별 *진입 파일
> 경로·export·렌더 DOM은 불변*으로 두고, 부품(types·hook·sub-component·data)만
> co-located 서브모듈로 추출한다. 기능 변경 0.
>
> **Project**: ASCA (my-v0-project) · **Author**: jaehong · **Date**: 2026-06-16
> **Status**: Draft · **Planning Doc**:
> [asca-component-split-phase-3-4.plan.md](../../01-plan/features/asca-component-split-phase-3-4.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- `npm run lint` **max-lines 경고 10 → 0** (분리 9 + 예외 1)
- 거대 모놀리식 컴포넌트를 **타입 / 로직(hook) / 프레젠테이션(sub-component) /
  데이터** 4축으로 분해해 유지보수성 확보
- **무결성**: 분리 전후 렌더 DOM·className·props·기존 테스트(389) 완전 동등

### 1.2 Design Principles

- **비파괴 진입점(Non-breaking entry)**: 외부에서 import 되는 파일
  (`StrokeAnimationPlayer.tsx` 등)의 **경로와 export 시그니처를 유지**한다. 외부
  importer를 건드리지 않기 위해, 추출 부품은 같은 디렉토리의 co-located
  서브디렉토리로 옮기고 진입 파일은 "shell(조립자)"로 남긴다.
- **CLAUDE.md Large File Refactoring Process** 준수: (1) Component Extraction →
  (2) Logic Separation(custom hook) → (3) Data Externalization → (4) type-check
  검증.
- **확립 패턴 재사용**: 그룹 `_components/`(app/\* 다수 선례), cultural
  `_constants/`(`color-classes.ts` 기존), 중앙 `hooks/`(useGallery 등).
- **행동 보존이 안전망**: 신규 테스트 없이 기존 행동 테스트 무수정 통과 + DOM
  등가가 분리의 검증 기준 (smart-quote history-table-refactor 패턴).

---

## 2. Architecture

### 2.1 분해 패턴 (4축)

```
[진입 파일 = shell]  ← 경로/export 불변, 외부 import 안전
      │ 조립(compose)만 담당, ≤ ~350줄 목표
      ├──▶ types.ts            (interface/type)         ── Domain
      ├──▶ use-<feature>.ts    (state·effect·callback)  ── Application(로직)
      ├──▶ <part>.tsx ×N       (JSX 패널/뷰)            ── Presentation
      └──▶ <feature>.data.ts / _constants/  (리터럴 데이터·프리셋·맵)
```

### 2.2 디렉토리 배치 (그룹별, co-located)

| 그룹     | 진입 파일(불변)                  | 추출 위치(신규)                                                                             |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| gallery  | `components/gallery/<Name>.tsx`  | `components/gallery/<kebab-name>/{types.ts, use-*.ts, *.tsx}`                               |
| cultural | `components/cultural/<Name>.tsx` | `components/cultural/<kebab-name>/{...}` + 데이터는 기존 `components/cultural/_constants/`  |
| bylaws   | `app/.../bylaws-content.tsx`     | `app/articles-of-incorporation-and-bylaws/_components/bylaws/{bylaws.data.ts, chapter.tsx}` |

> 진입 파일을 디렉토리로 이동하지 **않는다**(이동 시 외부 import 경로 깨짐).
> 서브디렉토리는 진입 파일의 형제로 생성한다.

### 2.3 네이밍 컨벤션 (실측 기반)

| 대상               | 규칙                        | 근거(repo 선례)                        |
| ------------------ | --------------------------- | -------------------------------------- |
| 진입/메인 컴포넌트 | PascalCase.tsx (불변)       | `StrokeAnimationPlayer.tsx`            |
| 추출 sub-component | kebab-case.tsx              | `hero.tsx`, `dao-architecture.tsx`     |
| custom hook        | `use-*.ts` (kebab)          | `use-mobile.tsx`, `use-toast.ts`       |
| types              | `types.ts` (co-located)     | —                                      |
| data/constants     | `*.data.ts` / `_constants/` | cultural `_constants/color-classes.ts` |

---

## 3. 파일별 분해 청사진 (Module Inventory)

> 측정값(2026-06-15 실측): state/effect/callback/JSX 카운트. **라인 예산은 shell
> ≤ ~350 목표**(prettier 멀티라인 + JSDoc +30~50 비논리 비용 사전 반영,
> [[feedback_refactor_line_budget_buffer]]). 정확한 라인 범위·JSX seam은 `do`
> 단계에서 실제 코드를 보고 확정 — 본 설계는 **타깃 모듈 + 책임 + 예산** 까지만
> 규정(읽지 않은 JSX 구조를 단정하지 않음).

### G1 · StrokeAnimationPlayer.tsx (901) — 로직 무거움

interfaces 5 · useState 7 · useEffect 3 · useCallback 6 · useRef 5 (canvas/RAF)

| 추출 모듈                                  | 책임                                                             | 예산 |
| ------------------------------------------ | ---------------------------------------------------------------- | ---: |
| `stroke-animation/types.ts`                | AnimationSettings·StrokePoint·AnimatedStroke·Props·PlaybackState |  ~80 |
| `stroke-animation/use-stroke-animation.ts` | 재생 상태머신(7 state·3 effect·6 callback·RAF/canvas ref)        | ~280 |
| `stroke-animation/playback-controls.tsx`   | 재생/정지/속도 컨트롤 패널                                       | ~120 |
| `stroke-animation/settings-panel.tsx`      | 애니메이션 설정 패널                                             | ~120 |
| **`StrokeAnimationPlayer.tsx`** (shell)    | canvas + 컨트롤 + 패널 조립                                      | ~250 |

### G2 · ArtworkComparison.tsx (821) — 로직 무거움

interfaces 4 · useState 8 · useCallback 9 · handler 6 · useRef 3

| 추출 모듈                                       | 책임                                                | 예산 |
| ----------------------------------------------- | --------------------------------------------------- | ---: |
| `artwork-comparison/types.ts`                   | ComparisonMode·ComparisonAnalysis·Props·ViewerState |  ~70 |
| `artwork-comparison/use-artwork-comparison.ts`  | 뷰어 상태 + 비교 로직(8 state·9 callback)           | ~260 |
| `artwork-comparison/artwork-comparison.data.ts` | ComparisonMode/Analysis 프리셋 데이터               |  ~80 |
| `artwork-comparison/comparison-viewer.tsx`      | 좌우 비교 뷰 + 모드/분석 패널                       | ~200 |
| **`ArtworkComparison.tsx`** (shell)             | 조립                                                | ~200 |

### G3 · GalleryGrid.tsx (820) — 로직 + helper

interfaces 1 · useState 8 · useCallback 8 · useMemo 2 · handler 6 · top-level
helper 3(getRandomAspectRatio/getCategoryIcon/getCategoryName)

| 추출 모듈                            | 책임                                                               | 예산 |
| ------------------------------------ | ------------------------------------------------------------------ | ---: |
| `gallery-grid/gallery-grid.utils.ts` | getRandomAspectRatio·getCategoryIcon·getCategoryName + 카테고리 맵 |  ~90 |
| `gallery-grid/use-gallery-grid.ts`   | 필터·정렬·선택 상태(8 state·8 callback·2 memo)                     | ~240 |
| `gallery-grid/gallery-item.tsx`      | 단일 카드/아이템 렌더                                              | ~160 |
| **`GalleryGrid.tsx`** (shell)        | 툴바 + 그리드 조립                                                 | ~250 |

### G4 · ZoomableImageViewer.tsx (702) — 최고 복잡

interfaces 3 · useState 9 · useCallback 17 · handler 13 · useRef 4 ·
MeasurementTool

| 추출 모듈                                  | 책임                                  | 예산 |
| ------------------------------------------ | ------------------------------------- | ---: |
| `zoomable-image-viewer/types.ts`           | ViewerState·Props·MeasurementTool     |  ~70 |
| `zoomable-image-viewer/use-image-zoom.ts`  | zoom/pan 변환 상태 + 휠/드래그 핸들러 | ~230 |
| `zoomable-image-viewer/use-measurement.ts` | 측정 도구 로직(거리/좌표)             | ~150 |
| `zoomable-image-viewer/zoom-controls.tsx`  | 줌 컨트롤 + 측정 오버레이 UI          | ~170 |
| **`ZoomableImageViewer.tsx`** (shell)      | 캔버스 + 컨트롤 조립                  | ~200 |

### C1 · CulturalAccessibility.tsx (745) — 패널 + 설정 데이터

interfaces 4 · useState 6 · useEffect 4 · JSX 145 · object-entry 86 → **패널
다수 + 기본설정 데이터**

| 추출 모듈                                              | 책임                                                         | 예산 |
| ------------------------------------------------------ | ------------------------------------------------------------ | ---: |
| `cultural-accessibility/types.ts`                      | AccessibilitySettings·LanguageSettings·CulturalContext·Props |  ~70 |
| `cultural/_constants/accessibility-defaults.ts`        | 기본 설정 프리셋(접근성/언어/문화맥락)                       | ~120 |
| `cultural-accessibility/use-accessibility-settings.ts` | 설정 상태 + DOM 반영 effect(6 state·4 effect)                | ~180 |
| `cultural-accessibility/accessibility-panel.tsx`       | 접근성 설정 패널                                             | ~140 |
| `cultural-accessibility/language-panel.tsx`            | 언어/문화맥락 패널                                           | ~120 |
| **`CulturalAccessibility.tsx`** (shell)                | 탭/패널 조립                                                 | ~150 |

### C2 · CulturalCalendar.tsx (698) — 날짜 계산 로직 + 그리드 JSX

interfaces 3 · useState 5 · useMemo 3 · JSX 100 · 전통날짜
계산(elements/animals/seasons as-const)

| 추출 모듈                                    | 책임                                             | 예산 |
| -------------------------------------------- | ------------------------------------------------ | ---: |
| `cultural-calendar/types.ts`                 | CulturalEvent·TraditionalDate·Props              |  ~80 |
| `cultural-calendar/traditional-date.ts`      | 음력/오행/십이지/계절 파생(as-const 배열 + 계산) | ~140 |
| `cultural-calendar/use-cultural-calendar.ts` | 월/필터 상태 + 파생 memo(5 state·3 memo)         | ~160 |
| `cultural-calendar/calendar-grid.tsx`        | 달력 그리드 + 이벤트 리스트                      | ~200 |
| **`CulturalCalendar.tsx`** (shell)           | 필터 + 그리드 조립                               | ~150 |

### C3 · LearningHub.tsx (600) — 리소스 데이터 + 패널

interfaces 4 · useState 6 · JSX 133 · object-entry 57 → **리소스 시드 데이터 +
카드/패널**

| 추출 모듈                             | 책임                                             | 예산 |
| ------------------------------------- | ------------------------------------------------ | ---: |
| `learning-hub/types.ts`               | LearningResource·LearningPath·UserProgress·Props |  ~90 |
| `learning-hub/learning-hub.data.ts`   | LearningResource/LearningPath 시드 데이터        | ~150 |
| `learning-hub/resource-grid.tsx`      | 리소스 카드 그리드                               | ~150 |
| `learning-hub/learning-path-view.tsx` | 학습 경로 + 진행 패널                            | ~130 |
| **`LearningHub.tsx`** (shell)         | 탭 + 뷰 조립                                     | ~150 |

### C4 · VirtualExhibition.tsx (558) — 뷰어 상태

interfaces 3 · useState 10 · JSX 104 · useRef 3

| 추출 모듈                                      | 책임                               | 예산 |
| ---------------------------------------------- | ---------------------------------- | ---: |
| `virtual-exhibition/types.ts`                  | ExhibitionArtwork·Exhibition·Props |  ~90 |
| `virtual-exhibition/use-virtual-exhibition.ts` | 네비게이션/뷰어 상태(10 state)     | ~160 |
| `virtual-exhibition/exhibition-viewer.tsx`     | 작품 뷰어 + 네비게이터 + 정보 패널 | ~200 |
| **`VirtualExhibition.tsx`** (shell)            | 조립                               | ~150 |

### A1 · bylaws-content.tsx (763) — 순수 콘텐츠

useState/effect/callback/interface **0** · `<section/h2/h3>` 131 → **로직 0,
순수 JSX 콘텐츠**

| 추출 모듈                               | 책임                                            | 예산 |
| --------------------------------------- | ----------------------------------------------- | ---: |
| `_components/bylaws/bylaws.data.ts`     | 장·조 콘텐츠를 구조화 데이터(제목 + 항/호 문단) | ~300 |
| `_components/bylaws/bylaws-chapter.tsx` | 데이터 1장 → 섹션 JSX 렌더(제목/조/항 매핑)     | ~120 |
| **`bylaws-content.tsx`** (shell)        | `bylaws.data` map → `<BylawsChapter>`           | ~120 |

> A1 데이터 모델: 콘텐츠가 균일(장→조→항)하면 **데이터 주도(data-driven)** 가
> 최적. 일부 장에 고유 JSX(표·각주)가 있으면 해당 장만 별도 `chapter-N.tsx`로
> 분기(혼합 허용). `do`에서 실제 마크업 확인 후 균일/혼합 결정.

### V · components/ui/sidebar.tsx (736) — shadcn vendor 예외

분리 **안 함**. §4 참조.

---

## 4. sidebar — ESLint 예외 설계 (R-1)

`.eslintrc.json`은 이미 `overrides`에 `max-lines: "off"`
패턴(tests·scripts·`lib/db/schema.ts`·seed)을 사용 중. 동일 방식으로 vendor 예외
추가:

```jsonc
// .eslintrc.json overrides[] 에 추가
{
  "files": ["components/ui/sidebar.tsx"],
  "rules": { "max-lines": "off" }, // shadcn/ui vendor (radix slot·cva·forwardRef) — 상류 재생성과 발산 방지
}
```

**결정**: `components/ui/**` 광역이 아닌 **단일 파일 글롭**을 채택.

- 사유: `components/ui/**` 광역은 향후 비-vendor ui 파일이 500을 넘겨도 침묵 →
  부채 은폐. 현재 위반은 sidebar 1건뿐이므로 좁게 예외.
- 확장 트리거: 추가 shadcn vendor 파일이 500 초과 시, **문서화된 vendor 파일
  목록**(`["components/ui/sidebar.tsx", "components/ui/<next>.tsx"]`)으로 확대.
  (광역 `**`는 마지막 수단)

---

## 5. 레이어 매핑 (Clean Architecture 적용)

분해 4축이 레이어에 그대로 대응 — 의존 방향 단방향 유지:

| 레이어            | 산출물                                   | import 규칙                         |
| ----------------- | ---------------------------------------- | ----------------------------------- |
| Presentation      | shell + `*.tsx` sub-component            | hook·types·data import 가능         |
| Application(로직) | `use-*.ts`                               | types·data·lib import; **JSX 금지** |
| Domain            | `types.ts`                               | 외부 의존 0 (순수 타입)             |
| Data/Infra        | `*.data.ts`, `_constants/`, `*.utils.ts` | types만 import                      |

**의존 방향**: Presentation → Application → Domain ← Data. shell은 hook과
sub-component를 조립만, 비즈니스 상태는 hook 안에. 역방향(hook이 JSX import)
금지.

---

## 6. 검증 계획 (행동 보존 게이트)

| 게이트         | 명령                           | 기준                                           |
| -------------- | ------------------------------ | ---------------------------------------------- |
| 타입           | `npm run type-check`           | 0 errors (implicit any·JSX 닫힘 주의)          |
| lint(핵심 KPI) | `npm run lint`                 | 해당 파일 **max-lines 경고 제거**, 신규 경고 0 |
| 동적 클래스    | (lint 내 no-restricted-syntax) | `bg-${}` 등 금지 — 정적 lookup 유지            |
| 테스트         | `npm run test:ci`              | **389 무수정 통과**(신규 테스트 추가 안 함)    |
| 포맷           | `npm run format:check`         | green (신규/이동 파일 `prettier --write` 필수) |
| design 게이트  | `design:lint`/`diff`/`wcag`    | UI 토큰 변경 0 → 무영향 확인                   |

**핵심 회귀 기준**: 분리 전후 **렌더 DOM·className·props 동등**. 기존 테스트가
안전망. CI Code Quality(`prettier --check .`)는 신규 md/tsx 미포맷 시 red → 커밋
전 format 필수 ([[feedback_unref_timer_jest_teardown_leak]] 부수교훈).

> 테스트 매핑: gallery/cultural 컴포넌트의 기존 행동 테스트가 분리 후에도 동일
> 셀렉터로 통과하는지가 1차 신호. 테스트 없는 컴포넌트는 DOM 스냅샷 수동 비교
> (`do`에서 분리 전/후 렌더 결과 diff).

---

## 7. 구현 순서 & PR 분할 (R-2 점진)

```
Phase 3a  V sidebar eslint 예외 (1 override 블록)   → 경고 즉시 1↓, trivial, 단독 PR 가능
Phase 3b  gallery G1~G4 (복잡도·가치 최고)          → 파일별 PR 또는 gallery 묶음 PR
Phase 4a  cultural C1~C4                            → 파일별 PR
Phase 4b  bylaws A1 (콘텐츠 데이터화)              → 단독 PR
```

- 각 PR = 1파일(또는 1그룹) 분리 + 6번 게이트 전부 green.
- 9파일 단일 PR **금지**(리뷰 불가·회귀 위험). gallery→cultural→bylaws 순.
- 제안: PR1 = Phase 3a(sidebar 예외, 즉효), PR2~ = 파일별 분리.

---

## 8. Risks & Mitigations

| 리스크                         | 완화                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| 분리 중 동작 회귀              | 기존 test:ci 389 무수정 통과 + DOM 등가성 확인이 게이트        |
| shell이 분리 후에도 500 근처   | shell 예산 ≤350 목표(버퍼 반영), 부족 시 sub-component 더 쪼갬 |
| 진입 파일 이동으로 import 깨짐 | **진입 파일 경로 불변**, 부품만 형제 서브디렉토리로 추출       |
| hook이 JSX 의존(레이어 역전)   | use-\*.ts는 JSX import 금지 — §5 규칙, 리뷰 체크               |
| CI Code Quality(prettier) red  | 신규/이동 파일 `prettier --write` 필수                         |
| 동적 Tailwind 클래스 누락      | no-restricted-syntax 유지 — `_constants` 정적 lookup 패턴 준수 |
| bylaws 데이터화 과도설계       | 균일 콘텐츠만 data-driven, 고유 JSX 장은 분기 — `do`서 결정    |

---

## 9. Success Criteria (Plan §6 정합)

- [ ] `npm run lint` max-lines 경고 **10 → 0** (분리 9 + sidebar 예외 1)
- [ ] type-check 0 · test:ci 389 pass · format:check green · design 게이트 통과
- [ ] 기능 동작 무변경 (행동 테스트 무수정 통과 · DOM 등가)
- [ ] sidebar = 분리 아닌 단일 파일 eslint 예외(사유 주석)
- [ ] 진입 파일 export/경로 불변 (외부 importer 무변경)

---

## Version History

| Version | Date       | Changes                                                                                                                                                                                                             | Author  |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 0.1     | 2026-06-16 | 최초. 9파일 분해 청사진(타입/hook/sub-component/data 4축·모듈 인벤토리+예산) + sidebar 단일파일 eslint 예외 + 비파괴 진입점 원칙 + 레이어 매핑 + 점진 PR 순서. cultural은 실측상 JSX 패널 비중 큼→sub-component 1차 | jaehong |
