---
template: design
version: 1.0
feature: asca-design-system-finalize
date: 2026-04-25
author: jhlim725
project: ASCA (my-v0-project)
parent_cycle: asca-design-system (2026-04-24, 82%, partial)
sibling_learning: smart-quote-emax/emax-design-system (2026-04-25, 98%)
---

# asca-design-system-finalize — Design Document

> **Summary**: Plan §7의 4가지 결정사항 구체화 + Phase별 파일 diff 명세. emax-design-system 패턴(`@google/design.md` CLI advisory + 자체 design-diff hard fail) 이식하되 ASCA Next.js TS 환경에 맞게 `tsx` runtime + WCAG contrast lint 추가.
>
> **Plan**: [asca-design-system-finalize.plan.md](../../01-plan/features/asca-design-system-finalize.plan.md)

---

## 1. 결정사항 (Decisions)

### D1 — typography 비-canonical 보존: **prose 섹션** 채택

| 옵션 | 평가 | 결정 |
|------|------|-----|
| A. unknown sections (YAML) | spec 상 preserve 허용이지만 lint warning, AI 에이전트 해석 불확실 | ❌ |
| B. prose 섹션 (Markdown 표) | lint clean, 사람·AI 모두 가독성 우수 | ✅ |
| C. 분리 파일 (typography-extended.md) | 분산 우려, SSoT 약화 | ❌ |

**근거**: Google spec preserve는 보존이지 권장이 아님. emax도 prose 표 패턴 채택. weight/tracking/leading은 Tailwind 기본값과 일치(소비처는 tailwind.config의 미설정 → 기본값) → 정보 손실 0.

### D2 — TS `tailwind.config.ts` 동적 import: **`tsx` runtime** 채택

| 옵션 | 평가 | 결정 |
|------|------|-----|
| a. `.cjs` 변환 | Next.js 14 App Router 표준이 `.ts` config라 retrograde | ❌ |
| b. `tsx` runtime (`npx tsx scripts/design-diff.ts`) | 0 config, devDep 1개 추가, TS 직접 import | ✅ |
| c. Build cache 활용 | 빌드 의존성 → CI 느려짐 | ❌ |

**근거**: ASCA는 Next.js 14, TS 우선. 스크립트도 TS로 작성하면 `import config from '../tailwind.config'`가 그대로 동작. devDep `tsx@^4.20.0` (또는 이미 설치된 ts-node 활용 가능 시 우선).

### D3 — WCAG 페어 매핑: **9 semantic + 4 surface** + Obang/Seasonal **decorative-only 예외**

**Hard-fail pairs (AA 4.5:1, large text 3:1 분리)**:

| ID | foreground | background | min ratio | 비고 |
|----|-----------|-----------|----------|------|
| P1 | foreground | background | 4.5 | 본문 텍스트 |
| P2 | primary-foreground | primary | 4.5 | 버튼 본문 |
| P3 | secondary-foreground | secondary | 4.5 | 보조 버튼 |
| P4 | accent-foreground | accent | 4.5 | hover 배경 텍스트 |
| P5 | highlight-foreground | highlight | 4.5 | gold 강조 |
| P6 | destructive-foreground | destructive | 4.5 | 위험 액션 |
| P7 | muted-foreground | muted | 4.5 | 비활성 상태 |
| P8 | card-foreground | card | 4.5 | 카드 본문 |
| P9 | popover-foreground | popover | 4.5 | popover 본문 |
| L1 | foreground | background | 3.0 (large text) | h1/h2/display |
| L2 | primary-foreground | primary | 3.0 (large text) | 버튼 large |

**Decorative-only exception (검증 제외, prose 명시)**:
- Obang 5색 (east-wood/south-fire/center-earth/west-metal/north-water): 장식 일러스트레이션·아이콘 전용
- Seasonal 4색 (spring-blossom/summer-jade/autumn-gold/winter-snow): 카테고리 라벨 장식
- Calligraphy materials (bamboo-green/silk-cream/lacquer-black/vermillion): 작품 메타데이터 색상
- Brand Extended 6색 (terra-red/sage-green/spring-green/brand-gold/medium-orchid/royal-blue): brand 페이지 정체성 표시 전용

**근거**: shadcn semantic 슬롯이 실제 텍스트 컨테이너. 전통 색은 의미 표현이지 본문 텍스트 contrast 대상 아님. emax는 colors가 단순(33 raw)이라 페어 검증 불필요했지만, ASCA는 47색 → 분리 정의 필수.

### D4 — DTCG export Stretch: **이번 사이클 보류**

**근거**:
- emax에서 학습된 flat→nested 변환 이슈가 ASCA에도 동일 발생 가능
- ASCA는 token 카테고리(Obang/Seasonal/Calligraphy)가 풍부 → flat key 변환 시 의미 정보 손실
- 5.5~6.5h 필수 작업에 집중, 별도 PDCA(`asca-dtcg-export`)로 분리 권장

---

## 2. Phase별 파일 변경 (File Diff)

### Phase 1 — typography canonical 변환

**파일**: `docs/02-design/DESIGN.md` (line 85~138 영역)

#### 변경 전 (현재, line 85~)

```yaml
typography:
  family:
    sans: 'var(--font-inter), ...'
    serif: 'var(--font-playfair), ...'
    calligraphy: '...'
    brush: '...'
    mono: '...'
    korean: '...'
    chinese: '...'
    japanese: '...'
    english: '...'
  scale:
    xs: '0.75rem / 1rem'
    # ... 13단계
  weight: { thin: 100, ..., black: 900 }
  tracking: { tighter: '-0.05em', ..., widest: '0.1em' }
  leading: { none: 1, ..., loose: 2 }
```

#### 변경 후 (canonical 8 tokens)

```yaml
typography:
  display-lg:
    fontFamily: var(--font-playfair), var(--font-noto-serif-kr), serif
    fontSize: "3.75rem"          # 60px (현 6xl)
  display-md:
    fontFamily: var(--font-playfair), var(--font-noto-serif-kr), serif
    fontSize: "3rem"             # 48px (현 5xl)
  headline-lg:
    fontFamily: var(--font-playfair), var(--font-noto-serif-kr), serif
    fontSize: "2.25rem"          # 36px (현 4xl)
  headline-md:
    fontFamily: var(--font-playfair), var(--font-noto-serif-kr), serif
    fontSize: "1.875rem"         # 30px (현 3xl)
  title-lg:
    fontFamily: var(--font-inter), var(--font-noto-sans-kr), sans-serif
    fontSize: "1.5rem"           # 24px (현 2xl)
  body-lg:
    fontFamily: var(--font-inter), var(--font-noto-sans-kr), sans-serif
    fontSize: "1.125rem"         # 18px (현 lg)
  body-md:
    fontFamily: var(--font-inter), var(--font-noto-sans-kr), sans-serif
    fontSize: "1rem"             # 16px (현 base)
  label-sm:
    fontFamily: var(--font-inter), var(--font-noto-sans-kr), sans-serif
    fontSize: "0.875rem"         # 14px (현 sm)
```

#### 추가 prose 섹션 (front matter 종료 `---` 이후)

```markdown
## Typography Reference (extended)

> **Why prose**: Google DESIGN.md spec v1은 typography를 `<name>: {fontFamily, fontSize}` 객체로 정의. weight/tracking/leading 등 ASCA 고유 확장은 prose로 보존하여 lint clean과 정보 보존을 동시 달성.

### Font Families (확장)

| 토큰 | 적용 |
|------|------|
| sans | UI 본문 (Inter + Noto Sans KR) |
| serif | 헤드라인·인용 (Playfair + Noto Serif KR) |
| calligraphy | 작품 정보, 한자 (Source Han Serif) |
| brush | 데코레이티브 (Ma Shan Zheng) |
| mono | 코드, 좌표 (JetBrains Mono) |
| korean | 한국어 강조 (Noto Serif KR) |
| chinese | 중국어 강조 (Source Han Serif SC) |
| japanese | 일본어 강조 (Noto Serif CJK JP) |
| english | 영어 강조 (Playfair Display) |

### Scale (Tailwind 기본 13단계 매핑)

| Tailwind | size / line-height | 용도 |
|----------|-------------------|------|
| xs | 0.75rem / 1rem | metadata, footnote |
| sm | 0.875rem / 1.25rem | label-sm |
| base | 1rem / 1.5rem | body-md |
| lg | 1.125rem / 1.75rem | body-lg |
| xl | 1.25rem / 1.75rem | sub-heading |
| 2xl | 1.5rem / 2rem | title-lg |
| 3xl | 1.875rem / 2.25rem | headline-md |
| 4xl | 2.25rem / 2.5rem | headline-lg |
| 5xl | 3rem / 1.1 | display-md |
| 6xl | 3.75rem / 1.1 | display-lg |
| 7xl~9xl | 4.5~8rem | hero (별도 케이스) |

### Weight / Tracking / Leading

| 카테고리 | 토큰 |
|---------|------|
| weight | thin(100), light(300), normal(400), medium(500), semibold(600), bold(700), black(900) |
| tracking | tighter(-0.05em), tight(-0.025em), normal(0), wide(0.025em), wider(0.05em), widest(0.1em) |
| leading | none(1), tight(1.1), snug(1.25), normal(1.5), relaxed(1.75), loose(2) |

이 값들은 Tailwind 기본값과 일치하므로 별도 config 불필요.
```

**변경 라인**: ~50줄 삭제 + ~25줄 canonical 추가 + ~50줄 prose 추가 = 약 +25 net

### Phase 2 — `scripts/design-diff.ts` 신설

**파일**: `scripts/design-diff.ts` (신규, ~120 LOC)

```typescript
#!/usr/bin/env tsx
/**
 * design-diff: DESIGN.md ↔ tailwind.config.ts 양방향 검증
 * Exit 1 on any drift, exit 0 if all 47 colors in sync.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import tailwindConfig from '../tailwind.config';

const DESIGN_PATH = resolve(__dirname, '../docs/02-design/DESIGN.md');
const source = readFileSync(DESIGN_PATH, 'utf8');
const fmMatch = source.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error('design-diff: DESIGN.md front matter not found');
  process.exit(1);
}
const design = parseYaml(fmMatch[1]) as { colors: Record<string, string> };

// Tailwind colors flatten — ASCA semantic uses var(--*), kebab-case top-level uses literal
const tailwindColors = (tailwindConfig as any).theme.extend.colors;
const flattened: Record<string, string> = {};
for (const [key, val] of Object.entries(tailwindColors)) {
  if (typeof val === 'string') {
    // Kebab-case literal hex (Obang/Seasonal/Calligraphy/BrandExt)
    flattened[key] = val;
  } else if (val && typeof val === 'object' && 'DEFAULT' in val) {
    // Semantic with foreground (primary/secondary/...)
    flattened[key] = (val as any).DEFAULT;
    if ('foreground' in val) flattened[`${key}-foreground`] = (val as any).foreground;
  }
}

// 분리 검증: literal hex만 비교 (var(--*)는 globals.css에서 별도 lint)
const errors: string[] = [];

// DESIGN → tailwind
for (const [name, hex] of Object.entries(design.colors)) {
  if (!hex.startsWith('#')) continue; // semantic var() skip
  const tw = flattened[name];
  if (!tw) {
    errors.push(`[missing in tailwind] ${name} = ${hex}`);
    continue;
  }
  if (tw.toLowerCase() !== hex.toLowerCase() && !tw.startsWith('var(')) {
    errors.push(`[mismatch] ${name}: DESIGN.md=${hex} tailwind=${tw}`);
  }
}

// Tailwind → DESIGN (literal hex만)
for (const [name, hex] of Object.entries(flattened)) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) continue;
  if (!(name in design.colors)) {
    errors.push(`[missing in DESIGN.md] tailwind ${name} = ${hex}`);
  }
}

const literalCount = Object.values(design.colors).filter(v =>
  typeof v === 'string' && v.startsWith('#')
).length;

if (errors.length > 0) {
  console.error(`design-diff FAILED (${errors.length} issues):`);
  errors.forEach(e => console.error(`  ${e}`));
  process.exit(1);
}
console.log(`✓ design-diff: ${literalCount} literal color tokens in sync`);
```

**`package.json` scripts**:

```json
{
  "scripts": {
    "design:lint": "design.md lint docs/02-design/DESIGN.md",
    "design:diff": "tsx scripts/design-diff.ts",
    "design:wcag": "tsx scripts/design-lint.ts"
  },
  "devDependencies": {
    "@google/design.md": "^0.1.1",
    "yaml": "^2.8.3",
    "tsx": "^4.20.0"
  }
}
```

(tsx 미설치 시만 추가; ts-node 이미 있으면 활용)

### Phase 3 — `scripts/design-lint.ts` (WCAG)

**파일**: `scripts/design-lint.ts` (신규, ~150 LOC)

```typescript
#!/usr/bin/env tsx
/**
 * design-lint: WCAG 2.1 contrast verification for hard-fail pairs.
 * AA 4.5:1 (normal) / 3:1 (large). Decorative-only colors are skipped.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const DESIGN_PATH = resolve(__dirname, '../docs/02-design/DESIGN.md');
const fm = readFileSync(DESIGN_PATH, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
const design = parseYaml(fm!) as { colors: Record<string, string> };

// Resolve var(--name) recursively to actual hex via design.colors lookup
function resolve_(value: string, depth = 0): string {
  if (depth > 5) return value;
  const m = value.match(/^var\(--([\w-]+)\)$/);
  if (!m) return value;
  const ref = design.colors[m[1]];
  return ref ? resolve_(ref, depth + 1) : value;
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = h.length === 3
    ? parseInt(h.split('').map(c => c + c).join(''), 16)
    : parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function relLum([r, g, b]: [number, number, number]): number {
  const norm = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b);
}

function ratio(fg: string, bg: string): number {
  const fgL = relLum(rgb(fg));
  const bgL = relLum(rgb(bg));
  const [light, dark] = fgL > bgL ? [fgL, bgL] : [bgL, fgL];
  return (light + 0.05) / (dark + 0.05);
}

interface Pair { id: string; fg: string; bg: string; min: number; size: 'normal' | 'large' }

const PAIRS: Pair[] = [
  { id: 'P1', fg: 'foreground',           bg: 'background', min: 4.5, size: 'normal' },
  { id: 'P2', fg: 'primary-foreground',   bg: 'primary',    min: 4.5, size: 'normal' },
  { id: 'P3', fg: 'secondary-foreground', bg: 'secondary',  min: 4.5, size: 'normal' },
  { id: 'P4', fg: 'accent-foreground',    bg: 'accent',     min: 4.5, size: 'normal' },
  { id: 'P5', fg: 'highlight-foreground', bg: 'highlight',  min: 4.5, size: 'normal' },
  { id: 'P6', fg: 'destructive-foreground', bg: 'destructive', min: 4.5, size: 'normal' },
  { id: 'P7', fg: 'muted-foreground',     bg: 'muted',      min: 4.5, size: 'normal' },
  { id: 'P8', fg: 'card-foreground',      bg: 'card',       min: 4.5, size: 'normal' },
  { id: 'P9', fg: 'popover-foreground',   bg: 'popover',    min: 4.5, size: 'normal' },
  { id: 'L1', fg: 'foreground',           bg: 'background', min: 3.0, size: 'large' },
  { id: 'L2', fg: 'primary-foreground',   bg: 'primary',    min: 3.0, size: 'large' },
];

const results = PAIRS.map(p => {
  const fgRaw = design.colors[p.fg];
  const bgRaw = design.colors[p.bg];
  if (!fgRaw || !bgRaw) {
    return { ...p, status: 'MISSING' as const, ratio: 0 };
  }
  const fgHex = resolve_(fgRaw);
  const bgHex = resolve_(bgRaw);
  if (!fgHex.startsWith('#') || !bgHex.startsWith('#')) {
    return { ...p, status: 'UNRESOLVED' as const, ratio: 0 };
  }
  const r = ratio(fgHex, bgHex);
  return { ...p, status: r >= p.min ? 'PASS' : 'FAIL', ratio: r, fgHex, bgHex };
});

const fails = results.filter(r => r.status === 'FAIL' || r.status === 'MISSING' || r.status === 'UNRESOLVED');

console.log('WCAG Contrast Lint Report');
console.log('─'.repeat(72));
results.forEach(r => {
  const icon = r.status === 'PASS' ? '✓' : '✗';
  const ratioStr = r.ratio.toFixed(2);
  console.log(`  ${icon} ${r.id} ${r.fg.padEnd(22)} on ${r.bg.padEnd(15)} ${ratioStr.padStart(6)}:1 (≥${r.min}, ${r.size}) ${r.status}`);
});
console.log('─'.repeat(72));
console.log(`Total: ${results.length}, Pass: ${results.length - fails.length}, Fail: ${fails.length}`);

if (fails.length > 0) {
  console.error(`\n❌ ${fails.length} pair(s) failed WCAG ${fails[0].min}:1 — see DESIGN.md prose for decorative exceptions.`);
  process.exit(1);
}
console.log('\n✓ All hard-fail pairs pass WCAG AA.');
```

**DESIGN.md prose 추가** (Decorative-only 명시):

```markdown
## Color Pair Policy (WCAG)

**Hard-fail pairs (verified by `npm run design:wcag`)**:
- foreground ↔ background (text contrast)
- primary ↔ primary-foreground, secondary ↔ secondary-foreground
- accent ↔ accent-foreground (hover states)
- highlight ↔ highlight-foreground (gold emphasis)
- destructive, muted, card, popover and their `*-foreground` pairs

**Decorative-only (excluded from contrast lint)**:
- Obang 5색 (east-wood, south-fire, center-earth, west-metal, north-water): 일러스트레이션·아이콘 전용
- Seasonal 4색 (spring-blossom, summer-jade, autumn-gold, winter-snow): 카테고리 라벨 장식
- Calligraphy 4색 (bamboo-green, silk-cream, lacquer-black, vermillion): 작품 메타데이터 색상
- Brand Extended 6색 (terra-red, sage-green, spring-green, brand-gold, medium-orchid, royal-blue): brand 페이지 정체성 표시

> **Rationale**: 전통 동아시아 5방위·계절·서예 색상은 의미 전달·장식 목적의 시각 표현이지 본문 텍스트 contrast 대상 아님. 텍스트 위에 사용 시 shadcn semantic 슬롯의 foreground 색을 함께 적용해야 한다.
```

### Phase 4 — CI 통합

**파일**: `.github/workflows/ci.yml` (Code Quality job, line 의존)

#### 변경 (예시 위치)

```yaml
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Type checking
        run: npm run type-check
      - name: Linting
        run: npm run lint
      - name: Code formatting check
        run: npm run format:check  # (있다면)
      # === NEW: Design system gates ===
      - name: Design lint (advisory)
        run: npm run design:lint || true
      - name: Design diff (hard fail)
        run: npm run design:diff
      - name: WCAG contrast lint (hard fail)
        run: npm run design:wcag
```

### Phase 5 — design-validator + (보류) DTCG

- **design-validator agent 호출**: `Task subagent_type=bkit:design-validator` 또는 직접 docs/scripts 검증 → 점수 ≥90 확인
- 미달 시 prose/페어 매핑 보강
- DTCG export wrapper는 별도 PDCA로 분리 (`asca-dtcg-export`)

---

## 3. 구현 순서 (Build Order)

```
1. Phase 1 (typography canonical)        → DESIGN.md 단독 수정, 검증: npx design.md lint
2. Phase 2 (design-diff.ts)              → 스크립트 작성, devDeps 설치, 검증: npm run design:diff
3. Phase 3 (design-lint.ts WCAG)         → 스크립트 작성, prose 보강, 검증: npm run design:wcag
4. Phase 4 (CI 통합)                     → ci.yml 3 step 추가, push 후 Actions 확인
5. Phase 5 (design-validator 재검증)     → agent 호출, 점수 ≥90 또는 보강
```

각 Phase 종료마다 `npm run lint` + `type-check` + `build` 회귀 0건 확인.

---

## 4. 검증 (Verification)

### 4.1 Phase별 검증 명령

| Phase | 명령 | 기대 |
|-------|------|------|
| 1 | `npx design.md lint docs/02-design/DESIGN.md` | 0 errors |
| 2 | `npm run design:diff` | `✓ N literal color tokens in sync` |
| 3 | `npm run design:wcag` | `✓ All hard-fail pairs pass WCAG AA` |
| 4 | GitHub Actions workflow run | 모든 step PASS |
| 5 | design-validator agent | 점수 ≥90 |

### 4.2 회귀 검증 (각 Phase 후)

| 명령 | 기대 |
|------|------|
| `npm run lint` | 0 errors / 변동 없음 |
| `npm run type-check` | 0 errors |
| `npm run build` | 성공 |
| 기존 jest | 회귀 없음 |

---

## 5. 파일 변경 요약

```
NEW   scripts/design-diff.ts                       (~120 LOC)
NEW   scripts/design-lint.ts                       (~150 LOC)
MOD   docs/02-design/DESIGN.md                     (typography canonical + 2 prose 섹션)
MOD   package.json                                 (3 scripts + 3 devDeps)
MOD   package-lock.json                            (devDep install)
MOD   .github/workflows/ci.yml                     (+3 steps in Code Quality)
MOD   .commit_message.txt                          (단계별 갱신)
MOD   .bkit-memory.json                            (parallelFeatures phase 갱신)
```

---

## 6. 위험 완화 (Risk Mitigation)

| 위험 | 발견 시점 | 완화책 |
|-----|----------|-------|
| `tsx` import에서 Next.js path alias 미해석 | Phase 2 | `tsx`는 `tsconfig.json`을 자동 인식 — 미동작 시 절대경로 사용 또는 `--tsconfig` 플래그 명시 |
| `tailwind.config.ts` 가 기타 plugin import (esp. shadcn-ui plugin) → 런타임 실패 | Phase 2 | `try/catch` 후 plugin 모듈만 mock 또는 config의 `theme.extend.colors`만 별도 export |
| WCAG P5 (highlight=#ffcc00 / highlight-foreground=#1a1a1a) PASS 확신 못함 | Phase 3 | 검증 결과 fail 시 highlight-foreground를 `#000` 으로 보정 검토 (현 #1a1a1a → #000은 미세 차이) |
| `warning-cleanup-cycle-2` 동시 작업의 package.json/ci.yml 충돌 | Phase 2/4 | 변경 직전 `git stash` + `git pull` rebase, 또는 작업 윈도우 분리 |
| design-validator 점수 90 미달 | Phase 5 | 미달 항목 listing 후 prose 보강 또는 페어 매핑 추가 |

---

## 7. DoD (Plan에서 계승)

- [ ] DESIGN.md typography canonical + `design:lint` 0 errors
- [ ] `scripts/design-diff.ts` 0 drift
- [ ] `scripts/design-lint.ts` WCAG AA 모든 hard-fail pair PASS
- [ ] CI 3 step 추가 + 첫 PR run PASS
- [ ] design-validator 점수 ≥90
- [ ] `npm run lint` / `type-check` / `build` / jest 회귀 0건
- [ ] memory `project_asca_design_system.md` Phase 3 완료로 갱신
- [ ] `.commit_message.txt` 한 줄 기록

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-25 | 초기 Design 작성 — Plan §7 4가지 결정 (D1 prose, D2 tsx runtime, D3 9+4 페어 + decorative exception, D4 DTCG 보류), Phase 1~5 파일 diff 명세 |
