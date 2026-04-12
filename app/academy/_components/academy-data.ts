export interface CurriculumCard {
  title: string
  titleEn: string
  levels: {
    label: string
    items: string[]
  }[]
}

export const CURRICULUM_CARDS: CurriculumCard[] = [
  {
    title: '한문 서예',
    titleEn: 'Chinese Calligraphy',
    levels: [
      {
        label: '[입문] 필법의 정석',
        items: [
          '집필법 및 중봉 운필의 기초',
          '해서: 안진경 <안근례비> 필법',
          '구양순 <구성궁예천명> 구조 이해',
        ],
      },
      {
        label: '[심화] 오체(五體) 연마',
        items: [
          '행서: 왕희지 <난정서> 흐름 학습',
          '예서/전서: 조형미와 고전 필법',
          '초서: 손과정 <서보> 및 창작',
        ],
      },
    ],
  },
  {
    title: '한글 서예',
    titleEn: 'Korean Calligraphy',
    levels: [
      {
        label: '[기초] 한글의 원형',
        items: [
          '판본체: <훈민정음 해례본> 임서',
          '용비어천가 자형 비례 학습',
          '자음/모음의 조형적 균형',
        ],
      },
      {
        label: '[응용] 궁체와 현대서예',
        items: [
          '궁체: 정자(옥원중회연) 및 흘림',
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
        label: '[기초] 사군자(四君子)',
        items: [
          '난초: 선의 강약과 기필/수필',
          '대나무: 직선의 힘과 잎 구성',
          '매화/국화: 농담 조절과 발묵법',
        ],
      },
      {
        label: '[연구] 작가 과정',
        items: [
          '십군자 및 화조화 소재 확장',
          '작품 창작: 화제 쓰기 및 낙관법',
          '전시 작품 구도 연구',
        ],
      },
    ],
  },
]

export interface SubjectItem {
  title: string
  description: string
}

export const SUBJECTS: SubjectItem[] = [
  { title: '한문서예', description: '篆書, 隸書, 楷書, 行書, 草書 (五體)를 중심으로 한 한문서예' },
  {
    title: '한글서예',
    description: '정자, 흘림체, 궁체, 판본체, 서간체, 고체, 민체 등 다양한 한글서예',
  },
  { title: '현대서예', description: '자유구상을 통해 작가의 개성과 창작을 강조하는 서체 및 화풍' },
  { title: '캘리그라피', description: '그림과 문자를 작가의 개성을 예술적으로 결합한 글자 디자인' },
  { title: '서각, 전각', description: '나무, 돌, 금옥(金玉)등에 인장(印章)을 새겨 작품을 제작' },
  {
    title: '문인화, 동양화',
    description: '조형원리와 예술철학의 집약 - 산수화, 풍경화 등 수묵 담채 그리기',
  },
  { title: '수묵화', description: '梅, 蘭, 菊, 竹 (四君子)을 다양한 표현기법으로 그리기' },
  {
    title: '민화',
    description: '조선후기 민간을 통해 전승된 해학과 풍자, 소망을 상징적인 도상으로 표현',
  },
]

export const SIDEBAR_SECTIONS = [
  { id: 'academy-intro', label: '동양서화 아카데미' },
  { id: 'munwon', label: '문원한문서예학원' },
  { id: 'sac-academy', label: '예술의전당 서화아카데미' },
  { id: 'partnership', label: '교육 협력 기관' },
] as const

export const SIDEBAR_QUICK_LINKS = [
  { href: '/forms', label: '서 식' },
  { href: '/history', label: '연 혁' },
  { href: '/board-members', label: '임 원' },
  { href: '/partners', label: '협력기관' },
  { href: '/articles-of-incorporation-and-bylaws', label: '정 관' },
] as const
