import type {
  CulturalExchangeProgramInfo,
  CulturalProgramType,
  CulturalProgramStatus,
} from '@/lib/types/membership'

export const mockPrograms: CulturalExchangeProgramInfo[] = [
  {
    id: 'program1',
    title: '한중일 서예교류 워크샵',
    titleKo: '한중일 서예교류 워크샵',
    titleEn: 'Korea-China-Japan Calligraphy Exchange Workshop',
    titleCn: '韩中日书法交流工作坊',
    titleJp: '韓中日書道交流ワークショップ',
    description:
      '한국, 중국, 일본의 서예 전통을 비교하고 서로의 기법을 배우는 3개국 문화교류 프로그램',
    descriptionKo:
      '한국, 중국, 일본의 서예 전통을 비교하고 서로의 기법을 배우는 3개국 문화교류 프로그램',
    descriptionEn:
      'A three-nation cultural exchange program comparing calligraphy traditions of Korea, China, and Japan',
    programType: 'workshop_series',
    targetAudience: [2, 3, 4],
    partnerOrganizations: [
      {
        name: '중국서법협회',
        nameLocal: '中国书法协会',
        type: 'art_school',
        country: 'CN',
        city: '베이징',
        website: 'https://www.ccagov.com.cn',
      },
      {
        name: '일본서도연맹',
        nameLocal: '日本書道連盟',
        type: 'art_school',
        country: 'JP',
        city: '도쿄',
        website: 'https://www.shodorenmei.or.jp',
      },
    ],
    countries: ['KR', 'CN', 'JP'],
    languages: ['ko', 'zh', 'ja', 'en'],
    duration: 7,
    maxParticipants: 30,
    currentParticipants: 18,
    fee: 1200000,
    currency: 'KRW',
    location: '서울 인사동 한국전통문화센터',
    venue: '한국전통문화센터 대강당',
    accommodationProvided: true,
    mealsProvided: true,
    transportationProvided: false,
    requirements: [
      {
        type: 'membership_level',
        description: '고급 실습생 이상',
        mandatory: true,
        details: { minimumLevel: 2 },
      },
      {
        type: 'language_proficiency',
        description: '영어 기본 소통 가능',
        mandatory: false,
      },
      {
        type: 'experience',
        description: '서예 경력 3년 이상',
        mandatory: true,
        details: { minimumYears: 3 },
      },
    ],
    benefits: [
      {
        type: 'certificate',
        description: '국제 문화교류 수료증',
        value: '3개국 공동 인증',
      },
      {
        type: 'networking',
        description: '국제 서예가 네트워크',
        value: '평생 멘토링',
      },
      {
        type: 'cultural_credit',
        description: '문화교류 활동 점수',
        value: '100점',
      },
    ],
    schedule: [
      {
        date: new Date('2025-03-15'),
        startTime: '09:00',
        endTime: '12:00',
        title: '환영식 및 개막 세리머니',
        location: '한국전통문화센터',
        type: 'cultural_activity',
        required: true,
      },
    ],
    applicationDeadline: new Date('2025-02-28'),
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-21'),
    status: 'open_for_applications',
    organizerId: 'admin1',
    coordinators: [],
    images: ['/images/programs/cultural-exchange-1.avif'],
    documents: [],
    isFeatured: true,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-20'),
  },
  {
    id: 'program2',
    title: '아시아 서예가 레지던시',
    titleKo: '아시아 서예가 레지던시',
    titleEn: 'Asian Calligraphy Artist Residency',
    programType: 'artist_residency',
    targetAudience: [3, 4],
    partnerOrganizations: [],
    countries: ['KR', 'CN', 'JP', 'VN', 'TH'],
    languages: ['ko', 'en'],
    duration: 30,
    maxParticipants: 8,
    currentParticipants: 5,
    fee: 2500000,
    currency: 'KRW',
    location: '경주 전통문화예술마을',
    accommodationProvided: true,
    mealsProvided: true,
    transportationProvided: true,
    requirements: [
      {
        type: 'membership_level',
        description: '인증 서예가 이상',
        mandatory: true,
        details: { minimumLevel: 3 },
      },
    ],
    benefits: [],
    schedule: [],
    applicationDeadline: new Date('2025-04-30'),
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-30'),
    status: 'open_for_applications',
    organizerId: 'admin1',
    coordinators: [],
    images: ['/images/programs/cultural-exchange-2.avif'],
    documents: [],
    isFeatured: false,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-15'),
  },
]

export const programTypeConfig: Record<
  CulturalProgramType,
  {
    name: string
    icon: string
    color: string
    description: string
  }
> = {
  cultural_immersion: {
    name: '문화체험',
    icon: '🏛️',
    color: 'bg-blue-500',
    description: '현지 문화에 깊이 몰입하는 체험형 프로그램',
  },
  artist_residency: {
    name: '아티스트 레지던시',
    icon: '🎨',
    color: 'bg-purple-500',
    description: '작품 활동에 집중할 수 있는 창작 지원 프로그램',
  },
  workshop_series: {
    name: '워크샵 시리즈',
    icon: '🛠️',
    color: 'bg-green-500',
    description: '체계적인 기법 학습을 위한 단계별 워크샵',
  },
  exhibition_exchange: {
    name: '전시교류',
    icon: '🖼️',
    color: 'bg-amber-500',
    description: '작품 전시를 통한 국제적 문화교류',
  },
  academic_collaboration: {
    name: '학술교류',
    icon: '🎓',
    color: 'bg-indigo-500',
    description: '연구 및 학술적 성과 공유 프로그램',
  },
  youth_program: {
    name: '청년 프로그램',
    icon: '🌟',
    color: 'bg-pink-500',
    description: '젊은 서예가들을 위한 특별 프로그램',
  },
  master_class: {
    name: '마스터클래스',
    icon: '👨‍🏫',
    color: 'bg-red-500',
    description: '거장들과 함께하는 고급 기법 교육',
  },
}

export const statusConfig: Record<
  CulturalProgramStatus,
  {
    name: string
    color: string
    bgColor: string
  }
> = {
  planning: { name: '기획 중', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  open_for_applications: { name: '모집 중', color: 'text-green-600', bgColor: 'bg-green-100' },
  applications_closed: { name: '모집 마감', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  in_progress: { name: '진행 중', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { name: '완료', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  cancelled: { name: '취소', color: 'text-red-600', bgColor: 'bg-red-100' },
}
