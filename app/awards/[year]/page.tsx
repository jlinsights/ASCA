import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ArrowLeft } from 'lucide-react'
import { getContestResultsByYearGrouped } from '@/lib/db/queries/contest-results'
import type { ContestResult } from '@/lib/db/schema'

// Extracted Components & Data
import { AwardHero } from './_components/award-hero'
import { ContestSummary } from './_components/contest-summary'
import { AwardCategoriesList } from './_components/award-categories-list'
import { YearNavigation } from './_components/year-navigation'
import { contestDataByYear, AwardCategory } from './_components/awards-data'

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
      <AwardHero year={displayData.year} edition={displayData.edition} title={displayData.title} />

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
        <ContestSummary
          date={displayData.date}
          venue={displayData.venue}
          totalEntries={displayData.totalEntries}
          totalWinners={totalWinners}
          judges={displayData.judges}
          status={displayData.status}
          title={displayData.title}
        />

        <AwardCategoriesList
          categories={displayData.categories}
          status={displayData.status}
          hasDbData={hasDbData}
        />
      </section>

      <YearNavigation currentYear={yearNum} validYears={validYears} />

      <LayoutFooter />
    </main>
  )
}
