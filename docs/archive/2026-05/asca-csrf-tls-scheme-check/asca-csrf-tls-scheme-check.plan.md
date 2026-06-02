---
feature: asca-csrf-tls-scheme-check
date: 2026-05-25
phase: plan
parent_cycle: asca-csrf-origin-check (2026-05-25 완료, Match 98%, PR #33)
revision: α
status: draft
estimate: ~30분
priority: MEDIUM (security-reviewer 결과 M1)
---

# Plan — asca-csrf-tls-scheme-check (rev α)

## §0. 컨텍스트

- 부모 사이클 `asca-csrf-origin-check` PR #33 의 security-reviewer MEDIUM M1:
  `parseHostname('http://asca.kr')` 과 `parseHostname('https://asca.kr')` 둘 다
  같은 hostname (`asca.kr`) 반환 → middleware Origin guard 는 scheme 무관 통과.
- HSTS preload + Clerk 쿠키 `Secure` 플래그가 1차 차단하지만, defense-in-depth
  관점에서 scheme 검증 추가 권고됨.
- 본 사이클: parent cycle 의 `lib/security/origin-check.ts` 헬퍼를 확장.
- **branch 의존**: `security/csrf-origin-check` (PR #33) 코드 베이스 위에 신규
  branch `security/csrf-tls-scheme-check` 분기. PR #33 머지 후 main 으로 자동
  rebase 또는 머지 충돌 0 (단순 함수 확장).

## §1. 목표 (success criteria)

- `lib/security/origin-check.ts` 에 scheme 검증 추가:
  - `OriginCheckEnv.enforceHttps?: boolean` 옵션 (default:
    `nodeEnv === 'production'`)
  - production 환경에서 `http://*` Origin 거부, `https://*` 만 허용
  - dev/test 환경은 default `false` (localhost http 정상 통과)
- `OriginCheckResult.reason` union 에 `'scheme_mismatch'` 추가
- 테스트 케이스 2건 추가 (production http 거부 / dev http 통과)
- 회귀 0: parent cycle 의 기존 16 테스트 모두 GREEN 유지
- security-reviewer 통과: HIGH 이상 신규 이슈 0

## §2. 영향 범위

| 영역                                               | 변경                                                                        | LOC  |
| -------------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| `lib/security/origin-check.ts`                     | enforceHttps 옵션 + scheme 검증 로직                                        | +~20 |
| `lib/security/__tests__/origin-check.test.ts`      | 2 테스트 케이스 추가                                                        | +~30 |
| `.env.example`                                     | (선택) `CSRF_ENFORCE_HTTPS` 명시                                            | +~3  |
| `docs/02-design/features/.../*.design.md` (parent) | §6.2 잔존 위험에서 해당 항목 strikethrough or 갱신 (다음 사이클 archive 시) | docs |
| middleware.ts                                      | 변경 없음                                                                   | 0    |

## §3. 작업 분해 (do 후보)

### T1 — 테스트 RED (2 케이스)

- `it('production http://asca.kr Origin → scheme_mismatch')` —
  env.nodeEnv='production', enforceHttps default true
- `it('dev http://localhost Origin → ok (enforceHttps false)')` —
  env.nodeEnv='development', enforceHttps default false
- 기존 16 케이스 영향 없음 확인 (`enforceHttps` 미설정 시 기존 동작 유지)
- 실행 → 신규 2건 fail

### T2 — 구현 GREEN

- `OriginCheckEnv` 에 `enforceHttps?: boolean` 추가
- `checkOrigin` 내부:
  `enforceHttps === true || (enforceHttps === undefined && nodeEnv === 'production')`
  이면 candidateUrl 의 protocol 검사
- `protocol !== 'https:'` → return
  `{ ok: false, reason: 'scheme_mismatch', ... }`
- `OriginCheckResult.reason` union 에 `'scheme_mismatch'` 추가
- 실행 → 18/18 GREEN

### T3 — env.example + 문서

- `.env.example` 에 `CSRF_ENFORCE_HTTPS` 주석 (선택)
- 부모 사이클의 `SECURITY_IMPLEMENTATION.md` 의 CSRF 절에 "production scheme
  검증" 1줄 추가

### T4 — 통합 검증

- `npm run type-check` 0 errors
- `npm run lint` warnings 회귀 0
- `npx jest lib/security` 18/18 PASS
- security-reviewer (선택, 짧은 사이클이라 생략 가능)

### T5 — PR 생성

- Branch: `security/csrf-tls-scheme-check`
- Base: `security/csrf-origin-check` (PR #33 머지 전이라면) 또는 `main` (머지
  후)
- PR body: parent 사이클 link + MEDIUM M1 해소 명시

## §4. 비범위 (out of scope)

- middleware.ts 변경 (helper 함수 시그니처 호환 유지)
- CSRF_ENFORCE_HTTPS env 외 추가 보안 옵션
- HSTS 헤더 정책 변경 (별 영역)

## §5. 리스크

| 리스크                              | 영향               | 완화                                                                          |
| ----------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| 기존 16 테스트의 ENV_PROD 가정 깨짐 | 회귀 16건          | ENV_PROD 가 enforceHttps 명시 false 또는 https origin 사용 — 케이스 점검 필요 |
| PR #33 머지 전 분기 → 머지 충돌     | rebase 복잡        | helper 함수 추가만 → squash merge 후 conflict 0                               |
| dev 환경 default 변경에 따른 회귀   | 로컬 dev 동작 변경 | default false (current behavior) 유지 → opt-in only                           |

## §6. 일정

- T1+T2: 15분
- T3: 5분
- T4: 5분
- T5: 5분
- **합계: ~30분** (security-reviewer 생략 시)

## §7. 검증 메트릭

- 신규 테스트 2건 PASS, 기존 16건 회귀 0 → 18/18
- type-check 0 errors
- lint warnings 회귀 0
- parent 사이클 design §6.2 잔존 위험 1건 해소 (정확 hostname 매칭 + scheme
  검증)

## §8. 참고

- Parent cycle: `docs/01-plan/features/asca-csrf-origin-check.plan.md` (rev β)
- Parent design: `docs/02-design/features/asca-csrf-origin-check.design.md`
  (v1.1, §6.2 잔존 위험)
- Parent report: `docs/04-report/features/asca-csrf-origin-check.report.md` (별
  사이클 후보 #1)
- Memory: `project_asca_csrf_tls_scheme_candidate.md`
- OWASP CSRF Prevention Cheat Sheet — "Use TLS" 권고
