---
feature: asca-csrf-origin-check
date: 2026-05-25
phase: plan
parent_cycle: asca-api-security-hardening (2026-04-25, CSRF 외 6건 핫픽스 완료)
revision: β
status: draft
revision_history:
  - α (2026-05-25): 초안
  - β (2026-05-25): design-validator HIGH 3건 + env 정정 반영
    - NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL (실제 ASCA env 정정)
    - CSRF_ALLOWED_ORIGINS 환경변수 추가 명시 (preview/staging 화이트리스트)
    - middleware 콜백 순서 구현 전략 명시 (§3.T3)
---

# Plan — asca-csrf-origin-check (rev β)

## §0. 컨텍스트

- 현재 `lib/security/secure-api.ts:174-204` 의 CSRF 검증은 **거짓 보안**:
  `csrfToken.includes(sessionToken.slice(-8))` — 세션 JWT 마지막 8자 substring
  포함만 확인. XSS 1회 노출 시 즉시 우회 가능.
- 토큰 발급 엔드포인트 없음 + 클라이언트에 `x-csrf-token` 헤더 첨부 코드
  0건(grep) → admin/system preset 호출이 토큰 생성 경로 없이 동작 중. 실질적으로
  `admin` preset 을 쓰는 라우트가 부재(`app/api/artists/route.ts` 1곳만
  `authenticated` 사용)해서 운영상 노출은 아직 없으나, **활성화되는 순간 403
  폭증 + 우회 동시 노출** 패턴.
- 1차 방어선 미비: `middleware.ts` 는 Clerk auth 만 호출. Origin/Referer 검증
  부재. Clerk 세션 쿠키는 `SameSite=Lax` 기본값이라 cross-site POST 는 이미
  브라우저에서 차단되지만, 서버측 명시 검증 추가가 OWASP "충분" 기준 충족.
- 옵션 평가 결과(2026-05-25 대화): **A. Origin/Referer 검증만** 채택. 이유: 거짓
  보안 제거가 최우선, Clerk SameSite 와 결합 시 OWASP CSRF Prevention Cheat
  Sheet "Use of Standard Headers to Verify Origin" 단독으로 충분 인정. 옵션
  B(double-submit)·C(Server Actions)는 별 사이클 후보로 deferred.

## §1. 목표 (success criteria)

- `lib/security/secure-api.ts` 의 `validateCSRFToken` 거짓 검증 함수 **삭제**.
- `middleware.ts` 에 **Origin/Referer 검증** 추가: mutating method
  (POST/PUT/PATCH/DELETE) 진입 시 `Origin` 또는 `Referer` 헤더가 자기 도메인
  (`process.env.NEXT_PUBLIC_APP_URL` + `process.env.VERCEL_URL` 자동 +
  `process.env.CSRF_ALLOWED_ORIGINS` csv) 일치 확인, 불일치 시 403 + audit log.
- `SecurityPresets.admin` / `system` 의 `validateCSRF: true` 옵션 **제거**.
  `SecureAPIConfig` 인터페이스에서도 `validateCSRF` 필드 제거(데드 코드 방지).
- audit 로그에 신규 이벤트 타입 `csrf.origin_mismatch` 추가 (rate-limit·auth와
  동일 포맷).
- 회귀 0: 기존 API 호출 동작 변경 없음(같은 도메인 호출은 모두 통과).
- E2E + jest test suite GREEN 유지 (Clerk infra fail 제외).
- security-reviewer agent 통과: HIGH 이상 신규 이슈 0.

## §2. 영향 범위

| 영역                                       | 변경                                                           | 비고                                  |
| ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------- |
| `middleware.ts`                            | Origin/Referer 검증 헬퍼 추가, Clerk middleware 이전 단계 실행 | Edge runtime 호환 필수                |
| `lib/security/secure-api.ts`               | `validateCSRFToken` 삭제, `validateCSRF` 옵션 제거             | callers 1곳 (`artists/route.ts`) 무변 |
| `lib/security/audit-logger.ts`             | `csrf.origin_mismatch` 이벤트 타입 추가                        | 신규 enum 1건                         |
| `docs/security/SECURITY_IMPLEMENTATION.md` | CSRF 절 갱신 ("Origin/Referer + SameSite=Lax 이중 방어")       | 문서만                                |
| `lib/security/__tests__/`                  | middleware origin-check 단위 테스트 신규                       | 신규 spec 1건, 8~10 케이스            |
| `app/api/**`                               | 변경 없음                                                      | 같은 도메인 호출은 그대로 통과        |

## §3. 작업 분해 (do 후보)

### T1 — Origin 검증 헬퍼 + 유닛 테스트 (TDD RED)

- `lib/security/origin-check.ts` 신규: `isAllowedOrigin(request, env)`
  - 허용 도메인 소스: `process.env.NEXT_PUBLIC_SITE_URL`,
    `process.env.VERCEL_URL`, 추가 환경변수 `CSRF_ALLOWED_ORIGINS`
    (comma-separated, preview 도메인용)
  - Origin 헤더 우선, 없으면 Referer 호스트, 둘 다 없으면 거부
  - 정확 hostname 매칭 (substring 금지)
- `lib/security/__tests__/origin-check.test.ts`: 동일 도메인 통과 / cross-site
  거부 / 헤더 누락 거부 / preview 도메인 통과 / Referer fallback / null Origin
  (file://) 거부 등 8~10 케이스 — **테스트 먼저 작성 후 실패 확인 (RED)**.

### T2 — 헬퍼 구현 (GREEN)

- T1 테스트 통과까지 최소 구현.
- `URL` 파싱 실패는 거부 처리.
- 환경변수 미설정 시 dev/test 환경은 localhost 자동 허용, production 은 strict
  (NEXT_PUBLIC_SITE_URL 필수, 누락 시 startup 에러).

### T3 — middleware.ts 통합

- mutating method 진입 시 Origin 검증 실행, 실패 → 403 JSON + audit log.
- **구현 전략 (rev β 명시)**: `clerkMiddleware` 의 callback 인자 안에서 guard 를
  **첫 줄에** 호출 (callback 진입 시점에는 `auth.protect()` 가 아직 실행 안된
  상태이므로 안전 — Design v1.1 §3.2 주석 참조). 별도 미들웨어 wrapping 은
  Next.js 14 가 단일 middleware 만 허용하므로 불가.
- 검증 제외 경로: `/api/webhooks/*` (Clerk svix signature 로 검증, Origin 없음).
  현재 ASCA 표면: `app/api/webhooks/clerk/route.ts` 1곳만 존재 (rev β grep
  검증). 향후 Toss/Stripe 추가 시 regex 또는 list 확장.
- 매트릭스 테스트: webhook 경유는 통과, 일반 API 는 Origin 미일치 시 403.

### T4 — secure-api.ts 거짓 검증 제거

- `validateCSRFToken` 함수 + import + `validateCSRF` 옵션 + `SecurityPresets` 내
  `validateCSRF: true` 라인 4건 모두 삭제.
- TypeScript 타입 빌드 통과 확인 (`npm run type-check`).
- `secure-api` 호출 사이트 회귀 0 확인.

### T5 — audit logger 이벤트 추가

- `auditLogger.logCSRFOriginMismatch(request, origin)` 메서드 추가
  (logSuspiciousActivity 와 동일 포맷, type=`csrf.origin_mismatch`).
- middleware 에서 호출.

### T6 — 문서 갱신

- `docs/security/SECURITY_IMPLEMENTATION.md` CSRF 절 재작성: "Clerk SameSite=Lax
  세션 쿠키 + Origin/Referer 명시 검증 이중 방어, OWASP CSRF Prevention Cheat
  Sheet Standard Header 패턴 채택".
- `docs/PRD.md:957` CSRF 라인 동기화.

### T7 — 통합 검증 + PR

- `npm run lint` warnings 회귀 0.
- `npm run type-check` 0 errors.
- `npm test` 신규 origin-check spec PASS + 기존 suite 회귀 0.
- `npm run dev` 로컬 — admin 페이지·일반 API mutating 호출 정상.
- security-reviewer agent 실행 → HIGH 이상 0 확인.
- Branch: `security/csrf-origin-check`
- PR body: "옵션 A 채택 근거 + 거짓 검증 제거 영향 + 잔여 표면(B/C deferred)
  명시".

## §4. 비범위 (out of scope, 별 사이클 후보)

- **옵션 B** double-submit cookie / signed CSRF token —
  `asca-csrf-double-submit` 사이클 후보. Trigger: state-changing 요청을
  cross-origin 으로 받아야 하는 요구사항 발생 시 (예: 외부 마이크로사이트 → ASCA
  API 직접 호출).
- **옵션 C** Clerk + Server Actions 통합 — `asca-admin-server-actions` 사이클
  후보. Trigger: admin 페이지 전면 리팩토링 시 동반.
- `app/api/webhooks/*` 의 signature 검증 강화 — `asca-webhook-signature-audit`
  사이클 후보 (현재 Clerk webhook 만 검증, Toss/Stripe 도입 시 갱신).
- Clerk 세션 쿠키 `SameSite=Strict` 승격 검토 — UX 영향 큼 (외부 링크 클릭 후
  로그인 유지 차단), 별도 결정 필요.

## §5. 리스크

| 리스크                                           | 영향                          | 완화                                                                                                  |
| ------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Vercel preview 다른 팀 호스트 false-pass (rev β) | 같은 `*.vercel.app` 공유 위험 | **와일드카드 미지원** — `CSRF_ALLOWED_ORIGINS` csv 명시만 허용, `VERCEL_URL` 은 자기 preview 호스트만 |
| 외부 webhook 의 Origin 누락 → 403                | Clerk webhook 신호 손실       | `/api/webhooks/*` 경로 제외 + signature 검증 별도 확인 (T3)                                           |
| 환경변수 누락(production)으로 전 admin 403       | 운영 장애                     | startup assertion (middleware 진입 시 throw) + `.env.example` 갱신                                    |
| Edge runtime 에서 `URL` 파싱 차이                | middleware 런타임 에러        | edge runtime 단위 테스트 (jest-environment-node 가 아닌 edge mock)                                    |
| 거짓 CSRF 제거 후 admin preset 사용 시작 시 회귀 | 미발견                        | 사이클 종료 후 `validateCSRF` grep으로 잔존 0 확인 (T4 검증)                                          |

## §6. 일정 (estimate)

- T1+T2 (TDD): 1.5h
- T3 (middleware): 1h
- T4 (제거): 0.3h
- T5 (audit log): 0.5h
- T6 (docs): 0.5h
- T7 (검증·PR): 1h
- 합계: **약 4.8h** (반나절 단일 세션)

## §7. 검증 메트릭 (Check phase 기준)

- Origin 검증 헬퍼 테스트 커버리지 ≥ 95%
- 회귀: 기존 jest 13 suites GREEN 유지
- lint warnings 회귀 0
- security-reviewer HIGH 이상 0
- 신규 audit 이벤트 type 1건 (`csrf.origin_mismatch`) 동작 확인
- middleware 응답 시간 회귀 < +2ms (Origin 파싱은 string ops 만)

## §8. 참고

- OWASP CSRF Prevention Cheat Sheet — "Identifying Source Origin (via Origin /
  Referer header)" 절
- Clerk docs — SameSite cookie 기본값 `Lax`
- Next.js Middleware Edge runtime 제약 — Node API 사용 불가, `URL`/`fetch` 사용
  가능
- 부모 사이클 `asca-api-security-hardening` (2026-04-25): CSRF는 당시 범위 외
  명시, 본 사이클이 후속 처리
