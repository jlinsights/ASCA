import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Headphones, CalendarClock } from 'lucide-react'

export const metadata: Metadata = {
  title: '추천ㆍ초대작가 신청 | 동양서예협회',
  description:
    '사단법인 동양서예협회 추천ㆍ초대작가 신청 페이지입니다. 자격 요건을 확인하시고 온라인으로 신청하실 수 있습니다.',
  openGraph: {
    title: '추천ㆍ초대작가 신청 | 동양서예협회',
    description:
      '사단법인 동양서예협회 추천ㆍ초대작가 신청 페이지입니다. 자격 요건을 확인하시고 온라인으로 신청하실 수 있습니다.',
  },
}

const TALLY_FORM_URL =
  'https://tally.so/embed/w59jeo?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1'

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: '이메일',
    description: 'info@orientalcalligraphy.org',
    href: 'mailto:info@orientalcalligraphy.org?subject=%EA%B0%90%EC%82%AC%ED%95%A9%EB%8B%88%EB%8B%A4.',
    external: false,
  },
  {
    icon: Headphones,
    title: '동양서협 실시간 채팅 문의',
    description: '1년 365일 언제든 문의 가능',
    href: 'https://orientalcalligraphy.channel.io',
    external: true,
  },
  {
    icon: CalendarClock,
    title: '커피챗 상담 예약',
    description: '월 - 금 오전 10시부터 오후 5시',
    href: 'https://whattime.co.kr/orientalcalligraphy',
    external: true,
  },
] as const

const SCORING_TABLE = [
  { award: '입선', score: '1점' },
  { award: '특선', score: '3점' },
  { award: '삼체상', score: '5점' },
  { award: '오체상', score: '7점' },
  { award: '우수상', score: '7점' },
  { award: '최우수상', score: '8점' },
  { award: '대상', score: '9점' },
] as const

const LEVEL_CRITERIA = [
  { range: '1점 ~ 9점', level: '공모작가, 청년작가, 일반작가' },
  { range: '10점 ~ 14점', level: '추천작가' },
  { range: '15점 이상', level: '초대작가' },
] as const

export default function RecommendedInvitedCalligrapherPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Application for Recommended &amp; Invited Calligrapher
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>추천ㆍ초대작가 신청</h1>
          <p className='text-lg text-muted-foreground'>社團法人 東洋書藝協會</p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-4xl mx-auto space-y-16'>
          <Card>
            <CardHeader className='text-center'>
              <Badge variant='outline' className='w-fit mx-auto mb-2'>
                온라인 신청
              </Badge>
              <CardTitle className='text-2xl'>추천ㆍ초대작가 온라인 신청서</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                data-tally-src={TALLY_FORM_URL}
                loading='lazy'
                width='100%'
                height='699'
                frameBorder='0'
                marginHeight={0}
                marginWidth={0}
                title='동양서예협회 추천ㆍ초대작가 신청'
                className='rounded-lg'
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>추천작가 / 초대작가 선정 기준</CardTitle>
              <p className='text-sm text-muted-foreground'>
                대한민국 동양서예대전 입상작 배점 기준
              </p>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 pr-4 font-medium'>입상 등급</th>
                      <th className='text-left py-2 font-medium'>배점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCORING_TABLE.map(row => (
                      <tr key={row.award} className='border-b border-muted'>
                        <td className='py-2 pr-4'>{row.award}</td>
                        <td className='py-2'>
                          <Badge variant='secondary'>{row.score}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 pr-4 font-medium'>누적 배점</th>
                      <th className='text-left py-2 font-medium'>선정 등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEVEL_CRITERIA.map(row => (
                      <tr key={row.range} className='border-b border-muted'>
                        <td className='py-2 pr-4'>{row.range}</td>
                        <td className='py-2'>{row.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='text-sm text-muted-foreground space-y-2 border-l-2 border-scholar-red/30 pl-4'>
                <p>
                  추천작가는 3년 이상의 정회원 경력과 수상실적이, 초대작가는 5년 이상의 추천작가
                  경력이 필요합니다.
                </p>
                <p>
                  자격심사위원회에서 서류심사와 작품심사로 구분하여 유자격 심사위원 전원의 3분의 2
                  이상 찬성으로 자격을 부여합니다.
                </p>
                <p>
                  만일 자격심사위원회 심사에서 통과되지 않을 경우 추후 전시회에 새로운 작품을 다시
                  출품하여 재심을 청구할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold mb-2'>동양서협에 직접 연락하기</h2>
              <p className='text-muted-foreground'>
                궁금하신 부분은 아래 연락처로 직접 문의 하시거나 이메일을 통하여 문의하여 주세요.
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
