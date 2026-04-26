import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ExhibitionErrorProps {
  message: string
  kind?: 'not-found' | 'network' | 'unauthorized'
  backHref?: string
}

const HEADINGS: Record<NonNullable<ExhibitionErrorProps['kind']>, string> = {
  'not-found': '전시를 찾을 수 없습니다',
  network: '전시를 불러오는 중 문제가 발생했습니다',
  unauthorized: '이 작업을 수행할 권한이 없습니다',
}

export function ExhibitionError({
  message,
  kind = 'not-found',
  backHref = '/exhibitions',
}: ExhibitionErrorProps) {
  return (
    <div className="min-h-[60vh] bg-rice-paper grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div
          aria-hidden="true"
          className="font-brush text-[8rem] text-scholar-red/15 leading-none -mb-8 select-none"
        >
          空
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-3">
          {HEADINGS[kind]}
        </h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        <Link href={backHref}>
          <Button variant="outline" className="border-celadon-green/40 hover:bg-celadon-green/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
