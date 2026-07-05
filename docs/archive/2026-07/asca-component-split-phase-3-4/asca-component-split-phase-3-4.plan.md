---
template: plan
feature: asca-component-split-phase-3-4
date: 2026-06-15
author: jaehong
project: ASCA (my-v0-project)
status: draft
---

# asca-component-split-phase-3-4 Plan

> **Summary**: ESLint `max-lines`(500) 초과 **10개 파일** 잔여분(Phase 1-2
> 이후)을 정리한다. 1개(shadcn vendor)는 **예외 처리**, 나머지 9개는 CLAUDE.md
> "Large File Refactoring Process"로 **동작 보존 분리**한다. 산출 가치 = lint
> 경고 10→0 + 유지보수성(거대 컴포넌트 해체). 기능 변경 0. **PDCA Phase**: Plan
> · **Source**: `/check` lint `max-lines` 경고 10건 · CLAUDE.md 500줄 룰 ·
> parent component-split Phase 1-2(merged)

---

## 1. 대상 (10 파일, 실측 2026-06-15)

| #   | 파일                                                                      | 줄수 | 분류                                                             | 처리             |
| --- | ------------------------------------------------------------------------- | ---: | ---------------------------------------------------------------- | ---------------- |
| V   | `components/ui/sidebar.tsx`                                               |  736 | **shadcn/ui vendor** (`@radix-ui/react-slot`, cva/forwardRef 31) | **예외**(분리 X) |
| G1  | `components/gallery/StrokeAnimationPlayer.tsx`                            |  901 | 로직 무거움(7 state·15 handler)                                  | 분리             |
| G2  | `components/gallery/ArtworkComparison.tsx`                                |  821 | 로직 무거움(8 state·14 handler)                                  | 분리             |
| G3  | `components/gallery/GalleryGrid.tsx`                                      |  820 | 로직 무거움(8 state·9 handler)                                   | 분리             |
| G4  | `components/gallery/ZoomableImageViewer.tsx`                              |  702 | 최고 복잡(9 state·17 memo·23 handler)                            | 분리             |
| C1  | `components/cultural/CulturalAccessibility.tsx`                           |  745 | (design서 per-file 분류)                                         | 분리             |
| C2  | `components/cultural/CulturalCalendar.tsx`                                |  698 | "                                                                | 분리             |
| C3  | `components/cultural/LearningHub.tsx`                                     |  600 | "                                                                | 분리             |
| C4  | `components/cultural/VirtualExhibition.tsx`                               |  558 | "                                                                | 분리             |
| A1  | `app/articles-of-incorporation-and-bylaws/_components/bylaws-content.tsx` |  763 | 콘텐츠 위주 추정                                                 | 데이터/섹션 분리 |

> 줄수는 `wc -l`; eslint `max-lines`는 주석/공백 옵션에 따라 다를 수 있음 — 분리
> 후 `npm run lint`로 경고 0 확인이 기준.

---

## 2. Scope

### In Scope

- [ ] **V (sidebar)**: shadcn vendor라 **eslint 예외** —
      `eslint.config`/`.eslintrc`에 `components/ui/**` max-lines off override
      **또는** 파일 상단 `/* eslint-disable max-lines */` + 사유 주석. (분리 시
      상류 shadcn 재생성과 발산하므로 분리하지 않음)
- [ ] **G1~G4 (gallery)**: CLAUDE.md 프로세스 — (1) sub-component 추출
      `_components/`, (2) 복잡 state/handler를 custom hook `use[Feature].ts`로,
      (3) 상수/mock 데이터 externalize. 우선순위 높음(복잡도·가치 최대)
- [ ] **C1~C4 (cultural)**: design에서 per-file 로직/프레젠테이션 분류 후 동일
      프로세스
- [ ] **A1 (bylaws)**: 정적 콘텐츠/섹션을 데이터·하위 섹션 컴포넌트로 분리
- [ ] 각 분리 후 `npm run type-check` 0 · `npm run lint`(해당 파일 max-lines
      경고 제거) · `test:ci` 389 유지 · `format:check`(prettier) green · design
      게이트(design:lint/diff/wcag) 영향 없음 확인

### Out of Scope

- 기능/동작 변경 (순수 구조 분리, DOM·props 동등성 유지)
- sidebar 내부 리팩터 (vendor 예외)
- 새 테스트 추가 (기존 행동 기반 테스트 무수정 통과가 게이트)
- max-lines 500 임계값 자체 변경

---

## 3. 핵심 결정

| ID  | 결정             | 선택                                     | 사유                                                                                 |
| --- | ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| R-1 | sidebar.tsx 처리 | **vendor 예외(분리 X)**                  | shadcn 원본(~700줄)을 손대면 업스트림 재생성/업데이트와 발산. 예외가 정석            |
| R-2 | PR 단위          | **점진(파일/그룹별 PR)**                 | 9개를 한 PR로 묶으면 리뷰 불가·회귀 위험. gallery→cultural→bylaws 순, 그룹별 PR 권장 |
| R-3 | 검증 게이트      | **기존 테스트 무수정 통과 + DOM 등가성** | 행동 보존이 분리의 안전망 (smart-quote history-table-refactor 패턴)                  |

---

## 4. 구현 순서 (점진)

```
Phase 3a: V sidebar eslint 예외 (1줄/override) — lint 경고 즉시 1 감소, trivial
Phase 3b: gallery G1~G4 (복잡도·가치 최고) — 파일별 또는 gallery 묶음 PR
Phase 4a: cultural C1~C4 — design per-file 분류 후
Phase 4b: bylaws A1 — 콘텐츠 데이터 externalize
각 단계: type-check 0 · lint(해당 max-lines 제거) · test:ci 389 · format:check · design 게이트
```

검증 기준: 분리 전후 **렌더 DOM·className·테스트 무변경**. 라인 예산은 prettier
다중라인+JSDoc 비용 사전 반영([[feedback_refactor_line_budget_buffer]]).

---

## 5. Risks & Mitigations

| 리스크                              | 완화                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| 분리 중 동작 회귀                   | 기존 test:ci 389 무수정 통과 게이트·DOM 등가성 확인                                           |
| 라인 예산 초과(분리해도 500 근처)   | 충분히 작은 단위로·hook 분리 우선                                                             |
| sidebar 예외가 다른 vendor에도 필요 | `components/ui/**` override로 일괄(개별 disable보다 유지보수 우월)                            |
| CI Code Quality(prettier) red       | 신규/이동 파일 `prettier --write` 필수 ([[feedback_unref_timer_jest_teardown_leak]] 부수교훈) |
| design 게이트 영향                  | UI 토큰 변경 없음 — 구조 분리만, design:diff 무영향 확인                                      |

---

## 6. Success Criteria

- [ ] `npm run lint` **max-lines 경고 0** (10→0)
- [ ] type-check 0 · test:ci 389 pass · format:check green · design 게이트 통과
- [ ] 기능 코드 동작 무변경 (행동 테스트 무수정 통과·DOM 등가)
- [ ] sidebar는 분리 아닌 예외로 처리(사유 주석)

## 7. Next

1. (선택) `/pdca design asca-component-split-phase-3-4` — cultural/bylaws
   per-file 분리 청사진 + sidebar 예외 방식 확정. 또는 Phase 3a(sidebar
   예외)+gallery부터 do 직행
2. 점진 PR로 진행

## Version History

| Ver | Date       | Changes                                                                                                                     | Author  |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| 0.1 | 2026-06-15 | 최초. 10파일 실측·분류(sidebar=shadcn vendor 예외, gallery 4 로직무거움 우선, cultural 4·bylaws 1). 점진 PR·동작보존 게이트 | jaehong |
