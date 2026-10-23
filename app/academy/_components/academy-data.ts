/**
 * 강좌 페이지의 사실 데이터.
 * - 협회 소개·과목·커리큘럼·문원한문서예학원·아남 배옥영: 협회가 직접 게시해 온 강좌 안내(구 웹사이트 강좌 페이지)
 * - 예술의전당 서화아카데미: 예술의전당 아카데미 모집현황 「[서화] 2026 <가을정규> 수강생 모집」 게시물을 그대로 옮겼다.
 *   원문 표기가 이상해 보이는 곳(김경미 10:30~11:30 등)도 고치지 않았다. 학기가 바뀌면 SAC_TERM 과 SAC_CLASSES 를 함께 바꾼다.
 */

export interface RegSource {
  label: string
  href: string
}

const reg = (slug: string, article: number, label: string): RegSource => ({
  label,
  href: `/regulations/${slug}#a${article}`,
})

export const SRC = {
  articles3: reg('articles', 3, '정관 제3조'),
  articles4: reg('articles', 4, '정관 제4조'),
} as const

/* ---------- 협회가 잇는 교육 ---------- */

export interface Institution {
  name: string
  role: string
  body: string
  href: string
}

export const INSTITUTIONS: readonly Institution[] = [
  {
    name: '문원한문서예학원',
    role: '위탁 운영',
    body: '사단법인 대한민국한자교육연구회 대한검정회의 후원 아래 한국한문한자교사중앙연수원에서 서예와 동양화 교육을 위탁 운영합니다.',
    href: '#munwon',
  },
  {
    name: '예술의전당 서화아카데미',
    role: '출품료 할인 협력',
    body: '협회의 대표 전시공간인 예술의전당 서예박물관의 정규강좌입니다. 수강생이 협회 공모전·기획전에 출품하면 출품료를 할인합니다.',
    href: '#sac',
  },
]

/* ---------- 가르치는 과목 ---------- */

export interface Subject {
  title: string
  mark: string
  description: string
}

export const SUBJECTS: readonly Subject[] = [
  {
    title: '한문서예',
    mark: '書',
    description: '篆書·隸書·楷書·行書·草書, 오체(五體)를 중심으로 한 한문서예',
  },
  {
    title: '한글서예',
    mark: '한',
    description: '정자·흘림체·궁체·판본체·서간체·고체·민체 등 다양한 한글서예',
  },
  {
    title: '현대서예',
    mark: '新',
    description: '자유구상을 통해 작가의 개성과 창작을 강조하는 서체와 화풍',
  },
  {
    title: '캘리그라피',
    mark: '字',
    description: '그림과 문자를 작가의 개성으로 예술적으로 결합한 글자 디자인',
  },
  {
    title: '서각·전각',
    mark: '刻',
    description: '나무, 돌, 금옥(金玉) 등에 인장(印章)을 새겨 작품을 제작',
  },
  {
    title: '문인화·동양화',
    mark: '畫',
    description: '조형원리와 예술철학의 집약 — 산수화, 풍경화 등 수묵 담채',
  },
  {
    title: '수묵화',
    mark: '墨',
    description: '梅·蘭·菊·竹, 사군자(四君子)를 다양한 표현기법으로 그리기',
  },
  {
    title: '민화',
    mark: '民',
    description: '조선 후기 민간에 전승된 해학과 풍자, 소망을 상징적인 도상으로 표현',
  },
]

/* ---------- 정규 커리큘럼 ---------- */

export interface CurriculumLevel {
  stage: string
  label: string
  items: readonly string[]
}

export interface CurriculumTrack {
  title: string
  titleEn: string
  levels: readonly [CurriculumLevel, CurriculumLevel]
}

export const CURRICULUM: readonly CurriculumTrack[] = [
  {
    title: '한문 서예',
    titleEn: 'Chinese Calligraphy',
    levels: [
      {
        stage: '입문',
        label: '필법의 정석',
        items: [
          '집필법과 중봉 운필의 기초',
          '해서: 안진경 〈안근례비〉 필법',
          '구양순 〈구성궁예천명〉 구조 이해',
        ],
      },
      {
        stage: '심화',
        label: '오체(五體) 연마',
        items: [
          '행서: 왕희지 〈난정서〉 흐름 학습',
          '예서·전서: 조형미와 고전 필법',
          '초서: 손과정 〈서보〉와 창작',
        ],
      },
    ],
  },
  {
    title: '한글 서예',
    titleEn: 'Korean Calligraphy',
    levels: [
      {
        stage: '기초',
        label: '한글의 원형',
        items: [
          '판본체: 〈훈민정음 해례본〉 임서',
          '용비어천가 자형 비례 학습',
          '자음·모음의 조형적 균형',
        ],
      },
      {
        stage: '응용',
        label: '궁체와 현대서예',
        items: [
          '궁체: 정자(옥원중회연)와 흘림',
          '민체: 자유로운 필치의 표현',
          '현대 캘리그라피 응용 기법',
        ],
      },
    ],
  },
  {
    title: '문인화',
    titleEn: 'Literati Painting',
    levels: [
      {
        stage: '기초',
        label: '사군자(四君子)',
        items: [
          '난초: 선의 강약과 기필·수필',
          '대나무: 직선의 힘과 잎 구성',
          '매화·국화: 농담 조절과 발묵법',
        ],
      },
      {
        stage: '연구',
        label: '작가 과정',
        items: [
          '십군자와 화조화로 소재 확장',
          '작품 창작: 화제 쓰기와 낙관법',
          '전시 작품 구도 연구',
        ],
      },
    ],
  },
]

/* ---------- 문원한문서예학원 ---------- */

export interface Fact {
  label: string
  value: string
  note?: string
  href?: string
}

export const MUNWON_FACTS: readonly Fact[] = [
  { label: '수업', value: '매주 토요일 09:30 – 12:30', note: '주 1회 3시간' },
  { label: '수강료', value: '300,000원', note: '1학기 16주 과정' },
  { label: '입금 계좌', value: '신한은행 110-060-843077' },
  {
    label: '장소',
    value: '서울특별시 은평구 녹번로4길 6-12 대한검정회',
    note: '지하철 3·6호선 불광역 3번 출구에서 615m',
    href: 'https://naver.me/5Z0Cq9Rw',
  },
]

export const MUNWON_FEATURES: readonly string[] = [
  '2012년부터 기존 수강 실적을 포함하는 학기 은행제 실시',
  '수료증 수여 (하위 과정부터 수강)',
  '서체별 실기 지도',
  '작품 기획법 지도',
]

export const ANAM = {
  name: '아남 배옥영',
  title: '대한민국 동양서예대전 심사위원장',
  role: '대한검정회 한자한문교사 중앙연수원 전임교수',
  portrait: '/images/artists/baeogyeong.png',
  career: [
    '동양철학박사',
    '원광대 서예문화학과 동양학대학원 강사 및 초빙교수 역임',
    '조선대학교 철학과 강사 역임',
    '송제인문학연구소 수석연구원',
    '세종한글큰뜻모임 이사',
    '아남서예심리치료연구소 소장',
    '전주시 평생교육원 인문학 강사',
    '대한검정회 한자한문교사 중앙연수원 전임교수',
  ],
  exhibitions: [
    '개인전 및 초대전 6회',
    '프랑스 앙지엥데뱅 미술관 초대전',
    '캐나다 온타리오 미술관 초대전',
  ],
  activities: [
    '선광사경연구회',
    '한국예문회',
    '한국현대서각회',
    '일본추미회',
    '전북현대서각회',
    '동양서예협회',
  ],
  artworks: [
    { src: '/images/artworks/nakjiron-baeogyeong.avif', title: '낙지론' },
    { src: '/images/artworks/cheoktang-baeogyeong.avif', title: '척탕' },
    { src: '/images/artworks/cheonjibubudo-baeogyeong.jpg', title: '천지부부도덕가' },
    { src: '/images/artworks/hoenggan-baeogyeong.jpg', title: '횡간' },
    { src: '/images/artworks/toepilyeosan-baeogyeong.jpg', title: '퇴필여산' },
  ],
  videos: [
    { id: 'Ii1Ui2UL8m4', title: '콜로키움 25회 서예 4부 1강' },
    { id: 'YZIbtwOHU8k', title: 'STB 콜로키움 19회 문자와 커뮤니케이션 1' },
  ],
} as const

/* ---------- 예술의전당 서화아카데미 ---------- */

export const SAC_LINKS = {
  post: 'https://www.sac.or.kr/site/main/board/academy_stats/318254',
  recruiting: 'https://www.sac.or.kr/site/main/board/academy_stats/list',
  academy: 'https://www.sac.or.kr/site/main/academy/22/academy_view',
} as const

export const SAC_TERM = {
  name: '2026 가을정규',
  period: '9.1(화) – 12.19(토)',
  length: '주 1회 · 15주',
  recess: '9.22(화) – 26(토) 휴강',
  place: '예술의전당 서예박물관 3층 실기실',
  format: '3시간 수업 — 지도 2시간, 자유연습 1시간',
  contact: '02-580-1657~8',
  tel: '025801657',
  contactHours: '09:00 – 17:00 · 일·월·공휴일 휴무',
} as const

export interface SacFee {
  label: string
  amount: string
}

export const SAC_FEES: readonly SacFee[] = [
  { label: '일반 강좌', amount: '460,000원' },
  { label: '전각', amount: '480,000원' },
  { label: '마스터반', amount: '552,000원' },
  { label: '한글작품연구반 · 수묵화 마스터반', amount: '600,000원' },
  { label: '민화', amount: '640,000원' },
]

export const SAC_DISCOUNTS: readonly string[] = [
  '예술의전당 유료회원(블루·골드) 5% 할인',
  '장애인·국가유공자 10% 할인 (전화 결제)',
]

/** 협회 수강생 혜택 — 협회가 안내해 온 내용. 규정 조항은 아니다 */
export const ASCA_BENEFIT = {
  headline: '수강료의 최대 10%를 협회 출품료에서 할인',
  items: [
    {
      label: '대상',
      value: '예술의전당 서화아카데미 수강생 중 협회 공모전·초대작가전·기획전 출품 예정자',
    },
    { label: '혜택', value: '수강료의 5% 상당 출품료 할인, 협회 정회원은 5% 추가' },
    { label: '신청', value: '동양서예협회 사무국에 수강증 제시' },
  ],
} as const

export const SAC_DAYS = ['화', '수', '목', '금', '토'] as const
export type SacDay = (typeof SAC_DAYS)[number]

export const SAC_SLOTS = [
  { id: 'am', label: '오전', time: '10:00 – 13:00' },
  { id: 'pm', label: '오후', time: '14:00 – 17:00' },
] as const
export type SacSlot = (typeof SAC_SLOTS)[number]['id']

export const SAC_CATEGORIES = [
  '한문서예',
  '한글서예',
  '문인화·수묵화',
  '캘리그라피',
  '민화',
  '전각',
] as const
export type SacCategory = (typeof SAC_CATEGORIES)[number]

export interface SacClass {
  day: SacDay
  slot: SacSlot
  title: string
  instructor: string
  category: SacCategory
  /** 시간대 기본값과 다를 때만 — 원문 표기 그대로 */
  time?: string
}

const c = (
  day: SacDay,
  slot: SacSlot,
  category: SacCategory,
  title: string,
  instructor: string,
  time?: string
): SacClass => ({ day, slot, category, title, instructor, ...(time ? { time } : {}) })

export const SAC_CLASSES: readonly SacClass[] = [
  // 오전 10:00 – 13:00
  c('화', 'am', '문인화·수묵화', '사군자·현대문인화', '벽하 최형주'),
  c('화', 'am', '한문서예', '한문서예', '경부 송종관'),
  c('화', 'am', '한글서예', '한글서예', '산내 박정숙'),
  c('화', 'am', '캘리그라피', '캘리그라피', '심재 오민준'),
  c('화', 'am', '한글서예', '한글작품 연구반', '한얼 이종선'),
  c('화', 'am', '한문서예', '한문서예 초서(천자문)', '중하 김건표'),
  c('수', 'am', '한문서예', '한문서예 마스터반 I', '소헌 정도준', '09:30 – 12:30'),
  c('수', 'am', '한문서예', '한문서예', '무산 허회태'),
  c('수', 'am', '한문서예', '한문서예', '죽림 정웅표'),
  c('수', 'am', '문인화·수묵화', '문인화(사군자) 기초', '화정 김무호', '09:30 – 12:30'),
  c('수', 'am', '한문서예', '한문서예', '시헌 남두기'),
  c('수', 'am', '캘리그라피', '캘리그라피 기초 창작과 실전 I', '진산 이상현'),
  c('목', 'am', '문인화·수묵화', '문인화(사군자) 기초', '화정 김무호', '09:30 – 12:30'),
  c('목', 'am', '캘리그라피', '캘리그라피 마스터반 · 작가과정', '심재 오민준'),
  c('목', 'am', '한문서예', '한문서예', '죽림 정웅표'),
  c('목', 'am', '민화', '민화에 홀리다 마스터반 · 작품과정', '서공임'),
  c('목', 'am', '한문서예', '한문서예 · 해서·행서', '가람 신동엽'),
  c('금', 'am', '한문서예', '한문서예 · 전서·해서', '시헌 남두기'),
  c(
    '금',
    'am',
    '캘리그라피',
    '다채로운 색으로 감정을 표현하는 추상아트웍 캘리그라피',
    '일우 문혜성',
    '11:00 – 14:00'
  ),
  c('금', 'am', '문인화·수묵화', '문인화(사군자) 맑은 정신의 그림', '다움 이형국'),
  c('금', 'am', '문인화·수묵화', '사군자 기초', '문원 김경미', '10:30 – 11:30'),
  c('토', 'am', '전각', '전각 마스터반', '사곡 이숭호', '09:00 – 12:00'),
  c('토', 'am', '한문서예', '한문서예', '사곡 이숭호', '11:00 – 14:00'),
  c('토', 'am', '문인화·수묵화', '문인화(사군자)', '평전 정운기'),
  c('토', 'am', '한글서예', '한글서예', '한결 김문희'),
  // 오후 14:00 – 17:00
  c('화', 'pm', '문인화·수묵화', '문인화의 현대화', '여촌 이상태'),
  c('화', 'pm', '문인화·수묵화', '문인화(사군자)', '취산 김민숙'),
  c('화', 'pm', '한글서예', '한글서예', '산내 박정숙'),
  c('화', 'pm', '민화', '민화를 만나다', '심수현'),
  c('화', 'pm', '한글서예', '한글서예 · 궁체·민체', '서원 윤경숙'),
  c('화', 'pm', '한문서예', '한문서예 입문(해서·행서·초서)', '청하 김희정'),
  c('수', 'pm', '한문서예', '한문서예 마스터반 II', '소헌 정도준', '13:00 – 16:00'),
  c('수', 'pm', '캘리그라피', '캘리그라피 기초 창작과 실전 II', '진산 이상현'),
  c('수', 'pm', '한문서예', '한문서예 마스터반', '죽림 정웅표', '13:30 – 16:30'),
  c('수', 'pm', '문인화·수묵화', '수묵화 마스터반', '화정 김무호', '13:00 – 17:00'),
  c('목', 'pm', '문인화·수묵화', '문인화(사군자) 종합', '화정 김무호', '13:00 – 16:00'),
  c('목', 'pm', '캘리그라피', '현대서예(모던캘리)와 기초 캘리그라피', '담헌 전명옥'),
  c('목', 'pm', '한문서예', '한문서예', '일강 전병택'),
  c('목', 'pm', '민화', '민화에 홀리다 마스터반 · 초급', '서공임'),
  c('금', 'pm', '문인화·수묵화', '문인화 시·서·화 융합미술', '다움 이형국'),
  c('토', 'pm', '전각', '전각 초급반', '사곡 이숭호'),
]

export const SAC_INSTRUCTOR_COUNT = new Set(SAC_CLASSES.map(item => item.instructor)).size

/* ---------- 문의 ---------- */

export const ACADEMY_LINKS = {
  booking: 'https://cal.com/orientalcalligraphy/academy',
  chat: 'https://orientalcalligraphy.channel.io',
  phone: '0502-5550-8700',
} as const
