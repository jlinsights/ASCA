'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Eye,
  MapPin,
  User,
  Star,
  Ticket,
  Clock,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Palette,
  Users,
  Instagram,
} from 'lucide-react'
import {
  EXHIBITION_STATUS_LABELS,
  EXHIBITION_ARTIST_ROLE_LABELS,
} from '@/types/exhibition'
import type { ExhibitionWithDetails } from '@/types/exhibition'
import {
  statusColors,
  formatExhibitionDate,
  getRemainingDays,
} from './exhibition-detail-meta'

interface ExhibitionDetailBodyProps {
  exhibition: ExhibitionWithDetails
}

export function ExhibitionDetailBody({ exhibition }: ExhibitionDetailBodyProps) {
  // Share handler
  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = exhibition.title || '동양서예협회 전시'

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank'
        )
        break
      case 'instagram':
        try {
          await navigator.clipboard.writeText(url)
          window.open('https://www.instagram.com', '_blank')
          alert(
            '인스타그램이 새 창에서 열렸습니다. 링크가 복사되었으니 게시물이나 스토리에 붙여넣어 공유해보세요!'
          )
        } catch (err) {
          alert('링크 복사에 실패했습니다.')
        }
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          alert('링크가 복사되었습니다.')
        } catch (err) {
          alert('링크 복사에 실패했습니다.')
        }
        break
    }
  }

  const exhibitionPeriod = `${formatExhibitionDate(exhibition.startDate)} ~ ${formatExhibitionDate(exhibition.endDate)}`
  const remainingDays = getRemainingDays(exhibition.endDate)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
      {/* Main Content */}
      <div className='lg:col-span-3 space-y-6'>
        {/* Exhibition Header */}
        <Card className='border-border/50'>
          <CardHeader className='pb-4'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3 flex-wrap'>
                <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                  {EXHIBITION_STATUS_LABELS[exhibition.status]?.ko}
                </Badge>
                {exhibition.isFeatured && (
                  <Badge variant='secondary' className='flex items-center gap-1'>
                    <Star className='h-3 w-3' />
                    주요 전시
                  </Badge>
                )}
                {remainingDays && exhibition.status === 'current' && (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {remainingDays}
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' onClick={() => handleShare('facebook')}>
                  <Facebook className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => handleShare('twitter')}>
                  <Twitter className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => handleShare('instagram')}>
                  <Instagram className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => handleShare('copy')}>
                  <LinkIcon className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <CardTitle className='text-2xl font-serif font-bold text-foreground mb-2'>
              {exhibition.title}
            </CardTitle>

            {exhibition.subtitle && (
              <p className='text-lg text-muted-foreground mb-4'>{exhibition.subtitle}</p>
            )}

            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>{exhibitionPeriod}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Eye className='h-4 w-4' />
                <span>{exhibition.views || 0}회</span>
              </div>
            </div>
          </CardHeader>

          {exhibition.featuredImageUrl && (
            <div className='px-6 pb-4'>
              <div className='relative w-full h-[900px] rounded-lg overflow-hidden bg-secondary/10'>
                <Image
                  src={exhibition.featuredImageUrl}
                  alt={exhibition.title}
                  fill
                  className='object-contain'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw'
                />
              </div>
            </div>
          )}

          <Separator />

          <CardContent className='pt-6'>
            {/* Exhibition Info */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              <div className='space-y-4'>
                {exhibition.location && (
                  <div className='flex items-start gap-3'>
                    <MapPin className='h-5 w-5 text-muted-foreground mt-0.5' />
                    <div>
                      <p className='font-medium text-foreground'>{exhibition.location}</p>
                      {exhibition.venue && (
                        <p className='text-sm text-muted-foreground'>{exhibition.venue}</p>
                      )}
                    </div>
                  </div>
                )}

                {exhibition.curator && (
                  <div className='flex items-center gap-3'>
                    <User className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-sm text-muted-foreground'>큐레이터</p>
                      <p className='font-medium text-foreground'>{exhibition.curator}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>전시 기간</p>
                    <p className='font-medium text-foreground'>{exhibitionPeriod}</p>
                  </div>
                </div>

                {exhibition.ticketPrice && (
                  <div className='flex items-center gap-3'>
                    <Ticket className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-sm text-muted-foreground'>입장료</p>
                      <p className='font-medium text-foreground'>
                        {exhibition.ticketPrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className='my-8' />

            {/* Description */}
            <div className='prose prose-slate dark:prose-invert max-w-none'>
              <h3 className='text-xl font-serif font-semibold text-foreground mb-4'>
                전시 소개
              </h3>
              <div className='whitespace-pre-wrap text-foreground leading-relaxed'>
                {exhibition.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exhibition Artworks */}
        {exhibition.artworks && exhibition.artworks.length > 0 && (
          <Card className='border-border/50'>
            <CardHeader>
              <CardTitle className='text-xl font-serif flex items-center gap-2'>
                <Palette className='w-5 h-5 text-celadon-green' />
                전시 작품 ({exhibition.artworks.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {exhibition.artworks
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map(artwork => (
                    <Link
                      key={artwork.id}
                      href={`/artworks/${artwork.artworkId}`}
                      className='group'
                    >
                      <Card className='overflow-hidden hover:shadow-md transition-shadow'>
                        <div className='relative aspect-[3/4] bg-celadon-green/10'>
                          {artwork.isFeatured && (
                            <div className='absolute top-2 right-2 z-10'>
                              <Badge className='bg-temple-gold/90 text-white'>
                                <Star className='w-3 h-3 mr-1 fill-current' />
                                대표
                              </Badge>
                            </div>
                          )}
                          <div className='w-full h-full flex items-center justify-center'>
                            <Palette className='w-12 h-12 text-celadon-green/30' />
                          </div>
                        </div>
                        <CardContent className='p-3'>
                          <p className='font-medium text-sm text-foreground line-clamp-1 group-hover:text-celadon-green transition-colors'>
                            작품 {artwork.displayOrder + 1}
                          </p>
                          {artwork.notes && (
                            <p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                              {artwork.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participating Artists */}
        {exhibition.artists && exhibition.artists.length > 0 && (
          <Card className='border-border/50'>
            <CardHeader>
              <CardTitle className='text-xl font-serif flex items-center gap-2'>
                <Users className='w-5 h-5 text-celadon-green' />
                참여 작가 ({exhibition.artists.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {exhibition.artists
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map(artist => (
                    <div
                      key={artist.id}
                      className='flex items-start gap-4 p-4 rounded-lg border border-celadon-green/20 hover:bg-celadon-green/5 transition-colors'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <p className='font-semibold text-foreground'>
                            작가 {artist.displayOrder + 1}
                          </p>
                          <Badge variant='outline' className='text-xs border-celadon-green/30'>
                            {EXHIBITION_ARTIST_ROLE_LABELS[artist.role]?.ko}
                          </Badge>
                        </div>
                        {artist.bio && (
                          <p className='text-sm text-muted-foreground'>{artist.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className='space-y-6'>
        {/* Exhibition Info Summary */}
        <Card className='border-border/50'>
          <CardHeader>
            <CardTitle className='text-lg font-serif'>전시 정보</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <p className='text-sm text-muted-foreground'>상태</p>
                <Badge className={statusColors[exhibition.status as keyof typeof statusColors]}>
                  {EXHIBITION_STATUS_LABELS[exhibition.status]?.ko}
                </Badge>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>기간</p>
                <p className='font-medium text-foreground text-sm'>{exhibitionPeriod}</p>
              </div>

              {exhibition.location && (
                <div>
                  <p className='text-sm text-muted-foreground'>장소</p>
                  <p className='font-medium text-foreground text-sm'>{exhibition.location}</p>
                  {exhibition.venue && (
                    <p className='text-xs text-muted-foreground'>{exhibition.venue}</p>
                  )}
                </div>
              )}

              <div>
                <p className='text-sm text-muted-foreground'>조회수</p>
                <p className='font-medium text-foreground text-sm'>
                  {(exhibition.views || 0).toLocaleString()}회
                </p>
              </div>

              {exhibition.artworks && exhibition.artworks.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground'>전시 작품</p>
                  <p className='font-medium text-foreground text-sm'>
                    {exhibition.artworks.length}개
                  </p>
                </div>
              )}

              {exhibition.artists && exhibition.artists.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground'>참여 작가</p>
                  <p className='font-medium text-foreground text-sm'>
                    {exhibition.artists.length}명
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className='border-border/50'>
          <CardHeader>
            <CardTitle className='text-lg font-serif'>빠른 이동</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Link href='/exhibitions'>
              <Button variant='outline' className='w-full justify-start'>
                전시 목록
              </Button>
            </Link>
            <Link href='/artworks'>
              <Button variant='outline' className='w-full justify-start'>
                갤러리
              </Button>
            </Link>
            <Link href='/artists'>
              <Button variant='outline' className='w-full justify-start'>
                작가 목록
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
