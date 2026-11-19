import type { TranslationData } from '../types'
import ko from '../locales/ko/contest-entries'
import en from '../locales/en/contest-entries'
import ja from '../locales/ja/contest-entries'
import zh from '../locales/zh/contest-entries'

// 내 작가 공간의 "내 출품" 섹션. 공모전·부문 이름은 데이터에서 오므로 여기엔 장르 말을 넣지 않는다.
export const contestEntriesTranslations: TranslationData = { ko, en, ja, zh }
