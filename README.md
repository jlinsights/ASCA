# 🎨 ASCA - 동양서예협회 웹사이트

> 전통 동양 서예의 아름다움을 현대적인 웹 기술로 구현한 종합 문화 플랫폼

## 🌟 주요 기능

### 🎯 핵심 시스템

- 🗄️ **완전한 데이터베이스 시스템** - Drizzle ORM + SQLite 기반 타입 안전 데이터
  관리
- 🔐 **관리자 인증 시스템** - 특별 관리자 계정 및 권한 관리
- 🎨 **전문적 브랜드 가이드라인** - 디자인 시스템과 통합된 브랜드 아이덴티티
- 🌍 **다국어 지원** - 한국어, 영어, 일본어, 중국어 (4개 언어)

### 🎨 사용자 경험

- 📱 **반응형 디자인** - 모든 디바이스에서 최적화된 경험
- ♿ **웹 접근성** - WCAG 2.1 AA 가이드라인 준수
- 🔄 **테마 시스템** - 라이트/다크 모드 지원
- 🖼️ **작품 갤러리** - 고급 필터링, 검색, 정렬 기능

### 📊 콘텐츠 관리

- 👨‍🎨 **작가 관리** - 상세 프로필, 경력, 전시 이력 관리
- 🖼️ **작품 관리** - 카테고리별 분류, 메타데이터 관리
- 🏛️ **전시회 관리** - 일정, 장소, 참여 작가/작품 관리
- 🏆 **수상작 관리** - 대한민국 동양서예대전 수상자 명단, 등급별 분류
- 📰 **뉴스 & 이벤트** - 공지사항, 워크숍, 강연회 관리

## 🛠️ 기술 스택

### 프론트엔드

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + Shadcn/ui
- **State Management**: React Context API + Zustand
- **Form Handling**: React Hook Form + Zod

### 데이터베이스

- **ORM**: Drizzle ORM 0.43.1
- **Database**: SQLite + Better SQLite3
- **Migration**: Drizzle Kit
- **Type Safety**: 완전한 TypeScript 지원

### 개발 도구

- **Package Manager**: npm
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library
- **Pre-commit**: Husky + lint-staged

### 외부 서비스

- **Authentication**: Clerk + Custom Admin System
- **Chat Support**: ChannelIO
- **Meeting Scheduler**: Cal.com
- **PDF Generation**: jsPDF + html2canvas

## 🚀 시작하기

### 환경 요구사항

- Node.js 18+
- npm 8+

### 설치

```bash
# 저장소 클론
git clone [repository-url]
cd ASCA-main

# 의존성 설치
npm install --legacy-peer-deps

# 개발 서버 시작
npm run dev
```

### 환경 변수

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Database (필수)
DATABASE_URL="file:./sqlite.db"

# Next.js (필수)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clerk Authentication (선택적)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# 기타 선택적 환경 변수들
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 데이터베이스 설정

```bash
# 데이터베이스 스키마 생성
npm run db:generate

# 스키마를 데이터베이스에 적용
npm run db:push

# 시드 데이터 생성 (개발용)
npm run db:seed

# 데이터베이스 테스트
npx tsx lib/db/test.ts

# 데이터베이스 GUI 도구 실행
npm run db:studio
```

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── admin/             # 관리자 페이지
│   │   ├── login/         # 관리자 로그인
│   │   └── page.tsx       # 관리자 대시보드
│   ├── artworks/          # 작품 페이지
│   ├── artists/           # 작가 페이지
│   ├── awards/            # 수상작 페이지
│   ├── brand/  # 브랜드 가이드라인
│   ├── exhibitions/       # 전시회 페이지
│   ├── news/              # 뉴스 페이지
│   ├── events/            # 이벤트 페이지
│   ├── galleries/         # 갤러리 페이지
│   └── ...
├── components/            # 재사용 컴포넌트
│   ├── ui/               # Shadcn/ui + 브랜드 특화 컴포넌트
│   │   ├── button.tsx    # 브랜드 variants 포함
│   │   ├── badge.tsx     # 전통/혁신/특별 variants
│   │   └── card.tsx      # 글래스모피즘 효과
│   └── ...
├── contexts/             # React Context
│   └── AuthContext.tsx   # 관리자 인증 컨텍스트
├── lib/                  # 유틸리티 & 설정
│   ├── db/              # 데이터베이스 관련
│   │   ├── schema.ts    # 데이터베이스 스키마 (12개 테이블)
│   │   ├── queries.ts   # 타입 안전 쿼리 함수들
│   │   ├── seed.ts      # 시드 데이터
│   │   ├── test.ts      # 데이터베이스 테스트
│   │   └── README.md    # 데이터베이스 가이드
│   └── ...
├── middleware.ts         # 관리자 페이지 접근 제어
├── drizzle.config.ts     # Drizzle ORM 설정
└── ...
```

## 🎨 디자인 시스템

### 브랜드 컬러 팔레트

- **Ink Black** (#1a1a1a) - 전통 먹색, 주요 텍스트
- **Rice Paper White** (#f5f5f0) - 한지 색상, 배경
- **Celadon Green** (#88A891) - 청자 녹색, 주요 액션
- **Sage Green** (#B7C4B7) - 연한 녹색, 보조 액션
- **Terra Red** (#9B4444) - 붉은 흙색, 경고/삭제
- **Stone Gray** (#6B7280) - 회색, 중성 요소

### UI 컴포넌트 시스템

- **Button Variants**: celadon, sage, terra, traditional, rice, touch
- **Badge Variants**: traditional, innovation, special, neutral
- **Card Variants**: traditional, artwork, glass, elevated
- **Hover Effects**: lift, scale, glow

### 타이포그래피

- **Primary Font**: Inter (Google Fonts)
- **Traditional Class**: font-traditional (브랜드 일관성)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold)

## ��️ 데이터베이스 시스템

### 주요 테이블 (12개)

1. **users** - 사용자 정보 및 역할 관리
2. **artists** - 작가 상세 정보 (다국어 지원)
3. **artworks** - 작품 정보 (다국어 지원)
4. **exhibitions** - 전시회 정보
5. **news** - 뉴스 및 공지사항
6. **events** - 이벤트 및 워크숍
7. **galleries** - 온라인 갤러리
8. **exhibition_artworks** - 전시회-작품 관계
9. **exhibition_artists** - 전시회-작가 관계
10. **gallery_artworks** - 갤러리-작품 관계
11. **event_participants** - 이벤트 참가자
12. **admin_permissions** - 관리자 권한

### 데이터베이스 스크립트

```bash
# 마이그레이션 생성
npm run db:generate

# 스키마 적용
npm run db:push

# 시드 데이터 생성
npm run db:seed

# 완전 리셋 (초기화 + 스키마 + 시드)
npm run db:reset

# GUI 도구 실행
npm run db:studio

# 연결 테스트
npx tsx lib/db/test.ts
```

## 🔐 관리자 시스템

### 특별 관리자 계정

- **이메일**: `info@orientalcalligraphy.org`
- **특징**: 비밀번호 없이 자동 로그인
- **권한**: 모든 CMS 기능 접근 가능
- **접근**: `/admin` 페이지 자동 리다이렉트

### 권한 시스템

- CMS 관리 (읽기/쓰기/삭제)
- 작가 관리
- 작품 관리
- 전시회 관리
- 뉴스 관리
- 이벤트 관리
- 사용자 관리

## 🧪 테스팅

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage

# CI 환경에서 테스트 실행
npm run test:ci

# 데이터베이스 테스트
npx tsx lib/db/test.ts
```

## 🔧 개발 스크립트

### 일반 개발

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# 타입 검사
npm run type-check

# 린팅
npm run lint
npm run lint:fix
```

### 데이터베이스 관리

```bash
# 마이그레이션 생성
npm run db:generate

# 스키마 적용
npm run db:push

# 마이그레이션 실행
npm run db:migrate

# 시드 데이터 생성
npm run db:seed

# 데이터베이스 리셋
npm run db:reset

# GUI 도구 실행
npm run db:studio

# 스키마 검증
npm run db:check

# 데이터베이스 초기화
npm run db:drop
```

## 🌍 다국어 지원

### 지원 언어

- 🇰🇷 한국어 (ko) - 기본 언어
- 🇺🇸 영어 (en)
- 🇯🇵 일본어 (ja)
- 🇨🇳 중국어 (zh)

### 데이터베이스 다국어 구조

모든 주요 콘텐츠 테이블에서 다국어 필드 지원:

- `title`, `titleKo`, `titleEn`, `titleCn`, `titleJp`
- `description`, `descriptionKo`, `descriptionEn`, `descriptionCn`,
  `descriptionJp`
- `name`, `nameKo`, `nameEn`, `nameCn`, `nameJp`

## 📦 빌드 & 배포

### 로컬 빌드

```bash
npm run build
```

### 환경별 설정

- **개발**: `npm run dev`
- **프로덕션**: `npm run build && npm start`
- **테스트**: `npm run test:ci`

## 🤝 기여하기

### 개발 가이드라인

1. 모든 컴포넌트는 TypeScript로 작성
2. Prettier와 ESLint 규칙 준수
3. 데이터베이스 변경 시 마이그레이션 생성
4. 브랜드 가이드라인 준수
5. 테스트 코드 작성 권장
6. 커밋 전 `npm run pre-commit` 실행

### 새로운 기능 추가 시

1. 데이터베이스 스키마 변경이 필요한 경우:
   - `lib/db/schema.ts` 수정
   - `npm run db:generate` 실행
   - `lib/db/queries.ts`에 쿼리 함수 추가
2. UI 컴포넌트 추가 시 브랜드 variants 고려
3. 다국어 지원이 필요한 경우 적절한 필드 구조 사용

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
db: 데이터베이스 스키마 변경
```

## 📚 문서

### 상세 가이드

- [데이터베이스 가이드](lib/db/README.md) - Drizzle ORM 사용법
- [브랜드 가이드라인](app/brand) - 디자인 시스템
- [컴포넌트 문서](components/ui) - UI 컴포넌트 사용법

### API 참조

- [쿼리 함수](lib/db/queries.ts) - 데이터베이스 쿼리
- [스키마 정의](lib/db/schema.ts) - 테이블 구조
- [타입 정의](lib/db/schema.ts) - TypeScript 타입

## 🔗 관련 링크

### 기술 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Shadcn/ui](https://ui.shadcn.com)

### 개발 도구

- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) -
  데이터베이스 GUI
- [SQLite Browser](https://sqlitebrowser.org/) - SQLite 관리 도구

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음 방법으로 연락해주세요:

- 🐛 **버그 리포트**: GitHub Issues 생성
- 💬 **실시간 지원**: 웹사이트 내 ChannelIO 채팅
- 📧 **이메일**: info@orientalcalligraphy.org
- 📖 **문서**: [데이터베이스 가이드](lib/db/README.md)

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

<div align="center">

**🎨 정법의 계승과 창신의 조화**

_전통 동양 서예의 아름다움을 현대 기술로 구현한 종합 문화 플랫폼_

Made with ❤️ by 동양서예협회 개발팀

</div>
