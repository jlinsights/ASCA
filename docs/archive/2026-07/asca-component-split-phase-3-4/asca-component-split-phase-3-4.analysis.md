---
template: analysis
version: 1.0
feature: asca-component-split-phase-3-4
date: 2026-07-05
analyzer: bkit:gap-detector
project: ASCA (my-v0-project)
plan_doc: docs/01-plan/features/asca-component-split-phase-3-4.plan.md
design_doc: docs/02-design/features/asca-component-split-phase-3-4.design.md
branch: main (4 PR squash-merged)
---

# asca-component-split-phase-3-4 Gap Analysis

> **Summary**: max-lines(500) 초과 10파일(9 분리 + sidebar 예외) 설계 vs 구현
> 비교 — **Match Rate 100%**, Gap 0건. gap-detector 구조검증 96%(CI 게이트
> 미재실행 -4%) + 본 세션 CI 게이트 실측으로 4점 마감.
>
> **Status**: ✅ Report-Ready (≥90% threshold 통과) **Date**: 2026-07-05
> **Merged**: #39 sidebar(31f95e56)·#40 gallery(b8d402d0)·#41
> cultural(d86d5285)·#42 bylaws(95edd07d)

---

## 1. Success Criteria 체크리스트 (Design §9)

| #   | 기준                                         | 결과 | 근거                                                                                                                               |
| --- | -------------------------------------------- | :--: | ---------------------------------------------------------------------------------------------------------------------------------- |
| SC1 | `npm run lint` max-lines 10 → 0              |  ✅  | 머지된 main `npm run lint` = max-lines 경고 0 (gap-detector + 세션 실측)                                                           |
| SC2 | 진입 파일 export/경로 불변                   |  ✅  | gallery/cultural 8파일 `export default` 불변, bylaws는 route-private `BylawsContent` named export 불변(`page.tsx` importer 무변경) |
| SC3 | shell ≤500(목표 ≤350)                        |  ✅  | 전 shell 119~287줄, 전부 ≤350                                                                                                      |
| SC4 | hook(`use-*.ts`) JSX import 없음(§5 레이어)  |  ✅  | 8개 hook 전부 JSX/컴포넌트 import 0                                                                                                |
| SC5 | sidebar = 분리 아닌 단일파일 예외(사유 주석) |  ✅  | `.eslintrc.json` `components/ui/sidebar.tsx` override + `//` vendor 사유 주석                                                      |
| SC6 | 기능 동작 무변경(행동 테스트·DOM 등가)       |  ✅  | test:ci 389/389 무수정 통과, verbatim 추출, bylaws는 가시 텍스트 12469자 완전 일치                                                 |

## 2. CI 게이트 (Design §9 Item 2 — 본 세션 실측)

| 게이트     | 명령                                            |                     결과                      |
| ---------- | ----------------------------------------------- | :-------------------------------------------: |
| 타입       | `npm run type-check`                            |                  ✅ 0 errors                  |
| 린트       | `npm run lint`                                  |           ✅ 0 errors (max-lines 0)           |
| 포맷       | `npm run format:check`                          |                   ✅ clean                    |
| 테스트     | `npm run test:ci`                               |            ✅ 389/389 (15 suites)             |
| 빌드       | `npm run build`                                 |           ✅ Compiled successfully            |
| 디자인     | `design:lint`/`diff`/`wcag`                     | ✅ 0/0 · 47 tokens in sync · WCAG AA all pass |
| pre-commit | `type-check && lint && format:check && test:ci` |                   ✅ exit 0                   |

> gap-detector가 -4% 매긴 사유(CI 게이트 미재실행)를 본 세션 `/check`·pre-commit
> 실측으로 전부 확인 → 100%.

## 3. 파일 구조 (실제 구현)

- **sidebar 예외**: `.eslintrc.json` overrides (단일 파일 글롭, 광역 아님)
- **gallery 4 shell**: StrokeAnimationPlayer 272·ArtworkComparison
  286·GalleryGrid 286·ZoomableImageViewer 237 (+ 각 co-located `{gallery-name}/`
  4모듈)
- **cultural 4 shell**: CulturalAccessibility 136·CulturalCalendar
  214·LearningHub 119·VirtualExhibition 198 (+ 각 co-located 4~6모듈)
- **bylaws shell**: bylaws-content 62 (+ `bylaws-sections/` 9 섹션 컴포넌트)

## 4. 의도된 do-단계 조정 (Design §3 "seam은 do서 확정" 재량 — 전부 합리적, Gap 아님)

| 파일 | design 청사진                   | 실제(조정)                     | 사유                                                                       |
| ---- | ------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| G2   | `.data.ts`                      | `analysis-panel.tsx`           | analysis=런타임 콜백, 리터럴 데이터 부재                                   |
| G3   | 3모듈                           | +`gallery-lightbox.tsx`(4모듈) | 거대 lightbox(227줄) → §8 risk대로 추가 분리                               |
| G4   | `use-measurement.ts`            | `info-panel.tsx`               | measurement 실 로직 부재(dead)                                             |
| C1   | `_constants/`                   | co-location                    | 응집도                                                                     |
| C3   | `.data.ts`                      | 생략                           | 전부 props, 하드코딩 seed 無                                               |
| A1   | data-driven(`.data.ts`+chapter) | 섹션 컴포넌트 9개              | 비균일 산문(다수 `<strong>`·혼합 `<ol>/<p>`) → design "혼합 fallback" 채택 |

## 5. Gap 목록

**Gap 0건.** 미구현·설계 위반 없음. 상기 조정은 design이 명시 허용한 do-단계
재량으로 전부 문서화됨.

## 6. 결론

**Match Rate 100%** — Report/Archive 진행 가능. 무테스트 컴포넌트 분리의
안전망(verbatim 추출 + type-check + build + 순수콘텐츠 텍스트-diff + 기존
test:ci 389 회귀 0)이 전 단계에서 유지됨. 부수 산출:
[[project_asca_a11y_cleanup_candidate]](CodeRabbit pre-existing a11y 55건 → 별도
사이클).
