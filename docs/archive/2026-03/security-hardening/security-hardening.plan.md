# Plan: Security Hardening

> ASCA 프로젝트 보안 강화 — Critical 취약점 7건 및 Warning 보안 이슈 해결

## 1. 개요

### 배경
2026-03-28 코드 분석 결과, ASCA 프로젝트에서 **Critical 보안 이슈 7건**이 발견됨.
SQL Injection, XSS, 인증 미구현, 민감 정보 노출 등 배포 차단 수준의 취약점이 포함.

### 목표
- Critical 보안 취약점 7건 전량 해결
- Warning 보안 관련 이슈 3건 개선
- 보안 테스트 커버리지 확보
- 프로덕션 배포 가능 상태 달성

### 범위
| 포함 | 제외 |
|------|------|
| API 인증/인가 적용 | 인증 시스템 아키텍처 전면 재설계 |
| XSS 방어 (DOMPurify) | 프론트엔드 UI/UX 변경 |
| SQL Injection 차단 | DB 스키마 변경 |
| 에러 메시지 보안 처리 | 성능 최적화 |
| 환경변수 검증 강화 | 새로운 기능 추가 |

---

## 2. Critical 이슈 목록

### C1. SQL Injection — `lib/sync-engine.ts:255-271`
- **현상**: `executeSchemaChange`에서 `tableName`, `columnName`을 직접 SQL 문자열에 삽입
- **위험도**: Critical (DB 전체 탈취 가능)
- **해결 방안**: 화이트리스트 기반 테이블/컬럼명 검증 추가

### C2. 환경변수 Non-null Assertion — `lib/sync-engine.ts:20-28`
- **현상**: `process.env.SUPABASE_SERVICE_ROLE_KEY!` 등 검증 없이 사용
- **위험도**: Critical (런타임 크래시 → 서비스 다운)
- **해결 방안**: `lib/config/env.ts`의 Zod 검증 활용

### C3. XSS — `app/blog/page.tsx:236-241`
- **현상**: 외부 RSS 콘텐츠를 `dangerouslySetInnerHTML`로 렌더링, `<script>` 등 미제거
- **위험도**: Critical (사용자 세션 탈취 가능)
- **해결 방안**: DOMPurify 서버사이드 적용

### C4. XSS — `components/ui/typewriter-effect.tsx:79`
- **현상**: `dangerouslySetInnerHTML={{ __html: displayedText }}`
- **위험도**: High (입력 소스에 따라 위험)
- **해결 방안**: React 텍스트 노드(`textContent`)로 전환

### C5. 인증 미구현 — `app/api/artists/route.ts:40-61`
- **현상**: POST(작가 생성)에 `// TODO: Admin Auth Check` 주석만 존재
- **위험도**: Critical (누구나 데이터 생성 가능)
- **해결 방안**: `withAdmin` 미들웨어 적용

### C6. 인증 미구현 — `app/api/cultural-exchange/applications/route.ts:20-24`
- **현상**: 신청 내역 조회 API 인증 코드 주석 처리
- **위험도**: Critical (회원 개인정보 노출)
- **해결 방안**: 인증 미들웨어 활성화

### C7. 민감 정보 노출 — `app/api/artists/route.ts:58`
- **현상**: `error.message`를 클라이언트 응답에 포함
- **위험도**: High (내부 구조 노출 → 공격 벡터 확대)
- **해결 방안**: 프로덕션에서 일반 메시지만 반환, 세부사항은 서버 로그

---

## 3. Warning 보안 이슈

### W5. 미해결 TODO 30건+ (보안 관련)
- API 엔드포인트 전수 조사 → 인증 TODO 일괄 구현

### W9. 모듈 레벨 싱글톤 — `lib/sync-engine.ts:494`
- 환경변수 누락 시 임포트 단계에서 크래시 → 지연 초기화 적용

### W10. 불완전한 권한 확인 — `app/api/members/[id]/route.ts:96-102`
- 관리자 역할 확인 로직 구현

---

## 4. 구현 우선순위

| 순서 | 이슈 | 예상 난이도 | 의존성 |
|------|------|------------|--------|
| 1 | C5, C6 — API 인증 일괄 적용 | Medium | 없음 |
| 2 | C3, C4 — XSS 방어 (DOMPurify) | Low | `isomorphic-dompurify` 설치 |
| 3 | C1 — SQL Injection 차단 | Medium | 없음 |
| 4 | C2, W9 — 환경변수 검증 + 지연 초기화 | Low | 없음 |
| 5 | C7 — 에러 메시지 보안 처리 | Low | 없음 |
| 6 | W5 — API 인증 TODO 전수 해결 | High | 1단계 완료 후 |
| 7 | W10 — 관리자 권한 확인 구현 | Medium | 없음 |

---

## 5. 의존성

### 설치 필요 패키지
```bash
npm install isomorphic-dompurify
npm install -D @types/dompurify
```

### 기존 활용 가능 코드
- `lib/config/env.ts` — Zod 환경변수 검증 (이미 존재)
- `lib/api/response.ts` — API 응답 표준화 (이미 존재)
- `lib/security/security-middleware.ts` — 보안 미들웨어 프레임워크 (이미 존재)

---

## 6. 성공 기준

- [ ] Critical 이슈 7건 전량 해결
- [ ] Warning 보안 이슈 3건 해결
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 에러 0건
- [ ] `npm run build` 성공
- [ ] 모든 `dangerouslySetInnerHTML` 사용처에 sanitize 적용
- [ ] 모든 쓰기 API 엔드포인트에 인증 미들웨어 적용
- [ ] 에러 응답에 내부 정보 미포함 확인

---

## 7. 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 인증 미들웨어 적용 시 기존 admin 기능 영향 | Medium | 기존 admin 라우트 패턴 참조 |
| DOMPurify 번들 사이즈 증가 | Low | isomorphic 버전으로 SSR 활용 |
| sync-engine 변경 시 Airtable 동기화 영향 | Medium | 화이트리스트만 추가, 로직 변경 최소화 |

---

**작성일**: 2026-03-28
**PDCA Phase**: Plan
**다음 단계**: `/pdca design security-hardening`
