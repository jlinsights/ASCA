# ASCA — 동양서예협회

동양서예협회의 작가·작품·전시·행사 정보를 제공하는 웹사이트와 관리자 CMS입니다.
한국어를 기본으로 하며 다국어 콘텐츠 필드와 i18n 인프라를 갖추고 있습니다.

## 주요 구성

- 작가·작품 탐색과 검색·필터, 전시·행사·공지 페이지
- 사진 갤러리와 협회 연혁 콘텐츠
- Clerk 인증을 사용하는 관리자 CMS와 역할 기반 권한 관리
- Supabase PostgreSQL 데이터 저장, Drizzle 쿼리와 마이그레이션
- Airtable 연동, 감사 로그, CQRS 및 이벤트 처리 모듈

기능 코드의 존재와 운영 데이터의 준비 상태는 별개입니다. 공개 CMS의 데이터
구성과 운영 관련 주의사항은 [AGENTS.md](AGENTS.md)를 확인하세요.

## 기술 스택

| 영역    | 구성                                             |
| ------- | ------------------------------------------------ |
| 웹      | Next.js App Router, React, TypeScript            |
| UI      | Tailwind CSS, Radix UI, shadcn/ui, Framer Motion |
| 데이터  | Supabase PostgreSQL, supabase-js, Drizzle ORM    |
| 인증    | Clerk                                            |
| 폼·검증 | React Hook Form, Zod                             |
| 테스트  | Jest, React Testing Library, Playwright          |
| 배포    | Vercel                                           |

정확한 의존성 버전과 실행 명령은 [package.json](package.json), 설치 버전은
[package-lock.json](package-lock.json)을 기준으로 합니다.

## 로컬 시작

명령은 저장소 루트에서 실행합니다. Next.js가 요구하는 Node.js 버전을 사용하세요.
현재 저장소의 Next.js 주 버전에 맞춰 Node.js 20.9 이상이 필요합니다.

```bash
git clone https://github.com/jlinsights/ASCA /Users/jaehong/Developer/Projects/ASCA
cd /Users/jaehong/Developer/Projects/ASCA
npm ci
cp /Users/jaehong/Developer/Projects/ASCA/.env.example /Users/jaehong/Developer/Projects/ASCA/.env.local
```

이미 저장소나 `.env.local`이 있다면 클론·복사 단계를 건너뛰세요. `.npmrc`에 peer
dependency 설치 옵션이 설정되어 있습니다.

`.env.local`의 예시 값을 실제 개발용 자격 증명으로 교체한 뒤 실행합니다.

```bash
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 기본 명령은
Webpack을 사용하며, Turbopack은 `npm run dev:turbo`로 별도 실행합니다.

### 환경 변수

전체 목록은 [.env.example](.env.example), 런타임 필수 여부는
[lib/config/env.ts](lib/config/env.ts)를 참조하세요.

| 변수                                | 용도                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                      | Drizzle용 PostgreSQL 연결 문자열                                      |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase API 주소                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | 공개 조회용 Supabase 키                                               |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 클라이언트 인증 설정                                            |
| `CLERK_SECRET_KEY`                  | Clerk 서버 인증 설정                                                  |
| `NEXT_PUBLIC_APP_URL`               | 앱 주소 및 CSRF 허용 출처 설정; 로컬 기본값은 `http://localhost:3000` |
| `SUPABASE_SERVICE_ROLE_KEY`         | 관리자 쓰기 등 서버 작업에 사용하는 선택적 키                         |

`DATABASE_URL`은 SQLite 파일 경로가 아닌 PostgreSQL 연결 문자열이어야 합니다.
Supabase 트랜잭션 풀러를 사용하는 Drizzle 연결은 `prepare: false`로 설정되어
있습니다. service role 키와 서버 비밀키는 클라이언트 코드나 저장소에 넣지
않습니다. Redis, Airtable, 추가 CSRF 출처 등 선택적 설정은 환경 변수 템플릿을
확인하세요.

## 개발 및 검증

| 명령                                     | 용도                                               |
| ---------------------------------------- | -------------------------------------------------- |
| `npm run dev`                            | Webpack 개발 서버                                  |
| `npm run type-check`                     | TypeScript 검사                                    |
| `npm run lint`                           | ESLint 검사                                        |
| `npm test`                               | Jest 테스트                                        |
| `npm run test:ci`                        | CI용 Jest 및 커버리지                              |
| `npm run test:e2e`                       | Playwright E2E 테스트                              |
| `npm run pre-commit`                     | 타입·린트·전체 포맷·CI 테스트 검사                 |
| `npm run build`                          | 컴파일 전용 빌드                                   |
| `NODE_ENV=production npm run build:full` | 페이지 데이터 수집과 프리렌더링을 포함한 배포 검증 |
| `npm start`                              | 빌드한 프로덕션 서버 실행                          |

`npm run build`만으로 배포 가능 여부를 판단하지 않습니다. Vercel은
[vercel.json](vercel.json)에 따라 `npm ci`와 `build:full`을 사용합니다. 전체
빌드에는 유효한 DB·Supabase·Clerk 환경 설정이 필요하며, Production과 Preview
각각에 설정해야 합니다.

## 데이터와 마이그레이션

- 공개 페이지 조회에는 supabase-js, 서버 데이터 처리에는 Drizzle을 사용합니다.
- 스키마와 쿼리는 [lib/db/schema.ts](lib/db/schema.ts),
  [lib/db/queries.ts](lib/db/queries.ts)를 참조하세요.
- Airtable 스키마 차이는 감지·기록 대상이며 자동으로 DB에 적용하지 않습니다.
- 홈·연혁 등 일부 콘텐츠는 저장소 데이터에서도 제공됩니다.
- 공개 콘텐츠 테이블은 RLS로 읽기를 허용하고 쓰기는 service role로 제한합니다.

```bash
npm run db:studio
npm run db:check
npm run db:generate
```

스키마 적용 명령인 `db:push`, `db:migrate`는 대상 DB와 백업을 확인한 뒤
사용합니다. 기존 Supabase 프로젝트용 마이그레이션을 현재 프로젝트에 일괄
재실행하지 마세요. 운영 DB 덤프와 개인정보는 커밋하지 않습니다. 관련 제약은
[AGENTS.md](AGENTS.md)의 운영 환경과 데이터 항목을 따릅니다.

## 디자인 시스템

[docs/02-design/DESIGN.md](docs/02-design/DESIGN.md)가 디자인 토큰의 기준입니다.
현재 ASCA Ink System은 Navy & Gold를 사용하며, UI는 `bg-primary`, `bg-accent`,
`text-muted-foreground` 같은 시맨틱 슬롯을 사용합니다.

기존 `celadon`, `sage` 등의 이름이 남아 있어도 이전 녹색 팔레트를 뜻하지
않습니다. 색상·서체·간격을 바꾸기 전에 디자인 문서를 확인하고, 새 토큰이
필요하면 문서부터 갱신합니다.

## 프로젝트 구조

```text
app/                      페이지 및 API 라우트
components/               공통 UI와 기능별 컴포넌트
lib/api/                  공개 콘텐츠 조회
lib/db/                   Drizzle 스키마·쿼리·연결
lib/admin/                관리자 권한
lib/security/             보안 미들웨어
lib/audit/                감사 로그
lib/i18n/                 다국어 인프라
lib/data/                 저장소 기반 콘텐츠
supabase/migrations/      Supabase 마이그레이션
scripts/                  데이터·개발 자동화
public/                   정적 자산
docs/                     설계 및 개발 문서
```

갤러리 데이터 작업에는 `gallery:split`, `gallery:upload:dry`,
`gallery:update-paths:dry` 등의 명령이 있습니다. 실행 전 `package.json`과 해당
스크립트의 입력·대상 스토리지를 확인하세요.

## 배포

프로젝트 지침에 기록된 Vercel 프로젝트는 `asca-main`, 배포 주소는
[asca-main.vercel.app](https://asca-main.vercel.app)입니다. 실제 배포 상태는
Vercel에서 확인하세요. 협회 도메인의 DNS는 별도로 관리되므로 이 저장소를
배포하는 것만으로 도메인 연결이 변경되지는 않습니다.

## 기여 및 참고 문서

작업 전 [AGENTS.md](AGENTS.md)를 읽고, 변경 범위에 맞는 검증을 실행하세요.
커밋은 명시적인 요청이 있을 때만 수행하며, 변경 설명은 `.commit_message.txt`에
이모지를 포함한 한국어 한 줄로 기록합니다.

- [디자인 시스템](docs/02-design/DESIGN.md)
- [데이터베이스 가이드](lib/db/README.md)
- [환경 변수 템플릿](.env.example)
- [프로젝트 실행 명령](package.json)

문제 제보는 저장소의 GitHub Issues를 이용하세요.
