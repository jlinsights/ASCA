import type { Language } from '@/lib/i18n/types'
import type { HistoryEvent } from './history-events'

// 연혁 원문(history-events.ts)은 한국어 기록 그대로 두고, 화면에 낼 때만 언어별로 바꾼다.
// - 한자 공식 전시명(第22回 大韓民國 東洋書藝大展 등)은 네 언어 모두 원문 그대로 둔다.
// - 날짜는 원문의 정해진 꼴('2025년 11월 27일(목) 오후 1시 ~ 7시')을 규칙으로 바꾼다.
// - 한국어로 된 행사명·장소만 아래 표로 옮긴다. 표에 없는 한국어가 새로 들어오면 테스트가 잡는다.

type Foreign = Exclude<Language, 'ko'>
type Phrase = Record<Foreign, string>

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const WEEKDAYS: Record<string, Phrase> = {
  월: { en: 'Mon', ja: '月', zh: '一' },
  화: { en: 'Tue', ja: '火', zh: '二' },
  수: { en: 'Wed', ja: '水', zh: '三' },
  목: { en: 'Thu', ja: '木', zh: '四' },
  금: { en: 'Fri', ja: '金', zh: '五' },
  토: { en: 'Sat', ja: '土', zh: '六' },
  일: { en: 'Sun', ja: '日', zh: '日' },
}

const NOTES: Record<string, Phrase> = {
  '(코로나19로 인터넷 전시 대체)': {
    en: '(held online due to COVID-19)',
    ja: '(新型コロナのためオンライン展示に代替)',
    zh: '(因新冠疫情改為線上展覽)',
  },
}

const month = (m: string, lang: Foreign) => (lang === 'en' ? EN_MONTHS[Number(m) - 1] : `${m}月`)

export function localizeHistoryDate(raw: string, lang: Language): string {
  if (lang === 'ko') return raw
  let s = raw
  for (const [ko, phrase] of Object.entries(NOTES)) s = s.replace(ko, phrase[lang])

  s = s.replace(/오후 (\d{1,2})시 ~ (\d{1,2})시/g, (_, a: string, b: string) =>
    lang === 'en' ? `${a}–${b} PM` : lang === 'ja' ? `午後${a}時〜${b}時` : `下午${a}時至${b}時`
  )
  s = s.replace(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/g, (_, y: string, m: string, d: string) =>
    lang === 'en' ? `${month(m, lang)} ${d}, ${y}` : `${y}年${m}月${d}日`
  )
  s = s.replace(/(\d{4})년 (\d{1,2})월/g, (_, y: string, m: string) =>
    lang === 'en' ? `${month(m, lang)} ${y}` : `${y}年${m}月`
  )
  s = s.replace(/(\d{1,2})월 (\d{1,2})일/g, (_, m: string, d: string) =>
    lang === 'en' ? `${month(m, lang)} ${d}` : `${m}月${d}日`
  )
  s = s.replace(/\(([월화수목금토일])\)/g, (_, w: string) =>
    lang === 'en' ? ` (${WEEKDAYS[w]![lang]})` : `(${WEEKDAYS[w]![lang]})`
  )
  // 영어는 요일 앞에 띄어쓰기를 넣었으니 원래 있던 공백과 겹친 것을 정리한다
  s = s.replace(/ {2,}/g, ' ')
  s = s.replace(/ ~ /g, lang === 'en' ? ' – ' : lang === 'ja' ? '〜' : ' – ')
  return s.trim()
}

// 장소: 기관 공식 표기를 따른다. 확인이 필요한 표기는 PR 에 따로 적었다.
const VENUES: Record<string, Phrase> = {
  문화체육관광부: {
    en: 'Ministry of Culture, Sports and Tourism',
    ja: '文化体育観光部',
    zh: '文化體育觀光部',
  },
  '서울, 북경, 서안 역사 박물관': {
    en: "History museums in Seoul, Beijing and Xi'an",
    ja: 'ソウル・北京・西安の歴史博物館',
    zh: '首爾、北京、西安歷史博物館',
  },
  세종문화회관: {
    en: 'Sejong Center for the Performing Arts',
    ja: '世宗文化会館',
    zh: '世宗文化會館',
  },
  '예술가의집 | Artist House (Arts Council Korea)': {
    en: 'Artist House (Arts Council Korea)',
    ja: 'アーティストハウス(韓国文化芸術委員会)',
    zh: '藝術家之家(韓國文化藝術委員會)',
  },
  '예술의전당 서울서예박물관': {
    en: 'Seoul Calligraphy Art Museum, Seoul Arts Center',
    ja: 'ソウル芸術の殿堂 書芸博物館',
    zh: '首爾藝術殿堂 書藝博物館',
  },
  '예술의전당 서울서예박물관 제1전시실 (2층)': {
    en: 'Seoul Calligraphy Art Museum, Seoul Arts Center — Gallery 1 (2F)',
    ja: 'ソウル芸術の殿堂 書芸博物館 第1展示室(2階)',
    zh: '首爾藝術殿堂 書藝博物館 第1展覽室(2樓)',
  },
  '인사동 한국미술관 3층 전관': {
    en: 'Hankook Art Museum, Insa-dong (entire 3rd floor)',
    ja: '仁寺洞 韓国美術館 3階全館',
    zh: '仁寺洞 韓國美術館 3樓全館',
  },
  '인사동 한국미술관': {
    en: 'Hankook Art Museum, Insa-dong',
    ja: '仁寺洞 韓国美術館',
    zh: '仁寺洞 韓國美術館',
  },
  '일본 동경 문화센터': {
    en: 'Tokyo Culture Center, Japan',
    ja: '東京文化センター',
    zh: '日本東京文化中心',
  },
  '일본 오사카 시립미술관': {
    en: 'Osaka City Museum of Fine Arts, Japan',
    ja: '大阪市立美術館',
    zh: '日本大阪市立美術館',
  },
  진천군립생거판화미술관: {
    en: 'Jincheon County Saenggeo Print Art Museum',
    ja: '鎮川郡立生居版画美術館',
    zh: '鎮川郡立生居版畫美術館',
  },
}

const appointmentCeremony = (year: string): Phrase => ({
  en: `${year} Appointment of New Officers & Invited Artist Certificate Ceremony`,
  ja: `${year} 新任役員委嘱式・招待作家証授与式`,
  zh: `${year} 新任理事委任暨特邀作家證書頒發儀式`,
})

const extraordinaryMeeting = (year: string): Phrase => ({
  en: `${year} Extraordinary General Meeting`,
  ja: `${year} 臨時総会`,
  zh: `${year} 臨時會員大會`,
})

// 행사명·부제: 한국어로 된 것만 이벤트 id 로 옮긴다.
const TITLES: Record<string, { title?: Phrase; subtitle?: Phrase }> = {
  // 영어 부제(New Horizons in East Asian Calligraphy)는 원래 있던 공식 표기라 그대로 둔다
  '2026-4': {
    title: {
      en: 'Seogyeong (書境): New Horizons — The Present and Future of East Asian Calligraphy',
      ja: '書境 新たな地平 — 東洋書芸の現在と未来',
      zh: '書境 新的地平線 — 東洋書藝的現在與未來',
    },
  },
  '2025-11': { title: extraordinaryMeeting('2025') },
  '2025-2a': { title: appointmentCeremony('2025') },
  '2025-2b': {
    title: { en: '2025 Regular Board Meeting', ja: '2025 定例理事会', zh: '2025 定期理事會' },
  },
  '2024-10a': { title: appointmentCeremony('2024') },
  '2024-10b': { title: extraordinaryMeeting('2024') },
  '2024-8': {
    title: {
      en: '2024 Korea Grand Calligraphy Exhibition — Live Brushwork Contest',
      ja: '2024 大韓民國 東洋書藝大展 揮毫大会',
      zh: '2024 大韓民國 東洋書藝大展 揮毫大會',
    },
    subtitle: {
      en: 'ASCA Officer Appointment Ceremony',
      ja: '社団法人 東洋書芸協会 役員委嘱式',
      zh: '社團法人 東洋書藝協會 理事委任儀式',
    },
  },
  '2024-1': {
    title: { en: '2024 Annual General Meeting', ja: '2024 定期総会', zh: '2024 定期會員大會' },
  },
  // 이름 표기(Lim Jaehong)는 본인 확인 필요 — 한자 이름은 지어내지 않는다
  '2023-10': {
    subtitle: {
      en: 'Inauguration of Chairman Lim Jaehong',
      ja: 'Lim Jaehong 理事長 就任',
      zh: 'Lim Jaehong 理事長 就任',
    },
  },
}

export function localizeHistoryEvent(event: HistoryEvent, lang: Language): HistoryEvent {
  if (lang === 'ko') return event
  const titles = TITLES[event.id]
  return {
    ...event,
    title: titles?.title?.[lang] ?? event.title,
    ...(event.subtitle !== undefined && {
      subtitle: titles?.subtitle?.[lang] ?? event.subtitle,
    }),
    ...(event.venue !== undefined && { venue: VENUES[event.venue]?.[lang] ?? event.venue }),
    ...(event.date !== undefined && { date: localizeHistoryDate(event.date, lang) }),
  }
}
