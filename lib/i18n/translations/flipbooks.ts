import type { TranslationData } from '../types'
import ko from '../locales/ko/flipbooks'
import en from '../locales/en/flipbooks'
import ja from '../locales/ja/flipbooks'
import zh from '../locales/zh/flipbooks'

// FlipHTML5 플립북 블록 문구 — components/flipbook/flipbook-embed.tsx 를 쓰는 곳마다 한 묶음.
// 고유명사·일정·지명은 각 안내서 표지 표기를 그대로 옮긴다.
// - 공모전: 한자 표기는 사이트 기존 표기(第N回 大韓民國 東洋書藝大展), 영문은 공모 요강 표지
// - 캘린더 행사: 행사 안내서 표지(2027 Membership & Calendar Special), 화백 표기는 소산(小山) 박대성
// - 대만 기행: 영문은 안내서 표지(A Calligraphic Journey through Taiwan), 지명 한자도 표지(桃園·臺北·臺中)
export const flipbookTranslations: TranslationData = { ko, en, ja, zh }
