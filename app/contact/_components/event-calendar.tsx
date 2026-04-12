'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

export function EventCalendar() {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <CalendarDays className='h-5 w-5 text-scholar-red' />
          행사 및 전시회 일정
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          동양서예협회에서 진행 예정인 행사 및 전시회를 살펴 보시고, 직접 예약 등록하여 주시기
          바랍니다.
        </p>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='relative w-full overflow-hidden rounded-b-lg'>
          <iframe
            src='https://lu.ma/embed/calendar/cal-ZlettsX2TEJryng/events?lt=dark'
            className='w-full border-0'
            style={{ height: '600px' }}
            allowFullScreen
            aria-label='동양서예협회 이벤트 캘린더'
            loading='lazy'
          />
        </div>
      </CardContent>
    </Card>
  )
}
