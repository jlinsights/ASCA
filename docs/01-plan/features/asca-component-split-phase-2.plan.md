---
feature: asca-component-split-phase-2
date: 2026-05-14
phase: plan
parent_cycle: asca-component-split-progress (Phase 1 완료 PR #23)
revision: α
status: draft
---

# Plan — asca-component-split-phase-2 (rev α)

## §0. 컨텍스트

- Phase 1 (PR #23 머지 `3e393755`, 2026-05-14): `genre/[genre]/page.tsx`
  529→109, `history/page.tsx` 542→36 — max-lines warnings 17→15 (2건 해소).
- 본 Phase 2: 중간 규모 (500~600 라인) 3 파일 슬림화 — sac-academy +
  GalleryFilterSections + artwork-upload-client.
- 자산: 이전 세션 stash@{0} = `sac-academy.tsx` 200 라인 슬림화 작업 완료 상태
  (clean apply 검증). 본 plan T1 의 즉시 산출물.

## §1. 목표 (success criteria)

- 3 파일 모두 < 500 라인 (max-lines warning 해소)
- lint warnings 14 → 11 (3건 추가 해소)
- 분할 패턴 Phase 1 동일: `_data/<name>.ts` + `_components/<name>.tsx` + slim
  entrypoint
- 회귀 0: 시각·동작·접근성 변경 없음
- CI/CD Pipeline 5 jobs GREEN 유지

## §2. 대상 파일 (3건)

| ID  | 파일                                                  | 라인 | 추정 분할                                                                 |
| --- | ----------------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| F1  | `app/academy/_components/sac-academy.tsx`             | 572  | 자산 stash@{0} 직접 활용 — 572 → ~377                                     |
| F2  | `components/gallery/search/GalleryFilterSections.tsx` | 527  | 필터 섹션별 sub-component (e.g. CategoryFilter, ArtistFilter, YearFilter) |
| F3  | `app/artworks/upload/artwork-upload-client.tsx`       | 514  | 업로드 폼/프리뷰/메타데이터 hook 분리                                     |

총 변경 라인 ≒ 1,613 → 분리 후 entrypoint 약 1,000 라인 (개별 < 500) + 신규
sub-component / data 파일.

## §3. 작업 분해 (do 후보)

### T1 — sac-academy 슬림화 (자산 stash@{0} 활용)

- `git stash pop stash@{0}` → 200 라인 deletion 즉시 적용
- 변경 내용 검토 (어떤 패턴으로 슬림화됐는지 확인 후 Phase 1 분할 패턴과 정합
  검증)
- 필요 시 `_data/` `_components/` 디렉토리로 재구성
- 검증: `npm run type-check` + `npm run lint sac-academy.tsx` warning 해소 확인

### T2 — GalleryFilterSections 분할

- 현 구조 분석: 어떤 섹션이 있는지 (예상: 카테고리/작가/연도/장르 필터 그룹)
- 섹션별 sub-component 추출 → `components/gallery/search/_sections/` 하위
- 공통 hook (`useFilterState` 등) 분리 가능성 평가
- 검증: `npm run type-check` + `npm run lint GalleryFilterSections.tsx` warning
  해소

### T3 — artwork-upload-client 분할

- 현 구조 분석: form / preview / metadata / validation 영역 식별
- form 섹션, preview 컴포넌트, validation hook 분리 → `_components/`, `use*.ts`
- 외부 의존 (Supabase storage, Drizzle insert) 은 유지, UI 만 분리
- 검증: `npm run type-check` + `npm run lint artwork-upload-client.tsx` warning
  해소

### T4 — 통합 검증

- `npm run lint` 전체 — warnings 14 → 11 확인
- `npm test` — 13 suites, 368 tests PASS 유지
- 로컬 dev 서버 `npm run dev` — /academy, /gallery, /artworks/upload 페이지 시각
  회귀 없음

### T5 — PR 생성

- Branch: `refactor/component-split-phase-2`
- 커밋 분할: F1 / F2 / F3 별 commit 권장 (review 편의)
- PR body: 분할 라인 통계 + 회귀 검증 결과

## §4. 리스크

- **R1**: stash@{0} 가 oldpath 기준 — main 변경분과 정합성 검증
  (`git apply --check` 통과 확인됨, 안전)
- **R2**: F2 GalleryFilterSections 의 state hoist 패턴 — Phase 1 의 `_data/`
  패턴이 form-state 에 그대로 적용 안 될 수 있음. hook 분리 필요
- **R3**: F3 artwork-upload-client 의 server action / Supabase 의존성 — UI
  분리가 side-effect 코드 영향 줄 수 있음
- **R4**: lint warnings 1건 해소가 다른 파일의 warning 노출 (max-lines 경계
  부근) — 가능성 낮음

## §5. 다음 행동 (즉시)

- T1 진행: `git stash pop stash@{0}` → diff 검토 → 커밋 → 검증
- T2, T3 는 분석 후 별 do 단계

## §6. 관련 자료

- Parent memory: `project_asca_component_split_progress.md` (Phase 1 완료, Phase
  2-4 backlog)
- 자산: stash@{0} (sac-academy 200 라인 슬림화, 2026-05-09 이전 세션 보류분)
- Phase 1 PR: #23 (`3e393755`)
- Phase 3-4 후보: `bylaws-content.tsx` (745), Cultural 4개 (517~671), Gallery
  4개 (589~759), `StrokeAnimationPlayer.tsx` (744), `sidebar.tsx` (671)
