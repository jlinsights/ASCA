'use client'

import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { enUS, jaJP, koKR, zhTW } from '@clerk/localizations'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n/types'

// 사이트 중국어 문구는 번체(歡迎·帳號)라 Clerk 도 zh-TW 를 쓴다.
export const CLERK_LOCALIZATIONS = { ko: koKR, en: enUS, ja: jaJP, zh: zhTW } satisfies Record<
  Language,
  unknown
>

interface LocalizedClerkProviderProps {
  children: ReactNode
}

// Clerk 위젯 언어를 사이트 언어 선택에 맞춘다. 예전에는 koKR 고정이라
// 영어 화면에서도 로그인 폼만 한국어로 나왔다.
export function LocalizedClerkProvider({ children }: LocalizedClerkProviderProps) {
  const { language } = useLanguage()
  return (
    <ClerkProvider
      localization={CLERK_LOCALIZATIONS[language]}
      signInUrl='/sign-in'
      signUpUrl='/sign-up'
      afterSignOutUrl='/'
    >
      {children}
    </ClerkProvider>
  )
}
