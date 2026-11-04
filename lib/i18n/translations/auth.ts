import type { TranslationData } from '../types'
import ko from '../locales/ko/auth'
import en from '../locales/en/auth'
import ja from '../locales/ja/auth'
import zh from '../locales/zh/auth'

// 로그인·회원가입 화면의 셸 문구. 자체 폼은 native-auth 번역을 사용한다.
// 작품 패널 캡션은 이미지에 실제로 쓰인 글귀만 옮긴다 — 작가·연도는 확인되지 않아 적지 않는다.
export const authTranslations: TranslationData = { ko, en, ja, zh }
