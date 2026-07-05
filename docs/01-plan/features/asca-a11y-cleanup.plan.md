# asca-a11y-cleanup Planning Document

> **Summary**: component-split PR #40·#41에서 CodeRabbit이 지적한 pre-existing 접근성 이슈(라벨 미연결·aria-label 누락·키보드 접근 불가·array-index key)를 해소하고, jest-axe + ESLint 룰 활성화로 회귀 방지 게이트를 구축한다.
>
> **Project**: ASCA (Next.js 14 + Supabase)
> **Author**: Claude (PDCA plan)
> **Date**: 2026-07-05
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

gallery·cultural 컴포넌트군에 프로덕션 현존하는 접근성 결함을 제거한다. 스크린리더 사용자가 컨트롤의 이름·용도를 인지할 수 없고, 키보드 사용자가 핵심 인터랙션(작품 선택·학습 경로 선택·모달)에 진입할 수 없는 상태다. 서예 협회 사이트 특성상 고령 사용자 비중이 높아 접근성은 기능 요구사항에 준한다.

### 1.2 Background

- component-split phase-3-4 사이클(archive `82ffc2a9`)은 **동작 보존(verbatim) 분리**가 원칙이어서 접근성 결함을 의도적으로 승계했다.
- PR #40(gallery 30건)·#41(cultural 25건)에서 CodeRabbit이 총 55건을 지적 — 전부 pre-existing이며 분리 작업이 만든 것이 아니다.
- 접근성 수정은 **의도적 DOM 변경**이므로 verbatim 원칙과 분리된 별도 사이클로 진행한다(memory: `asca-a11y-cleanup-candidate`).

### 1.3 CodeRabbit 55건 전수 분류 (수집: 2026-07-05, PR #40·#41 인라인 리뷰)

| 분류 | 건수 | 본 사이클 |
|------|-----:|:---------:|
| **접근성 (a11y)** | 12 스레드 (~31개 인스턴스) | ✅ In Scope |
| **array-index key** | 3 스레드 (5개 리스트) | ✅ In Scope |
| 기능 버그 (Functional/Stability) | 17 | ❌ → `asca-gallery-cultural-bugfix` 후보 |
| JSDoc 누락 | 12 | ❌ → 후속 처리 (기계적, 별도 배치) |
| 성능 (next/dynamic·memo) | 4 | ❌ → 후속 후보 |
| 타입/중복 구조 | 7 | ❌ → 후속 후보 |

원본 데이터: `gh api repos/jlinsights/ASCA/pulls/{40,41}/comments` (55건 검증 완료: 30+25)

### 1.4 Related Documents

- 직전 사이클: `docs/archive/2026-07/asca-component-split-phase-3-4/`
- PR #40: https://github.com/jlinsights/ASCA/pull/40 (gallery)
- PR #41: https://github.com/jlinsights/ASCA/pull/41 (cultural)
- 디자인 시스템 WCAG 게이트: `npm run design:wcag`

---

## 2. Scope

### 2.1 In Scope — a11y 12 스레드 + key 3 스레드

**A. 아이콘/기호 전용 컨트롤에 접근 가능한 이름 부여 (3 스레드)**

- [ ] `gallery/artwork-comparison/analysis-panel.tsx:27` — `✕` 닫기 버튼 `aria-label`
- [ ] `gallery/stroke-animation/playback-controls.tsx:121` — 이전/재생/정지/다음/설정 아이콘 버튼 5개 `aria-label`
- [ ] `cultural/virtual-exhibition/detail-view.tsx:173` — 오디오 가이드 컨트롤 `aria-label`

**B. 폼 라벨 ↔ 컨트롤 연결 (5 스레드, ~17개 인스턴스)**

- [ ] `gallery/stroke-animation/settings-panel.tsx:66` — Loop Mode label↔select (`id`/`htmlFor`)
- [ ] `cultural/cultural-accessibility/accessibility-panel.tsx` — Font Size·Font Family·Line Height·Contrast·Color Scheme·Reduce Motion 6개 라벨 (select는 `id`/`htmlFor`, 버튼 그룹은 `role="group"` + `aria-labelledby`)
- [ ] `cultural/cultural-accessibility/cultural-panel.tsx` — Name/Date/Number Format + 토글 2개, 5개 라벨
- [ ] `cultural/cultural-accessibility/language-panel.tsx` — Primary/Secondary Language + 토글 3개, 5개 라벨
- [ ] `cultural/learning-hub/resources-tab.tsx:50` — 검색 input `aria-label` (placeholder만으로 불충분)

**C. 키보드 접근성 (3 스레드)**

- [ ] `cultural/learning-hub/overview-tab.tsx:138` — Learning Path 카드 `div onClick` → `role="button"` + `tabIndex` + Enter/Space 핸들러
- [ ] `cultural/virtual-exhibition/gallery-view.tsx:57` — 작품 타일 동일 패턴
- [ ] `gallery/artwork-comparison/comparison-viewer.tsx:52` — 팬·줌 뷰어 `role` + 키보드 대응(최소 `role="application"` 또는 `aria-label` + 방향키 팬, 범위는 design에서 확정)

**D. 모달 포커스 관리 (1 스레드, heavy lift)**

- [ ] `gallery/gallery-grid/gallery-lightbox.tsx:37` — 포커스 트랩 + Tab 순환 + 닫힘 시 트리거로 포커스 복귀 (`role="dialog"`/`aria-modal`은 기존재)

**E. array-index key 제거 (3 스레드, 5개 리스트)**

- [ ] `gallery/artwork-comparison/analysis-panel.tsx:41` — similarities·differences·educational_notes 3개 리스트
- [ ] `gallery/gallery-grid/gallery-item.tsx:202` — 태그 리스트 (태그 값 key)
- [ ] `gallery/gallery-grid/gallery-lightbox.tsx:226` — 태그 리스트 (동일 패턴)

**F. 회귀 방지 게이트 구축**

- [ ] `jest-axe` 도입 + 수정 대상 컴포넌트 axe 스모크 테스트 (A~D 검증)
- [ ] `.eslintrc.json`에 jsx-a11y 핵심 룰 명시 활성화: `jsx-a11y/label-has-associated-control`, `jsx-a11y/click-events-have-key-events`, `jsx-a11y/no-static-element-interactions`, `jsx-a11y/control-has-associated-label` (error 승격 범위는 사전 전수 측정 후 design에서 확정)
- [ ] `react/no-array-index-key` 활성화 (동일하게 사전 측정 후 범위 확정)

### 2.2 Out of Scope

- **기능 버그 17건** (grid 모드 미렌더, scale-0 버튼, onEvent 미연결, pause/resume, loop single, 타이머/ref 정리, fullscreen 동기화, auto dark, isToday 하이드레이션, audio ref 분리 등) → **`asca-gallery-cultural-bugfix` 분리 사이클 후보** (동작 변경 + 테스트 전략이 a11y와 상이)
- **JSDoc 12건** — 기계적 작업, 별도 배치 커밋으로 처리 (PDCA 불요)
- **성능 4건** (next/dynamic 3, getEventsForDate memo) — 번들 측정 동반 필요, 후속 후보
- **타입/중복 7건** (MutableRefObject, as any, value:any, DifficultyLevel/필터 타입/카테고리 맵/ShareIcon 중복) — 후속 후보
- 전면 WCAG 2.1 AA 감사 (본 사이클은 CodeRabbit 지적 범위로 한정, 전면 감사는 별도)
- E2E 수준 스크린리더 시나리오 테스트

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 아이콘 전용 버튼 전수에 `aria-label` 부여 (스코프 A) | High | Pending |
| FR-02 | 폼 라벨-컨트롤 프로그래매틱 연결 (스코프 B, 17개) | High | Pending |
| FR-03 | 클릭 전용 인터랙티브 요소 키보드 접근 (스코프 C) | High | Pending |
| FR-04 | gallery-lightbox 포커스 트랩·복귀 (스코프 D) | Medium | Pending |
| FR-05 | array-index key → 콘텐츠 기반 key (스코프 E) | Medium | Pending |
| FR-06 | jest-axe 스모크 + ESLint a11y 룰 게이트 (스코프 F) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 동작 보존 | a11y 속성 외 시각·동작 변화 없음 | 기존 test:ci 389개 전부 GREEN 유지 |
| 접근성 | 수정 컴포넌트 axe violations 0 | jest-axe |
| 회귀 방지 | 활성화된 jsx-a11y·no-array-index-key 룰 0 error | `npm run lint` |
| 품질 게이트 | tsc 0 / build 성공 / design 3게이트 GREEN | 기존 CI |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] In Scope 15개 스레드 전부 해소 (파일별 체크리스트 design 문서에 상세화)
- [ ] jest-axe 테스트 신규 작성·통과 (수정 컴포넌트 커버)
- [ ] ESLint a11y 룰 활성화 + **fail-injection 검증** (위반 코드 임시 삽입 → lint 실패 확인 → 제거; memory: `fail-injection-pattern`)
- [ ] 기존 게이트 GREEN: `type-check` 0 · `test:ci` 389+ · `build` · `lint` · design 3게이트

### 4.2 Quality Criteria

- [ ] PR #40·#41의 해당 CodeRabbit 스레드에 커밋 참조로 resolve 가능한 상태
- [ ] 신규 lint error 0, 신규 warning 0 (룰 활성화 범위 내)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| jsx-a11y 룰 활성화 시 스코프 밖 파일에서 위반 대량 검출 | High | High | **착수 전 `grep -c`/lint 전수 측정 먼저** (memory: `no-tail-truncate-errors`). 폭발 시 대상 디렉터리 한정 override 또는 warn 유지 후 별도 사이클로 승격 |
| DOM 변경(role·tabIndex·id 추가)이 기존 389개 테스트의 쿼리/스냅샷 깨뜨림 | Medium | Medium | 수정 파일 대응 테스트 우선 실행, 쿼리 기반(getByRole) 테스트는 오히려 견고해짐 — 스냅샷만 선별 갱신 |
| 포커스 트랩(FR-04) 직접 구현 시 엣지 케이스(Shift+Tab, portal) | Medium | Medium | Radix `Dialog` 등 기존 의존성 재사용 우선 검토 (`components/ui` shadcn 존재), 직접 구현은 최후 수단 |
| label `id` 부여 시 컴포넌트 다중 인스턴스 id 충돌 | Medium | Low | `useId()` (React 19) 사용 원칙 |
| key 변경으로 리스트 재조정 동작 변화 | Low | Low | 태그·문자열 콘텐츠 기반 key + 중복 값 대비 `${value}-${index}` 복합 |

---

## 6. Architecture Considerations

기존 구조 변경 없음 — component-split으로 분리된 파일 경계 내 in-place 수정.

| Decision | Selected | Rationale |
|----------|----------|-----------|
| a11y 테스트 | jest-axe (신규 devDependency) | 기존 Jest 인프라 재사용, 컴포넌트 단위 스모크에 적합 |
| 정적 게이트 | eslint-plugin-jsx-a11y 명시 룰 (기설치 ^6.8.0) | 신규 설치 불요, `next/core-web-vitals`가 warn 수준만 제공하므로 명시 승격 필요 |
| 포커스 트랩 | 기존 UI 라이브러리 우선 (design에서 확정) | 직접 구현 리스크 회피 |
| id 생성 | `React.useId()` | SSR 안전, 다중 인스턴스 충돌 방지 |

---

## 7. Convention Prerequisites

- [x] ESLint: `.eslintrc.json` (`next/core-web-vitals` extends, jsx-a11y 명시 룰 없음 — 본 사이클에서 추가)
- [x] `react/no-array-index-key` 미설정 — 본 사이클에서 추가
- [x] jest-axe 미설치 — 본 사이클에서 추가
- [x] 기존 테스트 389개 (test:ci), tsc 0, max-lines 0 상태에서 착수
- 환경 변수: 불요

---

## 8. Next Steps

1. [ ] `/pdca design asca-a11y-cleanup` — 파일별 수정 상세(속성·패턴 명세), 룰 활성화 범위 사전 측정 결과 반영, jest-axe 테스트 목록
2. [ ] 구현 (PR 분할 기준: gallery 1 PR + cultural 1 PR + 게이트 1 PR 권장 — design에서 확정)
3. [ ] `/pdca analyze asca-a11y-cleanup`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-07-05 | 초안 — CodeRabbit 55건 전수 분류 기반 스코프 확정 | Claude |
