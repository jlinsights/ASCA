# Gap Analysis: Security Hardening

> Design 문서 vs 구현 코드 비교 분석

## 분석 개요
- **Feature**: security-hardening
- **분석일**: 2026-03-28
- **Design 문서**: `docs/02-design/features/security-hardening.design.md`
- **Match Rate**: **70%**

---

## 항목별 판정

### Step 1: API 인증 (57%)

| # | 파일 | 판정 | 상세 |
|---|------|:----:|------|
| 1 | `artists/route.ts` POST | ✅ | `createSecureAPI` 래퍼 적용 |
| 2 | `artists/[id]/route.ts` PUT/DELETE | ⚠️ | `requireAdminAuth` 직접 호출 (래퍼 미적용) |
| 3 | `applications/route.ts` GET | ✅ | memberId 없을 때 관리자 인증 |
| 4 | `applications/route.ts` POST | ⚠️ | `requireAdminAuth` 직접 호출 |
| 5 | `programs/route.ts` POST | ⚠️ | `requireAdminAuth` 직접 호출 |
| 6 | `programs/[id]/route.ts` PUT/DELETE | ⚠️ | `requireAdminAuth` 직접 호출 |
| 7 | `migration/migrate-all/route.ts` | ❌ | 비활성화(503) 상태, 인증 미적용, TODO 잔존 |

### Step 2: XSS 방어 (88%)

| # | 파일 | 판정 | 상세 |
|---|------|:----:|------|
| 8 | `lib/security/sanitize.ts` | ⚠️ | `sanitizeHTML` ✅, `escapeHTML` ❌ 누락 |
| 9 | `app/blog/page.tsx` | ✅ | sanitizeHTML 적용 |
| 10 | `typewriter-effect.tsx` | ✅ | dangerouslySetInnerHTML 제거 |
| 11 | `app/gallery/page.tsx` | ✅ | JSON-LD만 사용 (안전) |

### Step 3: SQL Injection (100%)

| # | 파일 | 판정 |
|---|------|:----:|
| 12 | `sync-engine.ts` executeSchemaChange | ✅ |

### Step 4: 환경변수 + 지연 초기화 (40%)

| # | 파일 | 판정 | 상세 |
|---|------|:----:|------|
| 13 | `sync-engine.ts` 지연 초기화 | ✅ | getter 패턴 적용 |
| 14 | `sync-engine.ts` getSyncEngine | ✅ | 팩토리 export |
| 15 | `sync/start/route.ts` | ❌ | SyncEngine 미사용 |
| 16 | `sync/stop/route.ts` | ❌ | SyncEngine 미사용 |
| 17 | `sync/status/route.ts` | ❌ | SyncEngine 미사용 |

### Step 5: 에러 보안 (100%)

| # | 파일 | 판정 |
|---|------|:----:|
| 18 | `lib/api/response.ts` safeError | ✅ |

### Step 6: 관리자 권한 (50%)

| # | 파일 | 판정 | 상세 |
|---|------|:----:|------|
| 19 | `members/[id]/route.ts` PUT | ✅ | getAuthContext 적용 |
| 20 | `members/[id]/route.ts` DELETE | ❌ | getAuthContext 미적용 |

---

## Gap 목록 (수정 필요)

### 즉시 수정 (구현 보완)
1. `app/api/members/[id]/route.ts` DELETE — getAuthContext 관리자 확인 추가
2. `lib/security/sanitize.ts` — escapeHTML 함수 추가
3. `app/api/migration/migrate-all/route.ts` — TODO 주석 정리

### Design 문서 업데이트
4. sync API 3개 파일 — 현재 SyncEngine 미사용 구조이므로 Design에서 제외
5. 동적 라우트([id]) 인증 방식 — `requireAdminAuth` 직접 호출을 허용 패턴으로 Design 반영

---

## 최종 Match Rate: 70%

**판정**: `< 90%` → `/pdca iterate security-hardening` 자동 개선 권장
