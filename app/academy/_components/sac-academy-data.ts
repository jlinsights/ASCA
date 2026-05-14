// Mock data for SAC Academy courses and instructors
// Extracted from sac-academy.tsx for max-lines compliance (Stage 5a-1)

export interface AcademyCourse {
  id: string
  courseId: string
  title: string
  instructor: string
  schedule: string
  period: string
  level: string
  description: string
  curriculum: string[]
  fee: string
  status: string
  externalLink: string
  createdAt: string
  updatedAt: string
}

export interface AcademyInstructor {
  id: string
  name: string
  introTitle: string
  category: string
  imageUrl: string
  career: string[]
  artworkUrl: string
  artworkDesc: string
}

export const MOCK_COURSES: AcademyCourse[] = [
  {
    id: 'cal1',
    courseId: 'C102104202511005',
    title: '나만의 캘리그라피 작품완성',
    instructor: '심재 오민준',
    schedule: '매주 화요일 10:00 - 13:00',
    period: '2026.01.13 - 02.03',
    level: '통합',
    description:
      '자신만의 독창적인 서체를 개발하고 완성도 높은 캘리그라피 작품을 제작하는 과정입니다.',
    curriculum: [
      '기초 선긋기와 필압 조절',
      '나만의 서체 찾기',
      '구도와 장법',
      '작품 제작 및 크리틱',
    ],
    fee: '200,000원 (4주)',
    status: '접수중',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511005',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cal2',
    courseId: 'C102104202511008',
    title: '서법의 기초 운필원리 핵심',
    instructor: '무산 허회태',
    schedule: '매주 수요일 10:00 - 13:00',
    period: '2026.01.14 - 02.04',
    level: '중급',
    description: '운필의 원리를 익히고 서법의 기초를 다지는 핵심 강의입니다.',
    curriculum: ['문자의 조형성 연구', '재료학 및 표현기법', '공간 구성 실습', '포트폴리오 제작'],
    fee: '250,000원 (4주)',
    status: '접수중',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511008',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cal3',
    courseId: 'C102104202511009',
    title: '전통과 현대문인화의 만남',
    instructor: '화정 김무호',
    schedule: '매주 목요일 13:00 - 16:00',
    period: '2026.01.15 - 02.05',
    level: '고급',
    description: '전통 문인화의 기법을 현대적 감각으로 재해석하여 작품을 완성합니다.',
    curriculum: ['전통 문인화의 이해', '사군자 표현 기법', '현대적 재료 활용', '작품 창작 실습'],
    fee: '200,000원 (4주)',
    status: '접수중',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511009',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'han1',
    courseId: 'C102104202511019',
    title: '한글서예 (한결)',
    instructor: '한결 김문희',
    schedule: '매주 토요일 10:00 - 13:00',
    period: '2026.01.10 - 01.31',
    level: '통합',
    description: '한글 서예의 정통 필법을 익히고 아름다운 우리말을 품격 있게 표현합니다.',
    curriculum: ['자음과 모음의 결구', '판본체와 궁체', '흘림체 기초', '창작 연습'],
    fee: '200,000원 (4주)',
    status: '마감임박',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511019',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'min1',
    courseId: 'C102104202511020',
    title: '새해 행운과 행복을 가져오는 민화',
    instructor: '심수현',
    schedule: '매주 토요일 10:00 - 13:00',
    period: '2026.01.10 - 01.31',
    level: '통합',
    description: '새해를 맞아 복을 기원하는 전통 민화를 배우고 작품을 완성합니다.',
    curriculum: ['민화의 기초 이해', '채색 기법 익히기', '상징물 표현', '작품 완성'],
    fee: '200,000원 (4주)',
    status: '접수중',
    externalLink:
      'https://www.sac.or.kr/site/main/academy/academy_app_view?searchCourseCd=C102104202511020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_INSTRUCTORS: AcademyInstructor[] = [
  {
    id: 'A1',
    name: '화정 김무호',
    category: '문인화·사군자',
    introTitle: '전통과 현대의 조화',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823.jpg',
    career: [
      '대한민국미술대전-대한민국서예대전-초대작가',
      '충남미술대전 초대작가',
      '대한민국미술대전(문인화 부문) 특선',
    ],
    artworkUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh1_20250823_1.jpg',
    artworkDesc: '▲ 화정 김무호_지지송추영...',
  },
  {
    id: 'A2',
    name: '한결 김문희',
    category: '한글서예',
    introTitle: '한글 서예의 아름다움',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_kmh2_20250823.jpg',
    career: [
      '대한민국미술대전 서예부문 초대작가',
      '경기미술대전 서예부문 초대작가',
      '중국미술대학 서법과 석사',
    ],
    artworkUrl: '',
    artworkDesc: '',
  },
  {
    id: 'A3',
    name: '무산 허회태',
    category: '한문서예',
    introTitle: '이모그래피의 창시자',
    imageUrl: '',
    career: [
      '이모그래피(Emography) 창시자',
      '개인전 20회 (한국, 미국, 독일 등)',
      '대한민국미술대전 심사위원 역임',
    ],
    artworkUrl: '',
    artworkDesc: '',
  },
  {
    id: 'A4',
    name: '심재 오민준',
    category: '캘리그라피',
    introTitle: '감성과 조형의 만남',
    imageUrl:
      'https://www.sac.or.kr/design/theme/sac/images/sub/academy_sub/calli_omj_20250823.jpg',
    career: [
      '한국캘리그라피디자인협회 이사',
      '원광대학교 서예문화예술학과 겸임교수',
      '개인전 및 초대전 다수',
    ],
    artworkUrl: '',
    artworkDesc: '',
  },
  {
    id: 'A5',
    name: '심수현',
    category: '민화',
    introTitle: '행복을 그리는 민화',
    imageUrl: '',
    career: ['전통민화 작가', '다수 회원전 및 그룹전 참여', '민화 지도사 자격 보유'],
    artworkUrl: '',
    artworkDesc: '',
  },
]
