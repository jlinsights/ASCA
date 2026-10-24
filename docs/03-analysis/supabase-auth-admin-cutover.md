# Supabase Auth 관리자 준비와 배포 순서

이 문서는 운영 실행 절차다. 실행 여부는 아래 체크리스트와 전환 준비 기록을
따른다. 초기 관리자 검증을 완료하기 전 PR을 병합하거나 운영으로 승격하지 않는다.
`main` 병합은 Vercel 운영 배포를 시작하므로 이 순서가 병합 선행 조건이다.

## 마이그레이션 적용 → 배포

1. ASCA-2026(`caxjyimsuvjnbmjoxfad`)의 직전 백업과 복구 기준을 확인한다.
2. 검토한 `supabase/migrations/20261024142344_supabase_auth_foundation.sql`의
   내용만 Supabase 마이그레이션 도구(`apply_migration`)로 해당 프로젝트에
   적용하고 적용 이력을 확인한다. 과거 파일 재실행, `db:push`, `--include-all`은
   사용하지 않는다. 현재 운영 Clerk 계정·설정은 보존한다.
3. `public.account_profiles`, `public.auth_identity_links`와
   `public.get_my_artist_ids()`가 존재하는지 확인한다. `authenticated`만 RPC를
   실행할 수 있고 `anon`·`service_role`에 실행 권한이 없는지 검사한다. 아래
   메타데이터 쿼리가 통과하기 전 새 코드를 배포하지 않는다.
4. Preview의 URL·공개 키·서버 키·DB 연결이 같은 ASCA-2026인지 확인하고 Preview
   코드를 배포한다. SMTP·검증된 발신 주소·이메일 확인·비밀번호 정책·TOTP·실제
   callback 쿼리를 포함한 allowlist를 확인한다. 운영 전환 전에는 테스트용 기본
   메일 발송에 의존하지 않는다.
5. 아래 절차로 관리자 계정·역할·TOTP를 준비하고 Preview에서 실제 관리자 접근을
   검증한다. 준비되지 않은 상태로 운영을 전환하지 않는다.
6. 준비 완료 후 병합/운영 배포한다. 운영 별칭에서 로그인·MFA·로그아웃·
   `/admin/artists` 및 승인된 대상의 회비 저장을 확인한다. PR #120의 Origin 허용
   목록을 유지한다. Clerk 제거·키 폐기는 롤백 검증 이후의 별도 작업이다.

```sql
select to_regclass('public.account_profiles') as account_profiles,
       to_regclass('public.auth_identity_links') as auth_identity_links,
       to_regprocedure('public.get_my_artist_ids()') as owner_rpc;
-- 위 결과가 모두 존재할 때만 다음 검사를 진행한다.
select has_function_privilege('authenticated', 'public.get_my_artist_ids()', 'execute') as authenticated,
       has_function_privilege('anon', 'public.get_my_artist_ids()', 'execute') as anon,
       has_function_privilege('service_role', 'public.get_my_artist_ids()', 'execute') as service_role;
-- 기대값: authenticated=true, anon=false, service_role=false.
```

DB 소유자/운영자 권한은 이 클라이언트 역할 검사와 별개다. 2026-10-24 운영 DB
적용과 위 권한 검사는 완료했다. 관리자 역할 부여는 아직 수행하지 않았다.

## 초기 관리자 계정 만들기

- 마이그레이션과 Preview 준비 후 실제 운영자가 Preview의 `/sign-up`에서
  `info@orientalcalligraphy.org`로 가입한다. 비밀번호는 운영자가 직접 설정하며
  채팅·PR·저장소에 기록하지 않는다.
- 해당 메일함에서 확인 링크를 열고 이메일 확인을 완료한다. Supabase Dashboard의
  Authentication → Users에서 이메일과 확인 상태를 확인하고 **해당 사용자의
  `auth.users.id` UUID**를 복사한다. Clerk 사용자 ID를 사용하지 않는다.
- 가입으로 생성되는 `public.account_profiles.role`은 `member`다. 이메일이나
  `ADMIN_EMAILS`에 이름이 있다는 이유로 자동 승격하지 않는다.

## 서버에서 admin 역할 부여

운영자가 Supabase SQL Editor 등 신뢰된 서버 관리 경로에서, 위에서 확인한 UUID를
넣어 다음 DML을 실행한다. 테이블은 **`public.account_profiles`**, 컬럼은
**`role`**, 값은 **`admin`**이다. `user_profiles`나 사용자 메타데이터가 아니다.

```sql
update public.account_profiles as p
set role = 'admin'
from auth.users as u
where p.id = u.id
  and u.id = '<확인한 auth.users.id UUID>'::uuid
  and lower(u.email) = 'info@orientalcalligraphy.org'
  and u.email_confirmed_at is not null
  and p.disabled_at is null
returning p.id, p.role;
```

반환된 UUID가 확인한 계정과 일치하는지 검사하고 작업 주체·시각을 운영 기록에
남긴다. 반환이 없으면 이메일 확인·UUID·계정 정지 상태를 조사하고 조건을 제거해
강제로 승격하지 않는다. 역할만으로 관리자 기능을 사용할 수는 없다.

## MFA(TOTP) 등록과 관리자 확인

- 해당 계정으로 Preview에 로그인한 뒤 `/auth/mfa?next=/admin/artists`를 연다.
- 인증 앱으로 QR을 등록하고 현재 일회용 코드를 입력해 등록·검증을 마친다. QR·
  설정 키·일회용 코드는 PR·로그·채팅에 기록하지 않는다.
- `/api/auth/session`의 계정 역할이 `admin`, `assuranceLevel`이 `aal2`인지
  운영자 브라우저에서 확인한다. 세션 응답이나 쿠키 원문을 PR에 붙이지 않는다.
- `/admin/artists`와 `/api/admin/artists` 접근이 성공하는지 확인한다. 새
  로그인은 `aal1`로 시작할 수 있으므로 관리자 작업 전에 다시 TOTP를 검증한다.
- `archiveIdentity()`는 DB 역할과 검증된 `aal2`를 모두 요구한다.
  `ADMIN_EMAILS`·`SUPER_ADMIN_EMAILS`는 native 판정에 사용하지 않는다.

`claimed_by_user_id`는 계속 `auth.users.id` UUID 문자열(text)이다. 관리자 준비가
기존 작가를 자동 연결하지 않는다. 계정–작가 연결 UI는 후속 Claude 작업이다.

## 병합 전 운영 체크리스트

- [x] 직전 완료 백업 확인, PITR 비활성·복원 리허설 미수행 기록
- [x] ASCA-2026에 검토된 Auth 마이그레이션만 적용하고 이력 확인
      (`20261024142344`)
- [x] 테이블·RPC 존재 및 역할별 실행 권한 확인
- [ ] Preview 환경변수·SMTP·발신 주소·확인 링크·TOTP 정책 확인
- [ ] Preview 배포 후 관리자 이메일 가입·확인과 UUID 확인
- [ ] `public.account_profiles.role = 'admin'` 부여 및 운영 기록
- [ ] `/auth/mfa`에서 TOTP 등록·검증, `admin` + `aal2` 확인
- [ ] Preview 관리자 화면/API 접근 확인
- [ ] 위 준비 완료 후 운영 병합/배포
- [ ] 운영 별칭에서 로그인·MFA·관리 화면·로그아웃·회비 저장 확인

실행하지 않은 운영 항목은 PR에서도 미완으로 둔다. CI의 로컬 검증은 운영 준비의
완료 증거가 아니다.
