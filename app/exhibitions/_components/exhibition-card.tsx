'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Eye, Star, Ticket, User, Users, ExternalLink } from 'lucide-react'
import type { Exhibition } from '@/types/cms'
import { statusColors, statusLabels, formatExhibitionDate } from './exhibitions-meta'

interface ExhibitionCardProps {
  exhibition: Exhibition
  featured?: boolean
}

export function ExhibitionCard({ exhibition, featured = false }: ExhibitionCardProps) {
  return (
    <Card
      className={`group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        featured
          ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-border/50 hover:border-border'
      }`}
    >
      <div className='relative'>
        <Link href={`/exhibitions/${exhibition.id}`}>
          <div className='aspect-[4/3] relative overflow-hidden cursor-pointer'>
            <Image
              src={exhibition.featured_image_url || '/images/exhibitions/poster-20th.avif'}
              alt={exhibition.title}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-300'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

            {/* 상태 배지 */}
            <div className='absolute top-3 right-3'>
              <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                {statusLabels[exhibition.status as keyof typeof statusLabels]}
              </Badge>
            </div>

            {/* 주요 전시회 표시 */}
            {exhibition.is_featured && (
              <div className='absolute top-3 left-3'>
                <Badge className='bg-amber-500 text-white border-0 shadow-md'>
                  <Star className='h-3 w-3 mr-1' />
                  주요
                </Badge>
              </div>
            )}

            {/* 조회수 */}
            <div className='absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1'>
              <div className='flex items-center gap-1 text-white text-sm'>
                <Eye className='h-3 w-3' />
                <span className='font-medium'>{exhibition.views}</span>
              </div>
            </div>
          </div>
        </Link>

        <CardContent className='p-6'>
          <div className='mb-3'>
            <Link href={`/exhibitions/${exhibition.id}`}>
              <h3 className='text-lg font-bold mb-2 text-foreground group-hover:text-primary cursor-pointer transition-colors line-clamp-2'>
                {exhibition.title}
              </h3>
            </Link>

            {exhibition.subtitle && (
              <p className='text-sm text-muted-foreground font-medium mb-2'>
                {exhibition.subtitle}
              </p>
            )}
          </div>

          <p className='text-muted-foreground mb-4 leading-relaxed line-clamp-3 text-sm'>
            {exhibition.description}
          </p>

          <div className='space-y-3 text-sm'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Calendar className='h-4 w-4 text-primary' />
              <span className='font-medium'>
                {formatExhibitionDate(exhibition.start_date)} -{' '}
                {formatExhibitionDate(exhibition.end_date)}
              </span>
            </div>

            {exhibition.venue && (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPin className='h-4 w-4 text-primary' />
                <span className='line-clamp-1'>{exhibition.venue}</span>
              </div>
            )}

            {exhibition.curator && (
              <div className='flex items-center gap-2 text-muted-foreground'>
                <User className='h-4 w-4 text-primary' />
                <span>큐레이터: {exhibition.curator}</span>
              </div>
            )}

            <div className='flex items-center justify-between pt-2 border-t border-border/30'>
              <div className='flex items-center gap-4'>
                {exhibition.max_capacity && (
                  <div className='flex items-center gap-1 text-muted-foreground'>
                    <Users className='h-4 w-4' />
                    <span className='text-xs'>{exhibition.max_capacity}명</span>
                  </div>
                )}
                <Link href={`/exhibitions/${exhibition.id}`}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs hover:bg-primary hover:text-primary-foreground transition-colors'
                  >
                    <ExternalLink className='h-3 w-3 mr-1' />
                    상세보기
                  </Button>
                </Link>
              </div>

              {exhibition.ticket_price && (
                <div className='flex items-center gap-1 text-primary font-bold'>
                  <Ticket className='h-4 w-4' />
                  <span>{exhibition.ticket_price.toLocaleString()}원</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
