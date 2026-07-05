---
template: report
version: 1.0
feature: asca-component-split-phase-3-4
date: 2026-07-05
project: ASCA (my-v0-project)
matchRate: 100
status: completed
plan_doc: docs/01-plan/features/asca-component-split-phase-3-4.plan.md
design_doc: docs/02-design/features/asca-component-split-phase-3-4.design.md
analysis_doc: docs/03-analysis/asca-component-split-phase-3-4.analysis.md
---

# asca-component-split-phase-3-4 Completion Report

> **Result**: ESLint `max-lines`(500) 초과 10파일 정리 완료 — **경고 10 → 0**,
> Match Rate **100%**. 4 PR squash-merge, 머지된 main 전 게이트 green. 기능 동작
> 무변경.

## 1. 개요 (PDCA 요약)

- **Plan** (2026-06-15): max-lines 초과 10파일 실측·분류 — sidebar(shadcn
  vendor)=예외, gallery 4·cultural 4·bylaws 1=동작 보존 분리. 점진 PR·행동보존
  게이트.
- **Design** (2026-06-16): 4축 분해(types/hook/sub-component/data) + 비파괴
  진입점 + 레이어 매핑 + shell≤350 + sidebar 단일파일 eslint 예외.
- **Do** (2026-07-05): 4 PR로 순차 구현. 각 파일 verbatim 추출 + 파일별 게이트
  검증.
- **Check** (2026-07-05): gap-detector 구조검증 + 세션 CI 게이트 실측 → **Match
  Rate 100%, Gap 0**.

## 2. 산출물 (머지 완료)

| PR  | 내용                   | 커밋     | 결과                                          |
| --- | ---------------------- | -------- | --------------------------------------------- |
| #39 | 3a sidebar eslint 예외 | 31f95e56 | `.eslintrc.json` 단일파일 override            |
| #40 | 3b gallery G1~G4       | b8d402d0 | 4 shell(272/286/286/237) + 16 co-located 모듈 |
| #41 | 4a cultural C1~C4      | d86d5285 | 4 shell(136/214/119/198) + 21 co-located 모듈 |
| #42 | 4b bylaws A1           | 95edd07d | shell 62 + 9 섹션 컴포넌트                    |

**총**: 9 진입 파일 대폭 축소 + ~46 co-located 모듈 신규 + 1 vendor 예외.

## 3. 검증 결과

- lint max-lines **10 → 0** · type-check 0 · test:ci **389/389**(회귀 0) ·
  format:check clean · build 성공 · design 3게이트 pass
- **비파괴 진입점**: 9 진입 파일 경로·export 불변 → 외부 importer 무변경
- **동작 보존**: verbatim 추출(로직·의존성배열·JSX 그대로), 내부정의
  컴포넌트→안정 컴포넌트(DOM 등가), bylaws 가시 텍스트 12469자 완전 일치

## 4. 학습 (재사용 가능)

1. **무테스트 컴포넌트 분리 안전망** = verbatim 추출 + 엄격 type-check +
   프로덕션 build + (순수 콘텐츠는 가시 텍스트 diff) + 기존 test:ci 회귀 0. 시각
   테스트 없이 동작 보존 담보.
2. **컴포넌트 내부 정의 서브컴포넌트**(`const Panel = () => ...`)는 매 렌더
   remount 안티패턴 → 안정 컴포넌트로 승격 시 **DOM 등가**(controlled·로컬
   state 無)이며 부수적으로 remount 개선.
3. **React 19 `useRef<T>(null)` = `RefObject<T | null>`** — sub-component prop
   타입도 `<T|null>`이어야 함. type-check가 C4에서 포착(무테스트 리팩터에서 타입
   게이트의 실효).
4. **파일별 커밋의 `.commit_message.txt` 포함**이 독립 PR 순차 머지 시 그
   파일에서만 충돌 유발 → `git merge origin/main` +
   `checkout --ours .commit_message.txt`로 해소. 다음엔 gitignore/rebase 검토.
5. **비균일 산문**은 data-driven보다 **섹션 컴포넌트 분리**가 안전(인라인 서식
   보존). 순수 콘텐츠는 텍스트-diff가 필수 검증(type-check/build는 단어 누락 못
   잡음).

## 5. 후속

- **[[project_asca_a11y_cleanup_candidate]]**: #40·#41 CodeRabbit pre-existing
  접근성·key 지적 55건 → 별도 `asca-a11y-cleanup` 사이클(의도적 DOM 변경, 자체
  a11y 검증). 프로덕션 기존 이슈라 분리 PR 범위 밖.
- 프로젝트 lint에 `jsx-a11y/*`·`react/no-array-index-key` 룰 활성화 검토(회귀
  방지).
