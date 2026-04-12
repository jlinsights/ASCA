import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'
import { LOGO_SECTIONS, LOGO_DOS, LOGO_DONTS } from './brand-data'

export function LogoIdentity() {
  return (
    <section id='logo-identity' className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-3'>로고 아이덴티티</h2>
      <p className='text-muted-foreground mb-8 leading-relaxed'>
        동양서예협회의 로고는 철학, 역사, 미학이 어우러진 시각적 정체성입니다. 매 획에는 의미가 담겨
        있으며, 서예의 본질적 아름다움을 현대적으로 해석했습니다.
      </p>

      <div className='space-y-6'>
        {LOGO_SECTIONS.map(section => (
          <Card key={section.title} className='overflow-hidden'>
            <CardContent className='p-5 md:p-6'>
              <h3 className='font-bold text-base mb-4 pl-3 border-l-4 border-scholar-red'>
                {section.title}
              </h3>
              <ul className='space-y-3'>
                {section.items.map(item => (
                  <li key={item.label} className='flex gap-3 text-sm'>
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scholar-red/60' />
                    <div>
                      <strong className='text-foreground'>{item.label}:</strong>{' '}
                      <span className='text-muted-foreground'>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
        <Card className='border-green-500/30 bg-green-500/5'>
          <CardContent className='p-5 md:p-6'>
            <h3 className='font-bold text-base mb-4 flex items-center gap-2 text-green-600 dark:text-green-400'>
              <CheckCircle className='h-5 w-5' />
              로고 사용 권장사항 (Do&apos;s)
            </h3>
            <ul className='space-y-2.5'>
              {LOGO_DOS.map(item => (
                <li key={item} className='flex items-start gap-2 text-sm text-muted-foreground'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500' />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className='border-red-500/30 bg-red-500/5'>
          <CardContent className='p-5 md:p-6'>
            <h3 className='font-bold text-base mb-4 flex items-center gap-2 text-red-600 dark:text-red-400'>
              <XCircle className='h-5 w-5' />
              로고 사용 금지사항 (Don&apos;ts)
            </h3>
            <ul className='space-y-2.5'>
              {LOGO_DONTS.map(item => (
                <li key={item} className='flex items-start gap-2 text-sm text-muted-foreground'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500' />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
