'use client'

import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MemberProfile, CalligraphyStyle, MemberActivityLog } from '@/lib/types/membership'
import { styleNames } from '../mock-data'

interface OverviewTabProps {
  profile: MemberProfile
  activities: MemberActivityLog[]
}

export function OverviewTab({ profile, activities }: OverviewTabProps) {
  const achievementsCount = profile.achievements ? JSON.parse(profile.achievements).length : 0
  const specializations = profile.specializations ? JSON.parse(profile.specializations) : []
  const interests = profile.interests ? JSON.parse(profile.interests) : []
  const languages = profile.languages ? JSON.parse(profile.languages) : []

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>활동 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <StatCard value={profile.participationScore ?? 0} label='참여 점수' color='blue' />
              <StatCard value={profile.contributionScore ?? 0} label='기여 점수' color='green' />
              <StatCard value={achievementsCount} label='수상 경력' color='purple' />
              <StatCard
                value={`${profile.calligraphyExperience}년`}
                label='서예 경력'
                color='amber'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전문 분야</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='text-sm text-muted-foreground mb-2'>특화 서체</div>
              <div className='flex flex-wrap gap-2'>
                {specializations.map((style: CalligraphyStyle) => (
                  <Badge key={style} variant='secondary'>
                    {styleNames[style]}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className='text-sm text-muted-foreground mb-2'>관심 분야</div>
              <div className='flex flex-wrap gap-2'>
                {interests.map((interest: string) => (
                  <Badge key={interest} variant='outline'>
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className='text-sm text-muted-foreground mb-2'>구사 언어</div>
              <div className='flex gap-2'>
                {languages.map((lang: string) => (
                  <Badge key={lang} variant='secondary'>
                    {resolveLanguageLabel(lang)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {activities.slice(0, 5).map(activity => (
              <div
                key={activity.id}
                className='flex items-center gap-4 p-3 border border-border rounded-lg'
              >
                <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                  <Activity className='h-5 w-5 text-primary' />
                </div>
                <div className='flex-1'>
                  <div className='font-medium'>{activity.description}</div>
                  <div className='text-sm text-muted-foreground'>
                    {activity.timestamp.toLocaleDateString()} • +{activity.points}점
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

const STAT_COLORS: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600',
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number | string
  label: string
  color: 'blue' | 'green' | 'purple' | 'amber'
}) {
  return (
    <div className='text-center p-4 border border-border rounded-lg'>
      <div className={`text-2xl font-bold ${STAT_COLORS[color]} mb-1`}>{value}</div>
      <div className='text-sm text-muted-foreground'>{label}</div>
    </div>
  )
}

function resolveLanguageLabel(lang: string): string {
  const map: Record<string, string> = {
    ko: '한국어',
    en: '영어',
    zh: '중국어',
    ja: '일본어',
  }
  return map[lang] || lang
}
