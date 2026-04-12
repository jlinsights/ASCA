import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  FileDown,
  Phone,
  Headphones,
  CalendarClock,
  ExternalLink,
  Users,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '심사위원·조직위원 위촉 신청 | 동양서예협회',
  description:
    '대한민국 동양서예대전 심사위원, 운영위원, 모집위원 위촉 지원서를 온라인으로 작성하거나 한컴독스/PDF 양식을 다운로드하실 수 있습니다.',
  openGraph: {
    title: '심사위원·조직위원 위촉 신청 | 동양서예협회',
    description:
      '대한민국 동양서예대전 심사위원, 운영위원, 모집위원 위촉 지원서를 온라인으로 작성하거나 한컴독스/PDF 양식을 다운로드하실 수 있습니다.',
  },
}

const TALLY_FORM_URL =
  'https://tally.so/embed/vGeXgl?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

const FORM_LINKS = {
  hwpx: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B1%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B1%E1%84%8E%E1%85%A9%E1%86%A8%20%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.hwpx',
  pdf: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B1%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B1%E1%84%8E%E1%85%A9%E1%86%A8%20%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.pdf',
}

const CONTACT_CARDS = [
  {
    icon: Phone,
    title: '전화 상담',
    description: '☎︎ 0502-5550-8700',
    href: 'tel:+8250255508700',
    external: false,
  },
  {
    icon: Headphones,
    title: '실시간 온라인 상담',
    description: '1년 365일 언제든 문의 가능',
    href: 'https://orientalcalligraphy.channel.io',
    external: true,
  },
  {
    icon: CalendarClock,
    title: '상담 예약',
    description: '월 - 금 오전 10시부터 오후 5시',
    href: 'https://cal.com/orientalcalligraphy',
    external: true,
  },
] as const

const JUROR_QUALIFICATIONS = [
  '본회 초대작가 (자문위원, 고문 포함)',
  '다른 서예 단체 초대작가',
  '본회 고문이나 자문위원이 추천한 인사',
] as const

const RECRUITER_QUALIFICATIONS = [
  '본회 일반 회원으로서 활동 기간이 1년 이상이고 협회 활동에 적극적으로 참여한 분',
  '미술 또는 예술 관련 분야에서 3년 이상의 홍보, 마케팅, 또는 기획 업무 경력이 있는 분',
  '본회 초대작가 1인 이상의 추천을 받아 협회 발전에 기여할 의사가 명확하다고 인정된 분',
  '본회 주관 공모전 또는 전시에 3회 이상 출품 실적이 있는 작가님',
] as const

export default function CommissioningApplicationPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Committee Commissioning Application
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>동양서예대전 위원 위촉 지원</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            심사위원, 운영위원, 모집위원으로 활동하실 분을 모집합니다. 온라인 지원서를 작성하시거나
            오프라인 양식을 다운로드하여 제출해 주세요.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-4xl mx-auto space-y-16'>
          <Card>
            <CardHeader className='text-center'>
              <Badge variant='outline' className='w-fit mx-auto mb-2'>
                온라인 접수
              </Badge>
              <CardTitle className='text-2xl'>온라인 위원 위촉 지원서 입력</CardTitle>
              <p className='text-muted-foreground'>
                아래 각 단계별 질문에 답하신 후 전송 버튼 누르기
              </p>
            </CardHeader>
            <CardContent>
              <iframe
                data-tally-src={TALLY_FORM_URL}
                loading='lazy'
                width='100%'
                height='1563'
                frameBorder='0'
                marginHeight={0}
                marginWidth={0}
                title='대한민국 동양서예대전 위원 위촉 지원서'
                className='rounded-lg'
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`,
                }}
              />
            </CardContent>
          </Card>

          <div className='grid md:grid-cols-2 gap-6'>
            <Card className='text-center'>
              <CardHeader>
                <Badge variant='outline' className='w-fit mx-auto mb-2'>
                  <FileText className='h-3 w-3 mr-1' />
                  한컴독스
                </Badge>
                <CardTitle className='text-xl'>위원 위촉 지원서 - 한컴독스 문서</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  아래 버튼 클릭하신 후 PC에서 &apos;한컴독스&apos;에서 입력 작성
                </p>
              </CardHeader>
              <CardContent>
                <Link
                  href={FORM_LINKS.hwpx}
                  target='_blank'
                  className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-scholar-red text-white hover:bg-scholar-red/90 transition-colors'
                >
                  <FileDown className='h-4 w-4' />
                  HWPX 양식 다운로드
                  <ExternalLink className='h-3 w-3' />
                </Link>
              </CardContent>
            </Card>

            <Card className='text-center'>
              <CardHeader>
                <Badge variant='outline' className='w-fit mx-auto mb-2'>
                  <FileText className='h-3 w-3 mr-1' />
                  Adobe PDF
                </Badge>
                <CardTitle className='text-xl'>위원 위촉 지원서 - Adobe PDF</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  아래 버튼 클릭하신 후 PC에 저장 후 프린트하여 수기 작성
                </p>
              </CardHeader>
              <CardContent>
                <Link
                  href={FORM_LINKS.pdf}
                  target='_blank'
                  className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-scholar-red text-white hover:bg-scholar-red/90 transition-colors'
                >
                  <FileDown className='h-4 w-4' />
                  PDF 양식 다운로드
                  <ExternalLink className='h-3 w-3' />
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-scholar-red' />
                <CardTitle className='text-xl'>위원 자격 요건</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <h3 className='font-semibold mb-3'>운영위원 및 심사위원 자격</h3>
                <ul className='space-y-2'>
                  {JUROR_QUALIFICATIONS.map((q, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm'>
                      <CheckCircle2 className='h-4 w-4 text-scholar-red mt-0.5 shrink-0' />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className='font-semibold mb-3'>모집위원 자격</h3>
                <ul className='space-y-2'>
                  {RECRUITER_QUALIFICATIONS.map((q, i) => (
                    <li key={i} className='flex items-start gap-2 text-sm'>
                      <CheckCircle2 className='h-4 w-4 text-scholar-red mt-0.5 shrink-0' />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className='text-sm text-muted-foreground border-l-2 border-scholar-red/30 pl-4'>
                <p>
                  각 위원의 보수는 운영 및 심사 규정 제4조의 2항에 의거 활동의 성격에 따라 수당 및
                  여비, 실적 인센티브로 구분하여 책정한 후 지급합니다.
                </p>
                <p className='mt-2'>
                  심사・운영・모집위원은 근로관계가 아닌 위촉직이며, 보수는 협회 재정 상황 및 내부
                  규정에 따라 조정하여 책정하게 됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold mb-2'>문의・상담</h2>
              <p className='text-muted-foreground'>
                궁금하신 사항은 아래 연락처로 직접 문의하여 주세요.
              </p>
            </div>
            <div className='grid md:grid-cols-3 gap-4'>
              {CONTACT_CARDS.map(card => (
                <Link
                  key={card.title}
                  href={card.href}
                  target={card.external ? '_blank' : undefined}
                  rel={card.external ? 'noopener noreferrer' : undefined}
                >
                  <Card className='h-full hover:shadow-md transition-shadow'>
                    <CardContent className='pt-6'>
                      <div className='flex items-start gap-3'>
                        <card.icon className='h-5 w-5 text-scholar-red mt-0.5 shrink-0' />
                        <div>
                          <p className='font-semibold'>{card.title}</p>
                          <p className='text-sm text-muted-foreground mt-1'>{card.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
