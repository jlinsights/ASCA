# asca-a11y-cleanup Design Document

> **Summary**: gallery·cultural 컴포넌트군 접근성 결함(라벨 미연결·aria-label
> 누락·키보드 접근 불가·array-index key) 파일별 수정 명세 + jest-axe·ESLint
> 스코프 게이트 설계
>
> **Project**: ASCA **Author**: Claude (PDCA design) **Date**: 2026-07-05
> **Status**: Draft **Plan**: `docs/01-plan/features/asca-a11y-cleanup.plan.md`

---

## 1. Overview

### 1.1 Design Goals

1. Plan In-Scope 15 스레드(실측 확장 ~40 인스턴스)를 파일별로 정확히 명세해 구현
   모호성 제거
2. 회귀 방지 게이트를 **스코프 한정 error**로 설계 — 전역 활성화는 불가함을
   실측으로 확정
3. 시각·동작 변화 최소화: a11y 속성 추가가 원칙, DOM 구조 변경은 lightbox(FR-04)
   한 곳으로 격리

### 1.2 사전 전수 측정 결과 (2026-07-05 실측, 설계 확정 근거)

**후보 5룰 전역 적용 시** (`--no-eslintrc` 단독 측정):

| 룰                                        |           전역 위반 | 대상 8개 디렉터리 내 |
| ----------------------------------------- | ------------------: | -------------------: |
| `react/no-array-index-key`                |                  99 |                   10 |
| `jsx-a11y/label-has-associated-control`   |                  48 |                   17 |
| `jsx-a11y/control-has-associated-label`   |                  44 |                    6 |
| `jsx-a11y/no-static-element-interactions` |                  18 |                    4 |
| `jsx-a11y/click-events-have-key-events`   |                   9 |                    2 |
| **합계**                                  | **218 (99개 파일)** |   **39 (15개 파일)** |

**결정 D-1**: 전역 error 승격 불가(218건), 전역 warn도
불가(`lint:strict --max-warnings 0` CI 게이트 파괴). → **ESLint override로 대상
디렉터리에만 error 적용**. 전역 롤아웃은 `asca-a11y-rules-rollout` 후속 후보로
이관.

**결정 D-2**: 대상 디렉터리 내 39건은 CodeRabbit 지적(15 스레드)의 상위집합 —
cultural-calendar(index key 3)·resource-card(key 1)·detail-view(key
1)·resources-tab 필터 select 등 동종 결함 포함. **게이트가 잡는 것은 전부 수정**
(스코프 자연 확장, 동일 결함 클래스).

### 1.3 Design Principles

- a11y 속성(aria-\*, id/htmlFor, role, tabIndex)·키 핸들러 **추가**가 기본; 기존
  클래스·구조·애니메이션 불변
- `id`는 전부 `React.useId()` 파생(SSR 안전·다중 인스턴스 충돌 방지) — 하드코딩
  id 금지
- key는 콘텐츠 기반, 중복 가능 값은 `${value}-${index}` 복합
- 아이콘 버튼 `aria-label`은 영어 고정(주변 UI 텍스트가 영어: "Loop Mode",
  "Search resources..." 등과 일관)

---

## 2. Architecture

### 2.1 Dependencies

| 항목                            | 변경                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| `jest-axe` + `@types/jest-axe`  | devDependencies 신규 추가                                        |
| `@radix-ui/react-dialog`        | 기설치 (components/ui/dialog.tsx에서 사용 중) — FR-04에서 재사용 |
| `eslint-plugin-jsx-a11y` ^6.8.0 | 기설치 — override로 룰만 활성화                                  |

### 2.2 수정 파일 목록 (구현 순서)

| #   | 파일                                                                 | FR           | 변경 유형                            |
| --- | -------------------------------------------------------------------- | ------------ | ------------------------------------ |
| 1   | `components/gallery/stroke-animation/playback-controls.tsx`          | FR-01        | aria-label 8개                       |
| 2   | `components/gallery/artwork-comparison/analysis-panel.tsx`           | FR-01, FR-05 | aria-label 1 + key 3                 |
| 3   | `components/cultural/virtual-exhibition/detail-view.tsx`             | FR-01, FR-05 | aria-label 1 + key 1                 |
| 4   | `components/gallery/stroke-animation/settings-panel.tsx`             | FR-02        | id/htmlFor 1쌍(+체크박스 4개 조건부) |
| 5   | `components/cultural/cultural-accessibility/accessibility-panel.tsx` | FR-02        | 6개 연결                             |
| 6   | `components/cultural/cultural-accessibility/cultural-panel.tsx`      | FR-02        | 5개 연결                             |
| 7   | `components/cultural/cultural-accessibility/language-panel.tsx`      | FR-02        | 5개 연결                             |
| 8   | `components/cultural/learning-hub/resources-tab.tsx`                 | FR-02        | aria-label 4개                       |
| 9   | `components/cultural/learning-hub/overview-tab.tsx`                  | FR-03        | role/tabIndex/키핸들러               |
| 10  | `components/cultural/virtual-exhibition/gallery-view.tsx`            | FR-03        | role/tabIndex/키핸들러               |
| 11  | `components/gallery/artwork-comparison/comparison-viewer.tsx`        | FR-03        | role/aria/키보드 팬·줌               |
| 12  | `components/gallery/gallery-grid/gallery-item.tsx`                   | FR-05        | key 1                                |
| 13  | `components/gallery/gallery-grid/gallery-lightbox.tsx`               | FR-04, FR-05 | 포커스 트랩 + key 1                  |
| 14  | `components/cultural/cultural-calendar/month-view.tsx`               | FR-05        | key 2                                |
| 15  | `components/cultural/learning-hub/resource-card.tsx`                 | FR-05        | key 1                                |
| 16  | `components/cultural/cultural-calendar/event-list.tsx`               | FR-05        | lint 검출 1건 위치 확인 후 수정      |
| 17  | `.eslintrc.json`                                                     | FR-06        | override 블록                        |
| 18  | `__tests__/a11y/*.test.tsx`                                          | FR-06        | jest-axe 스모크 신규                 |

---

## 3. 파일별 수정 명세

### FR-01. 아이콘/기호 전용 버튼 aria-label

**1) playback-controls.tsx** — 실측 8개 버튼 (Plan의 5개에서 확장: 속도 ±
2개·Pause 분리 확인):

| 버튼 (라인)       | aria-label        |
| ----------------- | ----------------- |
| SkipBack (~37)    | `Previous stroke` |
| Pause (~48)       | `Pause animation` |
| Play (~56)        | `Play animation`  |
| Square (~65)      | `Stop animation`  |
| SkipForward (~69) | `Next stroke`     |
| Minus 속도 (~82)  | `Decrease speed`  |
| Plus 속도 (~98)   | `Increase speed`  |
| Settings (~114)   | `Toggle settings` |

**2) analysis-panel.tsx:25** — `✕` 닫기 버튼 →
`aria-label='Close analysis panel'`

**3) detail-view.tsx:~169** — `<audio controls>`는 네이티브 접근성 확보(실측:
CodeRabbit 지적과 달리 양호). `<audio>`에
`aria-label={'Audio guide: ' + selectedArtwork.title...}` 추가로
lint(`control-has-associated-label`) 및 지적 스레드 동시 해소.

### FR-02. 폼 라벨 ↔ 컨트롤 연결

**공통 패턴 A — `<select>`/`<input>`:**

```tsx
const id = useId()
<label htmlFor={id} ...>Font Family</label>
<select id={id} ...>
```

**공통 패턴 B — 버튼 그룹/토글 (label이 프로그래매틱 연결 불가한 대상):**

```tsx
const labelId = useId()
<span id={labelId} className='(기존 label 클래스 유지)'>Color Scheme</span>
<div role='group' aria-labelledby={labelId}>
  <Button aria-pressed={selected} ...>
```

- `<label>` → `<span>` 전환 이유: label은 labelable 요소 전용, 버튼 그룹에는
  `aria-labelledby`가 표준. 클래스 유지로 시각 불변.
- 토글 단일 버튼: `aria-pressed` 추가(현재 variant로만 상태 표현 중).

**파일별 적용:**

| 파일                    | 패턴 A (select)                                                                                                                                  | 패턴 B (버튼 그룹/토글)                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| settings-panel.tsx      | Loop Mode 1                                                                                                                                      | — (체크박스 4개는 label 래핑 기연결 — lint가 여전히 flag하면 명시 id/htmlFor 추가)                            |
| accessibility-panel.tsx | Font Family, Contrast                                                                                                                            | Font Size(±버튼 group), Line Height(±버튼 group), Color Scheme(3버튼 group), Reduce Motion(토글+aria-pressed) |
| cultural-panel.tsx      | Name/Date/Number Format 3                                                                                                                        | Cultural Explanations·Historical Context 토글 2(+aria-pressed)                                                |
| language-panel.tsx      | Secondary Language, Translation Display 2                                                                                                        | Primary Language(버튼 group), Show Romanization·Pronunciation Guide 토글 2(+aria-pressed)                     |
| resources-tab.tsx       | 검색 input `aria-label='Search resources'` + Difficulty/Type/Duration 필터 select 3에 `aria-label` (라벨 텍스트 자체가 없으므로 aria-label 방식) | —                                                                                                             |

### FR-03. 키보드 접근성

**공통 패턴 C — 클릭 카드/타일:**

```tsx
<div
  role='button'
  tabIndex={0}
  onClick={handler}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler() } }}
  aria-label={/* 대상 명칭 */}
>
```

| 파일                  | 대상               | aria-label                                                                                                  |
| --------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| overview-tab.tsx:~134 | Learning Path 카드 | `` `Select learning path: ${path.title}` ``                                                                 |
| gallery-view.tsx:~48  | 작품 타일          | `` `View artwork: ${artwork.title.original ?? artwork.title}` `` (실제 title 필드 구조는 구현 시 타입 확인) |

**comparison-viewer.tsx:~44 — 팬·줌 뷰어 (별도 설계):**

```tsx
<div
  role='application'
  aria-label={`Artwork viewer: ${artwork.title}. Use arrow keys to pan, plus and minus to zoom.`}
  tabIndex={0}
  onKeyDown={handleViewerKeyDown}
  ...기존 마우스 핸들러 유지
>
```

- `handleViewerKeyDown`: Arrow 4방향 → offset ±20px, `+`/`=` → scale +0.2, `-` →
  scale −0.2 (기존 훅의 setViewerStates 재사용, wheel/drag와 동일 상태 경로).
  포커스 링: `focus-visible:ring-2` 클래스 추가.
- `no-static-element-interactions`는 `role='application'`으로 해소.

### FR-04. gallery-lightbox 포커스 트랩 (heavy lift)

**실측 현황**: `role='dialog'`·`aria-modal`·`aria-labelledby/-describedby`
기존재. **Escape 핸들러·포커스 트랩·포커스 복귀 전부 부재.** framer-motion
`AnimatePresence` 사용.

**결정 D-3 — 자체 훅 `useFocusTrap` 채택** (Radix Dialog 통합 기각):

- 기각 사유: Radix `DialogPortal/Overlay/Content` 전환은 DOM 구조·이벤트
  전파(현재 배경 onClick 닫기)·AnimatePresence 통합(forceMount)까지 바꾸는
  고위험 변경. 본 사이클 원칙(구조 불변)에 위배.
- 채택안: `hooks/use-focus-trap.ts` 신규 (~60줄):
  - mount 시: `document.activeElement` 저장 → 컨테이너 내 첫 focusable로 포커스
    이동
  - `keydown` 리스너: `Tab`/`Shift+Tab` 순환(컨테이너 내 focusable 쿼리),
    `Escape` → `onClose`
  - unmount 시: 저장한 트리거 요소로 포커스 복귀
  - 반환: `containerRef`
- gallery-lightbox에 `const trapRef = useFocusTrap({ onEscape: onClose })` 적용,
  모달 콘텐츠 div에 ref 연결.
- 단위 테스트 필수: Tab 순환·Escape 닫기·포커스 복귀 3케이스
  (`@testing-library/user-event`).

### FR-05. array-index key 제거 (lint 실측 10건)

| 파일:라인                   | 현재                            | 변경                                                                 |
| --------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| analysis-panel.tsx:35,48,87 | `key={index}` ×3                | `key={`${similarity}-${index}`}` 형태 복합 (문자열 중복 가능성 대비) |
| gallery-item.tsx:195        | `key={tagIndex}`                | `key={tag}` (태그 중복 없다고 가정 불가 시 복합)                     |
| gallery-lightbox.tsx:214    | `key={index}`                   | `key={tag}` (동일)                                                   |
| resource-card.tsx:92        | `key={index}`                   | `key={tag}`                                                          |
| detail-view.tsx:74          | `key={index}`                   | `key={detail}` (위치 계산은 index 유지 — key만 변경)                 |
| month-view.tsx:82           | `key={index}` (날짜 셀)         | `key={date.getTime()}`                                               |
| month-view.tsx:116          | `key={i}` (festivals)           | `key={festival}`                                                     |
| event-list.tsx (lint 1건)   | 위치 구현 시 lint 출력으로 특정 | 콘텐츠 기반 key                                                      |

### FR-06. 회귀 방지 게이트

**1) `.eslintrc.json` override 추가** (기존 overrides 배열에 블록 추가):

```jsonc
{
  "files": [
    "components/gallery/artwork-comparison/**/*.tsx",
    "components/gallery/gallery-grid/**/*.tsx",
    "components/gallery/stroke-animation/**/*.tsx",
    "components/gallery/zoomable-image-viewer/**/*.tsx",
    "components/cultural/cultural-accessibility/**/*.tsx",
    "components/cultural/cultural-calendar/**/*.tsx",
    "components/cultural/learning-hub/**/*.tsx",
    "components/cultural/virtual-exhibition/**/*.tsx",
  ],
  "rules": {
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/control-has-associated-label": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "react/no-array-index-key": "error",
  },
}
```

- 주석(사유) 추가: 전역 218건이라 스코프 한정, 롤아웃은 후속 사이클.
- **fail-injection 검증 필수**: 위반 코드 임시 삽입 → `npm run lint` exit 1 확인
  → 제거 (정상 exit 0만으론 게이트 작동 불명).

**2) jest-axe 스모크 — `__tests__/a11y/a11y-smoke.test.tsx`:**

```tsx
import { axe } from 'jest-axe'
// expect(await axe(container)).toHaveNoViolations()
```

- 대상: FR-01~03 수정 컴포넌트 9개(playback-controls, settings-panel,
  analysis-panel, accessibility-panel, cultural-panel, language-panel,
  resources-tab, overview-tab, gallery-view) — 최소 props/mock으로 렌더 → axe
  위반 0 단언.
- lightbox·comparison-viewer는 동작 테스트(FR-04 트랩 3케이스, FR-03 키보드 팬줌
  1케이스)로 별도 커버.
- jest.setup.js에 `jest-axe/extend-expect` 추가 (기존 jest-dom import 옆).
- **주의**: framer-motion·next/image mock은 기존 jest.setup 재사용. 무거운 Next
  라우트 import 회피(memory: realtime polyfill 스택오버플로 전례).
- axe는 icon-button-name 등 **lint가 못 잡는 결함**(버튼 접근 가능한 이름 부재가
  SVG 자식일 때 lint 통과함을 실측 확인)을 커버 — 두 게이트는 상호보완.

---

## 4. Test Plan

### 4.1 게이트 매트릭스

| 검증          | 도구                                   | 기준                                                                     |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| 신규 a11y 룰  | `npm run lint`                         | 대상 디렉터리 0 error + fail-injection 확인                              |
| axe 스모크    | `npm run test` (신규 파일)             | 9개 컴포넌트 violations 0                                                |
| 포커스 트랩   | 신규 단위 테스트                       | Tab 순환·Escape·복귀 3케이스 GREEN                                       |
| 기존 회귀     | `npm run test:ci`                      | 389개 전부 GREEN (쿼리 깨짐 시 getByRole 계열로 수정 — 스냅샷 선별 갱신) |
| 타입/빌드     | `npm run type-check` · `npm run build` | 0 error · 성공                                                           |
| 디자인 게이트 | `design:lint`/`diff`/`wcag`            | GREEN (DOM a11y와 독립이므로 영향 없음 예상)                             |

### 4.2 수동 스팟 체크 (구현 후 1회)

- 키보드만으로: gallery-view 타일 진입 → detail-view → 복귀 / lightbox 열기 →
  Tab 순환 → Escape 닫기 → 트리거 포커스 복귀
- VoiceOver 1패스: cultural-accessibility 패널 라벨 낭독 확인

---

## 5. 구현 순서 및 PR 분할

**결정 D-4 — 2 PR 분할** (Plan의 3 PR안에서 조정):

| PR       | 내용                                                                       | 근거                                                                                        |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **PR-1** | FR-01·02·03·05 전체 + FR-06(eslint override + jest-axe 스모크)             | 속성 추가 위주 저위험. 게이트가 수정 완결성을 same-PR에서 증명(게이트만 먼저 넣으면 CI red) |
| **PR-2** | FR-04 lightbox 포커스 트랩(`useFocusTrap` 훅 + 적용 + 동작 테스트 3케이스) | 유일한 동작 추가·이벤트 리스너 변경 — 위험 격리                                             |

각 PR: `.commit_message.txt` 갱신, prettier 통과(CI Code Quality), CodeRabbit
스레드 resolve 커밋 참조.

---

## 6. Security Considerations

해당 없음 — 클라이언트 마크업 속성·키 핸들러 추가만. 신규 외부 입력 경로 없음.
jest-axe는 devDependency로 프로덕션 번들 무관.

---

## 7. Out of Scope 재확인 (Plan §2.2 준수)

- 기능 버그 17건(grid 미렌더·scale-0 버튼·onEvent 등) — 이번 파일들을 만지더라도
  **수정 금지** (`asca-gallery-cultural-bugfix` 후보로 보존, 스코프 크리프 방지)
- zoomable-image-viewer: lint 대상 디렉터리에 포함했으나 실측 위반 0 — 수정
  없음, 게이트만 적용
- JSDoc·perf·타입 이슈 — 불변

---

## Version History

| Version | Date       | Changes                                                                 | Author |
| ------- | ---------- | ----------------------------------------------------------------------- | ------ |
| 0.1     | 2026-07-05 | 초안 — 룰 전수 측정(전역 218/대상 39)·파일 실사 기반 명세, D-1~D-4 결정 | Claude |
