---
template: plan
version: 1.2
feature: asca-api-security-hardening
date: 2026-04-25
author: jhlim725
project: ASCA (my-v0-project)
version_project: 0.1.0
parent_review:
  gstack /review (security-reviewer + code-reviewer 병렬, 2026-04-25)
branch: security-hardening-2026-04
---

# asca-api-security-hardening Planning Document

> **Summary**: API 보안 표면(GraphQL/SSE/members/admin)의 6개 인증·인가·정보누설
> 이슈 핫픽스 — pre-existing tech debt를 단일 PR 단위로 정리
>
> **Project**: ASCA (my-v0-project) **Version**: 0.1.0 **Author**: jhlim725
> **Date**: 2026-04-25 **Status**: Draft **Branch**:
> `security-hardening-2026-04` (origin/main 기반)

---

## 1. Overview

### 1.1 Purpose

`origin/main..HEAD` 28 커밋 보안 표면 리뷰(2026-04-25, gstack `/review`)에서
발견된 **CRITICAL 2 + HIGH 4 + MEDIUM 6** 이슈를 단일 보안 핫픽스 사이클로 정리.
이 사이클의 목적은 **regression이 아닌 pre-existing 부채**를 명시적으로 인식하고
안전한 상태로 끌어올리는 것.

### 1.2 Background

- gstack `/review` 결과: API/GraphQL/SSE/Supabase 표면에 인증 우회·IDOR·정보누설
  6건 확인
- on-disk 검증 결과 **6건 모두 origin/main에 이미 존재** — 이번 28 커밋
  modularization이 만든 것 아님
- 현재 production은 알려진 6건의 보안 표면을 그대로 노출 중
- 이미지 갤러리 정리(filter-repo) 직후 main이 클린한 상태에서 핫픽스 단일 PR로
  정리하는 게 history·blame·롤백 측면에서 최선

### 1.3 Related Documents

- 리뷰 출처: 2026-04-25 gstack `/review` 결과 (security-reviewer + code-reviewer
  병렬)
- 인증 패턴 레퍼런스: `lib/auth/middleware.ts` (`getAuthUser`)
- 권한 패턴 레퍼런스: `lib/middleware/admin-middleware.ts` (Clerk role +
  RoleManager)
- 로깅 표준: `lib/logging` (`logError`)

---

## 2. Scope

### 2.1 In Scope

- [ ] **C1** `lib/graphql/context.ts:101-127` — `authenticateUser()` Clerk JWT
      검증 구현 (Bearer 토큰 → `userId` 추출 → DB user 조회)
- [ ] **C2** `app/api/realtime/sse/route.ts:49-55` — SSE token 파라미터 검증
      구현 (또는 token 파라미터 제거 + Clerk `auth()` 강제)
- [ ] **H1** `app/api/members/[id]/route.ts:8-50` GET — 본인 또는 admin만 조회
      가능하도록 권한 체크 추가 (PUT 패턴 재사용)
- [ ] **H2** `app/api/admin/dashboard/route.ts:89-100` — 응답에서
      `error.message` 제거, `logError`로만 내부 기록
- [ ] **H3** `app/api/graphql/route.ts:119` OPTIONS —
      `Access-Control-Allow-Origin: *` → `process.env.ALLOWED_ORIGINS`
      화이트리스트 (없으면 same-origin only)
- [ ] **H4** `app/api/members/me/route.ts:17-134` — Supabase 미초기화 시
      prod에서 throw, dev에서만 dummy data 반환 (`NODE_ENV` 가드)
- [ ] **회귀 테스트** — Clerk 토큰 유무·만료·다른 사용자 토큰으로
      GraphQL/SSE/members 호출 테스트
- [ ] **CHANGELOG/SECURITY 노트** — 변경 사항을 `docs/SECURITY.md` 또는 PR
      본문에 명시 (감사 추적)

### 2.2 Out of Scope (P2 백로그 — 별도 사이클)

- M1 `app/api/members/me/route.ts:177-179` catch에 `logError` 추가 (스타일
  일관성, low risk)
- M2 GraphQL `formatError` production 시 모든 에러 메시지 레닥션 (현재는
  'Database' 키워드만)
- M3 `app/api/admin/sync-academy/route.ts` rate limit + scraped HTML 파싱 정리
- M4 `lib/middleware/admin-middleware.ts` Clerk role ↔ RoleManager 동기화 정책
  문서화
- M5 `lib/supabase/cms.ts` Supabase 에러 wrap (호출부 디버깅 컨텍스트 추가)
- M6 API 응답 envelope 통일 (`{ success, data, error }` 표준화) — 별도 큰 사이클
  필요
- E2E/integration 테스트 자동화 (현재 Plan은 단위 검증만 포함)
- HTTPS-only enforcement, HSTS 헤더 등 CSP 강화 (별도 사이클)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID    | Requirement                                                           | Priority | Status  |
| ----- | --------------------------------------------------------------------- | -------- | ------- |
| FR-01 | GraphQL Bearer 토큰 → Clerk session 검증 → `User` 반환                | High     | Pending |
| FR-02 | SSE 연결 시 Clerk session 또는 검증된 토큰 필수 (익명 거부)           | High     | Pending |
| FR-03 | `GET /api/members/[id]` — 본인 또는 admin만 200, 그 외 403            | High     | Pending |
| FR-04 | `/api/admin/dashboard` 500 응답에서 `error.message` 제거              | High     | Pending |
| FR-05 | GraphQL CORS — 화이트리스트 origin만 허용, 그 외 403 또는 미반영      | High     | Pending |
| FR-06 | `/api/members/me` — prod에서 Supabase 미초기화 시 500, dev에서만 mock | High     | Pending |
| FR-07 | 각 fix는 기존 통과 케이스(인증된 본인 요청 등)에 회귀 없음            | High     | Pending |

### 3.2 Non-Functional Requirements

| Category        | Criteria                                                 | Measurement Method          |
| --------------- | -------------------------------------------------------- | --------------------------- |
| Security        | OWASP Top 10 (A01·A05·A07) 회귀 테스트 통과              | 수동 회귀 + curl 시나리오   |
| Performance     | 인증 체크 추가로 인한 latency p50 < +10ms                | API 호출 전후 비교          |
| Backward compat | 인증된 정상 케이스의 응답 shape·status 동일              | 기존 클라이언트 통합 테스트 |
| Observability   | 인증 실패·CORS 차단·error catch가 모두 `logError`로 기록 | 로그 grep 확인              |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01~FR-06 모두 구현 완료
- [ ] 각 FR에 대한 회귀 테스트 시나리오 수동 통과 (인증된 케이스 + 미인증
      케이스)
- [ ] `npm run lint` 0 errors
- [ ] `npm run type-check` 통과
- [ ] PR 본문에 6개 fix 각각의 before/after 동작 명시
- [ ] gap-detector Match Rate ≥ 90% (`/pdca analyze`)

### 4.2 Quality Criteria

- [ ] 변경 영역(`app/api/**`, `lib/graphql/**`)에 신규 lint warning 없음
- [ ] 빌드 성공 (`npm run build`)
- [ ] Vercel preview deploy에서 production 동작 확인 (특히 GraphQL/SSE 인증 거부
      동작)
- [ ] 6 fix가 모두 단일 PR 안에 들어가되, 각 fix가 개별
      커밋(`fix(security): ...`)으로 분리되어 bisect 가능

---

## 5. Risks and Mitigation

| Risk                                                        | Impact | Likelihood | Mitigation                                                                                                               |
| ----------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| C1 GraphQL 인증 추가로 기존 anonymous public query가 깨짐   | High   | Medium     | 현재 anonymous로 어떤 쿼리가 노출 중인지 먼저 inventory → 의도된 public field만 `@public` 또는 schema-level allow로 분리 |
| C2 SSE 인증 추가로 클라이언트(웹/모바일) 연결 끊김          | High   | Medium     | SSE 연결 코드(`lib/realtime/`) 클라이언트 호출처 식별 → 토큰 전달 경로 정비 후 enforce                                   |
| H1 IDOR fix로 admin 페이지의 회원 조회가 깨짐               | Medium | Low        | `getAuthUser` 패턴 재사용 (기존 PUT과 동일 분기) → admin role 확인 후 통과                                               |
| H3 CORS 화이트리스트로 외부 통합(만약 있다면) 차단          | Medium | Low        | `ALLOWED_ORIGINS` env var 도입, 빈 값일 때 same-origin만 허용 → 통합 사용처 확인 후 추가                                 |
| H4 dummy data 제거로 dev 환경에서 Supabase 없이 개발 어려움 | Low    | Medium     | dev에서만 mock 유지, prod에서 throw — `NODE_ENV` 분기 유지                                                               |
| 인증 변경이 SSR/Server Component 흐름에 영향                | High   | Low        | Next.js App Router `auth()` 패턴 유지, server boundary에서만 호출                                                        |
| 회귀 검증 없이 merge → production 사고                      | High   | Medium     | merge 전 Vercel preview에서 6개 시나리오 수동 확인, 회귀 발견 시 즉시 revert (PR 단일 단위로 묶여있어 revert 한 줄)      |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level       | Characteristics                            | Recommended For       | Selected |
| ----------- | ------------------------------------------ | --------------------- | :------: |
| Starter     | Simple structure                           | Static sites          |    ☐     |
| **Dynamic** | Feature-based, services layer              | Web apps with backend |    ☑    |
| Enterprise  | Strict layer separation, DI, microservices | High-traffic systems  |    ☐     |

ASCA는 이미 Dynamic level (Next.js + Supabase + Drizzle + Clerk)이며, 본
사이클은 **신규 아키텍처 변경 없이 기존 패턴 일관성 강화**.

### 6.2 Key Architectural Decisions

| Decision               | Options                                                                           | Selected                                                          | Rationale                                                    |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| Auth source            | Clerk session / 별도 JWT / Supabase                                               | **Clerk session**                                                 | 이미 webhook·middleware·members PUT에서 표준 사용 중         |
| GraphQL auth 위치      | resolver-level / context-level / schema-directive                                 | **context-level**                                                 | `lib/graphql/context.ts` 기존 진입점, 단일 변경점            |
| SSE auth 전략          | query token / cookie / Authorization header                                       | **Clerk `auth()` (cookie)**                                       | Next.js Edge/Node 모두 호환, query token 검증 로직 중복 회피 |
| CORS 화이트리스트 위치 | env var / hardcoded / config file                                                 | **env var** (`ALLOWED_ORIGINS`)                                   | env 별 (preview/prod) 상이, 운영 중 변경 가능                |
| Error response shape   | `{ success, error, message }` / `{ success, error }` / `{ success, data, error }` | **`{ success: false, error: string }`** (이번 사이클은 H2만 통일) | 전체 envelope 통일은 M6로 별도 사이클                        |

### 6.3 Clean Architecture Approach

```
이번 사이클 변경 영역 (현행 구조 유지, fix-only)

app/
├── api/
│   ├── admin/dashboard/route.ts      ← H2 fix
│   ├── graphql/route.ts              ← H3 fix
│   ├── members/
│   │   ├── [id]/route.ts             ← H1 fix (GET 권한)
│   │   └── me/route.ts               ← H4 fix (prod 가드)
│   └── realtime/sse/route.ts         ← C2 fix
└── lib/
    ├── auth/middleware.ts            ← (변경 없음, 패턴 재사용)
    └── graphql/context.ts            ← C1 fix (authenticateUser)
```

신규 모듈/폴더 도입 없음. 모든 fix는 기존 파일 내 변경.

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` (프로젝트별, 다국어 패턴 + Supabase 명령) — 보안 섹션 없음
- [x] `.eslintrc.json` 존재
- [x] `.prettierrc` 존재
- [x] `tsconfig.json` 존재
- [ ] `docs/01-plan/conventions.md` — **부재** (Phase 2 미실행)
- [ ] `docs/SECURITY.md` 또는 SECURITY.md 루트 — **부재**, 본 사이클에서 신설
      검토

### 7.2 Conventions to Define/Verify

| Category                 | Current State                 | To Define                                                             | Priority |
| ------------------------ | ----------------------------- | --------------------------------------------------------------------- | :------: |
| **Auth pattern**         | `getAuthUser`, `auth()` 혼재  | API 핸들러는 `auth()` from `@clerk/nextjs/server` 통일 (server-only)  |   High   |
| **Error response shape** | 3종 혼재                      | 이번 사이클은 H2만 통일 (`{ success: false, error }`), 전체 통일은 M6 |  Medium  |
| **Error logging**        | 일부 `logError`, 일부 swallow | 모든 catch에 `logError` 호출 (M1 별도 사이클)                         |  Medium  |
| **CORS**                 | wildcard/혼재                 | env-driven 화이트리스트 표준                                          |   High   |
| **Env var for security** | 대부분 단일 환경              | `ALLOWED_ORIGINS`, `CRON_SECRET` 등 개별 검증                         |   High   |

### 7.3 Environment Variables Needed

| Variable                   | Purpose                               | Scope  |       To Be Created        |
| -------------------------- | ------------------------------------- | ------ | :------------------------: |
| `ALLOWED_ORIGINS`          | GraphQL CORS 화이트리스트 (콤마 구분) | Server |          ☑ (H3)           |
| `CLERK_SECRET_KEY`         | Clerk session 검증                    | Server |       ☐ (이미 존재)        |
| `CRON_SECRET`              | sync-academy bearer                   | Server | ☐ (이미 존재, M3에서 검토) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 클라이언트                   | Client |       ☐ (이미 존재)        |

### 7.4 Pipeline Integration

본 사이클은 9-phase Pipeline의 Phase 7 (SEO/Security)과 부분 겹침. 단, 본 사이클
범위는 6개 핫픽스로 한정.

| Phase                  | Status  | Document Location             | Command                               |
| ---------------------- | :-----: | ----------------------------- | ------------------------------------- |
| Phase 1 (Schema)       |    ☐    | `docs/01-plan/schema.md`      | (ASCA는 이미 운영 중, 사후 도입 검토) |
| Phase 2 (Convention)   |    ☐    | `docs/01-plan/conventions.md` | (별도 사이클)                         |
| Phase 7 (SEO/Security) | 🔄 부분 | (본 사이클)                   | `/phase-7-seo-security`               |

---

## 8. Implementation Plan (Stages)

이번 사이클은 6개 fix를 다음 순서로 단일 commit씩 적용 (bisect 안전):

| Stage | Fix                     | 파일                               | 예상 LOC | 검증                                        |
| ----- | ----------------------- | ---------------------------------- | -------- | ------------------------------------------- |
| S1    | C1 GraphQL auth         | `lib/graphql/context.ts`           | ~30      | curl: missing/expired/valid token           |
| S2    | C2 SSE auth             | `app/api/realtime/sse/route.ts`    | ~15      | curl: token 없음 → 401, valid → stream      |
| S3    | H1 members IDOR         | `app/api/members/[id]/route.ts`    | ~10      | curl: 다른 user UUID → 403, 본인 → 200      |
| S4    | H2 dashboard error leak | `app/api/admin/dashboard/route.ts` | ~5       | 의도적 throw → 응답에 `error.message` 없음  |
| S5    | H3 GraphQL CORS         | `app/api/graphql/route.ts`         | ~10      | OPTIONS with disallowed origin → 403        |
| S6    | H4 me prod guard        | `app/api/members/me/route.ts`      | ~5       | `NODE_ENV=production` + supabase=null → 500 |
| S7    | 통합 검증               | (없음)                             | -        | lint·type-check·build·preview deploy        |

---

## 9. Next Steps

1. [ ] Plan 검토·승인 (사용자)
2. [ ] `/pdca design asca-api-security-hardening` — 각 fix의 코드 수준 설계
       (수정 전후 코드 블록)
3. [ ] `/pdca do asca-api-security-hardening` — 구현 시작 (Stage S1~S6 순차)
4. [ ] `/pdca analyze asca-api-security-hardening` — Gap 분석 (수정 vs Design)
5. [ ] PR 생성 (`security-hardening-2026-04` → `main`)
6. [ ] Vercel preview에서 6 시나리오 수동 회귀
7. [ ] merge + production 모니터링

---

## Version History

| Version | Date       | Changes                                              | Author   |
| ------- | ---------- | ---------------------------------------------------- | -------- |
| 0.1     | 2026-04-25 | Initial draft (gstack /review 결과 기반 6 이슈 정리) | jhlim725 |
