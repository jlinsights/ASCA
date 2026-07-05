// Types for accessibility and internationalization

export interface AccessibilitySettings {
  fontSize: number
  fontFamily: 'default' | 'dyslexic' | 'serif' | 'sans'
  lineHeight: number
  letterSpacing: number
  contrast: 'normal' | 'high' | 'higher'
  colorScheme: 'light' | 'dark' | 'auto'
  motionReduced: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  audioDescriptions: boolean
  captionsEnabled: boolean
  focusVisible: boolean
}

export interface LanguageSettings {
  primary: 'ko' | 'zh-CN' | 'zh-TW' | 'ja' | 'en'
  secondary?: 'ko' | 'zh-CN' | 'zh-TW' | 'ja' | 'en'
  romanization: boolean
  pronunciation: boolean
  translation: 'inline' | 'hover' | 'toggle'
  direction: 'ltr' | 'rtl' | 'auto'
}

export interface CulturalContext {
  displayNames: 'traditional' | 'simplified' | 'romanized' | 'mixed'
  dateFormat: 'gregorian' | 'lunar' | 'both'
  timeFormat: '12h' | '24h'
  numberFormat: 'western' | 'chinese' | 'local'
  culturalExplanations: boolean
  historicalContext: boolean
}

export interface CulturalAccessibilityProps {
  initialSettings?: Partial<AccessibilitySettings>
  initialLanguage?: Partial<LanguageSettings>
  initialCultural?: Partial<CulturalContext>
  onSettingsChange?: (settings: AccessibilitySettings) => void
  onLanguageChange?: (language: LanguageSettings) => void
  onCulturalChange?: (cultural: CulturalContext) => void
  className?: string
}

export type ActivePanel = 'accessibility' | 'language' | 'cultural'
