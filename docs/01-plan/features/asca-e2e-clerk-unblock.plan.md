---
feature: asca-e2e-clerk-unblock
date: 2026-05-14
phase: plan
parent_cycle: asca-e2e-debt-roadmap (Phase 1 분리)
revision: α
status: draft
---

# Plan — asca-e2e-clerk-unblock (rev α)

## §0. 컨텍스트

- `asca-e2e-debt-roadmap` (2026-05-14) 의 **Phase 1 만 즉시 분리 사이클** 결정.
- 목표: main 의 `E2E Tests (Playwright)` workflow RED 해소 → main 전 워크플로우
  GREEN.
- 다른 jest mock debt (J1-J4) 는 `asca-e2e-debt-roadmap` backlog 유지.

## §1. 목표 (success criteria)

- ✅ main `E2E Tests (Playwright)` workflow conclusion = `success`
- ✅ WebServer 부팅 성공 (Clerk publishable key valid)
- ✅ Playwright chromium suite 실행 — 통과/실패 무관, 적어도 webServer timeout
  은 발생 안 함
- ✅ E2E 회귀 방지: workflow 에 env/secret 주입 패턴 commit + 짧은 README

## §2. Root cause (확정)

### 증상

- main `eece94f3` E2E Tests run `25863927048` log:
  - `[WebServer] Error: Publishable key not valid` 100+ 회 반복 (매초)
  - `Error: Timed out waiting 120000ms from config.webServer` → exit 1

### 원인 (`.github/workflows/e2e-tests.yml` + `.env.example`)

- workflow 의 `Setup environment variables` 단계: `cp .env.example .env.test` +
  `cp .env.example .env.local` 만 수행.
- `.env.example` 의
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key"` 는
  **placeholder string** — Clerk SDK 가 `pk_test_/pk_live_` prefix 뒤 base64url
  payload 를 검증 → `your_publishable_key` 부분에서 디코드 실패 →
  `Publishable key not valid`.
- **GitHub Actions secret 주입이 전혀 없음** — Clerk test instance 의 진짜
  publishable key 가 CI 에 들어가지 않음.

## §3. 옵션

### 옵션 A — GitHub Actions secret (권장)

- 작업:
  1. Clerk dashboard 에서 **e2e test instance** 의 publishable key + secret key
     발급 (또는 기존 dev instance 사용)
  2. repo settings → Actions secrets 에 등록:
     - `CLERK_PUBLISHABLE_KEY` (NEXT*PUBLIC*\*)
     - `CLERK_SECRET_KEY`
  3. `.github/workflows/e2e-tests.yml` 의 `Run Playwright tests` step env 에
     주입
  4. `Setup environment variables` 단계에서 `.env.test` 에 export 또는 workflow
     env 로 충분
- 장점: 실제 Clerk test instance 사용 → 인증 흐름 e2e 테스트 가능
- 단점: repo owner 권한 필요 (사용자 액션), test instance Clerk 비용 (free tier
  충분 예상)

### 옵션 B — Clerk SDK bypass via build flag

- `NEXT_PUBLIC_CLERK_BYPASS=true` 같은 flag + `<ClerkProvider>` wrapper 에서
  mock provider 반환
- 작업:
  1. `lib/auth/clerk-provider.tsx` 에 env-based 분기 추가
  2. workflow 에 flag 만 주입 (secret 불필요)
  3. e2e test 는 unauth flow 만 검증, auth flow 는 skip 또는 별도 mock
- 장점: secret 관리 불필요, 즉시 unblock
- 단점: 코드 변경 (prod 영향 0 보장 필요), auth e2e 미커버

### 옵션 C — `.env.example` 에 valid dummy key hardcode

- 시도: `pk_test_aW5zdGFuY2Utc3RhbmRpbi5jbGVyay5hY2NvdW50cy5kZXYk` 등 valid
  format dummy
- **불가능 / 비권장**: Clerk SDK 는 publishable key 의 instance host 부분에 실제
  fetch 시도 — invalid host 면 다른 형태 fail. real instance 없이 SDK 통과 불가.

## §4. 추천 옵션

→ **옵션 A** (사용자 액션 필요, but cleanest)

- Clerk dashboard `Development` instance 또는 신규 `E2E Testing` instance 의
  publishable/secret key 사용
- 비용 0 (Clerk dev instance 무료)
- Secret 1회 등록 후 영구 — 회귀 방지 자산

만약 **사용자 액션 즉시 불가** 한 경우: → **옵션 B fallback** — 코드 변경으로
SDK bypass 후 추후 옵션 A 로 마이그레이션

## §5. 작업 분해 (do 후보)

### 옵션 A 진행 시

- **T1**: Clerk dashboard 에서 e2e test instance publishable/secret key 발급
  (사용자 액션)
- **T2**: GitHub repo settings 에 secret 등록 (사용자 액션)
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- **T3**: `.github/workflows/e2e-tests.yml` 수정
  - `Run Playwright tests` step env 에
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}` +
    `CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}` 추가
  - 또는 `Setup environment variables` 단계에서 `.env.test` 에 echo append
- **T4**: PR 생성 → CI 재돌림 → WebServer 부팅 성공 + E2E 통과 확인
- **T5**: README 또는 `.github/workflows/README.md` 에 secret 요구 문서화

### 옵션 B 진행 시

- **T1**: `<ClerkProvider>` 또는 layout 의 ClerkProvider import 에 env flag 분기
  추가
- **T2**: `.env.example` 에 `NEXT_PUBLIC_CLERK_BYPASS=` placeholder 추가
- **T3**: workflow 에 `NEXT_PUBLIC_CLERK_BYPASS=true` 환경 주입
- **T4**: e2e auth flow test 가 있다면 .skip 또는 mock 처리
- **T5**: prod 회귀 검증 (flag false 시 기존 동작 보장)

## §6. 검증 계획

- 로컬: `npm run test:e2e:ci` 가 valid key 로 통과 (옵션 A: 실제 key +
  `.env.test`, 옵션 B: BYPASS=true)
- CI: PR push 시 E2E Tests workflow conclusion = success
- 회귀: main 머지 후 main run 도 동일 결과

## §7. 리스크

- **R1 (옵션 A)**: Clerk secret 노출 위험 — secret 은 repo secret 으로만 관리,
  env 출력 금지
- **R2 (옵션 A)**: Clerk test instance rate limit / 비용 — free tier 충분
  예상이나 모니터링 필요
- **R3 (옵션 B)**: ClerkProvider mock 이 prod 빌드 영향 — env flag 분기 단위
  테스트 필요
- **R4**: 이 fix 후 E2E 자체에서 다른 fail (DB, route, 컴포넌트) 노출 가능성 —
  Phase 1 의 정의는 **WebServer 부팅 성공**까지. 그 이후 RED 는 별 사이클

## §8. 다음 행동

본 plan 검토 후:

- 옵션 A 선택 시: `/pdca design asca-e2e-clerk-unblock` 후 사용자에게 Clerk
  dashboard / repo secret 작업 안내
- 옵션 B 선택 시: `/pdca design asca-e2e-clerk-unblock` 후 코드 변경 do 단계
  진행

## §9. 관련 자료

- Parent: `docs/01-plan/features/asca-e2e-debt-roadmap.plan.md`
- 실패 로그: main run `25863927048` (E2E Tests, eece94f3)
- 워크플로우: `.github/workflows/e2e-tests.yml`
- env: `.env.example` (Clerk 변수 정의)
- Clerk docs: https://clerk.com/docs/deployments/environments (test instance
  setup)
