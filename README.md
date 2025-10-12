# 🎨 ASCA - 동양서예협회 웹사이트

> 전통 동양 서예의 아름다움을 현대적인 웹 기술로 구현한 종합 문화 플랫폼

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://asca-gallery.vercel.app)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

## 🌟 주요 기능

### 🎯 핵심 시스템

- 🗄️ **완전한 데이터베이스 시스템** - Drizzle ORM + SQLite 기반 타입 안전 데이터 관리
- 🔐 **관리자 인증 시스템** - 특별 관리자 계정 및 권한 관리
- 🎨 **전문적 브랜드 가이드라인** - 디자인 시스템과 통합된 브랜드 아이덴티티
- 📸 **지능형 갤러리 시스템** - 연도별/카테고리별 분류, 고급 태그 기능
- 🌍 **한국어 특화 UI** - 완전한 한국어 현지화 및 문화적 적응

### 🎨 사용자 경험

- 📱 **반응형 디자인** - 모든 디바이스에서 최적화된 경험
- ♿ **웹 접근성** - WCAG 2.1 AA 가이드라인 준수
- 🔄 **다크모드 시스템** - 최적화된 라이트/다크 테마 지원
- 🖼️ **고급 갤러리** - AI 기반 분류, 연도별 필터링, 계절 태그
- 🔍 **지능형 검색** - 카테고리, 태그, 연도 기반 다차원 검색
- 🎯 **직관적 네비게이션** - 한국어 현지화된 메뉴 구조

### 📊 콘텐츠 관리

- 👨‍🎨 **작가 관리** - 상세 프로필, 경력, 전시 이력 관리
- 🖼️ **작품 관리** - 카테고리별 분류, 메타데이터 관리
- 🏛️ **전시회 관리** - 일정, 장소, 참여 작가/작품 관리
- 🏆 **수상작 관리** - 대한민국 동양서예대전 수상자 명단, 등급별 분류
- 📰 **뉴스 & 이벤트** - 공지사항, 워크숍, 강연회 관리
- 📸 **갤러리 자동화** - 265개 이미지, 9개 카테고리, 연도별 태그 자동 생성

## 🚀 갤러리 시스템 하이라이트

### 📈 통계 (2025년 기준)
- **총 이미지**: 265장
- **카테고리**: 9개 (심사위원회, 휘호대회, 전시회, 시상식 등)
- **자동 태그**: 계절, 연도, 카테고리별 특화 태그
- **연도 지원**: 2025년 (향후 확장 가능)

### 🎯 핵심 갤러리 기능
- **지능형 분류**: 폴더 구조 기반 자동 카테고리 감지
- **연도별 필터링**: 년도 기반 콘텐츠 조직화
- **고급 태그 시스템**: 카테고리별 특화 태그 (심사위원회, 휘호대회, 시상기념 등)
- **계절 태그**: 날짜 기반 계절 정보 자동 추출
- **다크모드 최적화**: 시인성과 가시성을 고려한 색상 시스템
- **반응형 마사이크 레이아웃**: 동적 격자 배치

## 🛠️ 기술 스택

### 프론트엔드

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + Shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context API + Zustand
- **Form Handling**: React Hook Form + Zod
- **Image Optimization**: Next.js Image + 고화질 최적화

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

### 배포 및 인프라

- **Hosting**: Vercel (Production)
- **Domain**: asca-gallery.vercel.app
- **CI/CD**: GitHub Actions + Vercel 자동 배포
- **Performance**: Edge Runtime + ISR (Incremental Static Regeneration)

### 외부 서비스

- **Authentication**: Clerk + Custom Admin System
- **Chat Support**: ChannelIO
- **Meeting Scheduler**: Cal.com
- **PDF Generation**: jsPDF + html2canvas
- **Gallery Analytics**: 방문자 추적 및 이미지 조회 통계

## 🚀 시작하기

### 환경 요구사항

- Node.js 18+
- npm 8+

### 설치

```bash
# 저장소 클론
git clone https://github.com/jlinsights/ASCA
cd ASCA

# 의존성 설치
npm install --legacy-peer-deps

# 갤러리 데이터 생성
npm run gallery:generate

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
│   ├── brand/             # 브랜드 가이드라인
│   ├── exhibitions/       # 전시회 페이지
│   ├── gallery/           # 📸 갤러리 메인 페이지
│   ├── news/              # 뉴스 페이지
│   ├── events/            # 이벤트 페이지
│   └── ...
├── components/            # 재사용 컴포넌트
│   ├── gallery/          # 📸 갤러리 전용 컴포넌트
│   │   ├── GalleryGrid.tsx    # 메인 갤러리 그리드
│   │   ├── SocialShare.tsx    # 소셜 공유 기능
│   │   └── ...
│   ├── ui/               # Shadcn/ui + 브랜드 특화 컴포넌트
│   │   ├── button.tsx    # 브랜드 variants 포함
│   │   ├── badge.tsx     # 전통/혁신/특별 variants
│   │   └── card.tsx      # 글래스모피즘 효과
│   ├── header.tsx        # 🇰🇷 한국어 현지화 헤더
│   └── ...
├── lib/                  # 유틸리티 & 설정
│   ├── data/            # 📊 데이터 파일
│   │   └── gallery-data.json  # 갤러리 메타데이터 (265개 이미지)
│   ├── db/              # 데이터베이스 관련
│   │   ├── schema.ts    # 데이터베이스 스키마 (12개 테이블)
│   │   ├── queries.ts   # 타입 안전 쿼리 함수들
│   │   └── ...
│   └── ...
├── public/images/gallery/  # 📸 갤러리 이미지 저장소
│   ├── committee_2025/    # 심사위원회 (73장)
│   ├── contest_2025/      # 휘호대회 (69장)
│   ├── group_2025/        # 단체사진 (16장)
│   ├── award_2025/        # 시상기념 (33장)
│   ├── ceremony_2025/     # 시상식 (35장)
│   ├── exhibition_2025/   # 전시회 (33장)
│   └── ...
├── scripts/              # 🤖 자동화 스크립트
│   └── generate-gallery-data.js  # 갤러리 데이터 자동 생성
├── types/               # TypeScript 타입 정의
│   └── gallery.ts       # 갤러리 관련 타입
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

# 갤러리 데이터 생성 🚀
npm run gallery:generate

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

## 🌍 현지화 시스템

### 🇰🇷 한국어 특화 UI

**현재 상태**: 완전한 한국어 현지화 완료
- ✅ **헤더 메뉴**: 전시회, 작품, 작가, 행사, 갤러리, 검색
- ✅ **다국어 버튼 제거**: 깔끔한 한국어 전용 인터페이스
- ✅ **갤러리 카테고리**: 심사위원회, 휘호대회, 시상기념 등 한국어 명칭
- ✅ **문화적 적응**: 동양서예 문화에 맞는 UI/UX

### 다국어 지원 인프라 (향후 확장용)

**지원 가능 언어**:
- 🇰🇷 한국어 (ko) - 기본 언어 (현재 활성화)
- 🇺🇸 영어 (en) - 인프라 준비됨
- 🇯🇵 일본어 (ja) - 인프라 준비됨
- 🇨🇳 중국어 (zh) - 인프라 준비됨

### 데이터베이스 다국어 구조

모든 주요 콘텐츠 테이블에서 다국어 필드 지원:

- `title`, `titleKo`, `titleEn`, `titleCn`, `titleJp`
- `description`, `descriptionKo`, `descriptionEn`, `descriptionCn`, `descriptionJp`
- `name`, `nameKo`, `nameEn`, `nameCn`, `nameJp`

**갤러리 다국어 지원**:
- 카테고리명 한국어 특화 (심사위원회, 휘호대회 등)
- 이미지 제목 자동 한국어 생성
- 태그 시스템 한국어 최적화

## 📦 빌드 & 배포

### 🚀 프로덕션 배포 (Vercel)

**현재 배포 상태**: ✅ **Live at https://asca-gallery.vercel.app**

```bash
# 자동 배포 (GitHub push 시)
git push origin main  # Vercel이 자동으로 빌드 및 배포

# 수동 배포 (Vercel CLI)
vercel --prod
```

### 배포 파이프라인

1. **GitHub Push** → `main` 브랜치
2. **Vercel 자동 감지** → 빌드 시작
3. **Next.js 빌드** → 최적화 및 정적 생성
4. **갤러리 이미지 최적화** → Next.js Image 처리
5. **Edge 배포** → 전 세계 CDN 배포
6. **자동 도메인 업데이트** → asca-gallery.vercel.app

### 로컬 빌드

```bash
# 갤러리 데이터 생성
npm run gallery:generate

# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 테스트
npm start
```

### 환경별 설정

- **개발**: `npm run dev` (localhost:3000)
- **프로덕션**: 자동 배포 → Vercel
- **테스트**: `npm run test:ci`

## 🤝 기여하기

### 개발 가이드라인

1. 모든 컴포넌트는 TypeScript로 작성
2. Prettier와 ESLint 규칙 준수
3. 데이터베이스 변경 시 마이그레이션 생성
4. 브랜드 가이드라인 준수
5. 테스트 코드 작성 권장
6. 커밋 전 `npm run pre-commit` 실행
7. **갤러리 이미지 추가 시 `npm run gallery:generate` 실행**

### 🖼️ 갤러리 콘텐츠 추가하기

**새로운 이미지 추가 프로세스**:

1. **이미지 업로드**: `/public/images/gallery/` 하위 폴더에 이미지 추가
   ```bash
   # 예시: 2026년 심사위원회 사진 추가
   /public/images/gallery/committee_2026/
   ```

2. **폴더 구조 규칙**:
   - `{category}_{year}/` 형식 사용
   - 지원 카테고리: `committee`, `contest`, `group`, `award`, `ceremony`, `exhibition`

3. **메타데이터 자동 생성**:
   ```bash
   npm run gallery:generate
   ```

4. **자동 생성되는 정보**:
   - 연도별 자동 분류
   - 카테고리별 한국어 제목
   - 계절 태그 자동 추가
   - 고화질 최적화 설정

### 새로운 기능 추가 시

1. **데이터베이스 스키마 변경**:
   - `lib/db/schema.ts` 수정
   - `npm run db:generate` 실행
   - `lib/db/queries.ts`에 쿼리 함수 추가

2. **갤러리 기능 확장**:
   - `types/gallery.ts`에 타입 정의 추가
   - `scripts/generate-gallery-data.js`에 로직 추가
   - `components/gallery/`에 UI 컴포넌트 추가

3. **UI 컴포넌트 추가**:
   - 브랜드 variants 고려
   - 다크모드 색상 최적화
   - 반응형 디자인 구현

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
gallery: 갤러리 기능 추가/수정 🖼️
i18n: 다국어/현지화 관련 변경 🌍
ui: UI/UX 개선 및 디자인 변경 🎨
```

### 🖼️ 갤러리 관련 커밋 예시

```bash
# 갤러리 이미지 추가
git commit -m "gallery: 2025년 시상식 사진 35장 추가"

# 갤러리 기능 개선
git commit -m "feat: 연도별 필터링 기능 추가"

# 다크모드 최적화
git commit -m "ui: 갤러리 다크모드 색상 최적화"

# 현지화 작업
git commit -m "i18n: 헤더 메뉴 한국어 현지화 완료"
```

## 📚 문서

### 📖 상세 가이드

- [데이터베이스 가이드](lib/db/README.md) - Drizzle ORM 사용법
- [브랜드 가이드라인](app/brand) - 디자인 시스템
- [컴포넌트 문서](components/ui) - UI 컴포넌트 사용법
- [갤러리 시스템](scripts/generate-gallery-data.js) - 이미지 자동 처리 로직

### 🔧 API 참조

- [쿼리 함수](lib/db/queries.ts) - 데이터베이스 쿼리
- [스키마 정의](lib/db/schema.ts) - 테이블 구조
- [갤러리 타입](types/gallery.ts) - 갤러리 TypeScript 타입
- [갤러리 데이터](lib/data/gallery-data.json) - 265개 이미지 메타데이터

### 🎯 구현된 주요 기능

**✅ 완료된 기능들**:
- 📸 **갤러리 시스템**: 265개 이미지, 9개 카테고리 자동 분류
- 🏷️ **태그 시스템**: 연도, 계절, 카테고리별 특화 태그
- 🌙 **다크모드**: 최적화된 갤러리 색상 시스템
- 🇰🇷 **한국어 현지화**: 완전한 한국어 UI 및 메뉴 시스템
- 📱 **반응형 디자인**: 모든 디바이스 최적화
- 🚀 **프로덕션 배포**: Vercel 자동 배포 시스템

**🔄 진행 중인 작업**:
- 연도별 필터링 UI 구현
- 갤러리 검색 기능 고도화
- 성능 최적화 및 캐싱

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
- 🖼️ **갤러리 지원**: [갤러리 시스템 가이드](scripts/generate-gallery-data.js)

## 🎉 프로젝트 현황

### 📊 현재 통계 (2024년 10월 기준)

- **✅ 프로덕션 배포**: https://asca-gallery.vercel.app
- **📸 갤러리 이미지**: 265장 (9개 카테고리)
- **🎨 UI 구성요소**: 50+ 재사용 컴포넌트
- **🗄️ 데이터베이스**: 12개 테이블, 완전한 타입 안전성
- **🌙 다크모드**: 완전 최적화 완료
- **🇰🇷 현지화**: 100% 한국어 UI 완성
- **📱 반응형**: 모든 디바이스 지원

### 🚀 최근 업데이트

**2024.10.12**:
- ✅ 헤더 한국어 현지화 완료
- ✅ 다국어 버튼 제거
- ✅ 갤러리 다크모드 색상 최적화
- ✅ 프로덕션 배포 완료

**2024.10.11**:
- ✅ 갤러리 연도별 시스템 구축
- ✅ 265개 이미지 자동 분류 완료
- ✅ 고급 태그 시스템 구현

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

---

<div align="center">

**🎨 정법의 계승과 창신의 조화**

_전통 동양 서예의 아름다움을 현대 기술로 구현한 종합 문화 플랫폼_

Made with ❤️ by 동양서예협회 개발팀

</div>
