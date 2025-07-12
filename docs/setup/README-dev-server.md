# 🚀 ASCA 개발 서버 시작 가이드

동양서예협회 (ASCA) CMS 시스템의 개발 서버를 시작하기 위한 완전한 가이드입니다.

## 📋 목차

1. [빠른 시작](#빠른-시작)
2. [환경 설정](#환경-설정)
3. [개발 서버 옵션](#개발-서버-옵션)
4. [개발 도구](#개발-도구)
5. [문제 해결](#문제-해결)
6. [개발 팁](#개발-팁)

---

## 🚀 빠른 시작

### 1. 프로젝트 설치

```bash
# 저장소 클론
git clone <repository-url>
cd ASCA

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 API 키 입력

# 개발 서버 시작
npm run dev
```

### 2. 통합 개발 서버 시작

```bash
# 기본 개발 서버 (추천)
npm run server:dev

# 또는 스크립트 직접 실행
node scripts/dev-server.js
```

## ⚙️ 환경 설정

### 필수 환경 변수

`.env.local` 파일에 다음 변수들을 설정해야 합니다:

```env
# 기본 설정
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 데이터베이스 (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 인증 (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# 관리자 권한
SUPER_ADMIN_EMAILS=admin@asca.kr
ADMIN_EMAILS=manager@asca.kr
```

### 환경 변수 검증

```bash
# 환경 변수 확인
npm run env:check

# 기본 .env.local 파일 생성
npm run env:example
```

## 🛠️ 개발 서버 옵션

### 기본 명령어

```bash
# 표준 Next.js 개발 서버
npm run dev

# Turbo 모드 (더 빠른 빌드)
npm run dev:turbo

# 디버그 모드
npm run dev:debug

# 클린 시작 (캐시 삭제 후 시작)
npm run dev:clean

# 완전 새로 시작 (node_modules 재설치)
npm run dev:fresh
```

### 고급 옵션

```bash
# 타입 체크와 함께 시작
npm run dev:type-check

# HTTPS 모드
npm run dev:https

# 모든 인터페이스에서 접근 가능
npm run dev:host

# 다른 포트 사용
npm run dev:port
```

### 통합 개발 서버

```bash
# 기본 개발 서버 (Next.js만)
node scripts/dev-server.js

# 데이터베이스 스튜디오와 함께
node scripts/dev-server.js --with-db

# 도움말
node scripts/dev-server.js --help
```

## 🔧 개발 도구

### 데이터베이스 관리

```bash
# 데이터베이스 스튜디오 시작
npm run db:studio

# 스키마 마이그레이션
npm run db:migrate

# 데이터베이스 초기화
npm run db:setup

# 데이터베이스 리셋
npm run db:reset
```

### 코드 품질 도구

```bash
# 타입 체크
npm run type-check

# 타입 체크 (실시간)
npm run type-check:watch

# 린팅
npm run lint

# 린팅 (자동 수정)
npm run lint:fix

# 코드 포맷팅
npm run format
```

### 테스트

```bash
# 단위 테스트
npm run test

# 테스트 (실시간)
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

### 빌드 및 분석

```bash
# 프로덕션 빌드
npm run build

# 번들 분석
npm run build:analyze

# 성능 감사
npm run perf:audit
```

## 🌐 개발 환경 URL

개발 서버 시작 후 다음 URL들을 사용할 수 있습니다:

- **메인 사이트**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin
- **API 문서**: http://localhost:3000/api
- **데이터베이스 스튜디오**: http://localhost:4983

## 🔍 모의 데이터 모드

실제 데이터베이스 없이 개발할 수 있습니다:

```env
# .env.local에 추가
USE_MOCK_DATA=true
```

모의 데이터 모드에서는:
- 사전 정의된 샘플 데이터 사용
- 실제 API 호출 없이 개발 가능
- 데이터베이스 설정 불필요

## 🛡️ 개발 관리자 모드

개발 중 관리자 권한을 쉽게 테스트할 수 있습니다:

```env
# .env.local에 추가 (주의: 프로덕션에서는 절대 사용 금지)
DEV_ADMIN_MODE=true
```

⚠️ **경고**: 이 모드는 보안 검사를 우회하므로 개발 환경에서만 사용하세요.

## 🎯 개발 서버 기능

### 자동 기능

- **핫 리로드**: 파일 변경 시 자동 새로고침
- **타입 체크**: 실시간 TypeScript 오류 감지
- **에러 오버레이**: 런타임 에러 표시
- **성능 모니터링**: 개발 중 성능 메트릭 수집

### 개발 도구 단축키

- **Ctrl+Shift+D**: 개발 정보 토글
- **Ctrl+Shift+L**: 로컬 스토리지 클리어

### 개발 헤더

개발 모드에서 다음 HTTP 헤더가 추가됩니다:

- `X-Dev-Mode: true`
- `X-Build-Time: <timestamp>`
- `Access-Control-Allow-Origin: *` (CORS 허용)

## 🔧 문제 해결

### 일반적인 문제

#### 1. 포트 충돌

```bash
# 포트 3000이 사용 중인 경우
npm run dev:port  # 3001 포트 사용

# 또는 환경 변수 설정
DEV_SERVER_PORT=3001
```

#### 2. 환경 변수 오류

```bash
# 환경 변수 검증
npm run env:check

# 기본 환경 파일 생성
npm run env:example
```

#### 3. 타입 에러

```bash
# TypeScript 캐시 삭제
rm -rf .next
npm run type-check
```

#### 4. 의존성 문제

```bash
# 의존성 재설치
npm run clean:all
npm install
```

#### 5. 데이터베이스 연결 문제

```bash
# 모의 데이터 모드로 시작
echo "USE_MOCK_DATA=true" >> .env.local
npm run dev
```

### 로그 확인

```bash
# 개발 서버 로그 활성화
echo "ENABLE_CONSOLE_LOGS=true" >> .env.local
echo "LOG_LEVEL=debug" >> .env.local
```

## 💡 개발 팁

### 1. 효율적인 개발 워크플로우

```bash
# 권장 개발 시작 순서
npm run env:check        # 환경 변수 확인
npm run type-check       # 타입 체크
npm run server:dev       # 통합 개발 서버 시작
```

### 2. 성능 최적화

```bash
# 터보 모드 사용
npm run dev:turbo

# 번들 분석
npm run build:analyze
```

### 3. 한국 시장 특화 기능 개발

```env
# 한국 서비스 API 키 설정
NEXT_PUBLIC_CHANNEL_IO_KEY=your_channel_io_key
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
NEXT_PUBLIC_CAL_COM_USERNAME=your_cal_com_username
```

### 4. 다국어 개발

- 기본 언어: 한국어 (ko)
- 지원 언어: 영어 (en), 일본어 (ja), 중국어 (zh)
- 번역 파일: `lib/i18n/translations/`

### 5. 모바일 개발

```bash
# 네트워크 인터페이스에서 접근 가능
npm run dev:host
# 모바일에서 http://your-ip:3000 접근
```

## 🚀 프로덕션 배포 준비

개발 완료 후 프로덕션 배포 전 체크리스트:

```bash
# 1. 전체 테스트 실행
npm run test:ci

# 2. 타입 체크
npm run type-check

# 3. 린팅
npm run lint

# 4. 프로덕션 빌드 테스트
npm run build
npm run start

# 5. 성능 감사
npm run perf:audit
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정 (`npm run env:check`)
2. 의존성 설치 상태 (`npm ls`)
3. 포트 사용 현황 (`lsof -i :3000`)
4. 로그 메시지 확인

추가 도움이 필요하면 개발팀에 문의하세요.

---

**Happy Coding! 🎨** 