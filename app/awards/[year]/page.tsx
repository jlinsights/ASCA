import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Medal,
  Award,
  Star,
  Crown,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Users,
  Info,
} from 'lucide-react'
import { getContestResultsByYearGrouped } from '@/lib/db/queries/contest-results'
import type { ContestResult } from '@/lib/db/schema'

interface AwardCategory {
  id: string
  name: string
  nameEn: string
  icon: typeof Crown
  color: string
  badgeColor: string
  maxCount: number
  winners: { name: string; script: string; title: string }[]
}

interface ContestData {
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

const contestDataByYear: Record<number, ContestData> = {
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
  2023: {
    year: 2023,
    edition: '제20회',
    title: '제20회 대한민국 동양서예대전',
    status: 'completed',
    date: '2023년 4월 10일 - 4월 25일',
    venue: '서울 예술의전당 서예박물관',
    totalEntries: 1180,
    judges: ['박묵연 (심사위원장)', '김한서', '이정묵', '최서림', '정동양'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '최한글', script: '전서', title: '천지자연' }],
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
          { name: '정묵림', script: '행서', title: '산수유정' },
          { name: '이서향', script: '해서', title: '정법의 아름다움' },
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
          { name: '김동양', script: '초서', title: '달빛 아래 글씨' },
          { name: '박예서', script: '예서', title: '한비자 발췌' },
          { name: '한서연', script: '해서', title: '천자문 全篇' },
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
          { name: '윤서화', script: '행서', title: '시경 발췌' },
          { name: '조한묵', script: '해서', title: '대학 서문' },
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
        winners: [{ name: '강예림', script: '전서', title: '금석문 연구' }],
      },
    ],
  },
  2022: {
    year: 2022,
    edition: '제19회',
    title: '제19회 대한민국 동양서예대전',
    status: 'completed',
    date: '2022년 5월 1일 - 5월 15일',
    venue: '서울 세종문화회관',
    totalEntries: 980,
    judges: ['이묵산 (심사위원장)', '김서운', '박정묵', '최예림'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '박묵향', script: '행서', title: '대풍가' }],
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
          { name: '김예서', script: '해서', title: '논어 학이편' },
          { name: '이서정', script: '초서', title: '풍류의 자취' },
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
          { name: '한묵연', script: '예서', title: '예서의 기원' },
          { name: '정서운', script: '전서', title: '고전의 여운' },
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
  2021: {
    year: 2021,
    edition: '제18회',
    title: '제18회 대한민국 동양서예대전',
    status: 'completed',
    date: '2021년 4월 20일 - 5월 5일',
    venue: '온라인 전시 (COVID-19)',
    totalEntries: 850,
    judges: ['최서운 (심사위원장)', '이한묵', '박동양', '김서림'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '이한서', script: '해서', title: '중용 발췌' }],
      },
      {
        id: 'excellence',
        name: '최우수상',
        nameEn: 'Excellence',
        icon: Trophy,
        color: 'text-amber-600',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        maxCount: 2,
        winners: [{ name: '정묵향', script: '행서', title: '봄의 서사' }],
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
  2020: {
    year: 2020,
    edition: '제17회',
    title: '제17회 대한민국 동양서예대전',
    status: 'completed',
    date: '2020년 6월 1일 - 6월 15일',
    venue: '온라인 전시 (COVID-19)',
    totalEntries: 720,
    judges: ['김동양 (심사위원장)', '박서운', '이예림'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '조묵린', script: '행초', title: '난정서 전문' }],
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
  2019: {
    year: 2019,
    edition: '제16회',
    title: '제16회 대한민국 동양서예대전',
    status: 'completed',
    date: '2019년 4월 8일 - 4월 22일',
    venue: '서울 예술의전당 서예박물관',
    totalEntries: 1100,
    judges: ['박한묵 (심사위원장)', '김서림', '이동양', '최예서', '정묵연'],
    categories: [
      {
        id: 'grand-prize',
        name: '대상',
        nameEn: 'Grand Prize',
        icon: Crown,
        color: 'text-yellow-600',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        maxCount: 1,
        winners: [{ name: '윤묵정', script: '해서', title: '맹자 발췌' }],
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
          { name: '한서림', script: '초서', title: '춘풍의 노래' },
          { name: '강예묵', script: '행서', title: '묵죽의 운치' },
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
          { name: '오동양', script: '전서', title: '석고문 임서' },
          { name: '신서화', script: '예서', title: '조전비 임서' },
          { name: '유묵향', script: '해서', title: '정기체의 정수' },
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
}

const validYears = Object.keys(contestDataByYear).map(Number)

export function generateStaticParams() {
  return validYears.map(year => ({ year: year.toString() }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>
}): Promise<Metadata> {
  const { year } = await params
  const yearNum = parseInt(year, 10)
  const data = contestDataByYear[yearNum]
  if (!data) {
    return { title: '수상 내역을 찾을 수 없습니다 - ASCA' }
  }
  return {
    title: `${data.title} 수상 내역 - ASCA`,
    description: `${data.title} 수상작 및 수상자 명단입니다. 대상, 최우수상, 우수상, 특선, 입선 수상 결과를 확인하세요.`,
    openGraph: {
      title: `${data.title} 수상 내역`,
      description: `${data.edition} 대한민국 동양서예대전 수상 결과`,
    },
  }
}

function mergeDbResults(
  categories: AwardCategory[],
  dbGrouped: Record<string, ContestResult[]>
): AwardCategory[] {
  const categoryMap: Record<string, string> = {
    'grand-prize': 'grand_prize',
    excellence: 'top_excellence',
    merit: 'excellence',
    special: 'special',
    selected: 'selected',
  }

  return categories.map(cat => {
    const dbKey = categoryMap[cat.id]
    const dbResults = dbKey ? dbGrouped[dbKey] : undefined
    if (dbResults && dbResults.length > 0) {
      return {
        ...cat,
        winners: dbResults.map(r => ({
          name: r.winnerName,
          script: r.script ?? '',
          title: r.artworkTitle ?? '',
        })),
      }
    }
    return cat
  })
}

export default async function AwardYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const yearNum = parseInt(year, 10)
  const data = contestDataByYear[yearNum]

  if (!data) {
    notFound()
  }

  let dbGrouped: Record<string, ContestResult[]> = {}
  try {
    dbGrouped = await getContestResultsByYearGrouped(yearNum)
  } catch {
    // DB 연결 실패 시 mock 데이터 사용
  }

  const hasDbData = Object.keys(dbGrouped).length > 0
  const mergedCategories = hasDbData ? mergeDbResults(data.categories, dbGrouped) : data.categories

  const displayData = { ...data, categories: mergedCategories }
  const totalWinners = displayData.categories.reduce((sum, cat) => sum + cat.winners.length, 0)

  return (
    <main className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-transparent'>
        <div className='container mx-auto px-4 text-center'>
          <Badge className='mb-4 bg-scholar-red text-white hover:bg-scholar-red/90'>
            {displayData.edition}
          </Badge>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4'>
            {displayData.year}년 수상 내역
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
            {displayData.title}
          </p>
        </div>
      </section>

      <div className='container mx-auto px-4 pt-8'>
        <Link
          href='/awards'
          className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          수상 목록으로 돌아가기
        </Link>
      </div>

      <section className='container mx-auto px-4 py-8'>
        <Card className='mb-8 border-border/50'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='flex items-start gap-3'>
                <Calendar className='h-5 w-5 text-scholar-red mt-0.5' />
                <div>
                  <p className='text-sm text-muted-foreground'>일시</p>
                  <p className='font-medium text-foreground'>{displayData.date}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Award className='h-5 w-5 text-scholar-red mt-0.5' />
                <div>
                  <p className='text-sm text-muted-foreground'>장소</p>
                  <p className='font-medium text-foreground'>{displayData.venue}</p>
                </div>
              </div>
              {displayData.totalEntries && (
                <div className='flex items-start gap-3'>
                  <Users className='h-5 w-5 text-scholar-red mt-0.5' />
                  <div>
                    <p className='text-sm text-muted-foreground'>총 출품</p>
                    <p className='font-medium text-foreground'>
                      {displayData.totalEntries.toLocaleString()}점
                    </p>
                  </div>
                </div>
              )}
              <div className='flex items-start gap-3'>
                <Trophy className='h-5 w-5 text-scholar-red mt-0.5' />
                <div>
                  <p className='text-sm text-muted-foreground'>수상자 (등록)</p>
                  <p className='font-medium text-foreground'>{totalWinners}명</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {displayData.judges.length > 0 && (
          <Card className='mb-8 border-border/50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Users className='h-5 w-5 text-scholar-red' />
                심사위원
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {displayData.judges.map((judge, i) => (
                  <Badge key={i} variant='outline' className='px-3 py-1'>
                    {judge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {displayData.status === 'upcoming' && (
          <Card className='mb-8 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'>
            <CardContent className='pt-6 flex items-start gap-3'>
              <Info className='h-5 w-5 text-blue-600 mt-0.5 shrink-0' />
              <div>
                <p className='font-medium text-blue-800 dark:text-blue-300 mb-1'>개최 예정</p>
                <p className='text-sm text-blue-700 dark:text-blue-400'>
                  {displayData.title}은 아직 개최 전입니다. 일정이 확정되면 공지사항을 통해
                  안내드리겠습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className='text-2xl font-semibold text-foreground mb-6'>수상 부문별 결과</h2>
        <div className='space-y-6'>
          {displayData.categories.map(category => {
            const Icon = category.icon
            return (
              <Card key={category.id} className='border-border/50 overflow-hidden'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.name}
                      <span className='text-sm font-normal text-muted-foreground'>
                        ({category.nameEn})
                      </span>
                    </CardTitle>
                    <Badge variant='outline' className={category.badgeColor}>
                      {category.winners.length > 0
                        ? `${category.winners.length}명`
                        : `최대 ${category.maxCount}명`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.winners.length > 0 ? (
                    <div className='divide-y divide-border/50'>
                      {category.winners.map((winner, i) => (
                        <div
                          key={i}
                          className='py-3 first:pt-0 last:pb-0 flex items-center justify-between'
                        >
                          <div className='flex items-center gap-3'>
                            <span className='text-sm font-medium text-foreground w-8 text-center'>
                              {i + 1}
                            </span>
                            <div>
                              <p className='font-medium text-foreground'>{winner.name}</p>
                              <p className='text-sm text-muted-foreground'>{winner.title}</p>
                            </div>
                          </div>
                          <Badge variant='secondary' className='text-xs'>
                            {winner.script}
                          </Badge>
                        </div>
                      ))}
                      {category.winners.length < category.maxCount && (
                        <p className='pt-3 text-xs text-muted-foreground italic'>
                          외 {category.maxCount - category.winners.length}명 (상세 명단은 추후
                          업데이트 예정)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground italic py-2'>
                      {displayData.status === 'upcoming'
                        ? '수상자가 아직 선정되지 않았습니다.'
                        : '상세 수상자 명단은 추후 업데이트될 예정입니다.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {!hasDbData && (
          <Card className='mt-8 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'>
            <CardContent className='pt-6 flex items-start gap-3'>
              <Info className='h-5 w-5 text-amber-600 mt-0.5 shrink-0' />
              <div>
                <p className='font-medium text-amber-800 dark:text-amber-300 mb-1'>데이터 안내</p>
                <p className='text-sm text-amber-700 dark:text-amber-400'>
                  현재 표시되는 수상자 정보는 일부 샘플 데이터입니다. 전체 수상자 명단은
                  데이터베이스 시딩 후 자동으로 업데이트됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section className='container mx-auto px-4 py-8 border-t'>
        <div className='flex items-center justify-between'>
          <div className='flex gap-2'>
            {validYears
              .sort((a, b) => b - a)
              .map(y => (
                <Link key={y} href={`/awards/${y}`}>
                  <Button
                    variant={y === yearNum ? 'default' : 'outline'}
                    size='sm'
                    className={y === yearNum ? 'bg-scholar-red hover:bg-scholar-red/90' : ''}
                  >
                    {y}
                  </Button>
                </Link>
              ))}
          </div>
          <Link href='/awards'>
            <Button variant='outline' size='sm'>
              전체 목록
            </Button>
          </Link>
        </div>
      </section>

      <LayoutFooter />
    </main>
  )
}
