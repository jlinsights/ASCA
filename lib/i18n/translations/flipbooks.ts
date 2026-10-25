import type { TranslationData } from '../types'

// FlipHTML5 플립북 블록 문구 — components/flipbook/flipbook-embed.tsx 를 쓰는 곳마다 한 묶음.
// 고유명사·일정·지명은 각 안내서 표지 표기를 그대로 옮긴다.
// - 공모전: 한자 표기는 사이트 기존 표기(第N回 大韓民國 東洋書藝大展), 영문은 공모 요강 표지
// - 캘린더 행사: 행사 안내서 표지(2027 Membership & Calendar Special), 화백 표기는 소산(小山) 박대성
// - 대만 기행: 영문은 안내서 표지(A Calligraphic Journey through Taiwan), 지명 한자도 표지(桃園·臺北·臺中)
export const flipbookTranslations: TranslationData = {
  ko: {
    flipbookOpen: '새 창에서 크게 보기',
    calendarFlipbookEyebrow: '2027 회원·캘린더 특별 행사',
    calendarFlipbookTitle: '2027 동양서예 캘린더 증정 행사',
    calendarFlipbookLede: '신청 2026년 10월 25일(일) – 12월 15일(화) 18:00 · 소산 박대성 화백의 2027 캘린더',
    calendarFlipbookFrameTitle: '2027 동양서예 캘린더 행사',
    contestFlipbookEyebrow: '공모 요강',
    contestFlipbookTitle: '제23회 대한민국 동양서예대전',
    contestFlipbookLede: '공모 요강과 전시 안내를 책장을 넘기듯 살펴보세요.',
    contestFlipbookFrameTitle: '제23회 대한민국 동양서예대전 공모 요강 플립북',
    taiwanTripFlipbookEyebrow: '회원·가족 여행 안내',
    taiwanTripFlipbookTitle: '대만 서예·문화 기행',
    taiwanTripFlipbookLede: '2027년 4월 7일(수) – 11일(일), 4박 5일 · 타오위안 · 타이베이 · 타이중',
    taiwanTripFlipbookFrameTitle: '대만 서예·문화 기행 안내서 플립북',
  },
  en: {
    flipbookOpen: 'Open full screen in a new tab',
    calendarFlipbookEyebrow: '2027 Membership & Calendar Special',
    calendarFlipbookTitle: '2027 Oriental Calligraphy Calendar Gift',
    calendarFlipbookLede: 'Apply Oct 25 – Dec 15, 2026, 18:00 KST · 2027 calendar of ink paintings by Sosan Park Dae-sung',
    calendarFlipbookFrameTitle: 'Flipbook: 2027 Oriental Calligraphy Calendar Gift',
    contestFlipbookEyebrow: 'Call for entries',
    contestFlipbookTitle: 'The 23rd Korea Oriental Calligraphy Exhibition',
    contestFlipbookLede: 'Leaf through the call for entries and exhibition guide page by page.',
    contestFlipbookFrameTitle:
      'Flipbook: call for entries for the 23rd Korea Oriental Calligraphy Exhibition',
    taiwanTripFlipbookEyebrow: 'Trip guide for members and families',
    taiwanTripFlipbookTitle: 'A Calligraphic Journey through Taiwan',
    taiwanTripFlipbookLede: 'April 7 (Wed) – 11 (Sun), 2027 · 5 days · Taoyuan · Taipei · Taichung',
    taiwanTripFlipbookFrameTitle: 'Flipbook: A Calligraphic Journey through Taiwan trip guide',
  },
  ja: {
    flipbookOpen: '新しいタブで大きく見る',
    calendarFlipbookEyebrow: '2027 会員・カレンダー特別企画',
    calendarFlipbookTitle: '2027 東洋書藝 カレンダー贈呈',
    calendarFlipbookLede: '申込 2026年10月25日(日)–12月15日(火) 18:00・小山 朴大成 画伯の2027カレンダー',
    calendarFlipbookFrameTitle: '2027 東洋書藝 カレンダー贈呈 フリップブック',
    contestFlipbookEyebrow: '募集要項',
    contestFlipbookTitle: '第23回 大韓民國 東洋書藝大展',
    contestFlipbookLede: '募集要項と展示案内を、ページをめくるようにご覧ください。',
    contestFlipbookFrameTitle: '第23回 大韓民國 東洋書藝大展 募集要項フリップブック',
    taiwanTripFlipbookEyebrow: '会員・ご家族向け旅行案内',
    taiwanTripFlipbookTitle: '台湾 書芸・文化紀行',
    taiwanTripFlipbookLede: '2027年4月7日(水)–11日(日)・4泊5日・桃園・臺北・臺中',
    taiwanTripFlipbookFrameTitle: '台湾 書芸・文化紀行 案内書フリップブック',
  },
  zh: {
    flipbookOpen: '在新分頁中全螢幕檢視',
    calendarFlipbookEyebrow: '2027 會員・月曆特別活動',
    calendarFlipbookTitle: '2027 東洋書藝 月曆贈送活動',
    calendarFlipbookLede: '申請 2026年10月25日(週日)–12月15日(週二) 18:00・小山 朴大成 畫伯 2027 月曆',
    calendarFlipbookFrameTitle: '2027 東洋書藝 月曆贈送活動 翻頁冊',
    contestFlipbookEyebrow: '徵稿簡章',
    contestFlipbookTitle: '第23回 大韓民國 東洋書藝大展',
    contestFlipbookLede: '像翻書一樣瀏覽徵稿簡章與展覽介紹。',
    contestFlipbookFrameTitle: '第23回 大韓民國 東洋書藝大展 徵稿簡章翻頁冊',
    taiwanTripFlipbookEyebrow: '會員・眷屬旅行指南',
    taiwanTripFlipbookTitle: '臺灣 書藝・文化紀行',
    taiwanTripFlipbookLede: '2027年4月7日(週三)–11日(週日)・五天四夜・桃園・臺北・臺中',
    taiwanTripFlipbookFrameTitle: '臺灣 書藝・文化紀行 指南翻頁冊',
  },
}
