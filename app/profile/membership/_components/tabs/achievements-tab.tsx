'use client'

import { Trophy, Eye, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MemberProfile } from '@/lib/types/membership'

interface AchievementsTabProps {
  profile: MemberProfile
}

export function AchievementsTab({ profile }: AchievementsTabProps) {
  const achievements = profile.achievements ? JSON.parse(profile.achievements) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>수상 경력 및 전시 참가</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {achievements.map((achievement: any, index: number) => (
            <div
              key={index}
              className='p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0'>
                  {achievement.type === 'award' ? (
                    <Trophy className='h-5 w-5 text-amber-600' />
                  ) : achievement.type === 'exhibition' ? (
                    <Eye className='h-5 w-5 text-blue-600' />
                  ) : (
                    <Star className='h-5 w-5 text-purple-600' />
                  )}
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold'>{achievement.title}</h3>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {achievement.description}
                      </p>
                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <span>{achievement.organization}</span>
                        <span>{achievement.date}</span>
                        {achievement.rank && <span>• {achievement.rank}</span>}
                      </div>
                    </div>
                    <Badge variant='secondary' className='ml-2'>
                      {achievement.significance === 'international'
                        ? '국제'
                        : achievement.significance === 'national'
                          ? '전국'
                          : '지역'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
