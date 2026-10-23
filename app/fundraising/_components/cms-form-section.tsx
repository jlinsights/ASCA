import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDown, ExternalLink } from 'lucide-react'
import { CMS_PDF_URL, DONUS_PAYMENT_URL } from './fundraising-data'

export function CmsFormSection() {
  return (
    <div>
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
    </div>
  )
}
