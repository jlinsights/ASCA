---
template: plan
feature: asca-design-system-finalize
date: 2026-04-25
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: asca-design-system
  date: 2026-04-24
  matchRate: 82
  status: completed-partial (Phase 1/2 only)
---

# asca-design-system-finalize — Plan

> **목적**: 2026-04-24 보류된 ASCA DESIGN.md Phase 3 잔여 작업을 완결한다. emax-design-system PDCA 사이클(2026-04-25, Match Rate 98%)에서 검증된 `@google/design.md` CLI + 자체 `design-diff` 패턴을 재사용해 ASCA에 적용한다.
>
> **Why now**: emax 사이클로 spec/CLI 작동·한계가 확인됐다. typography 비호환(현재 lint 파싱 실패)과 WCAG/CI 자동화 미비를 한 번에 해결할 시점.

---

## 1. 배경 (Context)

### 1.1 현재 상태 (2026-04-24 기준)

- `docs/02-design/DESIGN.md` v1.2.0-alpha — YAML front matter 토큰 + Do/Don't prose (476 LOC)
- `tailwind.config.ts` — Brand Extended Palette 6색 + shadcn semantic 매핑 (342 LOC)
- `app/globals.css` — `--celadon-green` 정렬, dead semantic 8개 제거
- design-validator 점수: **82/100** (Phase 3 미진행 차감)
- 활성 PDCA: `warning-cleanup-cycle-2` (in-progress, 별개 작업이므로 병행 가능)

### 1.2 Phase 3 보류 원인 (memory: project_asca_design_system.md)

- 사용자가 2026-04-24 세션에서 "이번 세션 마무리" 요청 → 별도 세션 권장
- `npx @google/design.md@latest lint docs/02-design/DESIGN.md` **파싱 실패**
  - 에러: `Unexpected error during model building: raw.match is not a function`
  - 루트 코즈: `typography:` 섹션 구조가 Google spec 비호환
    - **Google spec**: `typography.<name>: {fontFamily, fontSize}` (토큰별 객체)
    - **ASCA 현재**: `typography: {family, scale, weight, tracking, leading}` (5개 중첩 객체)

### 1.3 emax-design-system 학습 자산 (2026-04-25)

| 자산 | ASCA 재사용 가능성 |
|------|-------------------|
| `@google/design.md@0.1.1` CLI 사용법 | ✅ 동일 적용 |
| `scripts/design-diff.mjs` (YAML↔Tailwind 양방향 검증) | ✅ ASCA 토큰 키만 교체 후 이식 |
| CI step 패턴 (advisory lint + hard-fail diff) | ✅ `.github/workflows/ci.yml` Code Quality job에 추가 |
| typography canonical 8 tokens (display-lg ~ label-sm) | ✅ ASCA scale ↔ MD3 semantic 매핑 |
| Phase 4 export 보류 정책 (flat→nested 변환 어려움) | ⚠️ ASCA는 DTCG export 필수 → 별도 변환 wrapper 필요 |

---

## 2. 목표 (Goals)

### 2.1 Primary Goals (DoD)

1. **G1 — typography canonical 변환**: Google CLI lint `0 errors` 통과
   - 현재 family/scale/weight/tracking/leading 중첩 구조 → 토큰별 `{fontFamily, fontSize}` 객체
   - 비-canonical 정보(weight/tracking/leading 등)는 prose 섹션 또는 unknown sections(spec 허용)로 보존
2. **G2 — WCAG contrast 자동 lint**: 모든 색상 페어 AA(4.5:1) 통과 또는 명시적 예외
   - `@google/design.md` `contrast-ratio` warning rule 활용
   - 자체 `scripts/design-lint.ts` (페어 매핑 명시 + AA/AAA 분리 리포트)
3. **G3 — Tailwind ↔ DESIGN.md 양방향 diff**: `design:diff` 0 drift
   - emax `design-diff.mjs` 이식 + ASCA 토큰 키(`primary/secondary/accent/highlight/destructive/...` + Obang/Seasonal/Calligraphy) 매핑
4. **G4 — CI 통합**: `.github/workflows/ci.yml` Code Quality job에 2 step 추가
   - `npm run design:lint || true` (advisory)
   - `npm run design:diff` (hard fail)
5. **G5 — design-validator 점수 ≥90**: Phase 3 항목 충족 후 재검증

### 2.2 Stretch Goals (선택, 시간 여유 시)

- **S1 — DTCG export wrapper**: `scripts/design-export-dtcg.mjs`로 `tokens.json` 출력 + `tokens.json` ↔ tailwind 일치 검증
- **S2 — Sibling 프로젝트 활용**: smart-quote-main, BridgeLogis에 동일 패턴 적용 (별도 PDCA로 분리)

### 2.3 Out of Scope

- 기존 색상/typography 디자인 결정 변경 (브랜드 정체성 유지)
- 컴포넌트 단위 spec 추가 (token 레벨만)
- shadcn 마이그레이션
- warning-cleanup-cycle-2와의 통합 (별개 사이클)

---

## 3. 단계별 작업 (Phases)

### Phase 1 — typography canonical 변환 (G1)

**파일**: `docs/02-design/DESIGN.md`

- [ ] 현재 `typography:` 블록 백업 → prose 섹션 "Typography Reference (extended)"로 이동
  - family 9종, scale 13단계, weight/tracking/leading은 prose 표로 보존
- [ ] canonical 8 typography tokens 신설 (MD3 sematic + ASCA family 매핑):
  ```yaml
  typography:
    display-lg: { fontFamily: serif, fontSize: "3.75rem" }   # 60px (현 6xl)
    display-md: { fontFamily: serif, fontSize: "3rem" }       # 48px (현 5xl)
    headline-lg: { fontFamily: serif, fontSize: "2.25rem" }   # 36px (현 4xl)
    headline-md: { fontFamily: serif, fontSize: "1.875rem" }  # 30px (현 3xl)
    title-lg: { fontFamily: sans, fontSize: "1.5rem" }        # 24px (현 2xl)
    body-lg: { fontFamily: sans, fontSize: "1.125rem" }       # 18px (현 lg)
    body-md: { fontFamily: sans, fontSize: "1rem" }           # 16px (현 base)
    label-sm: { fontFamily: sans, fontSize: "0.875rem" }      # 14px (현 sm)
  ```
  - `fontFamily` 값은 token 참조 형태(`{fontFamily.serif}` 등)로 정의하거나 prose 가이드로 분리 (Google CLI v0.1.1 alpha 동작 확인 후 결정)
- [ ] `npx design.md lint docs/02-design/DESIGN.md` 0 errors 확인

**산출물**: 갱신된 DESIGN.md, lint 통과 로그
**예상 소요**: 1.0~1.5h

### Phase 2 — design-diff 스크립트 이식 (G3)

**파일**: `scripts/design-diff.mjs` (신규, ~80 LOC)

- [ ] emax `scripts/design-diff.mjs` 복사 → ASCA 키 매핑 교체
  - 검증 대상 색상: semantic(9) + Obang(5) + Seasonal(4) + Calligraphy 등 → 약 47개 colors
  - tailwind 경로: `tailwind.config.ts` (TS) → `tsx` 또는 `ts-node` 동적 import 또는 `.cjs` 빌드 산출물 활용
  - **결정 필요**: TS config 직접 import 가능한 방식 (Next.js 프로젝트 환경) vs. 사전 컴파일
- [ ] `package.json` scripts 추가:
  ```json
  "design:lint": "design.md lint docs/02-design/DESIGN.md",
  "design:diff": "node scripts/design-diff.mjs"
  ```
- [ ] devDependencies 추가: `@google/design.md@^0.1.1`, `yaml@^2.8.3`
- [ ] `npm run design:diff` 0 drift 확인 (현 tailwind.config.ts ↔ DESIGN.md)
  - **drift 발견 시**: tailwind 또는 DESIGN.md 보정 (브랜드 정체성 유지 우선)

**산출물**: scripts/design-diff.mjs, package.json 스크립트, drift report
**예상 소요**: 1.5~2.0h

### Phase 3 — WCAG contrast lint (G2)

**파일**: `scripts/design-lint.ts` (신규, ~150 LOC)

- [ ] 페어 매핑 명시:
  ```ts
  const PAIRS = [
    { fg: 'primary-foreground', bg: 'primary', minRatio: 4.5 },
    { fg: 'foreground', bg: 'background', minRatio: 4.5 },
    { fg: 'highlight-foreground', bg: 'highlight', minRatio: 4.5 },
    // ... 9 semantic + Obang/Seasonal 일부
  ];
  ```
- [ ] APCA 또는 WCAG 2.1 contrast 알고리즘 (단순 WCAG 2.1로 시작, APCA는 stretch)
- [ ] 출력: PASS/FAIL 리포트 + 실패 시 exit 1
- [ ] `package.json` scripts 추가: `"design:wcag": "tsx scripts/design-lint.ts"`
- [ ] 현재 페어 검증: 실패 시 **DESIGN.md prose에 명시적 예외**(예: highlight gold는 decorative only) 또는 색 보정

**산출물**: scripts/design-lint.ts, design.lint output, prose에 예외 항목 추가
**예상 소요**: 2.0~2.5h

### Phase 4 — CI 통합 (G4)

**파일**: `.github/workflows/ci.yml` (Code Quality job)

- [ ] Code Quality job에 step 추가:
  ```yaml
  - name: Design lint (advisory)
    run: npm run design:lint || true
  - name: Design diff (hard fail)
    run: npm run design:diff
  - name: WCAG contrast lint
    run: npm run design:wcag
  ```
- [ ] PR 트리거 시 정상 동작 확인 (별도 브랜치 push로 검증)

**산출물**: 갱신된 ci.yml, GitHub Actions run 로그
**예상 소요**: 0.5h

### Phase 5 — design-validator 재검증 + Stretch (G5, S1)

- [ ] design-validator agent 호출 → 점수 확인 (목표 ≥90)
- [ ] 점수 미달 항목 수정
- [ ] **Stretch S1 (선택)**: `scripts/design-export-dtcg.mjs` 작성
  - `npx design.md export --format dtcg` → wrapper로 `tokens.json` 생성
  - `tokens.json` ↔ tailwind 일치 검증 추가
  - emax에서 학습한 flat→nested 변환 이슈 동일 가능성 → 보류 결정 가능

**산출물**: design-validator 점수, (선택) tokens.json
**예상 소요**: 0.5h + (선택) 1.5h

---

## 4. 위험 요소 (Risks)

| 위험 | 영향 | 완화책 |
|-----|------|-------|
| Google CLI v0.1.1 alpha 불안정 | typography 변환 후에도 lint 실패 가능 | advisory(`|| true`) 처리, 자체 `design-diff` + `design-wcag`를 hard gate로 사용 |
| TS tailwind.config 동적 import 어려움 | design-diff 스크립트 작성 막힘 | (a) `tailwind.config.ts`를 `.cjs`로 변환 또는 (b) `tsx`/`ts-node` 런타임 사용 또는 (c) build 산출물 캐시 활용 |
| WCAG 페어 검증 실패 다수 | 브랜드 색 변경 압박 | prose에 decorative-only 예외 명시 (highlight gold 등), AA 미달은 AAA 대체 텍스트 페어로 회피 |
| `warning-cleanup-cycle-2` 동시 진행 충돌 | 동일 파일 수정 시 conflict | 영향 파일 분리 (디자인 시스템은 docs/scripts/CI, warning-cleanup은 src/app) — 현재 분리됨 |
| typography canonical 변환 시 정보 손실 | family 9종, scale 13단계 가이드 사라짐 | prose 섹션 "Typography Reference (extended)"로 보존 |

---

## 5. DoD (Definition of Done)

- [ ] DESIGN.md typography canonical 형태 변환 + `design:lint` 0 errors
- [ ] `scripts/design-diff.mjs` 작성, `design:diff` 0 drift
- [ ] `scripts/design-lint.ts` 작성, WCAG AA 페어 PASS 또는 명시적 예외
- [ ] CI 3 step 추가 (`design:lint` advisory, `design:diff` hard, `design:wcag` hard)
- [ ] design-validator 점수 ≥90
- [ ] `npm run lint` / `type-check` / `build` / 기존 jest 회귀 0건
- [ ] memory(`project_asca_design_system.md`) Phase 3 완료 상태로 갱신
- [ ] `.commit_message.txt` 한국어 한 줄 기록

---

## 6. 일정 (Estimate)

| Phase | 예상 시간 |
|-------|----------|
| Phase 1 typography canonical | 1.0~1.5h |
| Phase 2 design-diff 이식 | 1.5~2.0h |
| Phase 3 WCAG contrast lint | 2.0~2.5h |
| Phase 4 CI 통합 | 0.5h |
| Phase 5 재검증 + (선택) DTCG | 0.5h + (선택) 1.5h |
| **합계 (필수만)** | **5.5~6.5h** |
| **합계 (S1 포함)** | **7.0~8.0h** |

---

## 7. 다음 단계

1. **즉시**: 사용자 승인 → `/pdca design asca-design-system-finalize`
2. **Design 문서에서 결정할 것**:
   - typography canonical에 weight/tracking/leading을 어떻게 보존할지 (prose vs. unknown sections)
   - tailwind.config.ts 동적 import 방식 (a/b/c 중 선택)
   - WCAG 페어 매핑 최종 명세 (현재는 9 semantic 기준, Obang/Seasonal 일부 포함 여부)
   - DTCG export Stretch 진행 여부

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-25 | 초기 Plan 작성 (jhlim725@gmail.com) — emax-design-system 사이클 학습자산 활용 |
