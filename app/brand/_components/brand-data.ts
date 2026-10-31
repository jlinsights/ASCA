// 브랜드·스타일 가이드(/brand) 데이터. 값은 ASCA Ink System 토큰과 같아야 한다.
// 정본: docs/02-design/DESIGN.md · app/globals.css · tailwind.config.ts
// 화면 문구는 lib/i18n/translations/brand.ts 의 키로 둔다. 여기에는 번역하지 않는 상수만 둔다.

export interface BrandSection {
  id: string
  navKey: string
}

export const BRAND_SECTIONS: readonly BrandSection[] = [
  { id: 'essence', navKey: 'brandNavEssence' },
  { id: 'names', navKey: 'brandNavNames' },
  { id: 'logo', navKey: 'brandNavLogo' },
  { id: 'color', navKey: 'brandNavColor' },
  { id: 'type', navKey: 'brandNavType' },
  { id: 'voice', navKey: 'brandNavVoice' },
  { id: 'elements', navKey: 'brandNavElements' },
  { id: 'components', navKey: 'brandNavComponents' },
  { id: 'imagery', navKey: 'brandNavImagery' },
]

/** 협회 슬로건 — 모든 언어에서 한자 그대로 둔다(BRAND.md §4). */
export const BRAND_SLOGAN = '法古創新 · 人書俱老'

export interface ClassicalCompound {
  tc: string
  glossKey: string
}

export const CLASSICAL_COMPOUNDS: readonly ClassicalCompound[] = [
  { tc: '法古創新', glossKey: 'brandCompound1' },
  { tc: '人書俱老', glossKey: 'brandCompound2' },
  { tc: '東洋書藝', glossKey: 'brandCompound3' },
  { tc: '行雲流水', glossKey: 'brandCompound4' },
]

export interface OfficialName {
  labelKey: string
  value: string
  /** 표기의 언어 — 화면 언어와 달라도 글꼴·읽기가 맞도록 lang 속성으로 단다. */
  lang: 'ko' | 'zh-Hant' | 'en'
  useKey: string
}

export const OFFICIAL_NAMES: readonly OfficialName[] = [
  {
    labelKey: 'brandNameKoFull',
    value: '사단법인 동양서예협회',
    lang: 'ko',
    useKey: 'brandNameUseLegal',
  },
  {
    labelKey: 'brandNameKoShort',
    value: '동양서예협회',
    lang: 'ko',
    useKey: 'brandNameUseGeneral',
  },
  {
    labelKey: 'brandNameHanja',
    value: '東洋書藝協會',
    lang: 'zh-Hant',
    useKey: 'brandNameUseCatalog',
  },
  {
    labelKey: 'brandNameHanjaFull',
    value: '社團法人 東洋書藝協會',
    lang: 'zh-Hant',
    useKey: 'brandNameUseOfficial',
  },
  {
    labelKey: 'brandNameEnFull',
    value: 'The Asian Society of Calligraphic Arts',
    lang: 'en',
    useKey: 'brandNameUseEnglish',
  },
  { labelKey: 'brandNameEnShort', value: 'ASCA', lang: 'en', useKey: 'brandNameUseShort' },
]

export interface LogoVariant {
  src: string
  labelKey: string
  ground: 'paper' | 'ink'
}

export const LOGO_VARIANTS: readonly LogoVariant[] = [
  { src: '/logo/asca-logo-navy.png', labelKey: 'brandLogoNavy', ground: 'paper' },
  { src: '/logo/asca-logo-white.png', labelKey: 'brandLogoWhite', ground: 'ink' },
  { src: '/logo/asca-logo-gold.png', labelKey: 'brandLogoGold', ground: 'ink' },
]

export const LOGO_RULE_KEYS = [
  'brandLogoRule1',
  'brandLogoRule2',
  'brandLogoRule3',
  'brandLogoRule4',
] as const

export interface Swatch {
  name: string
  hex: string
  /** 이 색 위에 올릴 글자색 — WCAG AA 를 넘는 쪽 */
  on: 'light' | 'dark'
}

export interface CoreSwatch extends Swatch {
  usageKey: string
}

export const CORE_SWATCHES: readonly CoreSwatch[] = [
  { name: 'Navy 900 · 深藍', hex: '#0b1733', on: 'light', usageKey: 'brandSwatchNavy' },
  { name: 'Gold 500 · 正金', hex: '#d4a84a', on: 'dark', usageKey: 'brandSwatchGold' },
  { name: 'Paper · 宣紙', hex: '#fbf8ef', on: 'dark', usageKey: 'brandSwatchPaper' },
  { name: 'Seal Red · 朱印', hex: '#a8201a', on: 'light', usageKey: 'brandSwatchSeal' },
]

export interface Ladder {
  titleKey: string
  steps: readonly Swatch[]
}

export const COLOR_LADDERS: readonly Ladder[] = [
  {
    titleKey: 'brandColorNavy',
    steps: [
      { name: '950', hex: '#070d1a', on: 'light' },
      { name: '900', hex: '#0b1733', on: 'light' },
      { name: '800', hex: '#142244', on: 'light' },
      { name: '700', hex: '#1d2e5c', on: 'light' },
      { name: '600', hex: '#2a3f7a', on: 'light' },
      { name: '500', hex: '#3a54a0', on: 'light' },
      { name: '400', hex: '#6a82c0', on: 'dark' },
      { name: '300', hex: '#9eb0d6', on: 'dark' },
    ],
  },
  {
    titleKey: 'brandColorGold',
    steps: [
      { name: '900', hex: '#6b4e14', on: 'light' },
      { name: '800', hex: '#8a661c', on: 'light' },
      { name: '700', hex: '#a77d24', on: 'dark' },
      { name: '600', hex: '#c89729', on: 'dark' },
      { name: '500', hex: '#d4a84a', on: 'dark' },
      { name: '400', hex: '#e2c074', on: 'dark' },
      { name: '300', hex: '#ecd6a1', on: 'dark' },
      { name: '200', hex: '#f5e9c8', on: 'dark' },
      { name: '100', hex: '#fbf5e4', on: 'dark' },
    ],
  },
  {
    titleKey: 'brandColorStone',
    steps: [
      { name: '900', hex: '#1a1d2a', on: 'light' },
      { name: '700', hex: '#424a5e', on: 'light' },
      { name: '500', hex: '#6b7385', on: 'light' },
      { name: '300', hex: '#b8bccb', on: 'dark' },
      { name: '200', hex: '#d7dae3', on: 'dark' },
      { name: '100', hex: '#edeff3', on: 'dark' },
    ],
  },
]

export interface SemanticRole {
  token: string
  light: string
  dark: string
}

/** shadcn 시맨틱 슬롯 — app/globals.css :root / .dark 와 같은 값 */
export const SEMANTIC_ROLES: readonly SemanticRole[] = [
  { token: 'background', light: '#fbf8ef', dark: '#070d1a' },
  { token: 'foreground', light: '#0b1733', dark: '#fbf8ef' },
  { token: 'card', light: '#ffffff', dark: '#0b1733' },
  { token: 'primary', light: '#0b1733', dark: '#d4a84a' },
  { token: 'accent', light: '#d4a84a', dark: '#e2c074' },
  { token: 'muted', light: '#f4efdd', dark: '#142244' },
  { token: 'muted-foreground', light: '#424a5e', dark: '#9eb0d6' },
  { token: 'border', light: '#e5e0ce', dark: '#1f2b4c' },
  { token: 'destructive', light: '#a8201a', dark: '#c94a3f' },
]

export interface TypeSpecimen {
  roleKey: string
  family: string
  /** 견본 글자. null 이면 화면 언어 문장(brandTypeSample)을 쓴다. */
  sample: string | null
  lang?: 'ko' | 'zh-Hant' | 'en'
  className: string
}

export const TYPE_SPECIMENS: readonly TypeSpecimen[] = [
  {
    roleKey: 'brandTypeLatin',
    family: 'Playfair Display',
    sample: 'The Asian Society of Calligraphic Arts',
    lang: 'en',
    className: 'brand-spec--latin',
  },
  {
    roleKey: 'brandTypeHanja',
    family: 'Noto Serif TC · Source Han Serif TC',
    sample: '東洋書藝協會',
    lang: 'zh-Hant',
    className: 'brand-spec--hanja',
  },
  {
    roleKey: 'brandTypeKrSerif',
    family: 'Noto Serif KR',
    sample: '동양서예협회',
    lang: 'ko',
    className: 'brand-spec--kr-serif',
  },
  {
    roleKey: 'brandTypeSans',
    family: 'Pretendard',
    sample: null,
    className: 'brand-spec--sans',
  },
]

/** 크기 단계(px) — colors_and_type.css --text-* */
export const TYPE_SCALE: readonly number[] = [12, 14, 16, 18, 20, 24, 30, 36, 48, 64, 80, 112]

export const TYPE_RULE_KEYS = ['brandTypeRule1', 'brandTypeRule2', 'brandTypeRule3'] as const

export const VOICE_DO_KEYS = ['brandVoiceDo1', 'brandVoiceDo2', 'brandVoiceDo3'] as const
export const VOICE_DONT_KEYS = ['brandVoiceDont1', 'brandVoiceDont2', 'brandVoiceDont3'] as const

export interface RadiusStep {
  name: string
  px: number
}

export const RADII: readonly RadiusStep[] = [
  { name: 'none', px: 0 },
  { name: 'xs', px: 2 },
  { name: 'sm', px: 4 },
  { name: 'base', px: 6 },
  { name: 'md', px: 10 },
  { name: 'xl', px: 20 },
]

export const SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export interface MotionStep {
  name: string
  ms: number
}

export const MOTION: readonly MotionStep[] = [
  { name: 'fast', ms: 150 },
  { name: 'normal', ms: 260 },
  { name: 'slow', ms: 420 },
  { name: 'brush', ms: 720 },
]

export const MOTION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

export interface PhotoTreatment {
  modifier: 'ink' | 'paper' | 'warm'
  labelKey: string
}

export const PHOTO_TREATMENTS: readonly PhotoTreatment[] = [
  { modifier: 'ink', labelKey: 'brandPhotoInk' },
  { modifier: 'paper', labelKey: 'brandPhotoPaper' },
  { modifier: 'warm', labelKey: 'brandPhotoWarm' },
]

/** 사진 처리 견본 — 저장소에 이미 있는 서예 사진 */
export const PHOTO_SAMPLE = '/images/programs/calligraphy-scene-2.jpg'
