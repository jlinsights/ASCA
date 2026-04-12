import { MessageCircle, CalendarCheck, Phone, Mail, Headset } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    title: '카카오 채팅 문의',
    description: '1년 365일 실시간 채팅 가능',
    href: 'https://pf.kakao.com/_xkchGj/chat',
    external: true,
  },
  {
    icon: Headset,
    title: '동양서예협회 실시간 채팅 문의',
    description: '1년 365일 실시간 채팅 가능',
    href: 'https://orientalcalligraphy.channel.io',
    external: true,
  },
  {
    icon: CalendarCheck,
    title: '동양서예협회 상담 일정 예약',
    description: '원하시는 날짜/시간에 상담 일정 잡기',
    href: 'https://cal.com/orientalcalligraphy',
    external: true,
  },
  {
    icon: Phone,
    title: '대표 전화 및 팩스 번호',
    description: '☎ 0502-5550-8700 / FAX 0504-256-6600\n월 - 금 오전 10시 ~ 오후 5시',
    href: 'tel:+821089808555',
    external: false,
  },
  {
    icon: Mail,
    title: '이메일',
    description: 'info@orientalcalligraphy.org',
    href: 'mailto:info@orientalcalligraphy.org?subject=%EA%B0%90%EC%82%AC%ED%95%A9%EB%8B%88%EB%8B%A4!',
    external: false,
  },
] as const

export function ContactCards() {
  return (
    <div className='space-y-3'>
      {CONTACT_CHANNELS.map(channel => {
        const Icon = channel.icon
        return (
          <a
            key={channel.title}
            href={channel.href}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noopener noreferrer' : undefined}
            className='block group'
          >
            <Card className='transition-all hover:shadow-md hover:border-scholar-red/30 group-hover:-translate-y-0.5'>
              <CardContent className='flex items-start gap-4 p-4 md:p-5'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-scholar-red/10 text-scholar-red'>
                  <Icon className='h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <h3 className='font-semibold text-sm md:text-base'>{channel.title}</h3>
                  <p className='mt-1 text-xs md:text-sm text-muted-foreground whitespace-pre-line'>
                    {channel.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        )
      })}
    </div>
  )
}
