'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'
import type {
  AccessibilitySettings,
  ActivePanel,
  CulturalContext,
  CulturalAccessibilityProps,
  LanguageSettings,
} from './types'
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_CULTURAL_SETTINGS,
  DEFAULT_LANGUAGE_SETTINGS,
} from './accessibility-defaults'

type UseAccessibilitySettingsParams = Pick<
  CulturalAccessibilityProps,
  | 'initialSettings'
  | 'initialLanguage'
  | 'initialCultural'
  | 'onSettingsChange'
  | 'onLanguageChange'
  | 'onCulturalChange'
>

export function useAccessibilitySettings({
  initialSettings = {},
  initialLanguage = {},
  initialCultural = {},
  onSettingsChange,
  onLanguageChange,
  onCulturalChange,
}: UseAccessibilitySettingsParams) {
  const { theme, setTheme } = useTheme()
  const [settings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    ...DEFAULT_ACCESSIBILITY_SETTINGS,
    ...initialSettings,
  })
  // Page-local accessibility options must not overwrite the global, explicit theme choice.
  const accessibilitySettings = useMemo<AccessibilitySettings>(
    () => ({ ...settings, colorScheme: theme === 'dark' ? 'dark' : 'light' }),
    [settings, theme]
  )

  const [languageSettings, setLanguageSettings] = useState<LanguageSettings>({
    ...DEFAULT_LANGUAGE_SETTINGS,
    ...initialLanguage,
  })

  const [culturalSettings, setCulturalSettings] = useState<CulturalContext>({
    ...DEFAULT_CULTURAL_SETTINGS,
    ...initialCultural,
  })

  const [activePanel, setActivePanel] = useState<ActivePanel>('accessibility')
  const [isMinimized, setIsMinimized] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Apply font settings
    root.style.fontSize = `${accessibilitySettings.fontSize}px`
    root.style.lineHeight = accessibilitySettings.lineHeight.toString()
    root.style.letterSpacing = `${accessibilitySettings.letterSpacing}px`

    // Apply contrast settings
    switch (accessibilitySettings.contrast) {
      case 'high':
        root.style.filter = 'contrast(150%)'
        break
      case 'higher':
        root.style.filter = 'contrast(200%)'
        break
      default:
        root.style.filter = 'none'
    }

    // Apply motion reduction
    if (accessibilitySettings.motionReduced) {
      root.style.setProperty('--transition-duration', '0s')
    } else {
      root.style.removeProperty('--transition-duration')
    }

    // Apply focus visibility
    if (accessibilitySettings.focusVisible) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }

    // Notify parent of changes
    onSettingsChange?.(accessibilitySettings)

    // 설정 변경·언마운트 시 전역 상태 복원 (재실행 시엔 본문이 즉시 재적용)
    return () => {
      root.style.removeProperty('font-size')
      root.style.removeProperty('line-height')
      root.style.removeProperty('letter-spacing')
      root.style.removeProperty('filter')
      root.style.removeProperty('--transition-duration')
      root.classList.remove('focus-visible')
    }
  }, [accessibilitySettings, onSettingsChange])

  // Apply language settings
  useEffect(() => {
    const root = document.documentElement

    // Set language and direction
    root.lang = languageSettings.primary
    root.dir = languageSettings.direction

    onLanguageChange?.(languageSettings)
  }, [languageSettings, onLanguageChange])

  // Apply cultural settings
  useEffect(() => {
    onCulturalChange?.(culturalSettings)
  }, [culturalSettings, onCulturalChange])

  const updateAccessibilitySetting = (key: keyof AccessibilitySettings, value: any) => {
    if (key === 'colorScheme') {
      // Old 'auto' values mean the new light default; OS changes never switch the site.
      setTheme(value === 'dark' ? 'dark' : 'light')
      return
    }
    setAccessibilitySettings(prev => ({ ...prev, [key]: value }))
  }

  const updateLanguageSetting = (key: keyof LanguageSettings, value: any) => {
    setLanguageSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateCulturalSetting = (key: keyof CulturalContext, value: any) => {
    setCulturalSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetAllSettings = () => {
    setTheme('light')
    setAccessibilitySettings({ ...DEFAULT_ACCESSIBILITY_SETTINGS })
    setLanguageSettings({ ...DEFAULT_LANGUAGE_SETTINGS })
    setCulturalSettings({ ...DEFAULT_CULTURAL_SETTINGS })
  }

  return {
    accessibilitySettings,
    languageSettings,
    culturalSettings,
    activePanel,
    setActivePanel,
    isMinimized,
    setIsMinimized,
    panelRef,
    updateAccessibilitySetting,
    updateLanguageSetting,
    updateCulturalSetting,
    resetAllSettings,
  }
}
