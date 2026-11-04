import type { Language } from '../types'
import ko from '../locales/ko/archive'
import en from '../locales/en/archive'
import ja from '../locales/ja/archive'
import zh from '../locales/zh/archive'

export const archiveTranslations: Record<Language, Record<string, string>> = { ko, en, ja, zh }
