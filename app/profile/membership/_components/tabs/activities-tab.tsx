'use client'

import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MemberActivityLog } from '@/lib/types/membership'

interface ActivitiesTabProps {
  activities: MemberActivityLog[]
}

export function ActivitiesTab({ activities }: ActivitiesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {activities.map(activity => (
            <div
              key={activity.id}
              className='flex items-center gap-4 p-3 border border-border rounded-lg'
            >
              <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                <Activity className='h-4 w-4 text-primary' />
              </div>
              <div className='flex-1'>
                <div className='font-medium text-sm'>{activity.description}</div>
                <div className='text-xs text-muted-foreground'>
                  {activity.timestamp.toLocaleDateString()} {activity.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <Badge variant='secondary' className='text-xs'>
                +{activity.points}점
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
