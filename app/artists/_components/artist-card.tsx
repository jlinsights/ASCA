'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Award, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArtistShareButton } from '@/components/kakao/kakao-share-button'
import { artNameLabel, type PublicArtist as Artist } from '@/lib/api/artist-mapper'
import { artistDisplayName, lifeYearsLabel } from '@/lib/api/artist-life'
import { artistNativeHanName, artistNativeName } from '@/lib/api/artist-name'
import { getSpecialtyBadgeStyle, sortSpecialties } from './artists-meta'
import { regulationGrade } from './artist-filter-options'

interface ArtistCardProps {
  artist: Artist
  variant: 'pc' | 'mobile'
}

const HAN = /[㐀-鿿豈-﫿]/

/** 사진이 없을 때 사진 칸에 쓸 이름 — 한자 이름이 있으면 한자, 없으면 한글 */
export function photoPlaceholderName(
  artist: Pick<Artist, 'name' | 'nameZh'> & Partial<Pick<Artist, 'nationality' | 'nameJa'>>
): string {
  const nativeName = artistNativeHanName(artist)
  if (nativeName) return nativeName
  const zh = artist.nameZh?.trim()
  return zh && HAN.test(zh) ? zh : artist.name
}

export function ArtistCard({ artist, variant }: ArtistCardProps) {
  const isPc = variant === 'pc'
  const placeholderName = photoPlaceholderName(artist)
  const grade = regulationGrade(artist.membershipType)
  const nativeName = artistNativeName(artist)
  const displayName = artistDisplayName(nativeName, artist.deathYear)
  const lifeYears = lifeYearsLabel(artist.birthYear, artist.deathYear)
  const artName = artNameLabel(artist.artNameKo, artist.artNameHanja)

  const nameClass = isPc
    ? 'font-bold text-xl text-foreground group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0'
    : 'font-bold text-lg text-foreground line-clamp-1 group-hover:text-scholar-red dark:group-hover:text-scholar-red transition-colors duration-200 flex-1 min-w-0'

  const birthYearIconClass = isPc ? 'h-4 w-4' : 'h-3 w-3'
  const birthYearTextClass = isPc ? 'font-mono text-sm' : 'font-mono text-xs'
  const bioClass = isPc
    ? 'text-sm text-muted-foreground line-clamp-2 leading-relaxed'
    : 'text-xs text-muted-foreground line-clamp-2 leading-relaxed'

  const cardShadowClass = isPc
    ? 'group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 dark:shadow-black/20 dark:hover:shadow-black/40'
    : 'group overflow-hidden border-0 shadow-md dark:shadow-black/20'

  const cardContentClass = isPc
    ? 'p-6 space-y-4 bg-gradient-to-b from-background to-muted/10 dark:from-background dark:to-muted/5'
    : 'p-4 space-y-3 bg-gradient-to-b from-background to-muted/5 dark:from-background dark:to-muted/3'

  // 모바일 — 두 칸 격자에 맞춘 간결한 카드(2026-11-01). 카드 전체가 상세로 가는 링크이고,
  // 공유 단추만 사진 귀퉁이에 따로 둔다. 소개글·상세보기 단추는 상세 페이지가 보여 준다
  if (!isPc) {
    return (
      // 초점 링은 카드 자신에 그린다 — 링크에 그리면 카드의 overflow-hidden 에 잘린다 (Codex #214)
      <Card
        key={artist.id}
        className='group relative overflow-hidden border-0 shadow-sm has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-ring has-[a[data-card-link]:focus-visible]:ring-offset-2'
      >
        <Link
          href={`/artists/${artist.id}`}
          data-card-link=''
          className='block rounded-[inherit] focus-visible:outline-none'
        >
          <ArtistPhoto
            artist={artist}
            nativeName={nativeName}
            placeholderName={placeholderName}
            sizes='50vw'
          />
          <div className='space-y-1 p-3'>
            <h3 className={nameClass}>{displayName}</h3>
            {artName && (
              <p className='text-xs text-muted-foreground'>
                <span className='sr-only'>아호 </span>
                {artName}
              </p>
            )}
            {(grade || artist.title) && (
              <p className='text-xs text-foreground'>
                {[grade, artist.title].filter(Boolean).join(' · ')}
              </p>
            )}
            {lifeYears && <p className='font-mono text-xs text-muted-foreground'>{lifeYears}</p>}
            {artist.specialties && artist.specialties.length > 0 && (
              <p className='line-clamp-1 text-xs text-muted-foreground'>
                {sortSpecialties(artist.specialties).slice(0, 2).join(' · ')}
              </p>
            )}
          </div>
        </Link>
        <ArtistShareButton
          title={`${displayName} 작가`}
          description={`${artist.specialties?.join(', ') || '서예 작가'} - ${artist.bio || '동양서예협회 소속 작가입니다.'}`}
          imageUrl={artist.profileImage ?? undefined}
          webUrl={`/artists/${artist.id}`}
          variant='outline'
          isIconOnly={true}
          size='md'
          className='absolute right-2 top-2 bg-background/90'
        />
      </Card>
    )
  }

  return (
    <Card key={artist.id} className={cardShadowClass}>
      <ArtistPhoto
        artist={artist}
        nativeName={nativeName}
        placeholderName={placeholderName}
        sizes='(max-width: 1279px) 33vw, 25vw'
      />

      <CardContent className={cardContentClass}>
        <div className={isPc ? 'space-y-2' : 'space-y-1'}>
          <div className={`flex items-baseline justify-between ${isPc ? 'gap-4' : 'gap-3'}`}>
            <h3 className={nameClass}>{displayName}</h3>
            {lifeYears && (
              <div className='flex items-center gap-2 text-muted-foreground flex-shrink-0'>
                <Calendar className={birthYearIconClass} />
                <span className={birthYearTextClass}>{lifeYears}</span>
              </div>
            )}
          </div>
          {artName && (
            <p className={isPc ? 'text-sm text-muted-foreground' : 'text-xs text-muted-foreground'}>
              <span className='sr-only'>아호 </span>
              {artName}
            </p>
          )}
        </div>

        {/* 등급도 직위도 없는 작가(준회원·공모작가 등)는 빈 구분선을 그리지 않는다 */}
        {!grade && !artist.title ? null : isPc ? (
          <div className='flex flex-col gap-2 pt-2 border-t border-border/30 dark:border-border/20'>
            {grade && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>작가 등급</span>
                <span className='font-medium text-foreground'>{grade}</span>
              </div>
            )}
            {artist.title && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>직위</span>
                <span className='font-medium text-foreground'>{artist.title}</span>
              </div>
            )}
          </div>
        ) : (
          <div className='text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30 dark:border-border/20'>
            {grade && (
              <div className='text-center'>
                <span className='text-foreground font-medium'>{grade}</span>
              </div>
            )}
            {artist.title && (
              <div className='text-center'>
                <span className='text-foreground font-medium'>{artist.title}</span>
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
              title={`${displayName} 작가`}
              description={`${artist.specialties?.join(', ') || '서예 작가'} - ${artist.bio || '동양서예협회 소속 작가입니다.'}`}
              imageUrl={artist.profileImage ?? undefined}
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

interface ArtistPhotoProps {
  artist: Artist
  nativeName: string
  placeholderName: string
  sizes: string
}

/** 사진 칸 — 사진 한 장만. 사진이 없으면 다른 사람 사진을 빌리지 않고 이 작가의 이름을 세로로 쓴다 */
function ArtistPhoto({ artist, nativeName, placeholderName, sizes }: ArtistPhotoProps) {
  return (
    <div className='relative aspect-square overflow-hidden bg-paper-2 dark:bg-navy-900'>
      {artist.profileImage ? (
        <Image
          src={artist.profileImage}
          alt={nativeName}
          fill
          sizes={sizes}
          className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
        />
      ) : (
        <div
          aria-hidden='true'
          className='absolute inset-0 flex items-center justify-center'
          lang={
            placeholderName === artist.nameJa?.trim()
              ? 'ja'
              : placeholderName === artist.nameZh?.trim()
                ? 'zh'
                : undefined
          }
        >
          <span className='font-serif font-semibold tracking-[0.18em] text-navy-900/70 dark:text-paper/70 [writing-mode:vertical-rl] text-4xl md:text-5xl'>
            {placeholderName}
          </span>
        </div>
      )}
    </div>
  )
}
