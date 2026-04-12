import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, User, ExternalLink, Landmark } from 'lucide-react'
import { DONUS_PAYMENT_URL, DONUS_MYPAGE_URL, BANK_ACCOUNT } from './fundraising-data'

export function PaymentCards() {
  return (
    <section id='payment' className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-3'>온라인 결제 안내</h2>
      <p className='text-muted-foreground mb-6 leading-relaxed'>
        온라인 결제페이지에서 납부하시고, 마이페이지에서 납부내역을 확인하세요.
      </p>

      <Card className='mb-6 border-scholar-red/30 bg-scholar-red/5'>
        <CardContent className='flex items-center gap-3 p-4'>
          <Landmark className='h-5 w-5 shrink-0 text-scholar-red' />
          <p className='text-sm font-medium'>
            무통장입금계좌:{' '}
            <span className='font-bold'>
              {BANK_ACCOUNT.bank} {BANK_ACCOUNT.number}
            </span>{' '}
            {BANK_ACCOUNT.holder}
          </p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <a
          href={DONUS_PAYMENT_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='group block'
        >
          <Card className='h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-scholar-red/30'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <CreditCard className='h-5 w-5 text-scholar-red' />
                온라인 결제페이지
                <ExternalLink className='h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-scholar-red transition-colors' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                구분 및 항목을 선택한 후 납부하실 수 있습니다. 연회비, 출품료, 등록비 등 다양한
                항목을 온라인으로 결제하세요.
              </p>
            </CardContent>
          </Card>
        </a>

        <a
          href={DONUS_MYPAGE_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='group block'
        >
          <Card className='h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-scholar-red/30'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <User className='h-5 w-5 text-scholar-red' />
                온라인 마이페이지
                <ExternalLink className='h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-scholar-red transition-colors' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                첫 방문이시라면 마이페이지 계정을 만들고 회원 인증을 진행해 주세요. 기존 회원은
                납부내역을 확인하실 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </a>
      </div>
    </section>
  )
}
