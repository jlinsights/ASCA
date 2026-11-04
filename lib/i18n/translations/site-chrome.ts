import type { TranslationData } from '../types'
import ko from '../locales/ko/site-chrome'
import en from '../locales/en/site-chrome'
import ja from '../locales/ja/site-chrome'
import zh from '../locales/zh/site-chrome'

// 모든 페이지에 붙는 헤더·푸터 문구. 'site' 접두어로 기존 번역 표(navigation·legacy)와 키가 겹치지 않게 한다.
// 링크 주소(예: /artists?type=공모작가)는 언어와 무관하므로 여기 두지 않는다.
// 기관명은 각 기관의 공식 영문·현지 표기를 따른다.
export const siteChromeTranslations: TranslationData = { ko, en, ja, zh }
