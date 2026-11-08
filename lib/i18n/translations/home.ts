import type { TranslationData } from '../types'
import ko from '../locales/ko/home'
import en from '../locales/en/home'
import ja from '../locales/ja/home'
import zh from '../locales/zh/home'

// 홈(ASCA Ink System 에디토리얼 시안) 문구.
// 출처: Claude Design 'ASCA Design System' ui_kits/web/SiteProvider.jsx 의 문구를 바탕으로,
// 저장소 기록으로 확인되지 않는 약속·수치(회신 기한, 창립 연도 등)는 빼거나 실제 값으로 바꿨다.
export const homeTranslations: TranslationData = { ko, en, ja, zh }
