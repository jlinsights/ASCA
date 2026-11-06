'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'
import { localizeMembership, type MembershipCopy } from './membership-copy'

export interface MembershipText {
  /** 사실 데이터(등급·금액·요건·근거 조문) — 고른 언어 */
  copy: MembershipCopy
  /** 화면 틀 글자 — mb.ui.<name> */
  ui: (name: string) => string
  language: Language
}

/** 회원 안내 화면의 글자를 고른 언어로. ko 표에도 같은 한국어가 있어 모든 언어가 t() 하나로 간다 */
export function useMembershipText(): MembershipText {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const copy = useMemo(() => localizeMembership(key => t(key)), [t])
  return { copy, ui: name => t(`mb.ui.${name}`), language }
}
