import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Calendar,
  Star,
  Medal,
  Award,
  ArrowRight,
  Crown,
  Sparkles,
  CheckCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '수상 | 대한민국 동양서예대전 - ASCA',
  description:
    '대한민국 동양서예대전 역대 수상 내역을 확인하세요. 매년 개최되는 서예 공모전의 대상, 최우수상, 우수상, 특선, 입선 수상작을 연도별로 살펴보실 수 있습니다.',
  openGraph: {
    title: '수상 | 대한민국 동양서예대전',
    description: '대한민국 동양서예대전 역대 수상 내역 (2019-2025)',
  },
}

const awardCategories = [
  {
    id: 'grand-prize',
    name: '대상',
    nameEn: 'Grand Prize',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    id: 'excellence',
    name: '최우수상',
    nameEn: 'Excellence Award',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'merit',
    name: '우수상',
    nameEn: 'Merit Award',
    icon: Medal,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'special',
    name: '특선',
    nameEn: 'Special Selection',
    icon: Star,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'selected',
    name: '입선',
    nameEn: 'Selected',
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
]

const contestYears = [
  {
    year: 2025,
    edition: '제22회',
    title: '제22회 대한민국 동양서예대전',
    status: 'upcoming' as const,
    totalEntries: null,
    highlights: ['2025년 하반기 개최 예정', '출품 접수 안내 예정'],
  },
  {
    year: 2024,
    edition: '제21회',
    title: '제21회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 1250,
    highlights: ['대상 1명', '최우수상 2명', '우수상 5명', '특선 30명', '입선 100명'],
  },
  {
    year: 2023,
    edition: '제20회',
    title: '제20회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 1180,
    highlights: ['20회 기념 특별전 동시 개최', '해외 작가 참여 확대'],
  },
  {
    year: 2022,
    edition: '제19회',
    title: '제19회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 980,
    highlights: ['한·중·일 교류전 병행', '온라인 전시 도입'],
  },
  {
    year: 2021,
    edition: '제18회',
    title: '제18회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 850,
    highlights: ['비대면 심사 진행', '온라인 시상식'],
  },
  {
    year: 2020,
    edition: '제17회',
    title: '제17회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 720,
    highlights: ['COVID-19 대응 축소 운영', '온라인 갤러리 개설'],
  },
  {
    year: 2019,
    edition: '제16회',
    title: '제16회 대한민국 동양서예대전',
    status: 'completed' as const,
    totalEntries: 1100,
    highlights: ['역대 최대 규모 전시', '국제 심사위원 참여'],
  },
]

const statusConfig = {
  upcoming: { label: '예정', className: 'bg-blue-100 text-blue-800' },
  completed: { label: '완료', className: 'bg-green-100 text-green-800' },
}

export default function AwardsPage() {
  return (
    <main className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-transparent'>
        <div className='container mx-auto px-4 text-center'>
          <Badge className='mb-4 bg-scholar-red text-white hover:bg-scholar-red/90'>Awards</Badge>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4'>
            수 상
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>
            Awards &amp; Achievements
          </p>
          <p className='mt-4 text-muted-foreground max-w-3xl mx-auto'>
            매년 개최되는 대한민국 동양서예대전의 역대 수상 내역을 연도별로 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto mb-12'>
          <h2 className='text-2xl font-semibold text-foreground mb-6 flex items-center gap-2'>
            <Award className='h-6 w-6 text-scholar-red' />
            수상 부문
          </h2>
          <div className='flex flex-wrap gap-3'>
            {awardCategories.map(cat => {
              const Icon = cat.icon
              return (
                <Badge
                  key={cat.id}
                  variant='outline'
                  className={`${cat.color} px-3 py-1.5 text-sm`}
                >
                  <Icon className='h-3.5 w-3.5 mr-1.5' />
                  {cat.name}
                  <span className='ml-1 opacity-60 text-xs'>({cat.nameEn})</span>
                </Badge>
              )
            })}
          </div>
        </div>

        <h2 className='text-2xl font-semibold text-foreground mb-8 flex items-center gap-2'>
          <Calendar className='h-6 w-6 text-scholar-red' />
          연도별 수상 내역
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {contestYears.map(contest => {
            const status = statusConfig[contest.status]
            return (
              <Link key={contest.year} href={`/awards/${contest.year}`}>
                <Card className='h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/60 group'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <Badge variant='outline' className='text-scholar-red border-scholar-red/30'>
                        {contest.edition}
                      </Badge>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <CardTitle className='text-3xl font-bold text-foreground'>
                      {contest.year}
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>{contest.title}</p>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {contest.totalEntries && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Sparkles className='h-4 w-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>총 출품</span>
                        <span className='font-medium text-foreground'>
                          {contest.totalEntries.toLocaleString()}점
                        </span>
                      </div>
                    )}
                    <ul className='space-y-1.5'>
                      {contest.highlights.map((highlight, i) => (
                        <li
                          key={i}
                          className='text-sm text-muted-foreground flex items-start gap-2'
                        >
                          <span className='text-scholar-red mt-1.5 shrink-0'>•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className='flex items-center text-sm text-scholar-red font-medium group-hover:gap-2 transition-all pt-2'>
                      상세보기
                      <ArrowRight className='h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform' />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <section className='container mx-auto px-4 py-12 border-t'>
        <div className='max-w-3xl mx-auto text-center'>
          <Trophy className='h-12 w-12 text-scholar-red mx-auto mb-4' />
          <h2 className='text-2xl font-semibold text-foreground mb-4'>대한민국 동양서예대전</h2>
          <p className='text-muted-foreground leading-relaxed mb-6'>
            매년 개최되는 국내 최대 규모의 서예 공모전으로, 전통 서예의 계승과 발전을 위해 노력하고
            있습니다. 국내외 서예 애호가 누구나 참여 가능하며, 접수 마감은 매년 12월 31일까지입니다.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <p className='text-3xl font-bold text-scholar-red'>7+</p>
                <p className='text-sm text-muted-foreground mt-1'>역대 개최 횟수</p>
              </CardContent>
            </Card>
            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <p className='text-3xl font-bold text-scholar-red'>6,000+</p>
                <p className='text-sm text-muted-foreground mt-1'>누적 출품 수</p>
              </CardContent>
            </Card>
            <Card className='border-border/50'>
              <CardContent className='pt-6'>
                <p className='text-3xl font-bold text-scholar-red'>1,000+</p>
                <p className='text-sm text-muted-foreground mt-1'>누적 수상자</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </main>
  )
}
