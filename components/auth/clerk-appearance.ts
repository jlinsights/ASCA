'use client'

import { useTheme } from 'next-themes'

// Clerk 위젯을 카드가 아닌 페이지 위의 평평한 폼으로 보이게 한다.
// 색은 Clerk 변수로 준다 — Clerk 는 동의 문구·자리표시자·보조 글자를 자기 변수로 칠하므로
// Tailwind 클래스만으로는 다크 모드에서 그 글자들이 남색 위에 묻힌다.
// 제목과 반대편 링크는 AuthShell 이 그리므로 Clerk 의 헤더·하단은 숨긴다.

const INK_LIGHT = {
  colorPrimary: '#0b1733', // navy-900
  colorTextOnPrimaryBackground: '#fbf8ef',
  colorText: '#0b1733',
  colorTextSecondary: '#424a5e', // stone-700
  colorBackground: '#fbf8ef', // paper
  colorInputBackground: '#ffffff',
  colorInputText: '#0b1733',
  colorNeutral: '#0b1733',
  colorDanger: '#a8201a', // seal-red
  colorSuccess: '#3f7a4e',
} as const

const INK_DARK = {
  colorPrimary: '#d4a84a', // gold-500 — 남색 바탕 위 주 버튼
  colorTextOnPrimaryBackground: '#0b1733',
  colorText: '#fbf8ef',
  colorTextSecondary: '#9eb0d6', // navy-300
  colorBackground: '#070d1a', // navy-950
  colorInputBackground: '#0b1733',
  colorInputText: '#fbf8ef',
  colorNeutral: '#fbf8ef',
  colorDanger: '#c94a3f', // seal-red-soft
  colorSuccess: '#3f7a4e',
} as const

const LAYOUT = {
  rootBox: 'w-full',
  cardBox: 'w-full max-w-none shadow-none border-0 rounded-none',
  card: 'w-full shadow-none border-0 p-0 gap-6',
  header: 'hidden',
  footer: 'hidden',
  socialButtonsBlockButton: 'h-11 shadow-none',
  socialButtonsBlockButtonText: 'text-sm font-medium',
  dividerText: 'text-xs tracking-[0.18em]',
  formFieldLabel: 'text-[0.8125rem] font-medium',
  formFieldInput: 'h-11 shadow-none',
  formButtonPrimary:
    'h-11 bg-none text-sm font-semibold normal-case tracking-normal shadow-none after:hidden',
} as const

export function getClerkAuthAppearance(isDark: boolean) {
  return {
    variables: {
      ...(isDark ? INK_DARK : INK_LIGHT),
      borderRadius: '0.375rem',
      fontFamily: "'Pretendard', var(--font-noto-sans-kr), system-ui, sans-serif",
      fontSize: '0.9375rem',
    },
    elements: LAYOUT,
  }
}

export function useClerkAuthAppearance() {
  const { resolvedTheme } = useTheme()
  return getClerkAuthAppearance(resolvedTheme === 'dark')
}
