import type { TranslationData } from '../types'
import ko from '../locales/ko/exhibitions'
import en from '../locales/en/exhibitions'
import ja from '../locales/ja/exhibitions'
import zh from '../locales/zh/exhibitions'

// /exhibitions 와 하위 페이지(현재·예정·지난·온라인) 문구. 'ex' 접두어. 중국어는 번체.
// {n} 은 컴포넌트에서 숫자로 바꾼다.
export const exhibitionsTranslations: TranslationData = { ko, en, ja, zh }
