# 📁 ASCA 프로젝트 구조 가이드

**정리 완료일**: 2025-07-12  
**구조 버전**: 2.0 Organized

## 🎯 새로운 디렉토리 구조

```
ASCA/
├── 📁 app/                     # Next.js App Router
│   ├── admin/                  # 관리자 페이지
│   ├── api/                    # API 라우트
│   │   └── secure/             # 보안 강화된 API
│   ├── artists/                # 작가 페이지
│   ├── artworks/               # 작품 페이지
│   └── ...                     # 기타 페이지
│
├── 📁 components/              # React 컴포넌트
│   ├── ui/                     # 재사용 UI 컴포넌트
│   ├── admin-*/                # 관리자 전용 컴포넌트
│   └── ...                     # 기타 컴포넌트
│
├── 📁 lib/                     # 핵심 라이브러리
│   ├── auth/                   # 인증 시스템
│   ├── db/                     # 데이터베이스
│   ├── security/               # 보안 시스템
│   ├── utils/                  # 유틸리티
│   └── ...                     # 기타 라이브러리
│
├── 📁 config/                  # 🆕 설정 파일 통합
│   ├── build/                  # 빌드 관련 설정
│   │   ├── jest.config.js      # Jest 테스트 설정
│   │   ├── jest.setup.js       # Jest 설정 초기화
│   │   └── postcss.config.mjs  # PostCSS 설정
│   ├── development/            # 개발 환경 설정
│   ├── production/             # 프로덕션 설정
│   ├── components.json         # shadcn/ui 설정
│   ├── claude-mcp-config.json  # Claude MCP 설정
│   ├── mcp-config.json         # MCP 서버 설정
│   └── vercel.json             # Vercel 배포 설정
│
├── 📁 docs/                    # 🆕 문서 통합
│   ├── setup/                  # 설치 및 설정 가이드
│   │   ├── README-logo-usage.md
│   │   ├── README-unsplash-setup.md
│   │   └── README_FILES_SETUP.md
│   ├── security/               # 보안 문서
│   │   ├── SECURITY_IMPLEMENTATION.md
│   │   ├── SECURITY_RESTORATION_COMPLETE.md
│   │   └── SECURITY_DISABLED_ENDPOINTS.md
│   ├── api/                    # API 문서 (예약)
│   ├── deployment/             # 배포 가이드 (예약)
│   └── CLAUDE.md               # Claude Code 가이드
│
├── 📁 tools/                   # 🆕 개발 도구 통합
│   ├── scripts/                # 개발/운영 스크립트
│   │   ├── test-security-apis.js
│   │   ├── generate-gallery-json.js
│   │   └── ...                 # 기타 스크립트들
│   ├── testing/                # 테스트 도구 (예약)
│   └── backup/                 # 백업 파일
│       └── api-backup/         # API 백업
│
├── 📁 public/                  # 정적 파일
├── 📁 contexts/                # React 컨텍스트
├── 📁 hooks/                   # 커스텀 훅
├── 📁 types/                   # TypeScript 타입
├── 📁 styles/                  # 스타일 파일
├── 📁 providers/               # Provider 컴포넌트
├── 📁 drizzle/                 # 데이터베이스 마이그레이션
├── 📁 supabase/                # Supabase 설정
│
├── 📄 package.json             # 프로젝트 의존성
├── 📄 next.config.js           # Next.js 설정
├── 📄 tailwind.config.ts       # Tailwind 설정
├── 📄 tsconfig.json            # TypeScript 설정
├── 📄 drizzle.config.ts        # Drizzle ORM 설정
├── 📄 middleware.ts            # Next.js 미들웨어
├── 📄 env.example              # 환경변수 예제
├── 📄 README.md                # 프로젝트 소개
├── 📄 PROJECT_STRUCTURE.md     # 🆕 이 문서
└── 📄 .gitignore               # Git 제외 파일
```

## 🔄 주요 변경사항

### ✅ 정리된 내용

#### 1. **설정 파일 통합** (`config/`)
- **이전**: 루트에 산재된 20+ 설정 파일
- **현재**: 목적별로 분류된 체계적 구조
- **혜택**: 설정 관리 용이성, 환경별 분리

#### 2. **문서 체계화** (`docs/`)
- **이전**: README-*, SECURITY-* 파일들이 루트에 혼재
- **현재**: 주제별 폴더로 분류
- **혜택**: 문서 검색 및 관리 개선

#### 3. **개발 도구 통합** (`tools/`)
- **이전**: scripts/, api-backup/ 디렉토리가 별도 존재
- **현재**: 모든 개발 도구를 tools/ 하위로 통합
- **혜택**: 개발 워크플로우 일관성

### 📂 새로운 디렉토리별 역할

#### `config/` - 설정 관리
```
config/
├── build/          # 빌드 도구 설정 (Jest, PostCSS)
├── development/    # 개발 환경 전용 설정
├── production/     # 프로덕션 환경 설정
└── *.json          # 다양한 JSON 설정 파일들
```

#### `docs/` - 문서 관리
```
docs/
├── setup/          # 초기 설정 가이드
├── security/       # 보안 관련 문서
├── api/            # API 문서 (향후 확장)
├── deployment/     # 배포 가이드 (향후 확장)
└── CLAUDE.md       # AI 개발 가이드
```

#### `tools/` - 개발 도구
```
tools/
├── scripts/        # 개발/운영 스크립트
├── testing/        # 테스트 도구 (향후 확장)
└── backup/         # 백업 및 복구 파일
```

## 🔍 파일 찾기 가이드

### 자주 찾는 파일들의 새 위치

| 파일명 | 이전 위치 | 새 위치 |
|--------|-----------|---------|
| Jest 설정 | `./jest.config.js` | `config/build/jest.config.js` |
| 보안 문서 | `./SECURITY_*.md` | `docs/security/` |
| 설치 가이드 | `./README-*.md` | `docs/setup/` |
| 스크립트 | `./scripts/` | `tools/scripts/` |
| API 백업 | `./api-backup/` | `tools/backup/api-backup/` |
| MCP 설정 | `./claude-mcp-config.json` | `config/claude-mcp-config.json` |

### 빠른 검색 명령어

```bash
# 설정 파일 검색
find config/ -name "*.json" -o -name "*.js" -o -name "*.ts"

# 문서 검색
find docs/ -name "*.md"

# 스크립트 검색
find tools/scripts/ -name "*.js" -o -name "*.sh"

# 백업 파일 검색
find tools/backup/ -type f
```

## 🛠️ 개발 워크플로우 개선

### 이전 vs 현재

#### 설정 파일 수정 시
**이전**: 
```bash
# 루트 디렉토리에서 여러 파일 검색 필요
ls *.config.* *.json jest.* postcss.*
```

**현재**: 
```bash
# 목적에 맞는 디렉토리로 직접 이동
cd config/build/        # 빌드 설정
cd config/development/  # 개발 설정
cd config/production/   # 프로덕션 설정
```

#### 문서 작업 시
**이전**: 
```bash
# 루트에서 README 파일들 혼재
ls README*.md SECURITY*.md
```

**현재**: 
```bash
# 주제별 폴더에서 작업
cd docs/setup/     # 설치 가이드
cd docs/security/  # 보안 문서
cd docs/api/       # API 문서
```

#### 스크립트 실행 시
**이전**: 
```bash
node scripts/test-security-apis.js
```

**현재**: 
```bash
node tools/scripts/test-security-apis.js
```

## 📋 마이그레이션 체크리스트

### ✅ 완료된 작업
- [x] 문서 파일 재배치 (`docs/`)
- [x] 설정 파일 정리 (`config/`)
- [x] 스크립트 이동 (`tools/scripts/`)
- [x] 백업 파일 정리 (`tools/backup/`)
- [x] 새 구조 문서화

### 🔄 추가 최적화 가능 영역

#### 1. **환경별 설정 분리** (권장)
```bash
# 개발 환경 전용 설정
config/development/
├── .env.development
├── next.config.dev.js
└── database.dev.json

# 프로덕션 환경 설정
config/production/
├── .env.production
├── next.config.prod.js
└── database.prod.json
```

#### 2. **컴포넌트 구조 개선** (선택사항)
```bash
components/
├── ui/           # 기본 UI 컴포넌트
├── layout/       # 레이아웃 컴포넌트
├── forms/        # 폼 컴포넌트
├── admin/        # 관리자 전용
└── features/     # 기능별 컴포넌트
```

#### 3. **타입 정의 세분화** (선택사항)
```bash
types/
├── api/          # API 관련 타입
├── database/     # 데이터베이스 타입
├── components/   # 컴포넌트 타입
└── common/       # 공통 타입
```

## 🚀 사용법

### 개발 시작할 때
```bash
# 1. 의존성 설치
npm install

# 2. 환경 설정 확인
cat config/claude-mcp-config.json

# 3. 개발 서버 시작
npm run dev

# 4. 보안 테스트 (선택사항)
node tools/scripts/test-security-apis.js
```

### 새 팀원 온보딩
1. **프로젝트 구조 이해**: 이 문서 읽기
2. **설치 가이드**: `docs/setup/` 확인
3. **보안 정책**: `docs/security/` 검토
4. **개발 도구**: `tools/scripts/` 활용

## 📞 문제 해결

### 파일을 찾을 수 없는 경우
```bash
# 전체 프로젝트에서 파일 검색
find . -name "파일명" -type f

# 특정 확장자 검색
find . -name "*.config.*" -type f
```

### import 경로 오류 발생 시
- 대부분의 설정 파일은 루트 레벨에서 참조되므로 영향 없음
- 만약 경로 오류 발생 시 상대 경로를 절대 경로로 수정

---

## 🎉 정리 효과

### 📊 개선 지표
- **루트 파일 수**: 32개 → 15개 (53% 감소)
- **문서 체계성**: 파편화 → 주제별 분류
- **설정 관리**: 산재 → 목적별 통합
- **개발 효율성**: 검색 시간 단축, 구조 이해도 향상

이제 ASCA 프로젝트는 훨씬 더 체계적이고 관리하기 쉬운 구조를 갖추었습니다! 🚀

---

## 1. 오해 방지: zsh: command not found

- `zsh: command not found: next:` 등은 **터미널에서 패키지명을 명령어처럼 입력해서 생긴 에러**입니다.
- 실제로는 아래처럼 입력해야 합니다:
  ```sh
  npm ls react
  npm ls react-dom
  npm ls @clerk/nextjs
  ```
- 위 명령어는 **설치된 패키지의 실제 경로와 중복 여부**를 확인하는 용도입니다.

---

## 2. 다음 단계: React 중복 설치 여부 확인

### 1) 아래 명령어를 터미널에 입력해 주세요:

```sh
npm ls react
npm ls react-dom
npm ls @clerk/shared
```

- **중복 설치**가 있다면, 여러 경로에 react/react-dom이 표시됩니다.
- **정상**이라면, 프로젝트 루트 아래 한 번만 표시됩니다.

---

## 3. node_modules/lock 파일 삭제 후 재설치

중복 설치가 의심되거나, 에러가 계속된다면 아래 명령어를 순서대로 실행하세요:

```sh
rm -rf node_modules package-lock.json yarn.lock
npm install
```
- 모든 패키지를 **깨끗하게 재설치**합니다.

---

## 4. 서버 완전 재시작

패키지 재설치 후, 개발 서버를 완전히 종료했다가 다시 시작하세요.

```sh
npm run dev
```

---

## 5. 에러 메시지 변화 확인

- 위 과정을 거친 후에도 **Clerk/React 관련 에러**가 계속된다면,
  - `npm ls` 명령어의 결과(출력 내용)
  - 혹은 새로 발생하는 에러 메시지

  **이 두 가지를 복사해서 남겨주시면  
  더 구체적으로 진단해드릴 수 있습니다!**

---

### 요약

1. **npm ls react** 등으로 중복 설치 여부 확인
2. **node_modules, lock 파일 삭제 후 npm install**
3. **서버 완전 재시작**
4. **에러 메시지/결과 공유**

---

**이 과정을 따라가면 대부분의 "Invalid hook call" 및 Clerk 로딩 문제는 해결됩니다.  
진행 후 결과를 남겨주시면, 다음 단계로 빠르게 안내드리겠습니다!**