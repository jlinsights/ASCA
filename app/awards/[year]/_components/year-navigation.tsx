import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface YearNavigationProps {
  currentYear: number
  validYears: number[]
}

export function YearNavigation({ currentYear, validYears }: YearNavigationProps) {
  return (
    <section className='container mx-auto px-4 py-8 border-t'>
      <div className='flex items-center justify-between'>
        <div className='flex gap-2'>
          {validYears
            .sort((a, b) => b - a)
            .map(y => (
              <Link key={y} href={`/awards/${y}`}>
                <Button
                  variant={y === currentYear ? 'default' : 'outline'}
                  size='sm'
                  className={y === currentYear ? 'bg-scholar-red hover:bg-scholar-red/90' : ''}
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
  )
}
