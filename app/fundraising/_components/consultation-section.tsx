import { Card, CardContent } from '@/components/ui/card'
import { Phone, Headset, CalendarCheck } from 'lucide-react'

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: '전화 상담',
    description: '☎︎ 0502-5550-8700',
    href: 'tel:+8250255508700',
  },
  {
    icon: Headset,
    title: '실시간 상담',
    description: '1년 365일 언제든 문의 가능',
    href: 'https://orientalcalligraphy.channel.io',
    external: true,
  },
  {
    icon: CalendarCheck,
    title: '상담 예약',
    description: '월 - 금 오전 10시부터 오후 5시',
    href: 'https://cal.com/orientalcalligraphy',
    external: true,
  },
]

export function ConsultationSection() {
  return (
    <section id='consultation' className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-3'>문의·상담</h2>
      <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
        삼성금융네트웍스 제휴·후원 금융상품 가입 시 평생회원 승급, 연회비 면제, 전시 및 행사
        프로그램 우대·할인 혜택을 드리고 있습니다. 상담이 필요하신 회원 작가분께서는 아래로 문의해
        주세요.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {CONTACT_CHANNELS.map(channel => {
          const Icon = channel.icon
          return (
            <a
              key={channel.title}
              href={channel.href}
              target={channel.external ? '_blank' : undefined}
              rel={channel.external ? 'noopener noreferrer' : undefined}
              className='group block'
            >
              <Card className='h-full transition-all hover:shadow-md hover:-translate-y-1 hover:border-scholar-red/30'>
                <CardContent className='flex flex-col items-center text-center gap-3 p-5'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-scholar-red/10 text-scholar-red group-hover:bg-scholar-red group-hover:text-white transition-colors'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-sm'>{channel.title}</h3>
                    <p className='mt-1 text-xs text-muted-foreground'>{channel.description}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>
    </section>
  )
}
