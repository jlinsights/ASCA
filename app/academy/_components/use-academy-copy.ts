'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'
import { localizeAcademy, type AcademyCopy } from './academy-copy'

export interface AcademyText {
  /** 사실 데이터(과정·수강료·시간표) — 고른 언어 */
  copy: AcademyCopy
  /** 화면 틀 글자 — ac.ui.<name> */
  ui: (name: string) => string
  language: Language
}

/** 강좌 화면의 글자를 고른 언어로. ko 표에도 같은 한국어가 있어 모든 언어가 t() 하나로 간다 */
export function useAcademyText(): AcademyText {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const copy = useMemo(() => localizeAcademy(key => t(key)), [t])
  return { copy, ui: name => t(`ac.ui.${name}`), language }
}
