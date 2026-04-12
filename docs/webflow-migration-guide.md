# Webflow → Next.js 마이그레이션 가이드

## 개요

- **소스**: `orientalcalligraphy.webflow.zip` (2026-04-11 export)
- **대상**: ASCA Next.js App Router 프로젝트
- **위치**: `public/webflow/orientalcalligraphy/`
- **미리보기**: `/webflow` (개발용 대시보드)

## 파일 구조

```
public/webflow/orientalcalligraphy/
├── css/                    # Webflow CSS (normalize + components + custom)
├── js/                     # Webflow JS (jQuery + GSAP + interactions)
├── images/                 # 이미지 에셋 (한글 파일명 포함)
├── fonts/                  # Satoshi, icon font
├── documents/              # Lottie JSON 등
├── index.html              # 메인 홈
├── exhibition/             # 전시 페이지 (8개)
├── members/                # 회원 유형별 페이지 (10개)
├── home-pages/             # 홈 변형 (v1~v3, 참고용)
├── utility-pages/          # 템플릿 유틸 (skip)
├── landing-pages/          # 랜딩 페이지
├── partner/                # 파트너 소개
├── detail_*.html           # CMS 템플릿 (14개)
└── MISSING.txt             # Export 누락 에셋 목록
```

## 마이그레이션 우선순위

### Phase 1: HIGH (즉시 전환)

기존 Next 라우트가 없거나, Webflow 콘텐츠가 더 풍부한 페이지:

| Webflow 파일 | 신규 Next 라우트 | 비고 |
|---|---|---|
| `greetings.html` | `/greetings` | 6개 언어 인사말, i18n 활용 |
| `history.html` | `/history` | 협회 연혁 타임라인 |
| `introductions.html` | `/about` | 협회 소개 |
| `mission.html` | `/about/mission` | 사명 |
| `board-members.html` | `/about/board` | 임원 |
| `contact.html` | `/contact` | 문의 (지도/폼) |
| `membership.html` | `/members/apply` 병합 | 입회원서 |
| `application.html` | `/contests/[id]/apply` 병합 | 출품원서 |
| `exhibition/*.html` (최신) | `/exhibitions/[id]` 병합 | 전시 상세 |

### Phase 2: MEDIUM

| Webflow 파일 | 신규 Next 라우트 | 비고 |
|---|---|---|
| `partners.html` | `/partners` | 협력기관 |
| `brand.html` | `/about/brand` | 브랜드 가이드 |
| `fundrasing.html` | `/support` | 모금/후원 |
| `business-plan.html` | `/about/business-plan` | 사업계획 |
| `fairness-transparency-hub.html` | `/about/transparency` | 공정성·투명성 |
| `articles-of-incorporation-and-bylaws.html` | `/about/bylaws` | 정관 |
| `members/*.html` | `/members/[type]` | 회원 유형별 |

### Phase 3: LOW / SKIP

| Webflow 파일 | 결정 | 사유 |
|---|---|---|
| `home-pages/*` | SKIP | 템플릿 데모 |
| `utility-pages/*` | SKIP | 템플릿 잔재 |
| `detail_*.html` | 참고만 | CMS 템플릿, 동적 라우트로 대체 |
| `checkout/shop/paypal` | SKIP | 이커머스 미구현 |
| `old-home.html` | SKIP | 레거시 |
| Auth 페이지 | SKIP | Clerk 인증으로 대체 |

## 기술 전략

### CSS 통합

- Webflow CSS 변수와 Tailwind 토큰 매핑:
  - `--traditional-ink-black` = `ink-black` (#1a1a1a) ✅ 일치
  - `--rice-paper-white` = `rice-paper` (#f5f5f0) ✅ 일치
  - `--celadon-green` = `celadon-green` (#88a891) ✅ 일치
  - `--scholar-red` = `scholar-red` (#af2626) ✅ 일치
  - `--bamboo-green` (#4a6741) ≠ `bamboo-green` (#6b7c32) ⚠️ **충돌**
  - `--stone-gray` (#7f7f7f) ≠ `stone-gray` (#707070) ⚠️ **미세 차이**

- **전략**: Webflow 페이지 이관 시 Tailwind 토큰 우선 사용, 미매핑 색상은 CSS 변수로 임시 보존

### 폰트 통합

- Webflow 기본: `source-han-serif-tc` (Adobe Typekit)
- ASCA Next: `Inter` + `Noto Sans/Serif KR` + `Playfair Display` (Google Fonts)
- **전략**: Next.js `next/font` 기반으로 통일, Typekit 의존성 제거

### JS 인터랙션

- Webflow: jQuery 3.5.1 + GSAP (ScrollTrigger, SplitText 등)
- ASCA Next: Framer Motion
- **전략**: 스크롤 애니메이션은 `framer-motion`의 `useInView`로, 텍스트 분할은 CSS `@keyframes`로 대체

### 이미지

- Webflow: 상대경로 `images/...` + CDN (`imagedelivery.net`)
- **전략**: 로컬 이미지 → `public/images/` 이동 후 `next/image` 적용, CDN 이미지는 URL 유지

## 페이지 전환 절차 (개별 페이지)

1. Webflow HTML에서 `<body>` → `</body>` 사이 콘텐츠만 추출
2. 헤더(`.header.w-nav`)와 푸터(`.footer`) 제거 (기존 레이아웃 사용)
3. 섹션별로 React 컴포넌트 분리
4. Webflow 클래스 → Tailwind 유틸리티 변환
5. 인라인 스타일(`opacity:0; transform:...`) → Framer Motion `initial`/`animate` 변환
6. 이미지 `<img>` → `next/image` `<Image>` 변환
7. 내부 링크 경로 변환 (`.html` 확장자 제거, Next 라우트 매핑)
