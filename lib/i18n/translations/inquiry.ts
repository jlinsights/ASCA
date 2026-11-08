import type { TranslationData } from '../types'
import ko from '../locales/ko/inquiry'
import en from '../locales/en/inquiry'
import ja from '../locales/ja/inquiry'
import zh from '../locales/zh/inquiry'

// /contact#inquiry 문의서 화면 문구 (2026-11-01, #214).
// 사무국에 보내는 글(메일 제목·본문)은 한국어로 고정한다 — 받는 사람이 한국어로 읽는다.
// {email}·{link} 는 화면에서 링크로 바뀌는 자리다.
export const inquiryTranslations: TranslationData = { ko, en, ja, zh }
