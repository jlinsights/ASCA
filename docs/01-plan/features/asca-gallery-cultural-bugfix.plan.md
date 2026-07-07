# asca-gallery-cultural-bugfix Planning Document

> **Summary**: component-split PR #40·#41에서 CodeRabbit이 지적한 pre-existing
> 기능 버그 17건(전부 a11y-cleanup 사이클에서 의도적으로 보존)을 해소한다. 동작
> 변경 사이클이므로 훅 단위 동작 테스트를 안전망으로 신설한다.
>
> **Project**: ASCA (Next.js 14 + Supabase) **Author**: Claude (PDCA plan)
> **Date**: 2026-07-06 **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

gallery·cultural 컴포넌트군에 프로덕션 현존하는 기능 결함을 제거한다. 일부는
기능이 완전히 불능인 수준이다(공유·전체화면 버튼이 scale-0으로 영구히 숨겨짐,
grid 비교 모드 선택 시 빈 화면, 갤러리 이벤트 트래킹 무음 단절).

### 1.2 Background

- 출처: PR #40(gallery)·#41(cultural) CodeRabbit 55건 중 **기능 버그 분류 17건**
  — `asca-a11y-cleanup` plan §1.3에서 분류·보존(2026-07-05, archive `700c6b32`).
- a11y-cleanup과 분리한 이유: **동작 변경**이라 검증 전략이 다름(속성 추가가
  아니라 로직 수정 → 동작 테스트 필요).
- 전건 pre-existing — component-split verbatim 분리가 승계한 원본 결함.

### 1.3 Related Documents

- 직전 사이클: `docs/archive/2026-07/asca-a11y-cleanup/` (분류 원본은 plan §1.3)
- 리뷰 인라인: PR #40·#41 CodeRabbit 스레드
  (`gh api repos/jlinsights/ASCA/pulls/{40,41}/comments`)

---

## 2. Scope

### 2.1 In Scope — 서브시스템별 17건

**A. stroke-animation (4건) — `use-stroke-animation.ts`**

- [ ] A-1 (Major) pause 후 play 시 현재 stroke가 처음부터 재생 — `startTimeRef`
      재초기화 문제, 일시정지 지점부터 이어지도록 보정 (:245)
- [ ] A-2 (Major) `loopMode: 'single'` 미구현 — 설정 UI는 제공하나 완료 분기에서
      미처리 (:315)
- [ ] A-3 (Major) loop 재시작 nested `setTimeout` 미정리 — stop/unmount 후에도
      재생 재개됨, timeout ref 저장·clear (:331)
- [ ] A-4 (Major) RAF 루프에서 매 프레임 `new Image()` 생성 — `characterImage`
      변경 시 1회 로드해 ref 캐시 (:259)

**B. artwork-comparison (3건)**

- [ ] B-1 (Major) `comparisonMode.type === 'grid'` 분기 부재 → 빈 화면. 타입
      유니언에 'grid' 존재 확인됨. 최소 폴백 UI 또는 grid 렌더 구현
      (comparison-viewer.tsx switch)
- [ ] B-2 (Major) `requestAnalysis` 진행 중 가드 부재 — `isAnalyzing` 플래그로
      중복 요청·응답 경쟁 차단, 실패 시 로깅 (use-artwork-comparison.ts:249)
- [ ] B-3 (Minor) 콜백 ref가 unmount(`el === null`) 시 배열 정리 안 함 — stale
      DOM 참조 잔존 (comparison-viewer.tsx:62)

**C. gallery-grid (2건)**

- [ ] C-1 (Major) 공유/전체화면 버튼 `initial`·`animate` 모두
      `{scale: 0, rotate: 45}` → 영구 숨김·클릭 불가. `animate`를
      `{scale: 1, rotate: 0}`으로 (gallery-item.tsx:183)
- [ ] C-2 (Minor) `GalleryGrid`가 `onEvent` prop을 받기만 하고 호출하지 않음 →
      GalleryClient의 트래킹 무음 단절. handleImageClick/handleShareClick/
      navigateImage에 배선 (GalleryGrid.tsx:42)

**D. virtual-exhibition (3건)**

- [ ] D-1 (Major) 배경음악과 오디오 가이드가 `audioRef` 공유 → 상세 뷰 닫힘 시
      음악 토글 무반응. ref 분리 (VirtualExhibition.tsx:172 +
      use-virtual-exhibition.ts)
- [ ] D-2 (Minor) `isFullscreen` 즉시 토글 — `fullscreenchange` 이벤트에서
      `document.fullscreenElement` 기준으로 동기화(Esc 종료 반영)
      (use-virtual-exhibition.ts:63)
- [ ] D-3 (Minor) `audio.play()` Promise 거부(자동재생 정책) 미처리 — unhandled
      rejection + 상태 불일치 (use-virtual-exhibition.ts:75)

**E. cultural-accessibility (2건) — `use-accessibility-settings.ts`**

- [ ] E-1 (Major) `colorScheme: 'auto'` 전환 시 이전 `dark` 클래스 잔존 + 시스템
      테마 미반영 — `prefers-color-scheme` 매칭 반영 (:79)
- [ ] E-2 (Minor) 언마운트 시 전역 `document.documentElement` 스타일
      (fontSize·filter·dark·`--transition-duration`·focus-visible) 복원 cleanup
      부재 (:97)

**F. 개별 (3건)**

- [ ] F-1 (Minor) `use-image-zoom.ts:295` — `requestFullscreen`/`exitFullscreen`
      Promise 실패 시 상태 롤백 없음
- [ ] F-2 (Minor) `month-view.tsx:85` — `isToday`가 렌더 중 `new Date()` 직접
      호출 → SSR/CSR 하이드레이션 불일치 가능. 클라이언트 마운트 후 판정으로
      전환
- [ ] F-3 (Minor) `use-learning-hub.ts:53` — switch `case` 내 블록 없는 `const`
      선언 스코프 누수 (Biome `noSwitchDeclarations`) — case 블록 `{}` 감싸기

**G. 안전망 (신규 테스트)**

- [ ] 수정 대상 훅·컴포넌트 동작 테스트: stroke-animation(재개·single
      loop·타이머 정리), artwork-comparison(isAnalyzing·grid 폴백),
      gallery-item(버튼 가시화), use-accessibility-settings(auto 테마·cleanup),
      use-virtual-exhibition(fullscreen 동기화·audio 실패) — 상세 목록은
      design에서 확정

### 2.2 Out of Scope

- JSDoc 12건·perf 4건(next/dynamic·getEventsForDate memo)·타입/중복 7건 —
  a11y-cleanup plan §2.2와 동일하게 별도 처리
- `asca-a11y-rules-rollout` (전역 lint 218건)
- E2E 신규 작성 (기존 E2E 스위트 GREEN 유지만 확인)
- 기능 추가·리팩터링 — 결함 수정에 필요한 최소 변경 원칙

---

## 3. Requirements

### 3.1 Functional Requirements

| ID    | Requirement                                          | Priority | Status  |
| ----- | ---------------------------------------------------- | -------- | ------- |
| FR-01 | 완전 불능 결함 해소 (C-1 버튼, B-1 grid, C-2 이벤트) | High     | Pending |
| FR-02 | stroke-animation 재생 결함 4건 (A-1~A-4)             | High     | Pending |
| FR-03 | 리소스 누수·정리 결함 (A-3, B-3, E-2)                | Medium   | Pending |
| FR-04 | 상태 동기화 결함 (B-2, D-1~D-3, E-1, F-1)            | Medium   | Pending |
| FR-05 | 하이드레이션·스코프 결함 (F-2, F-3)                  | Low      | Pending |
| FR-06 | 수정 항목별 동작 테스트 신설 (스코프 G)              | High     | Pending |

### 3.2 Non-Functional Requirements

| Category    | Criteria                                     | Measurement Method       |
| ----------- | -------------------------------------------- | ------------------------ |
| 회귀 방지   | 기존 401개 테스트 GREEN 유지                 | `npm run test:ci`        |
| a11y 게이트 | 직전 사이클 게이트(lint 5룰·axe 스모크) 유지 | `npm run lint` + axe 9개 |
| 품질 게이트 | tsc 0 / build / prettier / design 3게이트    | 기존 CI                  |
| 최소 변경   | 결함 수정 외 리팩터링 금지                   | PR diff 리뷰             |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] In Scope 17건 전부 해소 (항목별 수정 명세는 design 문서)
- [ ] 스코프 G 동작 테스트 신설·통과 (버그별 최소 1 케이스, 수정 전 RED 확인
      가능한 항목은 fail-first로 작성)
- [ ] 기존 게이트 GREEN: tsc 0 · lint 0 · test:ci 401+ · build · prettier
      (**PDCA md 포함** — 직전 사이클 CI 실패 교훈)

### 4.2 Quality Criteria

- [ ] PR #40·#41 해당 CodeRabbit 스레드 resolve 가능 상태
- [ ] 신규 테스트가 수정 로직을 실제로 커버(가짜 GREEN 금지 — 가능한 항목은 수정
      전 실패 확인)

---

## 5. Risks and Mitigation

| Risk                                                              | Impact | Likelihood | Mitigation                                                                                      |
| ----------------------------------------------------------------- | ------ | ---------- | ----------------------------------------------------------------------------------------------- |
| stroke-animation RAF·타이머 로직 수정이 재생 동작을 미묘하게 변경 | High   | Medium     | 훅 단위 테스트(fake timers) + 수동 재생 스팟 체크. A-1~A-4는 단일 PR로 묶어 원자적 리뷰         |
| B-1 grid 모드: 폴백 UI vs 실제 grid 구현 범위 판단                | Medium | Medium     | design에서 결정 — 기본은 **안내 카드 폴백**(overlay/split-view 기존 패턴과 동일), 실구현은 별도 |
| E-1/E-2 전역 DOM 조작 수정이 위젯 외 페이지 스타일에 영향         | Medium | Medium     | jsdom 테스트로 documentElement 상태 단언 + 수동 확인                                            |
| D-1 audio ref 분리가 use-virtual-exhibition 훅 시그니처 변경 유발 | Medium | Low        | 컴포넌트 내부 배선만 변경, 외부 export 계약 유지                                                |
| F-2 isToday 클라이언트 판정 전환 시 초기 렌더에 하이라이트 부재   | Low    | High       | 의도된 트레이드오프(하이드레이션 안정 우선) — design에 명시                                     |
| jsdom에서 fullscreen API 부재                                     | Low    | High       | `document.fullscreenElement`·`requestFullscreen` mock 패턴 사용                                 |

---

## 6. Architecture Considerations

기존 구조 변경 없음 — 훅·컴포넌트 in-place 결함 수정.

| Decision    | Selected                              | Rationale                                       |
| ----------- | ------------------------------------- | ----------------------------------------------- |
| 테스트 방식 | RTL `renderHook` + jest fake timers   | 훅 로직 결함이 다수(A·D·E) — 기존 Jest 인프라   |
| PR 분할     | 서브시스템별 2~3 PR (design에서 확정) | stroke-animation 원자성 유지, 리뷰 부하 분산    |
| grid 모드   | 안내 카드 폴백 우선                   | overlay/split-view 기존 "Coming soon" 패턴 일치 |

---

## 7. Convention Prerequisites

- [x] 직전 사이클 게이트 현행: `.eslintrc` 대상 8디렉터리 5룰 error, jest-axe
      스모크 9, 기존 테스트 401 GREEN에서 착수
- [x] `hooks/use-focus-trap.ts` 등 신규 훅 컨벤션(kebab-case, JSDoc) 준수
- [x] 신규 md 문서는 커밋 전 `prettier --write` 필수 (CI Code Quality)
- 환경 변수: 불요

---

## 8. Next Steps

1. [ ] `/pdca design asca-gallery-cultural-bugfix` — 17건 항목별 수정 명세(현재
       코드 스니펫 실사), 테스트 목록, PR 분할 확정
2. [ ] 구현 → `/pdca analyze` → report → archive

---

## Version History

| Version | Date       | Changes                                           | Author |
| ------- | ---------- | ------------------------------------------------- | ------ |
| 0.1     | 2026-07-06 | 초안 — a11y-cleanup 분류 17건 서브시스템별 스코프 | Claude |
