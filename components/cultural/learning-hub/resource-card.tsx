'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Users, CheckCircle, Lock, Heart, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningResource } from './types'
import { getDifficultyColor, getTypeIcon, formatDuration } from './learning-hub.utils'

interface ResourceCardProps {
  resource: LearningResource
  compact?: boolean
  isCompleted: boolean
  isUnlocked: boolean
  onSelect: (resource: LearningResource) => void
}

export function ResourceCard({
  resource,
  compact = false,
  isCompleted,
  isUnlocked,
  onSelect,
}: ResourceCardProps) {
  const TypeIcon = getTypeIcon(resource.type)

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-300',
        isCompleted && 'bg-summer-jade/10 border-summer-jade/30',
        !isUnlocked && 'opacity-60',
        compact ? 'h-auto' : 'h-full'
      )}
    >
      <CardContent className='p-4 h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <TypeIcon className='w-4 h-4 text-celadon-green' />
            <Badge className={`${getDifficultyColor(resource.difficulty)} text-ink-black text-xs`}>
              {resource.difficulty}
            </Badge>
          </div>

          <div className='flex items-center gap-1'>
            {isCompleted && <CheckCircle className='w-4 h-4 text-summer-jade' />}
            {!isUnlocked && <Lock className='w-4 h-4 text-ink-black/40' />}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1'>
          <h4 className='font-calligraphy font-semibold text-ink-black mb-2 line-clamp-1'>
            {resource.title.original}
          </h4>

          {!compact && (
            <p className='font-english text-sm text-ink-black/70 mb-1'>{resource.title.english}</p>
          )}

          <p className='text-sm text-ink-black/80 mb-3 line-clamp-2'>{resource.description}</p>

          {/* Metadata */}
          <div className='flex items-center gap-3 text-xs text-ink-black/60 mb-3'>
            <span className='flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              {formatDuration(resource.duration)}
            </span>
            <span className='flex items-center gap-1'>
              <Users className='w-3 h-3' />
              {resource.enrolled}
            </span>
            <span className='flex items-center gap-1'>
              <Star className='w-3 h-3' />
              {resource.rating.toFixed(1)}
            </span>
          </div>

          {/* Cultural Context */}
          {!compact && resource.cultural_context && (
            <div className='bg-temple-gold/10 rounded-md p-2 mb-3'>
              <p className='text-xs text-ink-black/70 font-serif italic line-clamp-2'>
                {resource.cultural_context}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className='flex flex-wrap gap-1 mb-3'>
            {resource.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
              <Badge
                key={index}
                variant='outline'
                className='text-xs border-celadon-green/30 text-celadon-green'
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          <Button
            size='sm'
            className='flex-1'
            disabled={!isUnlocked}
            onClick={() => onSelect(resource)}
          >
            {isCompleted ? 'Review' : 'Start Learning'}
          </Button>

          {!compact && (
            <>
              <Button size='sm' variant='outline' className='border-ink-black/20'>
                <Heart className='w-3 h-3' />
              </Button>
              <Button size='sm' variant='outline' className='border-ink-black/20'>
                <Share2 className='w-3 h-3' />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
