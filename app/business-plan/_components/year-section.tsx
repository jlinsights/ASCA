import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Award, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type ExhibitionYear } from './business-plan-data'

interface YearSectionProps {
  exhibition: ExhibitionYear
}

export function YearSection({ exhibition }: YearSectionProps) {
  const { year, title, venue, period, posterSrc, exhibitionLink, ceremony } = exhibition

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className='flex flex-col md:flex-row'>
          {posterSrc && (
            <div className='relative w-full md:w-64 lg:w-72 shrink-0 bg-muted/30'>
              {exhibitionLink ? (
                <Link href={exhibitionLink} className='block group'>
                  <Image
                    src={posterSrc}
                    alt={`${title} 포스터`}
                    width={400}
                    height={560}
                    className='w-full h-auto object-contain transition-transform group-hover:scale-[1.02]'
                    unoptimized
                  />
                </Link>
              ) : (
                <Image
                  src={posterSrc}
                  alt={`${title} 포스터`}
                  width={400}
                  height={560}
                  className='w-full h-auto object-contain'
                  unoptimized
                />
              )}
            </div>
          )}

          <div className='flex flex-col justify-center gap-3 p-5 md:p-6'>
            <Badge variant='outline' className='w-fit border-scholar-red/40 text-scholar-red'>
              {year}년
            </Badge>

            <h3 className='text-lg font-bold'>{title}</h3>

            <div className='space-y-2 text-sm text-muted-foreground'>
              <div className='flex items-start gap-2'>
                <MapPin className='h-4 w-4 mt-0.5 shrink-0 text-scholar-red/70' />
                <span>{venue}</span>
              </div>
              <div className='flex items-start gap-2'>
                <Calendar className='h-4 w-4 mt-0.5 shrink-0 text-scholar-red/70' />
                <span>{period}</span>
              </div>
              {ceremony && (
                <div className='flex items-start gap-2'>
                  <Award className='h-4 w-4 mt-0.5 shrink-0 text-scholar-red/70' />
                  <span>시상식: {ceremony}</span>
                </div>
              )}
            </div>

            {exhibitionLink && (
              <Link
                href={exhibitionLink}
                className='inline-flex items-center gap-1.5 text-sm font-medium text-scholar-red hover:underline mt-1'
              >
                전시 상세보기
                <ExternalLink className='h-3.5 w-3.5' />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
