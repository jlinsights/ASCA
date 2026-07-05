'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, Clock, Trophy, ChevronRight } from 'lucide-react'
import type { LearningPath, LearningResource, UserProgress } from './types'
import { getDifficultyColor } from './learning-hub.utils'
import { ResourceCard } from './resource-card'

interface OverviewTabProps {
  userProgress: UserProgress
  resources: LearningResource[]
  learningPaths: LearningPath[]
  isResourceCompleted: (resourceId: string) => boolean
  isResourceUnlocked: (resource: LearningResource) => boolean
  onSelectResource: (resource: LearningResource) => void
  onSelectPath: (pathId: string) => void
}

export function OverviewTab({
  userProgress,
  resources,
  learningPaths,
  isResourceCompleted,
  isResourceUnlocked,
  onSelectResource,
  onSelectPath,
}: OverviewTabProps) {
  return (
    <div className='space-y-6'>
      {/* Progress Summary */}
      <Card className='bg-gradient-to-r from-temple-gold/10 to-autumn-gold/10 border-temple-gold/20'>
        <CardHeader>
          <CardTitle className='font-calligraphy text-xl text-ink-black'>
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-temple-gold mb-2'>{userProgress.level}</div>
              <div className='text-sm text-ink-black/70'>Current Level</div>
              <Progress value={(userProgress.experience % 1000) / 10} className='mt-2 h-2' />
            </div>

            <div className='text-center'>
              <div className='text-3xl font-bold text-summer-jade mb-2'>
                {userProgress.streakDays}
              </div>
              <div className='text-sm text-ink-black/70'>Day Streak</div>
            </div>

            <div className='text-center'>
              <div className='text-3xl font-bold text-vermillion mb-2'>
                {userProgress.totalHours}
              </div>
              <div className='text-sm text-ink-black/70'>Hours Learned</div>
            </div>

            <div className='text-center'>
              <div className='text-3xl font-bold text-celadon-green mb-2'>
                {userProgress.achievements.length}
              </div>
              <div className='text-sm text-ink-black/70'>Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {userProgress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='font-calligraphy flex items-center gap-2'>
              <Trophy className='w-5 h-5 text-temple-gold' />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {userProgress.achievements.slice(0, 3).map(achievement => (
                <div
                  key={achievement.id}
                  className='flex items-center gap-3 p-3 bg-temple-gold/10 rounded-lg'
                >
                  <div className='text-2xl'>{achievement.icon}</div>
                  <div>
                    <h4 className='font-semibold text-ink-black'>{achievement.title}</h4>
                    <p className='text-sm text-ink-black/70'>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Resources */}
      <Card>
        <CardHeader>
          <CardTitle className='font-calligraphy flex items-center gap-2'>
            <Star className='w-5 h-5 text-temple-gold' />
            Featured Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {resources
              .filter(r => r.featured)
              .slice(0, 3)
              .map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  compact
                  isCompleted={isResourceCompleted(resource.id)}
                  isUnlocked={isResourceUnlocked(resource)}
                  onSelect={onSelectResource}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Preview */}
      <Card>
        <CardHeader>
          <CardTitle className='font-calligraphy'>Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {learningPaths.slice(0, 2).map(path => (
              <div
                key={path.id}
                className='p-4 border border-celadon-green/20 rounded-lg hover:bg-silk-cream/50 transition-colors cursor-pointer'
                onClick={() => onSelectPath(path.id)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-calligraphy font-semibold text-ink-black mb-2'>
                      {path.title}
                    </h4>
                    <p className='text-sm text-ink-black/70 mb-3'>{path.description}</p>

                    <div className='flex items-center gap-4 text-sm'>
                      <Badge className={`${getDifficultyColor(path.level)} text-ink-black`}>
                        {path.level}
                      </Badge>
                      <span className='text-ink-black/60'>
                        <Clock className='w-3 h-3 inline mr-1' />
                        {path.estimated_duration}h
                      </span>
                      <span className='text-ink-black/60'>{path.modules.length} modules</span>
                    </div>
                  </div>

                  <ChevronRight className='w-5 h-5 text-ink-black/40' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
