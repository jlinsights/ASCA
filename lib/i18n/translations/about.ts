import type { TranslationData } from '../types'
import ko from '../locales/ko/about'
import en from '../locales/en/about'
import ja from '../locales/ja/about'
import zh from '../locales/zh/about'

// 소개(/introductions)·연혁(/history) 페이지 문구. 'intro'·'history' 접두어로 다른 표와 키가 겹치지 않게 한다.
// 협회 소개 본문은 길어서 app/introductions/_components/association-intro.ts 에 따로 둔다.
// 중국어는 번체(사이트 표기 통일, 2026-10-11 결정).
export const aboutTranslations: TranslationData = { ko, en, ja, zh }
