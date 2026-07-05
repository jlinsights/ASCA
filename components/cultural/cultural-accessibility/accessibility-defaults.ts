import type { AccessibilitySettings, CulturalContext, LanguageSettings } from './types'

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 16,
  fontFamily: 'default',
  lineHeight: 1.6,
  letterSpacing: 0,
  contrast: 'normal',
  colorScheme: 'auto',
  motionReduced: false,
  screenReader: false,
  keyboardNavigation: true,
  audioDescriptions: false,
  captionsEnabled: false,
  focusVisible: true,
}

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  primary: 'ko',
  romanization: true,
  pronunciation: false,
  translation: 'hover',
  direction: 'ltr',
}

export const DEFAULT_CULTURAL_SETTINGS: CulturalContext = {
  displayNames: 'mixed',
  dateFormat: 'both',
  timeFormat: '24h',
  numberFormat: 'local',
  culturalExplanations: true,
  historicalContext: true,
}

// Language options with native names
export const languageOptions = [
  { code: 'ko', name: '한국어', nativeName: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: '简体中文', nativeName: 'Simplified Chinese', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', nativeName: 'Traditional Chinese', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', nativeName: 'Japanese', flag: '🇯🇵' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
]

// Font family options optimized for different scripts
export const fontFamilyOptions = [
  {
    id: 'default',
    name: 'Default',
    description: 'Optimized for current language',
    css: 'font-family: var(--font-calligraphy)',
  },
  {
    id: 'serif',
    name: 'Traditional Serif',
    description: 'Classical typography for formal content',
    css: 'font-family: var(--font-korean)',
  },
  {
    id: 'sans',
    name: 'Modern Sans',
    description: 'Clean and readable for digital content',
    css: 'font-family: var(--font-sans)',
  },
  {
    id: 'dyslexic',
    name: 'Dyslexic Friendly',
    description: 'Optimized for reading difficulties',
    css: 'font-family: "OpenDyslexic", sans-serif',
  },
]
