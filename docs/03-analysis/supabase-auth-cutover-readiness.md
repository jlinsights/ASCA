# Supabase Auth 전환 준비와 실제 로컬 검증

2026-10-24. `feat/supabase-auth`를 main `85b6688d`(PR #121 문서·#122 LICENSE
포함)에 통합했다. 운영 인증 제공자·Vercel 환경변수·실제 사용자 계정은 변경하지
않았다. 운영 DB의 Auth 기반 스키마는 아래 적용 기록과 같이 준비했다.

## 통합한 경계

- `/members` 전체의 로그인 보호와 약관 버전 SSOT를 유지했다.
- `archiveIdentity()`의 `{ userId, admin }` 계약을 유지한다. 회비 관리 API와
  아카이브 제출 모두 공통 Supabase 계정 계층을 쓴다. 관리자는 DB `admin` 역할과
  검증된 MFA `aal2`가 필요하다.
- 운영 관리자 확인 대상은 `info@orientalcalligraphy.org`다. 이메일이나
  `ADMIN_EMAILS`만으로 native 계정을 승격하지 않는다. 이메일 확인과 기존 관리자
  신원 확인 뒤 신규 UUID에 역할을 부여하고 기록한다. 기존 Clerk 운영 설정은 롤백
  기간에 보존한다.
- 새 감사 기록의 `userId`는 Supabase Auth UUID다. 과거 Clerk ID 기록을 덮어쓰지
  않고, 확인된 이전 계정은 서버 전용 `auth_identity_links`로 연결한다.
- 작가 UUID와 계정 UUID를 구분한다. `visibility` RLS와 PR #118의 등급·회비
  트리거를 유지한다. `dues_status`에 `anon`·`authenticated` SELECT를 부여하지
  않는다. 공개 조회에 service role을 추가하지 않았다.
- Auth 마이그레이션은
  `supabase/migrations/20261024142344_supabase_auth_foundation.sql`로 이름을
  맞췄다. 검토 당시 `20261024110000`이던 파일을 실제 운영 적용 도구가 기록한
  버전에 맞춘 것으로 SQL 내용은 같다. 이미 적용된 `20261024093959`보다 뒤이며
  테스트·문서 참조도 갱신했다. `--include-all`로 옛 마이그레이션을 재실행하지
  않는다.

## 실제 로컬 검증

기존 로컬 Supabase 스택과 다른 CLI 프로젝트 `asca-auth-integration`에서
PostgreSQL·GoTrue·PostgREST·Mailpit을 실행했다. 계정과 메일은 `example.test` 및
로컬 Mailpit에 한정한다. API·DB·메일 포트는 각각 `56321`·`56322`·`56324`다.

앱 Site URL은 `http://localhost:3105`, callback allowlist는
`http://localhost:3105/auth/callback**`로 설정했다. `next` 쿼리를 포함한 실제
redirect URL이 허용되어야 한다. 경로만 등록하면 가입·복구 링크가 Site URL로
대체될 수 있었다. Preview/운영에는 각 환경의 HTTPS 호스트를 쓰고 실제 링크를
검사한다. 와일드카드 범위는 callback에 한정하고 앱의 내부 복귀 경로 검증도
유지한다. Next.js의 로컬 호스트 정규화 때문에 브라우저 주소는 `localhost`로
통일했다. 이메일 확인 필수, 서버 최소 비밀번호 길이 12, TOTP를 활성화했다.

```bash
AUTH_LOCAL_STATUS_FILE=/private/tmp/asca-auth-local-status.json npm run test:auth-service
```

상태 파일은 별도 CLI 프로젝트의 `supabase status --output json` 결과로 비공개
보관한다. 스크립트는 지정된 loopback 포트를 검사한 뒤 최소 작가 테스트 스키마와
검토한 회비/Auth 마이그레이션만 사용한다. 전체 CMS 구축이나 과거 마이그레이션
재실행 도구가 아니다. 이미 Auth 테이블이 있으면 해당 마이그레이션 적용은
생략하므로 SQL 변경 자체는 빈 DB의 `npm run test:auth-db`로 별도 확인한다.

실제 서비스에서 가입·확인 전 로그인 거부·PKCE 재사용 거부·메타데이터 역할 위조
차단·본인 프로필 RLS·타인 프로필 차단·작가 UUID 연결·회비 컬럼 비공개·숨긴 작가
조회 차단·TOTP 등록/검증·관리자 MFA·MFA 비밀번호 복구·로그아웃·정지 계정 차단을
검증했다. 테스트 계정과 작가는 종료 시 삭제한다.

gstack `/browse`에서는 실제 가입 → Mailpit 이메일 확인 → `/profile` 진입 → 이름
저장 → 로그아웃을 확인했다. 비밀번호 로그인도 실제 서비스에 연결해 확인했다.
이는 로컬 증거이며 Preview/운영의 메일 배달이나 인증 렌더링 증거가 아니다.

gstack `/codex` 독립 리뷰에서 기존 만료 세션 갱신이 PKCE 검증자 쿠키를 지우는
문제를 확인했다. GET callback에서는 기존 세션 갱신보다 코드 교환을 먼저
수행하도록 수정했다. 회귀 테스트와 폐기된 세션 쿠키를 포함한 실제 로컬 callback
HTTP 검사에서 새 세션 쿠키 기록 및 계정 조회가 성공했다.

최종 TypeScript·전체 Jest·lint·`NODE_ENV=production npm run build:full` 검증이
통과했다. 빈 로컬 DB에서 새 버전명의 Auth 마이그레이션도 적용·검증했다. lint는
기존 파일의 줄 수 경고만 남는다. AGENTS/CLAUDE 지침 본문 일치와 변경 파일 포맷도
확인했다. 독립 후속 리뷰에서는 추가 P1/P2 지적이 없었다.

## 운영 DB 적용 및 확인 기록

- ASCA-2026은 `ACTIVE_HEALTHY`다. 2026-10-24 `apply_migration`으로 검토된 Auth
  SQL만 적용했고 이력은 `20261024142344 / supabase_auth_foundation`이다.
  `account_profiles`·`auth_identity_links`·`get_my_artist_ids()`가 존재한다.
- RPC 실행 권한은 `authenticated=true`, `anon=false`, `service_role=false`다.
  `dues_status`·`claimed_by_user_id`는 여전히 anon·authenticated가 읽을 수 없다.
  작가 공개 범위 트리거와 새 계정/수정시각 트리거 3개도 확인했다. 실제 계정·
  프로필과 연결 작가는 모두 0건이다. 실제 사용자 생성·작가 연결은 수행하지
  않았다.
- 보안 advisor의 `auth_identity_links` RLS 무정책과 본인 ID RPC의 authenticated
  SECURITY DEFINER 알림은 의도한 서버 전용 매핑/본인 ID 조회 경계다. 기존 조회수
  증가 RPC의 공개 SECURITY DEFINER 경고는 이번 전환에서 변경하지 않았다.
- 최근 일일 물리 백업이 `COMPLETED`다. 최신 기록은
  `2026-10-23T18:43:41.887Z`이며 PITR은 비활성이다. 실제 복원 리허설을 수행한
  증거는 없다. 이번 변경은 기존 데이터·정책을 바꾸지 않는 추가 스키마로
  한정했고, 장애 시 기존 Clerk 운영 코드를 유지한 채 원인을 수정한다. 실제
  복원은 별도 운영 결정이며 이 백업 이후 데이터가 포함된다고 간주하지 않는다.
- Vercel `asca-main`의 팀 접근 승인이 반영되어 환경변수 메타데이터를 조회했다.
  Preview·운영 모두 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`이 등록되어 있다. Clerk 설정과
  `ADMIN_EMAILS`도 보존되어 있다.
- 사용자 요청에 따라 복호화 조회를 수행했다. 관리용 `SUPABASE_URL`과 개발용
  `NEXT_PUBLIC_SUPABASE_URL`은 ASCA-2026이다. 개발용 공개 키와 공통 서버 키의
  프로젝트 참조도 일치하며 실제 Auth API에서 유효함을 확인했다. 운영·Preview의
  공개 URL/키와 `DATABASE_URL`은 민감 변수로 보호되어 값을 반환하지 않았다. 빈
  응답을 미설정으로 판단하지 않으며 이 값들은 Preview 런타임에서 확인한다.
- `NEXT_PUBLIC_APP_URL`은 미등록이지만 PR #120이
  `VERCEL_PROJECT_PRODUCTION_URL`·`VERCEL_BRANCH_URL`을 정확한 허용 호스트로
  추가했다. 이 변경과 native proxy의 `checkOrigin()` 호출을 유지했고 운영·브랜치
  주소 허용 및 외부 주소 차단 회귀 테스트가 통과했다.
- 실제 Auth 공개 설정은 이메일 가입 가능·이메일 확인 필수이며 Kakao와 전화
  가입은 비활성이다.
- 운영 SMTP·발신 주소·Auth 서버 정책은 미확인이다. 미설정으로 단정하지 않는다.
  실제 사용자에게 초대·확인·복구 메일을 발송하지 않았다.

## 남은 운영 순서

1. Vercel 팀 접근과 조회 가능한 키·URL의 프로젝트 일치 검증은 완료했다. SMTP
   서비스·검증된 발신 주소와 보호된 변수의 런타임 확인을 진행한다. 비밀값은
   채팅이나 Git에 기록하지 않는다.
2. 같은 ASCA-2026을 가리키는 환경변수, Site URL, 쿼리를 포함한 callback
   allowlist, 이메일 확인, 비밀번호·메일 요청 제한을 검증한다.
3. Auth 마이그레이션과 RPC 권한 검사는 완료했다. 운영 코드 전환 직전 백업과 복구
   절차를 다시 확인한다. 전체 `db:push`나 과거 마이그레이션 재실행을 하지
   않는다.
4. 검증된 Clerk 신원을 신규 UUID에 연결한다. 비밀번호·세션 자동 승계나
   이메일만으로 계정 병합을 하지 않는다. 관리자·작가 소유권은 개별 확인한다.
5. Preview에서 이메일 배달·가입·복구·MFA·회비 관리·작품 제출과 타인 수정 차단을
   확인한 뒤 운영 전환한다. Clerk 계정과 설정은 롤백 검증까지 보존한다.

본인 작가 프로필 저장 보완과 계정 연결 계약은
[프로필 저장 기록](artist-profile-self-service.md)에 정리했다.

관리자 계정·DB 역할·TOTP 준비와 병합 선행 조건은
[관리자 전환 절차](supabase-auth-admin-cutover.md)를 따른다.
