# Build Stabilization - Gap Analysis Report

> **Date**: 2026-03-30
> **Match Rate**: 89% (WARNING)
> **Project**: ASCA (Next.js 16 + React 19)

---

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 92% | PASS |
| Architecture Compliance | 88% | PASS |
| Convention Compliance | 90% | PASS |
| Build Stability | 85% | WARNING |
| **Overall** | **89%** | **WARNING** |

---

## Changes Verified (8 Items)

| # | Change | Status |
|---|--------|--------|
| 1 | tsconfig.json - `.next/dev/types` include 제거 | WARNING - 미완료 확인 필요 |
| 2 | package.json - `eslint` 직접 호출, `--webpack` 플래그 | PASS |
| 3 | admin/logs/route.ts - `storeLog` export 제거 | PASS |
| 4 | members/route.ts - `searchMembers` export 제거 | PASS |
| 5 | artists/[id]/portfolio/page.tsx - async params | PASS |
| 6 | client-providers.tsx - LanguageProvider 추가 | PASS |
| 7 | exhibitions/layout.tsx - force-dynamic | PASS |
| 8 | app/layout.tsx - force-dynamic | WARNING - 성능 트레이드오프 |

---

## Gap Items

### GAP-1: tsconfig.json include (확인 필요)
- `.next/dev/types/**/*.ts`가 아직 include에 남아있는지 확인 필요

### GAP-2: `_global-error` Prerender Issue
- Next.js 16 known issue
- `app/global-error.tsx` provider-free 버전 필요

### GAP-3: `eslint-config-next` 버전 불일치
- `next`: ^16.0.10
- `eslint-config-next`: ^15.2.4 (업그레이드 필요)

### GAP-4: force-dynamic 전역 적용
- `app/layout.tsx`의 `force-dynamic`이 모든 정적 페이지를 SSR로 전환
- 빌드 안정화 후 필요한 라우트에만 개별 적용 권장

---

## Positive Findings

- Route export 잘못된 것 추가 없음 (40개 route.ts 전수 검사)
- Async params 추가 마이그레이션 불필요 (13개 페이지 + 3개 API route 정상)
- Layer 구조 설계 일치 (PASS)
- type-check: 0 errors
- lint: 0 errors (124 warnings, 모두 no-console)

---

## Recommended Actions

### Immediate
1. tsconfig.json `.next/dev/types/**/*.ts` 제거 확인
2. `app/global-error.tsx` provider-free 버전 생성

### Short-term (1 week)
1. `eslint-config-next` v16 업그레이드
2. `app/layout.tsx` force-dynamic 제거 -> 개별 라우트에만 적용
3. `docs/CLAUDE.md` build/lint 커맨드 업데이트

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-30 | Initial build stabilization analysis |
