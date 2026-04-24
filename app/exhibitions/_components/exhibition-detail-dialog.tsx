'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Clock, Ticket, Star, Heart, Info } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { Exhibition } from '@/lib/types/cms-legacy'
import { statusColors, statusLabels, formatExhibitionDate, formatPrice } from './exhibitions-meta'

interface ExhibitionDetailDialogProps {
  exhibition: Exhibition | null
  onClose: () => void
  isLiked: boolean
  onToggleLike: (id: string) => void
}

export function ExhibitionDetailDialog({
  exhibition,
  onClose,
  isLiked,
  onToggleLike,
}: ExhibitionDetailDialogProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={!!exhibition} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto'>
        {exhibition && (
          <>
            <DialogHeader>
              <DialogTitle className='text-2xl font-semibold'>{exhibition.title}</DialogTitle>
            </DialogHeader>

            <div className='space-y-6'>
              {/* 헤더 이미지 */}
              <div className='relative aspect-[16/9] bg-muted rounded-lg overflow-hidden'>
                <Image
                  src={exhibition.featured_image_url || '/images/exhibitions/poster-20th.avif'}
                  alt={exhibition.title}
                  fill
                  className='object-cover'
                />
                <div className='absolute inset-0 bg-black/20' />

                <div className='absolute bottom-4 left-4 right-4'>
                  <div className='flex items-end justify-between'>
                    <div>
                      <h2 className='text-2xl font-bold text-white mb-1'>{exhibition.title}</h2>
                      <p className='text-white/90'>{exhibition.subtitle}</p>
                    </div>

                    <div className='flex gap-2'>
                      <Badge
                        className={statusColors[exhibition.status as keyof typeof statusColors]}
                      >
                        {statusLabels[exhibition.status as keyof typeof statusLabels]}
                      </Badge>
                      {exhibition.is_featured && (
                        <Badge className='bg-yellow-500 hover:bg-yellow-600'>
                          <Star className='h-3 w-3 mr-1' />
                          주요
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 탭 콘텐츠 */}
              <Tabs defaultValue='info' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
                  <TabsTrigger value='info'>{t('info')}</TabsTrigger>
                  <TabsTrigger value='artists'>{t('artists')}</TabsTrigger>
                  <TabsTrigger value='artworks'>{t('artworks')}</TabsTrigger>
                  <TabsTrigger value='gallery'>{t('gallery')}</TabsTrigger>
                </TabsList>

                <TabsContent value='info' className='space-y-4'>
                  {/* 기본 정보 */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h3 className='font-semibold mb-3'>{t('exhibitionInfo')}</h3>
                      <div className='space-y-3 text-sm'>
                        <div className='flex items-start gap-3'>
                          <Calendar className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div>
                            <div className='font-medium'>{t('duration')}</div>
                            <div className='text-muted-foreground'>
                              {formatExhibitionDate(exhibition.start_date)} -{' '}
                              {formatExhibitionDate(exhibition.end_date)}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-start gap-3'>
                          <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div>
                            <div className='font-medium'>{t('venue')}</div>
                            <div className='text-muted-foreground'>{exhibition.venue}</div>
                            <div className='text-xs text-muted-foreground'>
                              {exhibition.address}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-start gap-3'>
                          <Clock className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div>
                            <div className='font-medium'>{t('hours')}</div>
                            <div className='text-muted-foreground'>{exhibition.opening_hours}</div>
                          </div>
                        </div>

                        <div className='flex items-start gap-3'>
                          <Ticket className='h-4 w-4 text-muted-foreground mt-0.5' />
                          <div>
                            <div className='font-medium'>{t('admission')}</div>
                            <div className='text-muted-foreground'>
                              {exhibition.is_free
                                ? t('free')
                                : exhibition.ticket_price
                                  ? formatPrice(
                                      exhibition.ticket_price,
                                      exhibition.currency || 'KRW'
                                    )
                                  : t('contactForPrice')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='font-semibold mb-3'>{t('contact')}</h3>
                      <div className='space-y-3 text-sm'>
                        <div>
                          <div className='font-medium'>{t('curator')}</div>
                          <div className='text-muted-foreground'>{exhibition.curator}</div>
                        </div>

                        <div>
                          <div className='font-medium'>{t('phone')}</div>
                          <div className='text-muted-foreground'>{exhibition.contact}</div>
                        </div>

                        <div>
                          <div className='font-medium'>{t('website')}</div>
                          <a
                            href={exhibition.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-celadon hover:underline'
                          >
                            {exhibition.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 설명 */}
                  <div>
                    <h3 className='font-semibold mb-3'>{t('about')}</h3>
                    <p className='text-muted-foreground leading-relaxed'>
                      {exhibition.description}
                    </p>
                  </div>

                  {/* 통계 */}
                  <div>
                    <h3 className='font-semibold mb-3'>{t('statistics')}</h3>
                    {exhibition.stats ? (
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center'>
                        <div className='p-3 bg-muted rounded-lg'>
                          <div className='text-2xl font-bold text-celadon'>
                            {exhibition.stats.total_artworks}
                          </div>
                          <div className='text-sm text-muted-foreground'>{t('artworks')}</div>
                        </div>
                        <div className='p-3 bg-muted rounded-lg'>
                          <div className='text-2xl font-bold text-celadon'>
                            {exhibition.stats.total_artists}
                          </div>
                          <div className='text-sm text-muted-foreground'>{t('artists')}</div>
                        </div>
                        <div className='p-3 bg-muted rounded-lg'>
                          <div className='text-2xl font-bold text-celadon'>
                            {exhibition.stats.view_count}
                          </div>
                          <div className='text-sm text-muted-foreground'>{t('views')}</div>
                        </div>
                        <div className='p-3 bg-muted rounded-lg'>
                          <div className='text-2xl font-bold text-celadon'>
                            {exhibition.stats.likes}
                          </div>
                          <div className='text-sm text-muted-foreground'>{t('likes')}</div>
                        </div>
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>{t('statisticsNotAvailable')}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='artists'>
                  {exhibition.participating_artists &&
                  exhibition.participating_artists.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {exhibition.participating_artists.map(artist => (
                        <Card key={artist.id}>
                          <CardContent className='p-4'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <h4 className='font-medium'>{artist.name}</h4>
                                <p className='text-sm text-muted-foreground'>
                                  {artist.specialty || ''}
                                </p>
                              </div>
                              <Badge variant='outline' className='text-xs'>
                                {t('artist')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-center py-8'>
                      {t('noArtistsAvailable')}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value='artworks'>
                  {exhibition.featured_artworks && exhibition.featured_artworks.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {exhibition.featured_artworks.map(artwork => (
                        <Card key={artwork.id} className='overflow-hidden'>
                          <CardContent className='p-0'>
                            <div className='relative aspect-[3/4] bg-muted'>
                              <Image
                                src={artwork.image_url}
                                alt={artwork.title}
                                fill
                                className='object-cover'
                              />
                            </div>
                            <div className='p-3'>
                              <h4 className='font-medium mb-1'>{artwork.title}</h4>
                              <p className='text-sm text-muted-foreground'>{artwork.artist_name}</p>
                              {artwork.year && (
                                <p className='text-xs text-muted-foreground'>{artwork.year}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-center py-8'>
                      {t('noArtworksAvailable')}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value='gallery'>
                  {exhibition.gallery_images && exhibition.gallery_images.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {exhibition.gallery_images.map((image, index) => (
                        <div
                          key={index}
                          className='relative aspect-[4/3] bg-muted rounded-lg overflow-hidden'
                        >
                          <Image
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-center py-8'>
                      {t('noGalleryImagesAvailable')}
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              {/* 액션 버튼 */}
              <div className='flex gap-2 pt-4 border-t'>
                <Button className='flex-1' onClick={() => onToggleLike(exhibition.id)}>
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {t('like')}
                </Button>
                <Button variant='outline'>
                  <Info className='h-4 w-4 mr-2' />
                  {t('details')}
                </Button>
                {exhibition.status === 'current' && (
                  <Button className='bg-celadon hover:bg-celadon/90'>
                    <Ticket className='h-4 w-4 mr-2' />
                    {t('bookTickets')}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
