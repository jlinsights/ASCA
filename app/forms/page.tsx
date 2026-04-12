import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { FileDown, Download, FileText, ExternalLink, MousePointerClick } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '문서·서식 | 동양서예협회',
  description:
    '동양서예협회의 공식 서식 자료를 다운로드할 수 있습니다. 회원가입 신청서, 작품출품 양식, 심사위원 지원서 등 필요한 모든 양식을 한곳에서 편리하게 이용하세요.',
  openGraph: {
    title: '문서·서식 | 동양서예협회',
    description:
      '출품원서, 입회원서, 추천·초대작가 신청서 등 동양서예협회 공식 서식을 다운로드하세요.',
  },
}

interface FormItem {
  id: string
  title: string
  description: string
  downloads: {
    label: string
    href: string
    type: 'pdf' | 'hwp' | 'hwpx' | 'docx' | 'online'
    note: string
  }[]
}

const FORM_ITEMS: FormItem[] = [
  {
    id: 'application-for-exhibition',
    title: '출품원서',
    description:
      '대한민국 동양서예대전 참여를 희망하실 때 작성 제출하셔야 하는 출품원서 양식입니다.',
    downloads: [
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%91%E1%85%AE%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
      {
        label: 'Word 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%91%E1%85%AE%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5%20%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.docx',
        type: 'docx',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'oc-registration-form',
    title: '입회원서',
    description: '저희 협회 정회원으로 가입하기 위하여 필요한 가장 기본적인 신청 양식입니다.',
    downloads: [
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%92%E1%85%AC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
      {
        label: '한컴독스로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%92%E1%85%AC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.hwp',
        type: 'hwp',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'oc-calligraphy-training',
    title: '서예강좌 입회원서',
    description:
      '저희 협회에서 후원 및 운영하고 있는 서예강좌에 신청하기 위한 입회원서 양식입니다. 회원 뿐 아니라 비회원도 신청 가능합니다.',
    downloads: [
      {
        label: '온라인 입회원서 입력',
        href: 'https://tally.so/r/wvDE8D',
        type: 'online',
        note: '입력하신 후 전송하시면 완료',
      },
      {
        label: '한글 문서로 다운로드',
        href: 'https://www.dropbox.com/scl/fi/ubbjdanb604ot6bbgdnok/_2023.hwp?rlkey=f4iruynrk0nnuwxn8hu1xmvry&dl=0',
        type: 'hwp',
        note: '작성하신 후 동양서협에 제출',
      },
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://www.dropbox.com/scl/fi/43fbehts9a6o3h98m3pv7/_2023.pdf?rlkey=jh148g3qn6d3fyoru7wix52gn&dl=0',
        type: 'pdf',
        note: '작성하신 후 동양서협에 제출',
      },
    ],
  },
  {
    id: 'request-for-invited',
    title: '추천ㆍ초대작가 신청서',
    description:
      '추천・초대작가 선임 규칙 제2조에 의거 추천작가증 및 초대작가증 발급 요청하실 때 필요한 신청서입니다.',
    downloads: [
      {
        label: '온라인 신청서 입력',
        href: '/application-for-recommended-invited-calligrapher',
        type: 'online',
        note: '입력하신 후 전송하시면 완료',
      },
      {
        label: '한글 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%8E%E1%85%AE%E1%84%8E%E1%85%A5%E1%86%AB%E2%80%A4%E1%84%8E%E1%85%A9%E1%84%83%E1%85%A2%20%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%80%E1%85%A1%20%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.hwp',
        type: 'hwp',
        note: '작성하신 후 제출',
      },
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%8E%E1%85%AE%E1%84%8E%E1%85%A5%E1%86%AB%E2%80%A4%E1%84%8E%E1%85%A9%E1%84%83%E1%85%A2%20%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%80%E1%85%A1%20%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'cms-application',
    title: 'CMS 출금 이체 신청서',
    description:
      '후원금을 CMS 정기납 방식으로 납부 신청하실 때 필요한 기본 신청서입니다. 온라인 후원 모금을 통해 서류작성 없이 신청 가능합니다.',
    downloads: [
      {
        label: '한글 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/CMS%20%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%B3%E1%86%B7%20%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A6%20%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.hwp',
        type: 'hwp',
        note: '작성하신 후 동양서협에 제출',
      },
      {
        label: 'Word 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC_CMS%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%B3%E1%86%B7%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A6_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.docx',
        type: 'docx',
        note: '작성하신 후 제출',
      },
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC_CMS%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%B3%E1%86%B7%E1%84%8B%E1%85%B5%E1%84%8E%E1%85%A6_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%8E%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A5.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'application-for-invited',
    title: '위원 위촉 지원서',
    description: '심사위원 및 운영위원 지원하실 때 작성 제출해야 하는 신청 양식입니다.',
    downloads: [
      {
        label: '한글 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B1%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B1%E1%84%8E%E1%85%A9%E1%86%A8%20%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.hwpx',
        type: 'hwpx',
        note: '작성하신 후 동양서협에 제출',
      },
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%EC%84%9C%EC%8B%9D/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%B1%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B1%E1%84%8E%E1%85%A9%E1%86%A8%20%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%89%E1%85%A5.pdf',
        type: 'pdf',
        note: '작성하신 후 동양서협에 제출',
      },
    ],
  },
  {
    id: 'donation-consent',
    title: '재산출연증서(기부승낙서)',
    description:
      '재산의 무상 출연(기부/후원) 및 임원 취임에 따른 발전기금을 납부하실 때에 작성하시게 되는 기본 양식입니다. 본인의 인감도장이 필요하며 임원 취임 시에는 별도의 취임승낙서가 필요합니다.',
    downloads: [
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%8C%E1%85%A2%E1%84%89%E1%85%A1%E1%86%AB%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%8B%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%B3%E1%86%BC%E1%84%89%E1%85%A5(%E1%84%80%E1%85%B5%E1%84%87%E1%85%AE%E1%84%80%E1%85%B3%E1%86%B7%E1%84%89%E1%85%B3%E1%86%BC%E1%84%82%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5).pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'letter-of-acceptance',
    title: '취임승낙서',
    description:
      '협회 임원에 취임하실 때 재산출연증서(기부승낙서)와 함께 작성하여 협회에 제출해야하는 기본 양식입니다. 본인의 개인 인감도장이 필요합니다.',
    downloads: [
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/A4%20-%20%E1%84%8E%E1%85%B1%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%89%E1%85%B3%E1%86%BC%E1%84%82%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'resume',
    title: '이력서',
    description:
      '협회 임원에 취임하시거나 외부 지도강사와 심사위원을 위촉할 때 주무관청인 문화체육관광부에 통보하기 위해 필요한 양식입니다.',
    downloads: [
      {
        label: '한글 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%92%E1%85%A7%E1%86%B8%20%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B5%E1%84%85%E1%85%A7%E1%86%A8%E1%84%89%E1%85%A5%20%E1%84%91%E1%85%AD%E1%84%8C%E1%85%AE%E1%86%AB%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.hwp',
        type: 'hwp',
        note: '작성하신 후 제출',
      },
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%92%E1%85%A7%E1%86%B8%20%E1%84%8B%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%20%E1%84%8B%E1%85%B5%E1%84%85%E1%85%A7%E1%86%A8%E1%84%89%E1%85%A5%20%E1%84%91%E1%85%AD%E1%84%8C%E1%85%AE%E1%86%AB%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.pdf',
        type: 'pdf',
        note: '작성하신 후 제출',
      },
    ],
  },
  {
    id: 'executive-personal-info',
    title: '임원 취임예정자 인적사항',
    description:
      '협회 임원에 취임하실 때 주무관청인 문화체육관광부에 통보하기 위해 필요한 양식입니다.',
    downloads: [
      {
        label: 'PDF 문서로 다운로드',
        href: 'https://www.dropbox.com/scl/fi/8b49t8bfvum22bk60w4ct/A4.pdf?rlkey=s2a40lvsrwtdgl57bqgxjb7zw&dl=0',
        type: 'pdf',
        note: '작성하신 후 동양서협에 제출',
      },
    ],
  },
]

function getTypeBadge(type: FormItem['downloads'][number]['type']) {
  switch (type) {
    case 'pdf':
      return <Badge variant='secondary'>PDF</Badge>
    case 'hwp':
    case 'hwpx':
      return <Badge variant='secondary'>한글</Badge>
    case 'docx':
      return <Badge variant='secondary'>Word</Badge>
    case 'online':
      return <Badge className='bg-scholar-red text-white hover:bg-scholar-red/90'>온라인</Badge>
  }
}

function getTypeIcon(type: FormItem['downloads'][number]['type']) {
  if (type === 'online') return <ExternalLink className='h-4 w-4' />
  return <Download className='h-4 w-4' />
}

export default function FormsPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Documents &amp; Forms
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>문서·서식</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            동양서예협회의 공식 서식 자료를 다운로드할 수 있습니다. 회원가입 신청서, 작품출품 양식,
            심사위원 지원서 등 필요한 모든 양식을 한곳에서 편리하게 이용하세요.
          </p>
          <div className='flex justify-center gap-3 mt-6'>
            <Link
              href='https://orientalcalligraphy.channel.io'
              target='_blank'
              className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
            >
              <MousePointerClick className='h-4 w-4' />
              상담 문의
            </Link>
            <Link
              href='https://whattime.co.kr/orientalcalligraphy'
              target='_blank'
              className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
            >
              상담 예약
            </Link>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='grid gap-8'>
          {FORM_ITEMS.map(form => (
            <Card key={form.id} id={form.id}>
              <CardHeader>
                <CardTitle className='flex items-center gap-3'>
                  <FileDown className='h-5 w-5 text-scholar-red shrink-0' />
                  {form.title}
                </CardTitle>
                <p className='text-sm text-muted-foreground'>{form.description}</p>
              </CardHeader>
              <CardContent>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {form.downloads.map(dl => (
                    <Link
                      key={dl.href}
                      href={dl.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='group flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors'
                    >
                      <div className='mt-0.5 shrink-0 text-muted-foreground group-hover:text-scholar-red transition-colors'>
                        {getTypeIcon(dl.type)}
                      </div>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-sm font-medium'>{dl.label}</span>
                          {getTypeBadge(dl.type)}
                        </div>
                        <p className='text-xs text-muted-foreground'>{dl.note}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-12 text-center'>
          <p className='text-sm text-muted-foreground mb-4'>
            궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Link
              href='/history'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4'
            >
              연혁
            </Link>
            <Link
              href='/articles-of-incorporation-and-bylaws'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4'
            >
              정관
            </Link>
            <Link
              href='/business-plan'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4'
            >
              사업계획
            </Link>
            <Link
              href='/contact'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4'
            >
              문의
            </Link>
          </div>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
