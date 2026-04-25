import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import type { AwardCategory } from './awards-data'

interface AwardCategoriesListProps {
  categories: AwardCategory[]
  status: 'upcoming' | 'completed'
  hasDbData: boolean
}

export function AwardCategoriesList({ categories, status, hasDbData }: AwardCategoriesListProps) {
  return (
    <section className='py-8'>
      <h2 className='text-2xl font-semibold text-foreground mb-6'>수상 부문별 결과</h2>
      <div className='space-y-6'>
        {categories.map(category => {
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
                    {status === 'upcoming'
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
                현재 표시되는 수상자 정보는 일부 샘플 데이터입니다. 전체 수상자 명단은 데이터베이스
                시딩 후 자동으로 업데이트됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
