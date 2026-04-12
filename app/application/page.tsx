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
  Music,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '출품원서 | 동양서예협회',
  description:
    '대한민국 동양서예대전 출품원서를 온라인으로 입력하거나 MS Word, PDF 양식을 다운로드하여 작성하실 수 있습니다.',
  openGraph: {
    title: '출품원서 | 동양서예협회',
    description:
      '대한민국 동양서예대전 출품원서를 온라인으로 입력하거나 MS Word, PDF 양식을 다운로드하여 작성하실 수 있습니다.',
  },
}

const FORM_LINKS = {
  tally:
    'https://tally.so/embed/nr8bM2?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&formEventsForwarding=1',
  word: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%91%E1%85%AE%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.docx',
  pdf: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%91%E1%85%AE%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.pdf',
  spotify: 'https://open.spotify.com/embed/episode/1yd6KxiQs8nCpVkRB5QKe5?utm_source=generator',
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

export default function ApplicationPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Exhibition Entry Form
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>출품원서</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            대한민국 동양서예대전 출품원서를 온라인으로 입력하시거나, MS Word 또는 PDF 양식을
            다운로드하여 작성하실 수 있습니다.
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
              <CardTitle className='text-2xl'>온라인 출품원서 입력</CardTitle>
              <p className='text-muted-foreground'>
                아래 각 단계별 질문에 답하신 후 전송 버튼 누르기
              </p>
            </CardHeader>
            <CardContent>
              <iframe
                data-tally-src={FORM_LINKS.tally}
                loading='lazy'
                width='100%'
                height='1452'
                frameBorder='0'
                marginHeight={0}
                marginWidth={0}
                title='東洋書藝 出品願書'
                className='rounded-lg'
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`,
                }}
              />
            </CardContent>
          </Card>

          <div className='flex items-center gap-3 mt-8'>
            <Music className='h-5 w-5 text-scholar-red' />
            <span className='text-sm text-muted-foreground'>관련 팟캐스트</span>
          </div>
          <iframe
            style={{ borderRadius: 12 }}
            src={FORM_LINKS.spotify}
            width='100%'
            height='152'
            frameBorder='0'
            allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
            loading='lazy'
            title='Spotify Episode'
          />

          <div className='grid md:grid-cols-2 gap-6'>
            <Card className='text-center'>
              <CardHeader>
                <Badge variant='outline' className='w-fit mx-auto mb-2'>
                  <FileText className='h-3 w-3 mr-1' />
                  MS Word
                </Badge>
                <CardTitle className='text-xl'>출품원서 - MS WORD</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  아래 버튼 클릭하신 후 PC에서 워드에서 입력 작성
                </p>
              </CardHeader>
              <CardContent>
                <Link
                  href={FORM_LINKS.word}
                  target='_blank'
                  className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-scholar-red text-white hover:bg-scholar-red/90 transition-colors'
                >
                  <FileDown className='h-4 w-4' />
                  Word 양식 다운로드
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
                <CardTitle className='text-xl'>출품원서 - Adobe PDF</CardTitle>
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
