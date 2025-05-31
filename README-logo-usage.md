# ASCA 로고 사용 가이드

동양서예협회(ASCA) 웹사이트에서 로고 이미지를 올바르게 사용하는 방법을
안내합니다.

## 📁 로고 파일 위치

모든 로고 파일은 `/public/logo/` 폴더에 저장되어 있습니다:

```
public/
└── logo/
    ├── Logo & Tagline_white BG.png    # 태그라인 로고 (흰색 배경용)
    ├── Logo & Tagline_black BG.png    # 태그라인 로고 (검은색 배경용)
    ├── Logo & Slogan_white BG.png     # 슬로건 로고 (흰색 배경용)
    └── Logo & Slogan_black BG.png     # 슬로건 로고 (검은색 배경용)
```

## 🎨 로고 변형

### 1. 태그라인 로고 (기본)

- **텍스트**: "The Asian Society of Calligraphic Arts"
- **용도**: 공식 문서, 웹사이트 헤더, 명함 등
- **파일**: `Logo & Tagline_*.png`

### 2. 슬로건 로고

- **텍스트**: "正法의 계승, 創新의 조화"
- **용도**: 브랜딩 자료, 포스터, 홍보물 등
- **파일**: `Logo & Slogan_*.png`

## 💻 코드에서 사용하기

### Logo 컴포넌트 사용 (권장)

```tsx
import { Logo } from '@/components/logo'

// 기본 태그라인 로고 (테마 자동 감지)
<Logo width={200} height={60} />

// 슬로건 로고
<Logo variant="slogan" width={250} height={80} />

// 커스텀 스타일링
<Logo
  variant="tagline"
  width={300}
  height={90}
  className="hover:opacity-80 transition-opacity"
/>
```

### 직접 이미지 사용

```tsx
import Image from 'next/image'

// 태그라인 로고 (흰색 배경용)
<Image
  src="/logo/Logo & Tagline_white BG.png"
  alt="동양서예협회 | Oriental Calligraphy Association"
  width={200}
  height={60}
/>

// 슬로건 로고 (검은색 배경용)
<Image
  src="/logo/Logo & Slogan_black BG.png"
  alt="동양서예협회 | Oriental Calligraphy Association"
  width={200}
  height={60}
/>
```

## 🔄 테마별 자동 선택

Logo 컴포넌트는 현재 테마에 따라 자동으로 적절한 로고를 선택합니다:

- **라이트 모드**: `*_white BG.png` (검은색 텍스트)
- **다크 모드**: `*_black BG.png` (흰색 텍스트)

## 📋 사용 규칙

### ✅ 권장사항

- Logo 컴포넌트 사용을 우선적으로 고려
- 원본 비율 유지
- 충분한 여백 확보
- 적절한 크기 사용 (최소 60px 높이)

### ❌ 금지사항

- 로고 비율 왜곡 금지
- 임의 색상 변경 금지
- 로고 회전이나 기울임 금지
- 복잡한 배경 위 직접 배치 금지

## 🔧 브랜드 가이드라인 페이지

더 자세한 브랜드 가이드라인은 `/brand` 페이지에서 확인할 수 있습니다:

- 로고 다운로드 기능
- 색상 팔레트
- 타이포그래피 가이드
- 사용 예시 및 금지사항

## 📥 로고 다운로드

브랜드 가이드라인 페이지에서 다음 형식으로 로고를 다운로드할 수 있습니다:

- `ASCA_Logo_White_BG.png` - 태그라인 로고 (흰색 배경용)
- `ASCA_Logo_Black_BG.png` - 태그라인 로고 (검은색 배경용)
- `ASCA_Logo_Slogan_White_BG.png` - 슬로건 로고 (흰색 배경용)
- `ASCA_Logo_Slogan_Black_BG.png` - 슬로건 로고 (검은색 배경용)

## 🚀 업데이트 내역

- **2024.12**: 로고 파일을 `/public/logo/` 폴더로 통합
- **2024.12**: Logo 컴포넌트에 variant 옵션 추가
- **2024.12**: 브랜드 가이드라인 페이지에 실제 다운로드 기능 구현
