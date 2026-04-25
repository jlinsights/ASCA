import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Calendar, Users, Info } from 'lucide-react'

interface ContestSummaryProps {
  date: string
  venue: string
  totalEntries: number | null
  totalWinners: number
  judges: string[]
  status: 'upcoming' | 'completed'
  title: string
}

export function ContestSummary({
  date,
  venue,
  totalEntries,
  totalWinners,
  judges,
  status,
  title,
}: ContestSummaryProps) {
  return (
    <div className='space-y-8'>
      <Card className='border-border/50'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='flex items-start gap-3'>
              <Calendar className='h-5 w-5 text-scholar-red mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>일시</p>
                <p className='font-medium text-foreground'>{date}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Award className='h-5 w-5 text-scholar-red mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>장소</p>
                <p className='font-medium text-foreground'>{venue}</p>
              </div>
            </div>
            {totalEntries && (
              <div className='flex items-start gap-3'>
                <Users className='h-5 w-5 text-scholar-red mt-0.5' />
                <div>
                  <p className='text-sm text-muted-foreground'>총 출품</p>
                  <p className='font-medium text-foreground'>{totalEntries.toLocaleString()}점</p>
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

      {judges.length > 0 && (
        <Card className='border-border/50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Users className='h-5 w-5 text-scholar-red' />
              심사위원
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {judges.map((judge, i) => (
                <Badge key={i} variant='outline' className='px-3 py-1'>
                  {judge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'upcoming' && (
        <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'>
          <CardContent className='pt-6 flex items-start gap-3'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5 shrink-0' />
            <div>
              <p className='font-medium text-blue-800 dark:text-blue-300 mb-1'>개최 예정</p>
              <p className='text-sm text-blue-700 dark:text-blue-400'>
                {title}은 아직 개최 전입니다. 일정이 확정되면 공지사항을 통해 안내드리겠습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
