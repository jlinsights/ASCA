# 🎨 ASCA - 동양서예협회 웹사이트

> 전통 동양 서예의 아름다움을 현대적인 웹 기술로 구현한 종합 문화 플랫폼

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://asca-main.vercel.app)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

> 에이전트·개발자용 상세 지침은 [`AGENTS.md`](AGENTS.md)(Codex)와
> [`docs/CLAUDE.md`](docs/CLAUDE.md)(Claude Code)에 있다. 두 파일은 같은 내용을
> 유지한다.

## 🌟 주요 기능

### 🎯 공개 사이트

- 👨‍🎨 **작가** — 초대작가·추천작가 등 공개 등급 작가 목록과 상세(이름 검색,
  직함·등급 필터)
- 🏛️ **전시** — 현재·예정·지난·온라인 전시 (연혁 데이터 기반)
- 📜 **연혁** — 1997년 한·중·일 교류전부터의 협회 기록
- 📸 **갤러리** — 심사위원회·휘호대회·시상식 등 카테고리별 행사 사진
- 🏆 **공모전** — 대한민국 동양서예대전 공모 요강
- 📃 **정관·규정·이용약관** — 이용약관은 2026년 11월 1일 시행본
- 🎨 **브랜드 가이드** — `/brand` (ASCA Ink System)

### 🌍 다국어

- 한국어(기본)·영어·일본어·중국어(번체 `zh-TW`) — 헤더의 언어 선택으로 바꾼다
- 언어는 브라우저(`localStorage`)에 저장되고 URL 에는 없다

### 🔐 회원·관리

- 로그인: Clerk (Supabase Auth 로 전환 작업 중)
- 관리자: `/admin/artists` 작가 회비 관리

## 🛠️ 기술 스택

| 영역        | 사용 기술                                                                       |
| ----------- | ------------------------------------------------------------------------------- |
| 프레임워크  | Next.js 16 (App Router), React, TypeScript 5                                    |
| 스타일      | Tailwind CSS 3, Radix UI + shadcn/ui, Framer Motion                             |
| 데이터      | Supabase PostgreSQL (`ASCA-2026`), supabase-js(공개 조회) + Drizzle ORM(서버)   |
| 인증        | Clerk                                                                           |
| 테스트      | Jest + React Testing Library, Playwright(E2E), 실제 Postgres 검사(`archive-db`) |
| 배포        | Vercel (`asca-main`), GitHub Actions                                            |
| 외부 서비스 | ChannelIO(채팅), Cal.com(상담 예약)                                             |

정확한 버전은 `package.json` 을 본다.

## 🚀 시작하기

### 환경 요구사항

- Node.js 18+
- npm 8+

### 설치

```bash
git clone https://github.com/jlinsights/ASCA
cd ASCA
npm install
npm run dev        # Webpack 개발 서버 (권장)
```

### 환경 변수

`.env.local` 에 넣는다. 필수 여부는 `lib/config/env.ts` 의 zod 스키마가 정한다.

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용 — 관리자 API

# PostgreSQL (필수 — 배포 빌드 build:full 은 없으면 실패한다)
DATABASE_URL=                     # Supabase 트랜잭션 풀러(6543)

# Clerk (필수)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# 관리자 이메일 (쉼표로 구분)
ADMIN_EMAILS=

# 앱 주소 — CSRF 허용 목록에도 쓰인다
NEXT_PUBLIC_APP_URL=http://localhost:3000
# CSRF_ALLOWED_ORIGINS=           # 추가로 허용할 출처(쉼표 구분)
```

⚠️ 자격 증명은 커밋하지 않는다. 이 저장소는 공개다.

## 📁 프로젝트 구조

```
├── app/                       # Next.js App Router
│   ├── admin/                 # 관리자 — artists(회비 관리)
│   ├── api/                   # API 라우트 (artists, admin, archive …)
│   ├── artists/               # 작가 목록·상세
│   ├── exhibitions/           # 전시 (_data/exhibition-records.ts)
│   ├── history/               # 연혁 (_data/history-events.ts)
│   ├── gallery/               # 갤러리
│   ├── brand/                 # 브랜드·스타일 가이드
│   ├── terms-of-service/      # 이용약관 (_data/terms-articles.ts)
│   └── …
├── components/                # 재사용 컴포넌트 (ui/, header/, admin/, gallery/ …)
├── lib/
│   ├── api/                   # 공개 조회 (artists.ts — anon 클라이언트)
│   ├── admin/                 # 관리자 도메인 (artist-dues.ts …)
│   ├── archive/writer.ts      # 관리자 판정 archiveIdentity()
│   ├── security/              # CSRF 출처 검사, 입력 정리, 요청 제한
│   ├── i18n/translations/     # 화면별 번역표
│   ├── data/gallery-data.json # 갤러리 메타데이터
│   └── db/                    # Drizzle 스키마·쿼리
├── supabase/migrations/       # DB 마이그레이션 (구조 변경은 여기로만)
├── scripts/                   # 갤러리 데이터 생성, DB 검사 스크립트
├── docs/02-design/DESIGN.md   # 디자인 토큰 단일 출처
└── proxy.ts                   # Next 미들웨어 — CSRF 검사 + Clerk
```

## 🗄️ 데이터

- Supabase 프로젝트 **`ASCA-2026`**. 옛 프로젝트는 복구할 수 없다.
- **데이터가 있는 테이블은 `artists` 뿐이다.** 공지·전시·행사·작품 테이블은 빈
  상태이고, 홈·연혁·전시 하위 페이지는 저장소 안의 데이터 파일을 읽는다.
- 작가 공개 여부는 `artists.visibility` + RLS 가 정한다. **준회원·공모작가**와
  회비 상태 **'자격 정지'** 인 작가는 트리거가 자동으로 숨긴다.
- 회비 상태(`정상`·`권한 제한`·`자격 정지`)는 등급과 별개로 관리한다.
- 구조 변경은 `supabase/migrations/` 마이그레이션으로만 한다. DB 덤프는 커밋하지
  않는다.

자세한 규칙(열 단위 grant, 1,000행 제한, 검색 함정)은 `AGENTS.md` 의 "운영
환경과 데이터"를 본다.

## 🔐 관리자

- 관리자 계정: `info@orientalcalligraphy.org` (비밀번호 로그인)
- 관리자 여부: Clerk 의 검증된 대표 이메일이 `ADMIN_EMAILS` 에 있는지로 정한다
- `/admin` → **`/admin/artists` 작가 회비 관리** — 이름·등급·회비 상태로 찾고,
  작가별 회비 상태를 바꾼다. 바꾸면 공개 여부가 함께 맞춰지고 감사 로그에 남는다
- 공모전·회원 관리 화면은 아직 동작하지 않아 메뉴에서 뺐다

## 🎨 디자인 시스템 — ASCA Ink System (Navy & Gold)

토큰의 단일 출처는 [`docs/02-design/DESIGN.md`](docs/02-design/DESIGN.md), 견본
페이지는 `/brand` 다.

- **Navy 900** `#0b1733` — 주 색, 본문 글자
- **Paper** `#fbf8ef` — 宣紙 배경
- **Gold 500** `#d4a84a` — 강조·hover (글자색으로 쓰지 않는다)
- **Seal Red** `#a8201a` — 朱印, 오류·낙관에만

새 코드는 시맨틱 클래스(`bg-primary`·`bg-accent`·`text-muted-foreground`)를
쓴다. `celadon-green`·`scholar-red` 같은 옛 이름은 기존 클래스 호환용이고 값은
남색·금색이다. 버튼은 `default`·`secondary`·`outline`·`ghost` 를 쓴다.

## 🧪 테스트

```bash
npm test                 # Jest 단위·컴포넌트 테스트
npm run test:coverage    # 커버리지
npm run test:e2e         # Playwright E2E
npm run type-check       # TypeScript
npm run lint             # ESLint
npm run pre-commit       # 커밋 전 전체 검사 (type-check + lint + format + test:ci)
```

CI(`.github/workflows/`)는 `ci.yml`(품질·테스트·빌드), `e2e-tests.yml`,
`archive-db.yml`(실제 Postgres 에서 RLS·grant·트리거 검사)을 돌린다.

## 📦 배포

- `main` 에 push 하면 Vercel 프로젝트 **`asca-main`** 이 배포한다 →
  **https://asca-main.vercel.app**
- ⚠️ `orientalcalligraphy.org` 는 아직 옛 **Webflow** 사이트를 가리킨다. 이
  저장소를 배포해도 그 도메인은 바뀌지 않는다.
- 배포 빌드는 `npm run build:full` 이다. 로컬 `npm run build` 는 compile-only 라
  환경 변수 누락을 못 잡는다.
- UI·미들웨어 변경은 배포된 사이트에서 직접 확인한다.

## 🖼️ 갤러리 사진 추가

1. `public/images/gallery/{category}_{year}/` 에 사진을 넣는다 (category:
   `committee`·`contest`·`group`·`award`·`ceremony`·`exhibition`).
2. 메타데이터를 다시 만든다: `node scripts/generate-gallery-data.js` →
   `lib/data/gallery-data.json`
3. 이미지 최적화: `npm run images:optimize`

## 🤝 기여하기

1. TypeScript, Prettier·ESLint 규칙을 따른다.
2. DB 구조 변경은 `supabase/migrations/` 마이그레이션으로 한다.
3. UI 는 `docs/02-design/DESIGN.md` 토큰을 쓴다. 동적 Tailwind 클래스
   (`bg-${color}`)는 쓰지 않는다.
4. 화면 문구는 4개 언어 번역표에 모두 넣는다.
5. 커밋 전 `npm run pre-commit`.

커밋 메시지: `feat:`·`fix:`·`docs:`·`refactor:`·`test:`·`chore:` 접두사를 쓴다.

## 📞 문의

- 🐛 버그: GitHub Issues
- 💬 사이트 내 ChannelIO 채팅
- 📧 info@orientalcalligraphy.org

## 📄 라이선스

소스 코드는 [MIT 라이선스](LICENSE)로 배포한다 — Copyright (c) 2025-2026
사단법인 동양서예협회.

작가의 작품 이미지, 행사 사진, 협회 로고, 정관·규정·연혁 등 콘텐츠는 이
라이선스에 포함되지 않으며 각 저작권자에게 권리가 있다.

## 🚀 최근 업데이트

**2026.10**

- ✅ 이용약관 전면 개정 (2026년 11월 1일 시행)
- ✅ 준회원·공모작가 비공개 — 등급 기반 자동 비공개 트리거, 작가 상세 API 의 RLS
  우회 수정
- ✅ 회비 상태(`dues_status`)와 관리자 회비 관리 화면 `/admin/artists`
- ✅ 관리자 메뉴의 없는 페이지 링크(404) 정리
- ✅ CSRF 허용 목록 수정 — 로그아웃·회비 저장이 403 으로 막히던 문제 해결
- ✅ 홈·전시·연혁 화면 재구성, 4개 언어 번역, ASCA Ink System 적용

**진행 중**

- 🔄 Clerk → Supabase Auth 전환
- 🔄 회원 계정과 작가 정보 연결 (연결 전까지 `/profile/edit` 저장은 동작하지
  않는다)

---

<div align="center">

**🎨 정법의 계승과 창신의 조화**

_전통 동양 서예의 아름다움을 현대 기술로 구현한 종합 문화 플랫폼_

동양서예협회

</div>
