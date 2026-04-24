import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CulturalExchangeProgramInfo } from '@/lib/types/membership'
import { programTypeConfig, statusConfig } from './program-data'

interface ProgramCardProps {
  program: CulturalExchangeProgramInfo
  onSelect: (p: CulturalExchangeProgramInfo) => void
}

export function ProgramCard({ program, onSelect }: ProgramCardProps) {
  const typeConfig = programTypeConfig[program.programType]
  const statusConfig_ = statusConfig[program.status]
  const progressPercentage = (program.currentParticipants / program.maxParticipants) * 100

  const getDDay = (deadline: Date) => {
    const today = new Date()
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff > 0) return `D-${diff}`
    if (diff === 0) return 'D-Day'
    return '마감'
  }

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative h-48 overflow-hidden'>
        <Image
          src={program.images[0] || '/images/programs/cultural-exchange-1.avif'}
          alt={program.title}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <div className='absolute top-4 left-4 flex gap-2'>
          <Badge className={cn('text-white', typeConfig.color)}>
            {typeConfig.icon} {typeConfig.name}
          </Badge>
          <Badge className={cn(statusConfig_.bgColor, statusConfig_.color)}>
            {statusConfig_.name}
          </Badge>
        </div>
        {program.isFeatured && (
          <div className='absolute top-4 right-4'>
            <Badge className='bg-amber-500 text-white'>
              <Star className='w-3 h-3 mr-1' />
              추천
            </Badge>
          </div>
        )}
        {program.applicationDeadline && (
          <div className='absolute bottom-4 right-4'>
            <Badge variant='secondary' className='bg-black/50 text-white border-0'>
              <Clock className='w-3 h-3 mr-1' />
              {getDDay(program.applicationDeadline)}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div>
            <h3 className='text-xl font-bold mb-2'>{program.title}</h3>
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {program.description}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-muted-foreground' />
              <span>{program.startDate.toLocaleDateString()}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              <span>{program.duration}일</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-muted-foreground' />
              <span className='truncate'>{program.location}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4 text-muted-foreground' />
              <span>
                {program.currentParticipants}/{program.maxParticipants}명
              </span>
            </div>
          </div>

          <div>
            <div className='text-sm text-muted-foreground mb-2'>참가 국가</div>
            <div className='flex gap-2'>
              {program.countries.map(country => (
                <Badge key={country} variant='outline' className='text-xs'>
                  {country === 'KR' ? '🇰🇷 한국' : country === 'CN' ? '🇨🇳 중국' : country === 'JP' ? '🇯🇵 일본' : country}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className='flex justify-between text-sm mb-2'>
              <span>모집 진행률</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className='h-2' />
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold'>
                ₩{program.fee.toLocaleString()}
              </div>
              <div className='text-xs text-muted-foreground'>
                {program.accommodationProvided && '숙박 포함'}
                {program.mealsProvided && ' • 식사 포함'}
              </div>
            </div>
            <Button
              onClick={() => onSelect(program)}
              disabled={program.status !== 'open_for_applications'}
            >
              {program.status === 'open_for_applications' ? '신청하기' : '모집마감'}
              <ArrowRight className='w-4 h-4 ml-2' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
