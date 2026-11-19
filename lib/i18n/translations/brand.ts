import type { TranslationData } from '../types'
import ko from '../locales/ko/brand'
import en from '../locales/en/brand'
import ja from '../locales/ja/brand'
import zh from '../locales/zh/brand'

// 브랜드·스타일 가이드(/brand) 문구. 'brand' 접두어로 다른 표와 키가 겹치지 않게 한다.
// 협회명·슬로건·사자성어 같은 한자 브랜드 상수는 번역하지 않고 컴포넌트에 그대로 둔다.
// 중국어는 번체(사이트 표기 통일, 2026-10-11 결정).
export const brandTranslations: TranslationData = { ko, en, ja, zh }
