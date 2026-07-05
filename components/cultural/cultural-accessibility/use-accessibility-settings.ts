'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    ...DEFAULT_ACCESSIBILITY_SETTINGS,
    ...initialSettings,
  })

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

    // Apply color scheme
    if (accessibilitySettings.colorScheme !== 'auto') {
      root.classList.toggle('dark', accessibilitySettings.colorScheme === 'dark')
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
    setAccessibilitySettings(prev => ({ ...prev, [key]: value }))
  }

  const updateLanguageSetting = (key: keyof LanguageSettings, value: any) => {
    setLanguageSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateCulturalSetting = (key: keyof CulturalContext, value: any) => {
    setCulturalSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetAllSettings = () => {
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
