import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

interface AwardHeroProps {
  year: number
  edition: string
  title: string
}

export function AwardHero({ year, edition, title }: AwardHeroProps) {
  return (
    <PageHero
      {...PAGE_HERO_MARKS.awards}
      title={`${year}년 수상 내역`}
      lede={title}
      crumbs={[{ label: '수상', href: '/awards' }, { label: `${year}` }]}
    >
      <Badge className='bg-scholar-red text-white hover:bg-scholar-red/90'>{edition}</Badge>
    </PageHero>
  )
}
