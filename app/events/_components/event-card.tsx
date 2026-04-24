'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Star,
  Heart,
  Share2,
  ExternalLink,
  UserPlus,
  Timer,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  Gift,
  User,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Event } from '@/lib/types/cms-legacy'
import { useLanguage } from '@/contexts/language-context'
import {
  statusColors,
  categoryColors,
  getCategories,
  getStatusOptions,
  formatEventDate,
} from './events-meta'

function getStatusIcon(status: string) {
  switch (status) {
    case 'upcoming':
      return <Clock className='h-3 w-3' />
    case 'ongoing':
      return <Zap className='h-3 w-3' />
    case 'completed':
      return <CheckCircle className='h-3 w-3' />
    case 'cancelled':
      return <AlertCircle className='h-3 w-3' />
    default:
      return <Clock className='h-3 w-3' />
  }
}

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { language } = useLanguage()
  const categories = getCategories(language)
  const statusOptions = getStatusOptions(language)

  const handleLike = () => {
    // 좋아요 기능 구현 (로깅 제거)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`,
      })
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`)
      alert(language === 'ko' ? '링크가 복사되었습니다.' : 'Link copied to clipboard.')
    }
  }

  return (
    <Card
      className={`group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        event.is_featured
          ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-border/50 hover:border-border'
      }`}
    >
      <div className='relative'>
        <div className='aspect-video relative overflow-hidden'>
          <Image
            src={event.featured_image_url || '/images/events/event-photo-1.avif'}
            alt={event.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

          {/* 상태 배지 */}
          <div className='absolute top-3 left-3'>
            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
              <div className='flex items-center gap-1'>
                {getStatusIcon(event.status)}
                <span className='text-xs font-medium'>
                  {statusOptions.find(s => s.value === event.status)?.label || event.status}
                </span>
              </div>
            </Badge>
          </div>

          {/* 중요 행사 표시 */}
          {event.is_featured && (
            <div className='absolute top-3 right-3'>
              <Badge className='bg-amber-500 text-white border-0 shadow-md'>
                <Star className='h-3 w-3 mr-1' />
                {language === 'ko' ? '주요' : 'Featured'}
              </Badge>
            </div>
          )}

          {/* 조회수 */}
          <div className='absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1'>
            <div className='flex items-center gap-1 text-white text-sm'>
              <Eye className='h-3 w-3' />
              <span className='font-medium'>{event.views}</span>
            </div>
          </div>
        </div>

        <CardContent className='p-6'>
          {/* 카테고리 */}
          <div className='mb-3'>
            <Badge className={categoryColors[event.event_type as keyof typeof categoryColors]}>
              {categories.find(c => c.value === event.event_type)?.label || event.event_type}
            </Badge>
          </div>

          {/* 제목 */}
          <h3 className='text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors'>
            {event.title}
          </h3>

          {/* 설명 */}
          <p className='text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed'>
            {event.description}
          </p>

          {/* 메타 정보 */}
          <div className='space-y-2 mb-4'>
            {/* 일시 */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Calendar className='h-4 w-4 text-primary' />
              <span className='font-medium'>{formatEventDate(event.event_date, language)}</span>
            </div>

            {/* 장소 */}
            {event.location && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <MapPin className='h-4 w-4 text-primary' />
                <span className='font-medium'>{event.location}</span>
              </div>
            )}

            {/* 주최자 */}
            {event.organizer && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <User className='h-4 w-4 text-primary' />
                <span className='font-medium'>{event.organizer}</span>
              </div>
            )}
          </div>

          {/* 추가 정보 */}
          <div className='flex items-center justify-between pt-3 border-t border-border/30'>
            <div className='flex items-center gap-4'>
              {/* 정원 */}
              {event.max_participants && (
                <div className='flex items-center gap-1 text-muted-foreground'>
                  <Users className='h-4 w-4' />
                  <span className='text-xs'>{event.max_participants}명</span>
                </div>
              )}
            </div>

            {/* 참가비 */}
            {event.registration_fee && (
              <div className='flex items-center gap-1 text-primary font-bold'>
                <Gift className='h-4 w-4' />
                <span className='text-sm'>{event.registration_fee.toLocaleString()}원</span>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className='flex items-center justify-between mt-4'>
            <Link href={`/events/${event.id}`}>
              <Button variant='outline' size='sm' className='border-border/50 hover:bg-primary/5'>
                {language === 'ko' ? '자세히 보기' : 'View Details'}
                <ExternalLink className='h-3 w-3 ml-1' />
              </Button>
            </Link>

            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                onClick={handleLike}
                title={language === 'ko' ? '좋아요' : 'Like'}
              >
                <Heart className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                onClick={handleShare}
                title={language === 'ko' ? '공유하기' : 'Share'}
              >
                <Share2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
