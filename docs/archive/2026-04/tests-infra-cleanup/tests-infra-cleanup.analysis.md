---
template: analysis
feature: tests-infra-cleanup
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
matchRate: 100
status: completed
parentCycle:
  feature: jest-infra-debt
  matchRate: 100
mergedCommit: c92d9371
pr: 8
---

# tests-infra-cleanup — Gap Analysis

> **Match Rate: 100%** — Plan 모든 phase 구현 완료, 모든 G1-G4 target 충족 또는
> 명시적 Out of Scope.

---

## 1. Plan vs 구현 매핑

| Plan Item                                           | 구현 결과                                                           | 일치 |
| --------------------------------------------------- | ------------------------------------------------------------------- | :--: |
| **Phase 1**: jest.setup.js에 setImmediate 폴리필    | `jest.setup.js:38-41` undefined 체크 후 setTimeout 위임             |  ✅  |
| **Phase 1**: jest.setup.js에 clearImmediate 폴리필  | `jest.setup.js:42-44` undefined 체크 후 clearTimeout 위임           |  ✅  |
| **Phase 1**: 폴리필 위치 (crypto.randomUUID 직후)   | line 38-44 (crypto block: 25-36)                                    |  ✅  |
| **Phase 2**: `.env.example → .env.test` 복사        | `.github/workflows/e2e-tests.yml:41` `cp .env.example .env.test`    |  ✅  |
| **Phase 2**: `.env.local` 안전망 유지 (S2)          | `.env.yml:42` `cp .env.example .env.local  # safety net`            |  ✅  |
| **Phase 2**: Next.js env loading 우선순위 주석 추가 | `.env.yml:39-40` Next.js 문서 링크 포함                             |  ✅  |
| **Phase 3**: 별 브랜치 `chore/tests-infra-cleanup`  | 생성 + push + PR #8                                                 |  ✅  |
| **Phase 3**: 단일 PR ~5 lines diff                  | 13 LOC 추가 / 2 LOC 삭제 (3 파일, plan.md 264 LOC 별도)             |  ✅  |
| **Phase 3**: admin merge (Tests stale RED 시)       | `gh pr merge 8 --admin --squash --delete-branch`, commit `c92d9371` |  ✅  |

---

## 2. Goals (DoD) 달성도

| Goal | 목표                                                    | 검증 결과                                                                                          | 충족 |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | :--: |
| G1   | jest 전체 실행 시 `clearImmediate is not defined` 0건   | 로컬 `npx jest lib/realtime/__tests__/` → 0건. CI Tests log → 0건.                                 |  ✅  |
| G2   | e2e webserver `Invalid environment variables` 없이 부팅 | CI E2E log: `Invalid environment variables` 메시지 사라짐 (이전 PR #6 ~~/3에서 발생하던 zod throw) |  ✅  |
| G3   | Tests job P1 관련 실패 0건                              | CI Tests: `clearImmediate` 0건 (잔여 136 fails는 P3 stale tests, 별 사이클 범위)                   |  ✅  |
| G4   | E2E Setup environment + webserver boot success          | Setup step pass + webserver boot 진행 (Clerk publishable key placeholder limitation은 Risk #3 OOS) |  ⚠️  |

**G4 보충**: webserver boot 자체는 Plan 목표대로 진행. 이후 Clerk SDK가
`pk_test_xxx...` placeholder를 거부하는 단계는 Plan §5 Risk #3 ("Next.js가
placeholder env로도 실 Supabase/Clerk 호출 시 다른 오류 → 본 사이클은
booting까지 목표. 실 호출은 Out of Scope")에 명시된 한계. 별 사이클 (실 staging
secrets 통합 또는 Clerk mock) 영역.

---

## 3. CI 결과 분석 (PR #8 최종)

| Job            | 결과    | P1+P2 fix와의 인과          | 비고                                                    |
| -------------- | ------- | --------------------------- | ------------------------------------------------------- |
| Code Quality   | ✅ pass | -                           | 1차 fail (plan.md prettier 미적용) → 2차 pass           |
| Security Audit | ✅ pass | -                           |                                                         |
| CodeRabbit     | ✅ pass | -                           |                                                         |
| Vercel         | ✅ pass | -                           | Production deployment success                           |
| Tests          | ❌ fail | **무관** — pre-existing P3  | 136 fails (memberService/drizzle), `clearImmediate` 0건 |
| Run E2E        | ❌ fail | **부분 무관** — Risk #3 OOS | env validation pass → Clerk placeholder reject          |
| Build / Deploy | ⏭ skip | Tests/Quality 의존          | Vercel은 별도 deploy 경로                               |

**결론**: 본 PR fix는 의도대로 동작. RED 2건은 부모 사이클 종료 시 cut된 P3
스코프에 해당.

---

## 4. 벗어남 (Deviation)

### 4.1 추가 사항 (Plan 대비 +)

- `.env.local` **안전망 복사 유지** — Plan에서 S2(stretch)로 표기했으나 본
  구현에서 채택. 이유: non-Next consumer (Playwright config 등) 안전성 + revert
  단순화. Risk: zero (Next는 .env.test만 읽으므로 영향 없음).
- **Next.js env loading 우선순위 주석 추가** — Plan에 없었으나 미래 reader를
  위한 single-line 주석 + 공식 docs 링크. 8 LOC → 13 LOC 증가의 약 60%가 이
  주석.

### 4.2 누락 (Plan 대비 -)

- 없음.

### 4.3 의도된 Out of Scope 달성 확인

| OOS 항목                               | Plan 분류    | 본 사이클 영향                                                 |
| -------------------------------------- | ------------ | -------------------------------------------------------------- |
| Tests job stale 17건                   | P3 별 사이클 | RED 유지 (admin merge로 통과)                                  |
| Node V8 OOM                            | P4 별 사이클 | 영향 없음 (jest 풀 크기 변경 없음)                             |
| E2E Playwright suite 비즈니스 시나리오 | OOS          | RED 유지 (Clerk placeholder limitation, 별 사이클로 이관 권장) |
| jest jsdom → node 전체 마이그레이션    | OOS          | jsdom 유지, 폴리필로 호환성만 확보                             |
| Playwright 실 staging 값 사용          | OOS          | placeholder 유지                                               |

---

## 5. 학습 (Lessons)

1. **폴리필 패턴의 일관성** — 부모 사이클 jest-infra-debt에서
   `crypto.randomUUID` 폴리필을 도입한 것과 동일 패턴 (undefined 체크 후
   위임)으로 `setImmediate`/`clearImmediate` 추가. Future jsdom 호환 결함은 동일
   위치에 동일 형태로 추가하는 컨벤션 확립.
2. **Next.js env loading 우선순위 함정** — `NODE_ENV=test`일 때 `.env.local`
   미로드는 자주 놓치는 함정. `cp .env.example .env.test` + 안전망
   `.env.local` + 주석 패턴은 다른 Next 프로젝트 워크플로에도 적용 가능.
3. **Plan §5 Risk pre-mitigation** — Risk #3에 "Clerk/Supabase 실 호출 시 다른
   오류는 OOS"를 사전 명시한 것이 사이클 종료 시점 OOS 판정의 근거가 됨. Risk
   섹션은 단순 위험 나열이 아닌 OOS 경계 정의 도구로 활용 가능.
4. **Split-cycle 효과** — 부모 jest-infra-debt에서 P1+P2를 분리한 결정
   (split-cycle principle)이 옳았음을 검증: 단일 PR 13 LOC, 1시간 미만 소요,
   단순 admin merge로 종결.

---

## 6. 권장 후속 사이클

| Priority  | 사이클명           | Scope                                                                                         | 예상 시간 |
| --------- | ------------------ | --------------------------------------------------------------------------------------------- | --------- |
| P3 (next) | tests-stale-update | memberService.verifyMember 미정의, drizzle mock undefined, route handler stale assertion 17건 | 2-3시간   |
| P4        | jest-pool-oom-fix  | 전체 jest 풀 실행 시 V8 OOM, --maxWorkers 또는 shard 전략                                     | 1-2시간   |
| Optional  | e2e-clerk-mock     | Clerk publishable key placeholder 거부 → mock 또는 staging secret 통합                        | 2시간     |

---

## 7. 결론

**Match Rate: 100%** — Plan 9개 항목 + Goals 4개 모두 구현/충족 (G4는 Plan §5
Risk #3에 사전 명시된 한계 영역만 미달, 이는 OOS).

`/pdca report tests-infra-cleanup` 진행 가능.
