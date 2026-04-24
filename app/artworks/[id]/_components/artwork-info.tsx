'use client'

import Link from 'next/link'
import {
  Heart,
  Share2,
  Eye,
  MessageCircle,
  Calendar,
  Palette,
  Ruler,
  User,
  ShoppingCart,
  Award,
  Star,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Artwork } from './artwork-types'
import { formatPrice, getCategoryLabel, getStyleLabel } from './artwork-utils'

interface ArtworkInfoProps {
  artwork: Artwork
  isLiked: boolean
  onToggleLike: () => void
}

export function ArtworkInfo({ artwork, isLiked, onToggleLike }: ArtworkInfoProps) {
  return (
    <div className='space-y-6'>
      <ArtworkHeader artwork={artwork} isLiked={isLiked} onToggleLike={onToggleLike} />
      <ArtworkPrice artwork={artwork} />
      <ArtworkQuickInfo artwork={artwork} />
      <ArtworkTags artwork={artwork} />
      <ArtworkTabs artwork={artwork} />
    </div>
  )
}

function ArtworkHeader({ artwork, isLiked, onToggleLike }: ArtworkInfoProps) {
  return (
    <div>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='flex flex-wrap gap-2 mb-3'>
            {artwork.isFeatured && (
              <Badge className='bg-red-600 text-white'>
                <Star className='w-3 h-3 mr-1' />
                추천작품
              </Badge>
            )}
            <Badge variant='outline' className='border-blue-200 text-blue-800'>
              {getCategoryLabel(artwork.category)}
            </Badge>
            <Badge variant='outline' className='border-green-200 text-green-800'>
              {getStyleLabel(artwork.style)}
            </Badge>
            {artwork.font && (
              <Badge variant='outline' className='border-purple-200 text-purple-800'>
                {artwork.font}
              </Badge>
            )}
            {artwork.paperSize && (
              <Badge variant='outline' className='border-orange-200 text-orange-800'>
                {artwork.paperSize}
              </Badge>
            )}
            {!artwork.isAvailable && <Badge variant='secondary'>판매완료</Badge>}
          </div>

          <h1 className='text-3xl md:text-4xl font-normal mb-2'>{artwork.title}</h1>

          <Link
            href={`/artists/${artwork.artistId || artwork.artist}`}
            className='text-lg text-muted-foreground hover:text-foreground transition-colors'
          >
            by {artwork.artist}
          </Link>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onToggleLike}
            className='flex items-center gap-2'
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            {artwork.likes + (isLiked ? 1 : 0)}
          </Button>
          <Button variant='outline' size='sm'>
            <Share2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground'>
        <div className='flex items-center'>
          <Calendar className='w-4 h-4 mr-2' />
          {artwork.year}년
        </div>
        <div className='flex items-center'>
          <Eye className='w-4 h-4 mr-2' />
          {artwork.views} 조회
        </div>
        <div className='flex items-center'>
          <Ruler className='w-4 h-4 mr-2' />
          {artwork.dimensions}
        </div>
      </div>
    </div>
  )
}

function ArtworkPrice({ artwork }: { artwork: Artwork }) {
  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-2xl font-bold mb-1'>
            {formatPrice(artwork.price, artwork.currency)}
          </div>
          <p className='text-sm text-muted-foreground'>작품 가격</p>
        </div>
        <div className='flex gap-2'>
          <Button size='lg' disabled={!artwork.isAvailable} className='flex items-center gap-2'>
            <MessageCircle className='h-4 w-4' />
            {artwork.isAvailable ? '구매 문의' : '판매완료'}
          </Button>
          <Button variant='outline' size='lg'>
            <ShoppingCart className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ArtworkQuickInfo({ artwork }: { artwork: Artwork }) {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <Palette className='h-5 w-5 text-blue-600' />
          <div>
            <p className='text-xs text-muted-foreground'>재료</p>
            <p className='text-sm font-medium'>{artwork.medium}</p>
          </div>
        </div>
      </Card>
      <Card className='p-4'>
        <div className='flex items-center gap-3'>
          <Info className='h-5 w-5 text-green-600' />
          <div>
            <p className='text-xs text-muted-foreground'>상태</p>
            <p className='text-sm font-medium'>{artwork.condition || '우수'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ArtworkTags({ artwork }: { artwork: Artwork }) {
  return (
    <div className='flex flex-wrap gap-2'>
      {artwork.tags.map((tag, index) => (
        <Badge key={index} variant='outline' className='text-xs'>
          #{tag}
        </Badge>
      ))}
    </div>
  )
}

function ArtworkTabs({ artwork }: { artwork: Artwork }) {
  return (
    <Tabs defaultValue='description' className='w-full'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='description'>작품설명</TabsTrigger>
        <TabsTrigger value='details'>세부정보</TabsTrigger>
        <TabsTrigger value='artist'>작가정보</TabsTrigger>
      </TabsList>

      <TabsContent value='description' className='space-y-4 mt-6'>
        <div className='prose prose-sm max-w-none'>
          <p className='leading-relaxed'>{artwork.description}</p>
          {artwork.significance && (
            <div className='mt-4 p-4 bg-muted/50 rounded-lg'>
              <h4 className='font-medium mb-2'>작품의 의미</h4>
              <p className='text-sm text-muted-foreground'>{artwork.significance}</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value='details' className='space-y-4 mt-6'>
        <ArtworkDetails artwork={artwork} />
      </TabsContent>

      <TabsContent value='artist' className='space-y-4 mt-6'>
        <div className='flex items-start gap-4'>
          <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center'>
            <User className='h-8 w-8 text-muted-foreground' />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-lg mb-2'>{artwork.artist}</h3>
            <p className='text-sm text-muted-foreground leading-relaxed mb-4'>
              {artwork.artistBio || '작가 정보가 준비 중입니다.'}
            </p>
            <Link
              href={`/artists/${artwork.artistId || artwork.artist}`}
              className='inline-flex items-center text-sm text-primary hover:underline'
            >
              작가 페이지 보기 →
            </Link>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function ArtworkDetails({ artwork }: { artwork: Artwork }) {
  return (
    <div className='space-y-3'>
      <DetailRow label='카테고리' value={getCategoryLabel(artwork.category)} />
      <DetailRow label='스타일' value={getStyleLabel(artwork.style)} />
      {artwork.font && <DetailRow label='서체' value={artwork.font} />}
      {artwork.paperSize && <DetailRow label='규격' value={artwork.paperSize} />}
      <DetailRow label='제작기법' value={artwork.technique || artwork.medium} />
      <DetailRow label='크기' value={artwork.dimensions} />
      {artwork.weight && <DetailRow label='무게' value={artwork.weight} />}
      {artwork.materials && artwork.materials.length > 0 && (
        <DetailRow label='사용재료' value={artwork.materials.join(', ')} />
      )}
      {artwork.certification && (
        <div className='flex justify-between py-3 border-b'>
          <span className='text-muted-foreground'>진품보증</span>
          <Badge variant='outline' className='text-green-600 border-green-600'>
            <Award className='w-3 h-3 mr-1' />
            인증완료
          </Badge>
        </div>
      )}
      {artwork.exhibition && (
        <div className='py-3 border-b'>
          <span className='text-muted-foreground block mb-1'>전시이력</span>
          <span className='text-sm'>{artwork.exhibition}</span>
        </div>
      )}
      {artwork.provenance && (
        <div className='py-3 border-b'>
          <span className='text-muted-foreground block mb-1'>소장이력</span>
          <span className='text-sm'>{artwork.provenance}</span>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between py-3 border-b'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  )
}
