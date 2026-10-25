import type { Language } from '@/lib/i18n/types'

export const portraitCopy: Record<Language, { pending: string }> = {
  ko: { pending: '초상 준비 중' },
  en: { pending: 'Portrait not yet available' },
  ja: { pending: '肖像写真を準備中' },
  zh: { pending: '肖像照片準備中' },
}
