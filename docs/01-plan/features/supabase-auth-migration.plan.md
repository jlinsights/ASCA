# Supabase Auth 단계별 전환

작성: 2026-10-24. Clerk 유료 업그레이드 없이 기존 Supabase Pro를 활용한다.

## 결정과 범위

- 기존 운영 로그인은 후속 전환 검증까지 Clerk로 유지한다.
- 구현은 `feat/supabase-auth` 작업 트리에서 진행한다. 기존 작업 트리의 변경을
  보존한다.
- 로그인 계정 UUID와 작가·작품 UUID를 구분한다. 가입만으로 기존 작가를
  소유하거나 협회 정회원이 되지 않는다.
- 기존 DB의 `artists.claimed_by_user_id`에 검증된 계정 UUID 문자열을 연결한다.
  이름이나 이메일 일치만으로 자동 연결하지 않는다.
- `account_profiles`는 Supabase Auth 전용이다. 기존 Clerk webhook의
  `user_profiles`와 섞지 않는다.
- 관리자는 DB 역할과 검증된 `aal2` 세션이 모두 필요하다. 사용자 메타데이터의
  역할을 신뢰하지 않는다.

## 순서와 완료 조건

### 1. 계정·권한 기반

- Auth 사용자 생성 시 기본 `member` 프로필 생성. 이는 로그인 사용자 역할이며
  회비·회원 등급과 별개다.
- 본인 프로필만 조회, 이름·언어만 수정. 역할·정지 상태·과거 계정 연결 정보는
  서버에서 관리한다.
- 본인 소유 작가 ID만 반환하는 제한된 RPC. 기존 공개 CMS 권한은 확대하지 않는다.
- 검증된 서버 세션, DB 역할, 계정 정지, 관리자 MFA, 작가 소유권, 안전한 복귀
  경로를 테스트한다.
- 독립 로컬 PostgreSQL에서 마이그레이션·트리거·RLS·권한을 실제 실행한다.

### 2. 로그인 화면과 세션 전환

- 기존 Ink System 로그인·가입 화면을 Supabase 이메일/비밀번호 방식으로 교체한다.
- 이메일 인증, PKCE callback, 비밀번호 복구, 로그아웃, 세션 갱신, 다국어 오류를
  구현한다.
- 모든 Clerk 서버·클라이언트 호출을 공통 Supabase 계정 계층으로 전환한다.
- 프로필·작품 업로드는 계정 ID 대신 연결된 작가 ID를 사용한다. 관리자 서버
  layout과 API 양쪽에서 검증한다.
- MFA 등록·challenge와 만료/중복 callback, 타인 작가 수정 차단을 검증한다.

### 3. 설정과 기존 계정 이전

- 실제 프로젝트 `ASCA-2026` (`caxjyimsuvjnbmjoxfad`)만 사용한다. 옛
  `.env.local`을 복사하지 않는다.
- SMTP 서비스·발신 주소를 확인하고 인증메일 전송을 검증한다. SMTP 비밀번호/API
  키는 채팅·저장소에 기록하지 않는다.
- redirect allowlist, site URL, 이메일 인증, 비밀번호 정책, rate limit을
  설정한다.
- Kakao는 Supabase provider 설정과 이메일 동의 조건을 확인한 뒤 활성화한다.
- 기존 Clerk 계정은 검증된 사용자 ID 매핑을 남겨 이전한다. 비밀번호·세션 승계는
  전제하지 않는다.
- 관리자 최초 부여와 기존 작가 소유권 연결은 개별 확인 후 기록한다. 자동
  초대·메일 발송은 하지 않는다.

### 4. 운영 전환

- DB 백업/복원 가능 상태 확인 → 검토된 단일 마이그레이션 적용 → Preview
  인증·권한 검증 → 운영 전환 순서다.
- 과거 Supabase/Drizzle 전체 마이그레이션 재실행이나 `db:push`를 하지 않는다.
  현행 DB와 레거시 Drizzle 스키마가 다르다.
- `NODE_ENV=production npm run build:full`, 관련 단위/DB 테스트,
  lint/type-check를 통과한다.
- 실제 가입·인증·로그인·복구·MFA·소유권을 Preview에서 확인한 후 전환한다. 외부
  메일 전송은 별도로 승인한다.
- Clerk 설정과 계정은 롤백 기간 동안 보존한다. 운영 전환 후 SDK·webhook을
  제거한다.

## 1단계 산출물과 검증 기록

진행 결과는 `docs/03-analysis/supabase-auth-foundation.md`에 기록한다. 이 계획의
항목 자체는 완료 증거가 아니다.

운영 DB·인증 제공자·메일 설정은 이 단계에서 변경하지 않는다. 운영 반영과 실제
메일/로그인 검증은 후속 단계다.
