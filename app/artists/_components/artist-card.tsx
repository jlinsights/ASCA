'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Award, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArtistShareButton } from '@/components/kakao/kakao-share-button'
import type { ArtistRow as Artist } from '@/lib/supabase'
import { getSpecialtyBadgeStyle, sortSpecialties } from './artists-meta'

interface ArtistCardProps {
  artist: Artist
  variant: 'pc' | 'mobile'
}

const DEFAULT_IMAGE = '/images/artists/kangdaehee.avif'

export function ArtistCard({ artist, variant }: ArtistCardProps) {
  const isPc = variant === 'pc'

  const nameClass = isPc
    ? 'font-bold text-xl text-foreground group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0'
    : 'font-bold text-lg text-foreground line-clamp-1 group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0'

  const birthYearIconClass = isPc ? 'h-4 w-4' : 'h-3 w-3'
  const birthYearTextClass = isPc ? 'font-mono text-sm' : 'font-mono text-xs'
  const bioClass = isPc
    ? 'text-sm text-muted-foreground line-clamp-2 leading-relaxed'
    : 'text-xs text-muted-foreground line-clamp-2 leading-relaxed'

  const cardShadowClass = isPc
    ? 'group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40'
    : 'group overflow-hidden border-0 shadow-md dark:shadow-gray-900/20'

  const cardContentClass = isPc
    ? 'p-6 space-y-4 bg-gradient-to-b from-background to-muted/10 dark:from-background dark:to-muted/5'
    : 'p-4 space-y-3 bg-gradient-to-b from-background to-muted/5 dark:from-background dark:to-muted/3'

  return (
    <Card key={artist.id} className={cardShadowClass}>
      <div className='relative aspect-square overflow-hidden'>
        <div className='relative group'>
          <Image
            src={artist.profileImage || DEFAULT_IMAGE}
            alt={artist.name}
            width={400}
            height={400}
            className='w-full h-64 object-cover rounded-lg transition-all duration-300 group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>

        <div className='space-y-4'>
          {artist.profileImage && (
            <div className='flex items-center justify-center'>
              <Image
                src={artist.profileImage}
                alt={artist.name}
                width={100}
                height={100}
                className='w-20 h-20 rounded-full object-cover border-2 border-celadon'
              />
            </div>
          )}

          <div className='text-center'>
            <h3 className='text-xl font-bold text-celadon mb-1'>{artist.name}</h3>
            <p className='text-sm text-muted-foreground'>
              {artist.nameEn || artist.birthYear
                ? `${artist.nameEn || ''} ${artist.birthYear ? `(${artist.birthYear})` : ''}`.trim()
                : ''}
            </p>
          </div>

          {artist.nationality && (
            <div className='flex items-center justify-center gap-1 text-sm text-muted-foreground'>
              <MapPin className='w-4 h-4' />
              <span>{artist.nationality}</span>
            </div>
          )}
        </div>
      </div>

      <CardContent className={cardContentClass}>
        <div className={isPc ? 'space-y-2' : 'space-y-1'}>
          <div className={`flex items-baseline justify-between ${isPc ? 'gap-4' : 'gap-3'}`}>
            <h3 className={nameClass}>{artist.name}</h3>
            {artist.birthYear && (
              <div className='flex items-center gap-2 text-muted-foreground flex-shrink-0'>
                <Calendar className={birthYearIconClass} />
                <span className={birthYearTextClass}>b. {artist.birthYear}</span>
              </div>
            )}
          </div>
        </div>

        {isPc ? (
          <div className='flex flex-col gap-2 pt-2 border-t border-border/30 dark:border-border/20'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>회원 구분</span>
              <span className='font-medium text-foreground'>{(artist as any).membership_type}</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>작가 유형</span>
              <span className='font-medium text-foreground'>{(artist as any).artist_type}</span>
            </div>
            {(artist as any).title && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>직위</span>
                <span className='font-medium text-foreground'>{(artist as any).title}</span>
              </div>
            )}
          </div>
        ) : (
          <div className='text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30 dark:border-border/20'>
            <div className='flex items-center justify-between'>
              <span className='text-foreground font-medium'>{(artist as any).membership_type}</span>
              <span>•</span>
              <span className='text-foreground font-medium'>{(artist as any).artist_type}</span>
            </div>
            {(artist as any).title && (
              <div className='text-center'>
                <span className='text-foreground font-medium'>{(artist as any).title}</span>
              </div>
            )}
          </div>
        )}

        {artist.specialties && artist.specialties.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {sortSpecialties(artist.specialties).map((specialty, index) => (
              <Badge
                key={index}
                variant='outline'
                className={`text-xs px-3 py-1 font-medium border transition-all duration-200 ${getSpecialtyBadgeStyle(specialty)}`}
              >
                {specialty}
              </Badge>
            ))}
          </div>
        )}

        {isPc
          ? artist.awards &&
            artist.awards.length > 0 && (
              <div className='text-sm text-muted-foreground space-y-1 pt-2 border-t border-border/50 dark:border-border/30'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    <Award className='h-3 w-3' />
                    <span className='text-xs'>수상 경력</span>
                  </div>
                  <span className='text-xs font-medium text-foreground'>
                    {artist.awards.length}개
                  </span>
                </div>
              </div>
            )
          : artist.awards &&
            artist.awards.length > 0 && (
              <div className='flex items-center justify-center text-xs text-muted-foreground pt-2 border-t border-border/30 dark:border-border/20'>
                <div className='flex items-center gap-1'>
                  <Award className='h-3 w-3' />
                  <span>
                    수상 <span className='font-medium text-foreground'>{artist.awards.length}</span>
                    개
                  </span>
                </div>
              </div>
            )}

        <p className={bioClass}>{artist.bio}</p>

        <div
          className={
            isPc
              ? 'pt-4 border-t border-border dark:border-border/30'
              : 'pt-3 border-t border-border/50 dark:border-border/30'
          }
        >
          <div className='flex gap-2'>
            <Link href={`/artists/${artist.id}`} className='flex-1'>
              <Button
                variant='outline'
                size={isPc ? 'default' : 'sm'}
                className={
                  isPc
                    ? 'w-full hover:bg-scholar-red hover:text-white hover:border-scholar-red dark:hover:bg-scholar-red dark:hover:text-white dark:hover:border-scholar-red transition-all duration-200'
                    : 'w-full text-xs h-8 hover:bg-scholar-red hover:text-white hover:border-scholar-red dark:hover:bg-scholar-red dark:hover:text-white dark:hover:border-scholar-red transition-all duration-200'
                }
              >
                {isPc ? '작가 상세보기' : '상세보기'}
              </Button>
            </Link>
            <ArtistShareButton
              title={`${artist.name} 작가`}
              description={`${artist.specialties?.join(', ') || '서예 작가'} - ${artist.bio || '동양서예협회 소속 작가입니다.'}`}
              imageUrl={artist.profileImage || DEFAULT_IMAGE}
              webUrl={`/artists/${artist.id}`}
              variant='outline'
              isIconOnly={true}
              size='md'
              className='flex-shrink-0'
              onShareSuccess={() => {
                // 공유 성공 처리 placeholder
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
