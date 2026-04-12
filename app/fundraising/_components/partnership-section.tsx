import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDown, Shield, Sparkles, ExternalLink } from 'lucide-react'
import { CMS_PDF_URL, DONUS_PAYMENT_URL } from './fundraising-data'

const FINANCIAL_SERVICES = [
  '맞춤형 자산관리 프로그램',
  '예술인 특화 보장설계 프로그램',
  '연금재원 마련 및 퇴직연금',
  '가업승계 및 상속증여 컨설팅',
  '동양서예협회 회원 전용 우대혜택',
]

export function PartnershipSection() {
  return (
    <div className='space-y-16'>
      <section id='cms-form' className='scroll-mt-24'>
        <h2 className='text-2xl font-bold mb-3'>CMS 출금이체 신청서</h2>
        <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
          원활한 모금 관리를 위하여 CMS 출금이체 신청서 작성 제출을 부탁드립니다. 작성 완료 후 본인
          인감 혹은 서명 날인하여 협회에 제출해 주시면 됩니다.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <a href={CMS_PDF_URL} target='_blank' rel='noopener noreferrer' className='group block'>
            <Card className='h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-scholar-red/30'>
              <CardContent className='flex items-center gap-4 p-5'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-scholar-red/10 text-scholar-red group-hover:bg-scholar-red group-hover:text-white transition-colors'>
                  <FileDown className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-bold text-sm'>CMS 출금이체 신청서 다운로드</h3>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    PDF 양식 다운로드 → 작성·날인 → 협회 제출
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a
            href={DONUS_PAYMENT_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='group block'
          >
            <Card className='h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:border-scholar-red/30'>
              <CardContent className='flex items-center gap-4 p-5'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-scholar-red/10 group-hover:text-scholar-red transition-colors'>
                  <ExternalLink className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-bold text-sm'>온라인 모금함</h3>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    온라인에 익숙하신 분은 모금함을 통해 진행하실 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </section>

      <section id='partnership' className='scroll-mt-24'>
        <h2 className='text-2xl font-bold mb-3'>삼성금융네트웍스 제휴·후원</h2>

        <Card className='overflow-hidden'>
          <div className='grid grid-cols-1 md:grid-cols-2'>
            <CardContent className='p-5 md:p-6'>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-bold leading-tight'>
                    대한민국 금융의 기준,
                    <br />
                    65년의 신뢰로 당신의 평생을 지킵니다.
                  </h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    평생회원 승급 및 전시 행사 할인 우대
                  </p>
                </div>

                <div className='rounded-lg bg-muted/50 p-4'>
                  <h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
                    <Sparkles className='h-4 w-4 text-scholar-red' />
                    Financial Solutions for Artists
                  </h4>
                  <p className='text-xs text-muted-foreground mb-3'>
                    작품활동에만 집중하실 수 있도록, 든든한 울타리가 되어 드리겠습니다.
                  </p>
                  <ul className='space-y-1.5'>
                    {FINANCIAL_SERVICES.map(service => (
                      <li
                        key={service}
                        className='flex items-start gap-2 text-xs text-muted-foreground'
                      >
                        <span className='mt-1 h-1 w-1 shrink-0 rounded-full bg-scholar-red' />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className='text-[11px] text-muted-foreground/70'>
                  * 본 서비스는 삼성금융네트워크와의 제휴·후원을 통해 제공됩니다.
                </p>
              </div>
            </CardContent>

            <div className='flex items-center justify-center p-5 md:p-6 bg-muted/30'>
              <div className='text-center space-y-4'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-scholar-red/10 text-scholar-red mx-auto'>
                  <Shield className='h-8 w-8' />
                </div>
                <div>
                  <p className='font-bold text-sm'>제휴·후원 상담</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    상담을 통해 작가님의 상황에 맞는
                    <br />
                    최선의 솔루션을 제안 드립니다.
                  </p>
                </div>
                <a
                  href='https://cal.com/orientalcalligraphy/familyoffice'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-lg bg-scholar-red px-4 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
                >
                  상담 예약하기
                  <ExternalLink className='h-3.5 w-3.5' />
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
