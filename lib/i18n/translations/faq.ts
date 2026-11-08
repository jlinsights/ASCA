import type { TranslationData } from '../types'
import ko from '../locales/ko/faq'
import en from '../locales/en/faq'
import ja from '../locales/ja/faq'
import zh from '../locales/zh/faq'

// /faq 화면 문구. 질문·답 본문은 lib/content/site-faq.ts(한국어, 규정 근거 포함)가 단일 출처이고,
// 영어·일본어·중국어 번역은 site-faq-en·ja·zh.ts 에 id 로 붙는다(site-faq-locale.ts).
export const faqTranslations: TranslationData = { ko, en, ja, zh }
