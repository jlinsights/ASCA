'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { localizePath, splitLocale } from './locale-routing'

/**
 * 언어 접두사를 뗀 현재 경로. /en/history 에서도 '/history' — 메뉴 활성 표시·경로 비교용.
 * usePathname 은 rewrite 때 서버와 브라우저가 다른 값(/history ↔ /en/history)을 줄 수 있는데,
 * 접두사를 떼면 둘이 같아져 hydration 이 어긋나지 않는다.
 */
export function useRoutePath(): string {
  return splitLocale(usePathname() ?? '/').path
}

/** 지금 언어의 주소로 바꾸는 함수. 번역 안 된 페이지·외부 주소는 그대로 둔다 */
export function useLocalizedHref(): (href: string) => string {
  const { language } = useLanguage()
  return useCallback((href: string) => localizePath(href, language), [language])
}
