# 브랜드 가이드라인

패밀리오피스 프로젝트의 일관된 사용자 경험을 위한 디자인 시스템과 브랜드 가이드라인입니다.

## 📋 목차

- [색상 팔레트](#색상-팔레트)
- [타이포그래피](#타이포그래피)
- [컴포넌트 시스템](#컴포넌트-시스템)
- [스페이싱](#스페이싱)
- [시각적 효과](#시각적-효과)
- [사용 가이드라인](#사용-가이드라인)
- [브랜드 컴포넌트 사용법](#브랜드-컴포넌트-사용법)

## 🎨 색상 팔레트

### 주요 브랜드 색상

| 색상             | HEX       | CSS 클래스            | 사용 용도                                   |
| ---------------- | --------- | --------------------- | ------------------------------------------- |
| Navy Primary     | `#1A1A2E` | `bg-navy-primary`     | 메인 브랜드 색상, 신뢰성과 전문성을 나타냄  |
| Gold Primary     | `#C9B037` | `bg-gold-primary`     | 프리미엄 액센트 색상, 성공과 번영을 상징    |
| Burgundy Primary | `#800020` | `bg-burgundy-primary` | 보조 브랜드 색상, 중요한 정보와 경고에 사용 |

### 금융 특화 색상

| 색상           | HEX       | CSS 클래스          | 사용 용도                       |
| -------------- | --------- | ------------------- | ------------------------------- |
| Trust Blue     | `#2563EB` | `bg-trust-blue`     | 신뢰성 강조, 금융 안정성 표현   |
| Success Green  | `#059669` | `bg-success-green`  | 성장과 수익, 긍정적 지표에 사용 |
| Warning Amber  | `#D97706` | `bg-warning-amber`  | 주의사항과 리스크 알림          |
| Premium Purple | `#7C3AED` | `bg-premium-purple` | 프리미엄 서비스와 VIP 고객용    |

### 중성 색상

| 색상       | HEX       | CSS 클래스     | 사용 용도            |
| ---------- | --------- | -------------- | -------------------- |
| Pure White | `#FFFFFF` | `bg-white`     | 깔끔한 배경과 텍스트 |
| Slate 50   | `#F8FAFC` | `bg-slate-50`  | 미묘한 배경색        |
| Slate 100  | `#F1F5F9` | `bg-slate-100` | 카드 배경            |
| Slate 300  | `#CBD5E1` | `bg-slate-300` | 경계선과 구분선      |
| Slate 500  | `#64748B` | `bg-slate-500` | 보조 텍스트          |
| Slate 700  | `#334155` | `bg-slate-700` | 일반 텍스트          |
| Slate 900  | `#0F172A` | `bg-slate-900` | 제목과 강조 텍스트   |

## 📝 타이포그래피

### 폰트 패밀리

- **Heading Font**: 제목과 헤딩에 사용되는 세리프 폰트

  ```css
  font-family: var(--font-heading);
  ```

- **Body Font**: 본문과 일반 텍스트에 사용되는 산세리프 폰트
  ```css
  font-family: var(--font-body);
  ```

### 텍스트 크기 스케일

| 크기 | Tailwind 클래스 | 사용 용도        |
| ---- | --------------- | ---------------- |
| 6xl  | `text-6xl`      | 메인 헤딩 (H1)   |
| 4xl  | `text-4xl`      | 서브 헤딩 (H2)   |
| 2xl  | `text-2xl`      | 섹션 헤딩 (H3)   |
| xl   | `text-xl`       | 소제목 (H4)      |
| lg   | `text-lg`       | 큰 본문 텍스트   |
| base | `text-base`     | 일반 본문 텍스트 |
| sm   | `text-sm`       | 작은 텍스트      |
| xs   | `text-xs`       | 캡션             |

## 🧩 컴포넌트 시스템

### 기본 UI 컴포넌트

프로젝트에서 사용 가능한 주요 UI 컴포넌트들:

- **Button**: 다양한 variant (primary, secondary, outline, ghost, destructive)
- **Card**: 콘텐츠 그룹화를 위한 카드 컴포넌트
- **Input/Textarea**: 폼 입력 요소
- **Badge**: 상태나 카테고리 표시
- **Alert**: 알림 메시지
- **Progress/Slider**: 진행률 및 슬라이더
- **Switch**: 토글 스위치
- **Avatar**: 프로필 이미지

### 브랜드 컴포넌트

일관된 브랜드 스타일을 위한 커스텀 컴포넌트들:

#### BrandContainer

```tsx
<BrandContainer variant="wide" spacing="lg">
  {/* 콘텐츠 */}
</BrandContainer>
```

#### BrandSection

```tsx
<BrandSection background="glass" spacing="xl">
  {/* 섹션 콘텐츠 */}
</BrandSection>
```

#### BrandHeading

```tsx
<BrandHeading as="h2" size="xl" color="brand" align="center">
  제목 텍스트
</BrandHeading>
```

#### BrandText

```tsx
<BrandText size="lg" color="muted" weight="medium">
  본문 텍스트
</BrandText>
```

#### BrandCard

```tsx
<BrandCard variant="glass" padding="lg">
  {/* 카드 콘텐츠 */}
</BrandCard>
```

#### BrandGrid

```tsx
<BrandGrid cols={3} gap="lg">
  {/* 그리드 아이템들 */}
</BrandGrid>
```

## 📏 스페이싱

일관된 레이아웃을 위한 간격 시스템:

| 크기 | 값    | 사용 용도    |
| ---- | ----- | ------------ |
| xs   | 8px   | 작은 여백    |
| sm   | 16px  | 기본 여백    |
| md   | 24px  | 중간 여백    |
| lg   | 48px  | 큰 여백      |
| xl   | 100px | 매우 큰 여백 |

### BrandSpacer 사용법

```tsx
<BrandSpacer size="md" />
```

## 🎯 금융 특화 요소

### 아이콘 시스템

금융 컨설팅 서비스에 특화된 아이콘들:

- **성장**: `TrendingUp` - 포트폴리오 성과, 수익률 표시
- **보안**: `Shield`, `Lock` - 자산 보호, 보안 서비스
- **수익**: `DollarSign` - 수익률, 금융 성과
- **분석**: `PieChart`, `BarChart3` - 데이터 분석, 리포트
- **계산**: `Calculator` - 금융 계산, 시뮬레이션
- **포트폴리오**: `Briefcase` - 자산 관리, 투자 상품
- **고객**: `Users` - 고객 관리, 상담 서비스
- **목표**: `Target` - 투자 목표, 재무 계획
- **프리미엄**: `Award` - VIP 서비스, 프리미엄 상품
- **승인**: `CheckCircle` - 승인 프로세스, 완료 상태

### 데이터 시각화

금융 데이터를 효과적으로 표현하는 컴포넌트들:

- **포트폴리오 성과 카드**: 수익률, 자산 배분 시각화
- **리스크 분석 차트**: 변동성, 샤프 비율 표시
- **진행률 바**: 목표 달성률, 투자 진행 상황
- **KPI 대시보드**: 핵심 지표 요약 표시

## ✨ 시각적 효과

### 글래스모피즘

- `.glass`: 기본 글래스 효과
- `.glass-dark`: 다크 글래스 효과
- `.glass-card`: 카드형 글래스 효과

### 호버 효과

- `.hover-lift`: 마우스 오버 시 들어올리는 효과
- `.hover-glow`: 마우스 오버 시 글로우 효과
- `.hover-glass-shine`: 글래스 샤인 효과

### 그라데이션

#### 브랜드 그라데이션

- `bg-gradient-brand`: 메인 브랜드 그라데이션
- `bg-gradient-navy`: 네이비 그라데이션
- `bg-gradient-gold`: 골드 그라데이션
- `bg-gradient-burgundy`: 버건디 그라데이션

#### 금융 특화 그라데이션

- `bg-gradient-trust`: 신뢰성 강조 블루 그라데이션
- `bg-gradient-success`: 성공/수익 그린 그라데이션
- `bg-gradient-premium`: 프리미엄 퍼플 그라데이션

### 트랜지션

- `.transition-fo`: 부드러운 트랜지션 (0.3s)
- `.transition-fo-fast`: 빠른 트랜지션 (0.2s)
- `.transition-fo-slow`: 느린 트랜지션 (0.5s)

## 📱 반응형 디자인

### 브레이크포인트

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 모바일 최적화

- 터치 타겟 최소 크기: 44px × 44px
- `.touch-target`: 터치 최적화 클래스
- `.touch-button`: 터치 버튼 스타일

## 📋 사용 가이드라인

### ✅ 권장사항

#### 색상 사용

- 브랜드 색상을 일관되게 사용하여 신뢰성 강화
- 금융 특화 색상으로 데이터 의미 명확화 (녹색=수익, 빨간색=손실)
- 적절한 대비율 유지 (WCAG 2.1 AA 기준)

#### 디자인 원칙

- 모바일 우선 반응형 디자인 적용
- 글래스모피즘으로 현대적이고 세련된 느낌 연출
- 일관된 스페이싱으로 정돈된 레이아웃 구성
- 브랜드 컴포넌트 우선 사용으로 통일성 확보

#### 금융 특화 요소

- 데이터 시각화 시 명확한 정보 전달 우선
- 금융 아이콘으로 직관적인 UI 구성
- 프리미엄 느낌의 색상과 효과 활용

### ❌ 주의사항

#### 색상 관련

- 브랜드 색상을 임의로 변경 금지
- 금융 데이터에서 색상 의미 혼동 방지
- 과도한 색상 사용으로 인한 가독성 저하 방지

#### 사용자 경험

- 과도한 애니메이션으로 인한 산만함 방지
- 접근성을 해치는 디자인 사용 금지
- 복잡한 금융 정보의 과도한 시각화 지양
- 일관성 없는 컴포넌트 스타일링 방지
- 신뢰성을 해칠 수 있는 과도한 장식 효과 지양

## 🛠 브랜드 컴포넌트 사용법

### 설치 및 임포트

```tsx
import {
  BrandContainer,
  BrandSection,
  BrandHeading,
  BrandText,
  BrandCard,
  BrandGrid,
  BrandSpacer,
} from "@/components/ui/brand-components";
```

### 기본 레이아웃 구성

```tsx
function ExamplePage() {
  return (
    <BrandSection background="muted" spacing="xl">
      <BrandContainer variant="wide">
        <BrandHeading as="h1" size="2xl" color="brand" align="center">
          페이지 제목
        </BrandHeading>
        <BrandSpacer size="md" />
        <BrandText size="lg" color="muted" align="center">
          페이지 설명 텍스트
        </BrandText>
        <BrandSpacer size="lg" />

        <BrandGrid cols={3} gap="lg">
          <BrandCard variant="glass" padding="lg">
            <BrandHeading as="h3" size="md" color="gold">
              카드 제목
            </BrandHeading>
            <BrandSpacer size="sm" />
            <BrandText color="muted">카드 내용</BrandText>
          </BrandCard>
          {/* 더 많은 카드들... */}
        </BrandGrid>
      </BrandContainer>
    </BrandSection>
  );
}
```

### 실제 사용 예시

브랜드 가이드라인 페이지(`/brand-guidelines`)에서 모든 컴포넌트의 실제 사용 예시를 확인할 수 있습니다.

## 🔗 관련 파일

- **브랜드 가이드라인 페이지**: `/app/brand-guidelines/page.tsx`
- **브랜드 컴포넌트**: `/components/ui/brand-components.tsx`
- **사용 예시**: `/components/ui/brand-usage-examples.tsx`
- **글로벌 스타일**: `/app/globals.css`
- **Tailwind 설정**: `/tailwind.config.ts`

## 📞 문의

브랜드 가이드라인이나 디자인 시스템에 대한 문의사항이 있으시면 개발팀에 연락해 주세요.

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0
