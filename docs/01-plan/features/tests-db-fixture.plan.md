---
template: plan
feature: tests-db-fixture
date: 2026-04-30
author: jaehong (jhlim725@gmail.com)
status: draft
parentCycle:
  feature: tests-stale-update
  status: draft (G3 ejection origin)
ejectedFrom:
  cycle: tests-stale-update
  group: G3 (drizzle/Postgres TypeError)
---

# tests-db-fixture — Plan

> **목적**: 부모 사이클 `tests-stale-update`에서 ejection된 G3 (Repository 통합
> 테스트의 Postgres 의존)을 별 사이클로 해결. CI에서 `base.repository.test.ts` +
> `member.repository.test.ts`가 GREEN.
>
> **Why now**: 부모 사이클(`tests-stale-update`)의 G1+G2+G4 머지 후에도 Tests
> job RED 잔존. 본 사이클로 ASCA Tests job 전체 GREEN 회복 (jest-infra-debt →
> tests-infra-cleanup → tests-stale-update → 본 사이클 4 PDCA chain).

---

## 1. 배경 (Context)

### 1.1 Ejection 경위

`tests-stale-update` Plan v1에서 G3는 "drizzle mock chain undefined" 가설로
시작했으나, 사전 inspection 결과:

```ts
// lib/repositories/__tests__/base.repository.test.ts
import { testDatabaseHelpers, getTestPool } from '@/lib/testing/setup-test-db'
// ...
beforeAll(async () => {
  await testDatabaseHelpers.beforeAll() // 실제 Postgres connection
  repository = new TestRepository()
})
```

`mock` 패턴이 아닌 **실제 Postgres** 의존 통합 테스트. CI에 test DB 컨테이너
부재 → connection 실패 → TypeError. 본 사이클로 분리.

### 1.2 영향 범위

| File                                                        | Test 수 | 의존                       |
| ----------------------------------------------------------- | ------- | -------------------------- |
| `lib/repositories/__tests__/base.repository.test.ts`        | ~12     | `setup-test-db` + Postgres |
| `lib/repositories/__tests__/member.repository.test.ts`      | ~16     | 동                         |
| (잠재) `lib/services/__tests__/member-service.test.ts` 일부 | ?       | repository 의존 시         |

총 ~28+건의 test가 본 사이클 영향.

### 1.3 현재 인프라

- `lib/testing/setup-test-db.ts` 존재 (helpers는 이미 작성됨)
- CI workflow (`.github/workflows/ci.yml`) **Postgres service 없음** (test job
  단순 `npm run test:ci`만 실행)
- 로컬 dev에서는 `DATABASE_URL` 환경변수로 실 DB 사용 가능

---

## 2. 목표 (Goals — Karpathy §4 형태)

### 2.1 Primary Goals (DoD)

| Goal | Test Set                                   | 현재 상태                     | Target | Verify Check                                                    |
| ---- | ------------------------------------------ | ----------------------------- | ------ | --------------------------------------------------------------- |
| G1   | Repository 2 files (28+ tests)             | RED (TypeError on connection) | GREEN  | `npx jest lib/repositories/__tests__/ --silent && echo G1_PASS` |
| G2   | CI Tests job 전체 GREEN (조부모 누적 효과) | RED (G3 잔존)                 | GREEN  | CI: `Tests` job → `0 failed`                                    |

### 2.2 Out of Scope

- Production drizzle ORM 변경
- Repository logic 변경
- Schema migration
- E2E test
- Performance/load tests

---

## 3. 단계별 작업 (Phases)

### Phase 1 — 인프라 결정 (선행)

**3가지 옵션 평가** (사용자 결정 포인트):

| Option | 방식                                             | 장점                              | 단점                                              |
| ------ | ------------------------------------------------ | --------------------------------- | ------------------------------------------------- |
| **A**  | GH Actions `services: postgres` (실 PG 컨테이너) | 실 DB 동작, drizzle SQL 검증 정확 | CI 시간 +30~60초, secrets 또는 inline config 필요 |
| **B**  | `pg-mem` (in-memory)                             | 빠름, secrets 불필요              | drizzle 일부 SQL 미지원 가능, mismatch 위험       |
| **C**  | testcontainers (Docker in CI)                    | 실 PG + 자동 lifecycle            | 시간 +1~2분, Docker-in-Docker 복잡                |

**추천**: A (실 DB) — drizzle correctness 우선. 사용자 결정 필요.

### Phase 2 — 인프라 구축 (Option A 가정)

1. **Step**: `.github/workflows/ci.yml` test job에 `services: postgres` 추가 →
   **verify**: workflow YAML lint pass
2. **Step**: `setup-test-db.ts` 가 CI env에서 connection string 읽도록 확인 →
   **verify**: 로컬 PG로 simulate
3. **Step**: schema initialization step 추가 (`npm run db:push` 또는 SQL
   fixture) → **verify**: 첫 test 통과

### Phase 3 — Test 적용

1. **Step**: G2(`tests-stale-update`)에서 ejected된 `member.repository.test.ts`
   verifyMember 호출 함께 dead-delete → **verify**: `grep -c verifyMember` → 0
2. **Step**: 2 files 단독 PASS → **verify**:
   `npx jest lib/repositories/__tests__/`
3. **Step**: 종합 `npm run test:ci` → **verify**: G2 (CI Tests 전체 GREEN)

### Phase 4 — CI 통합

- [ ] 별 브랜치 `chore/tests-db-fixture`
- [ ] PR 생성
- [ ] CI: Tests job GREEN
- [ ] 일반 머지

---

## 4. 비기능 요구사항

- **Reversibility**: workflow 변경 1 commit, test 변경 1 commit
- **Backward compat**: production 무영향
- **CI 시간**: +30~60초 (Option A)

---

## 5. 위험

| Risk                                      | Likelihood | Impact | Mitigation                                      |
| ----------------------------------------- | ---------- | ------ | ----------------------------------------------- |
| Postgres service init 실패                | Medium     | High   | health check + retry 설정                       |
| Schema init 시간 길어 CI feedback 지연    | Low        | Medium | SQL fixture cache 또는 prebuilt image           |
| Test 격리 부족 (병렬 실행 시 데이터 충돌) | Medium     | High   | per-test schema 또는 transaction rollback 패턴  |
| Option A 선택 시 secrets 누출 위험        | Low        | High   | inline test-only credentials, 실 prod secrets X |

---

## 6. 검증

```bash
# 로컬 (Postgres 컨테이너 필요)
docker run -d -e POSTGRES_PASSWORD=test -p 5432:5432 postgres:15
DATABASE_URL=postgresql://postgres:test@localhost:5432/postgres npx jest lib/repositories/__tests__/

# CI
# Tests job 결과 확인 (0 failed)
```

---

## 7. 일정

| Phase                      | 예상 시간 | 누적    |
| -------------------------- | --------- | ------- |
| Phase 1 (인프라 결정)      | 0.5h      | 0:30    |
| Phase 2 (workflow + setup) | 1.5h      | 2:00    |
| Phase 3 (test 적용)        | 1.0h      | 3:00    |
| Phase 4 (PR + CI)          | 0.5h      | 3:30    |
| Buffer                     | 0.5h      | 4:00    |
| **총합**                   |           | **~4h** |

---

## 8. 다음 단계

1. **Phase 1 결정 — 사용자 선택 필요**: Option A (실 PG) / B (pg-mem) / C
   (testcontainers)
2. `/pdca design tests-db-fixture` (Option 결정 후)
3. `/pdca do tests-db-fixture`
4. PR + 머지 → ASCA Tests job 첫 GREEN

---

## 9. 참조

- 부모 사이클: `docs/01-plan/features/tests-stale-update.plan.md` (G3 ejection)
- 조부모: `docs/archive/2026-04/tests-infra-cleanup/`,
  `docs/archive/2026-04/jest-infra-debt/`
- drizzle docs: https://orm.drizzle.team/docs/get-started-postgresql
- pg-mem: https://github.com/oguimbal/pg-mem
- GitHub Actions services:
  https://docs.github.com/en/actions/using-containerized-services/about-service-containers
