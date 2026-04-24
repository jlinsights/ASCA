import {
  Trophy,
  Medal,
  Star,
  Crown,
  CheckCircle,
} from 'lucide-react'

export interface AwardCategory {
  id: string
  name: string
  nameEn: string
  icon: any
  color: string
  badgeColor: string
  maxCount: number
  winners: { name: string; script: string; title: string }[]
}

export interface ContestData {
  year: number
  edition: string
  title: string
  status: 'upcoming' | 'completed'
  date: string
  venue: string
  totalEntries: number | null
  judges: string[]
  categories: AwardCategory[]
}

export const contestDataByYear: Record<number, ContestData> = {
  2025: {
    year: 2025,
    edition: '제22회',
    title: '제22회 대한민국 동양서예대전',
    status: 'upcoming',
    date: '2025년 하반기 예정',
    venue: '추후 공지',
    totalEntries: null,
    judges: [],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [],
      },
      {
        id: 'excellence',
        name: '최우수상',
        nameEn: 'Excellence',
        icon: Trophy,
        color: 'text-amber-600',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        maxCount: 2,
        winners: [],
      },
      {
        id: 'merit',
        name: '우수상',
        nameEn: 'Merit',
        icon: Medal,
        color: 'text-blue-600',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        maxCount: 5,
        winners: [],
      },
      {
        id: 'special',
        name: '특선',
        nameEn: 'Special',
        icon: Star,
        color: 'text-indigo-600',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        maxCount: 30,
        winners: [],
      },
      {
        id: 'selected',
        name: '입선',
        nameEn: 'Selected',
        icon: CheckCircle,
        color: 'text-gray-600',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
        maxCount: 100,
        winners: [],
      },
    ],
  },
  2024: {
    year: 2024,
    edition: '제21회',
    title: '제21회 대한민국 동양서예대전',
    status: 'completed',
    date: '2024년 4월 15일 - 4월 30일',
    venue: '서울 예술의전당 서예박물관',
    totalEntries: 1250,
    judges: ['김정수 (심사위원장)', '이한묵', '박서림', '최동현', '정예서'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '김서예', script: '해행초', title: '정법과 창신의 조화' }],
      },
      {
        id: 'excellence',
        name: '최우수상',
        nameEn: 'Excellence',
        icon: Trophy,
        color: 'text-amber-600',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        maxCount: 2,
        winners: [
          { name: '이묵향', script: '행서', title: '묵향의 정취' },
          { name: '박문인', script: '초서', title: '현대의 서정' },
        ],
      },
      {
        id: 'merit',
        name: '우수상',
        nameEn: 'Merit',
        icon: Medal,
        color: 'text-blue-600',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        maxCount: 5,
        winners: [
          { name: '정서법', script: '해서', title: '해서의 정수' },
          { name: '한필묵', script: '예서', title: '고운 묵적' },
          { name: '조서향', script: '전서', title: '금석의 울림' },
          { name: '윤초연', script: '초서', title: '바람의 서체' },
          { name: '강묵림', script: '행서', title: '송림의 운치' },
        ],
      },
      {
        id: 'special',
        name: '특선',
        nameEn: 'Special',
        icon: Star,
        color: 'text-indigo-600',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        maxCount: 30,
        winners: [
          { name: '오서운', script: '해서', title: '천자문 중 발췌' },
          { name: '신묵연', script: '행서', title: '추사의 흔적' },
          { name: '유한글', script: '한글서예', title: '훈민정음 서체 연구' },
        ],
      },
      {
        id: 'selected',
        name: '입선',
        nameEn: 'Selected',
        icon: CheckCircle,
        color: 'text-gray-600',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
        maxCount: 100,
        winners: [
          { name: '차예림', script: '해서', title: '논어 중 발췌' },
          { name: '임서정', script: '행서', title: '봄날의 서정' },
        ],
      },
    ],
  },
}
