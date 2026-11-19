import type { TranslationData } from '../types'
import ko from '../locales/ko/regulations'
import en from '../locales/en/regulations'
import ja from '../locales/ja/regulations'
import zh from '../locales/zh/regulations'

// /regulations (정관 및 규정) 화면 문구. 규정 본문은 regulations/*.md 의 한국어 원문과
// regulations/i18n/{en,ja,zh} 의 참고용 번역본이고,
// 여기에는 메뉴·목차·안내 같은 화면 틀과 규정 이름만 둔다.
// zh 는 사이트 다른 화면처럼 번체(臺灣) 표기.
export const regulationsTranslations: TranslationData = { ko, en, ja, zh }
