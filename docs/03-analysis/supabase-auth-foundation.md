# Supabase Auth 전환 1단계

2026-10-24, `feat/supabase-auth`, 기준 `origin/main`의 `3bbc2b73`.

후속 통합·실제 서비스 검증은
[전환 준비 기록](supabase-auth-cutover-readiness.md)을 확인한다. 아래는 1단계
시점의 기록이다.

## 상태와 결정

Clerk 유료 업그레이드 없이 Supabase Auth로 전환한다. 이 단계는 계정·권한·작가
연결의 기반을 구현한다. 운영 로그인, 운영 DB, Clerk 계정, 이메일 발송 설정은
변경하지 않았다. 기존 작업 트리의 미커밋 변경도 보존했다.

현재 요청에 따른 구현은 별도 작업 트리
`/Users/jaehong/Developer/Projects/ASCA-supabase-auth`에 있다.

## 확인한 데이터 경계

- 연결된 프로젝트는 `ASCA-2026` (`caxjyimsuvjnbmjoxfad`), `ACTIVE_HEALTHY`다.
- 현행 `artists.id`는 UUID, `claimed_by_user_id`는 text다. 기존 UUID를 바꾸지
  않는다.
- 현행 DB에 `account_profiles`, `auth_identity_links`는 없다. 이 단계의 SQL은
  운영에 미적용이다.
- Clerk webhook이 사용하는 `user_profiles`를 재활용하지 않는다. webhook과 신규
  Auth 트리거의 쓰기 충돌을 피한다.

## 구현

- `account_profiles.id`는 `auth.users.id` FK다. 이름·언어와 DB 관리 역할·정지
  상태를 분리한다.
- 가입 트리거와 기존 native 사용자 backfill은 역할을 항상 `member`로 만든다.
  사용자 메타데이터에 `role: admin`이 있어도 복사하지 않는다. 여기의 `member`는
  로그인 계정 역할이며 협회 회원 등급·회비 승인과 무관하다.
- 인증 사용자는 본인 프로필만 읽고 이름·언어만 수정한다. 역할·정지 상태·ID·시간
  컬럼은 수정할 수 없다.
- `auth_identity_links`는 검증된 과거 Clerk ID와 신규 계정의 매핑을 보존하는
  서버 전용 테이블이다. 이메일/이름으로 자동 연결하거나 가입자가 매핑을 입력하는
  경로는 없다.
- `get_my_artist_ids()`는 현재 계정에 이미 연결된 작가 UUID만 반환한다. 비공개
  작가도 소유자에게만 ID를 돌려주며 타인 소유 정보·연락처를 노출하지 않는다.
  기존 공개 CMS 정책과 쓰기 권한은 확대하지 않는다.
- `loadSupabaseAccount`는 `getUser()`로 현재 사용자를 확인하고 DB 프로필과
  `getClaims()`로 검증한 세션의 MFA 수준을 조회한다. 계정/프로필 오류는 권한
  기본값으로 덮지 않는다.
- `requireSupabaseAdmin`은 DB `admin`과 `aal2`를 모두 요구한다.
  `canManageArtist`는 일반 계정의 소유 작가와 MFA를 통과한 관리자를 구분한다.
- 만료·폐기된 JWT/refresh token은 비로그인/401로, 네트워크·인증 서버 장애는
  503으로 구분한다. 독립 리뷰에서 확인한 오류 분류 결함을 회귀 테스트와 함께
  수정했다.
- 로그인 후 이동 경로는 사이트 내부 경로만 허용한다. 외부 URL, protocol-relative
  URL, 역슬래시, 제어 문자, 중첩 인코딩 우회를 거부한다.

이 모듈은 아직 운영 Clerk 진입점에 연결하지 않았다. 후속 화면·API 전환 시 모든
권한 판단을 이 서버 계층으로 통일해야 한다. 이 단계만으로 현행 Clerk API의 권한
결함이 해결됐다고 볼 수 없다.

## 검증

- 전체 TypeScript 검사 통과.
- gstack `/codex` 독립 읽기 전용 리뷰의 세션 오류 분류 지적을 반영했다.
- 전체 ESLint 검사 오류 없음. 기존 파일의 줄 수 경고는 남아 있다.
- 계정·MFA·소유권·redirect 단위 테스트 통과.
- 별도의 로컬 PostgreSQL에서 새 마이그레이션을 실제 적용하고 다음 경계를
  검증했다: 기본 역할, backfill, 메타데이터 권한 위조, 익명 접근, 본인
  조회/수정, 타인 수정, 역할/정지 해제 차단, 소유 작가 조회, 쓰기 권한 비확대,
  계정 삭제 시 작가 보존.
- `npm run db:generate`는 임시 출력 디렉터리에 생성해 검토했다. 레거시 테이블
  전체를 생성하는 결과는 운영에 적용하거나 커밋하지 않았다. 검토 대상 SQL은
  `supabase/migrations/20261024110000_supabase_auth_foundation.sql` 하나다.

DB 테스트는 JWT helper와 최소 `auth.users` 구조를 제공하는 로컬 PostgreSQL
16이다. 운영 Supabase는 PostgreSQL 17이며, 운영 마이그레이션은 아직 실행하지
않았다. 실제 GoTrue, 이메일 발송, MFA 등록/challenge, 브라우저 cookie 갱신
검증을 대체하지 않는다. 운영 환경의 `build:full`, 실제 가입/로그인/복구, Preview
검증은 후속 전환 단계에 남아 있다.

## 다음 단계

[전환 계획](../01-plan/features/supabase-auth-migration.plan.md)의 2단계 순서로
로그인·가입·이메일 인증·복구·cookie 갱신·관리자 MFA 화면과 기존 API를 교체한다.
현재 Clerk 구현을 일부만 바꾼 상태로 운영 배포하지 않는다.

실제 인증메일 검증 전에 SMTP 서비스와 발신 주소가 필요하다. Supabase 기본 발송은
운영용으로 사용하지 않는다. 키나 비밀번호는 저장소·채팅에 넣지 않는다. 운영
마이그레이션은 백업/복원 가능 상태를 먼저 확인하고 단일 파일만 적용한다.

## 공식 자료

- [Supabase 서버 인증과 Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [SMTP 설정](https://supabase.com/docs/guides/auth/auth-smtp)
- [Kakao OAuth](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
