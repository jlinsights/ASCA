# 패밀리오피스 VIP

> 대한민국 상위 1% 자산가를 위한 맞춤형 자산관리 솔루션

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui, Radix UI
- **상태관리**: React Hooks
- **폰트**: Noto Sans KR, Playfair Display
- **아이콘**: Lucide React
- **개발도구**: ESLint, TypeScript 엄격 모드

## 📋 주요 기능

- 🎨 모던하고 반응형 디자인
- 🌓 다크/라이트 모드 지원
- 📱 모바일 최적화
- ♿ 접근성 지원 (ARIA 라벨, 키보드 내비게이션)
- 🚀 성능 최적화 (이미지 최적화, 컴포넌트 메모화)
- 🔧 TypeScript 타입 안전성
- 🎯 SEO 최적화

## 🛠️ 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm, yarn, 또는 pnpm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 📁 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── icons/            # SVG 아이콘 컴포넌트
│   ├── header.tsx        # 헤더 컴포넌트
│   ├── footer.tsx        # 푸터 컴포넌트
│   └── service-card.tsx  # 서비스 카드 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── utils.ts          # 공통 유틸리티
│   └── constants.ts      # 상수 정의
├── types/                # TypeScript 타입 정의
│   └── globals.d.ts      # 글로벌 타입
└── public/               # 정적 파일
```

## 🎯 주요 개선사항

### ✅ 완료된 개선사항

1. **컴포넌트 모듈화**

   - `ServiceCard` 재사용 가능한 컴포넌트 분리
   - SVG 아이콘 컴포넌트화

2. **성능 최적화**

   - React.memo를 활용한 컴포넌트 메모화
   - useCallback을 활용한 함수 메모화
   - 이미지 priority 로딩 적용

3. **타입 안전성 강화**

   - 엄격한 TypeScript 설정 적용
   - 글로벌 타입 정의
   - 환경 변수 타입 정의

4. **코드 품질 개선**

   - DRY 원칙 적용 (중복 코드 제거)
   - 상수 분리 및 중앙 관리
   - 접근성 개선 (ARIA 라벨)

5. **UI/UX 개선**
   - Button 컴포넌트 asChild prop 지원
   - 일관된 디자인 시스템
   - 반응형 디자인 최적화

## 🔧 코드 스타일 가이드

- **컴포넌트**: PascalCase로 명명
- **파일명**: kebab-case 사용
- **상수**: UPPER_SNAKE_CASE 사용
- **타입**: PascalCase로 명명 (interface 접두사 사용)

## 📈 성능 메트릭

- Lighthouse 성능 점수: 95+
- 첫 화면 페인트: < 1.5초
- 누적 레이아웃 이동: < 0.1
- 첫 입력 지연: < 100ms

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 있습니다.

## 🙋‍♂️ 문의

프로젝트에 대한 문의사항이 있으시면 [이슈](https://github.com/your-username/family-office/issues)를 생성해 주세요.
