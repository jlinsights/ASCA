import { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollText, ChevronRight, Scale, MessageSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: '기부금품 관리 및 이용약관 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 기부금품 관리 시스템 및 홈페이지 이용자에게 제공하는 서비스의 내용과 이용 당사자의 권리, 의무 및 책임사항을 규정합니다.',
  openGraph: {
    title: '기부금품 관리 및 이용약관 | 동양서예협회',
    description:
      '사단법인 동양서예협회의 기부금품 관리 및 이용약관입니다. 후원회원의 권리와 의무, 기부금 사용 원칙, 반환 규정 등을 안내합니다.',
  },
}

const SIDEBAR_LINKS = [
  { label: '연혁', href: '/history' },
  { label: '조직도', href: '/board-members' },
  { label: '양식모음', href: '/forms' },
  { label: '유관단체', href: '/partners' },
  { label: '사업계획', href: '/business-plan' },
  { label: '정관', href: '/articles-of-incorporation-and-bylaws' },
  { label: '개인정보처리방침', href: '/privacy-policy' },
] as const

const TERMS_ARTICLES = [
  {
    id: 'article-1',
    title: '제1조(약관의 목적)',
    content:
      '이 이용약관(이하 "약관")은 사단법인 동양서예협회(이하 "협회"라 함)가 운영하는 기부금품 관리 시스템 및 홈페이지(이하 "시스템") 이용자에게 제공하는 서비스의 내용과 이용 당사자의 권리, 의무 및 책임사항을 규정하는 것을 목적으로 한다.',
  },
  {
    id: 'article-2',
    title: '제2조(용어의 정의)',
    content: '이 약관에서 사용하는 용어의 정의는 다음과 같다.',
    items: [
      "'후원회원'은 협회의 설립 목적과 사업에 공감하여 반대급부 없이 무상으로 경제적 가치(현금, 물품 등)가 있는 것을 출연‧증여하기 위해 협회에 개인정보 제공 및 기부신청 절차를 마친 개인 및 법인단체를 말한다.",
      "'서비스'란 협회가 기부금 사업을 위해 이용자에게 제공하는 일체의 온‧오프라인 서비스(기부금 행사 안내, 시스템 이용, 기부금영수증 발급 및 국세청 신고 대행 등 행정처리)를 말한다.",
      "'이용자'는 시스템을 이용하는 후원회원 및 웹사이트 가입 회원을 말한다.",
    ],
  },
  {
    id: 'article-3',
    title: '제3조(후원회원 가입 및 정보제공)',
    content:
      '협회를 통한 서예 문화 진흥 및 목적 사업 후원에 자발적 의사가 있는 개인 및 법인단체는 협회가 정한 절차에 따라 후원회원으로 가입할 수 있다.',
    items: [
      '서비스를 이용하고자 하는 후원회원은 관련 법령에 따라 협회가 요청하는 필수 정보(이름/법인명, 연락처, 이메일, 결제정보 등)를 제공해야 한다.',
      '「소득세법」 및 「법인세법」에 따른 기부금영수증 발급을 신청할 경우, 고유식별번호(주민등록번호 또는 사업자등록번호)를 제공해야 한다. 해당 정보는 영수증 발급 및 국세청 신고 목적 외에는 사용되지 않는다.',
      '타인의 명의를 도용하여 가입한 경우 등록된 정보는 삭제되며, 관계 법령에 따라 처벌받을 수 있다.',
    ],
  },
  {
    id: 'article-4',
    title: '제4조(이용약관의 효력 및 변경)',
    items: [
      '이 약관은 이용자가 시스템을 통해 동의 의사를 표시하고 정보를 전달함으로써 효력이 발생한다. 서면이나 이메일 등을 통해 후원을 신청한 경우에도 동일한 효력을 갖는다.',
      '협회는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 개정할 수 있으며, 개정된 약관은 적용일 7일 전부터 홈페이지 등을 통해 공지한다.',
    ],
  },
  {
    id: 'article-5',
    title: '제5조(서비스의 제공 및 일시 중단)',
    items: [
      '협회는 안정적인 서비스 제공을 위해 정기적 또는 비정기적 시스템 점검을 실시할 수 있으며, 이로 인해 시스템 이용 서비스가 일시 중단될 수 있습니다.',
      '협회는 시스템 정기 점검의 경우 최소 7일 전부터 홈페이지 등을 통해 이용자에게 공지하는 것을 원칙으로 합니다.',
      '천재지변, 시스템 장애, 긴급 보안 문제 등 불가피한 사유로 인해 서비스가 일시 중단될 경우, 협회는 사후에 이를 공지할 수 있습니다.',
    ],
  },
  {
    id: 'article-6',
    title: '제6조(협회의 권리와 의무)',
    items: [
      '협회는 후원회원이 출연한 기부금품을 협회 정관 및 「기부금품의 모집 및 사용에 관한 법률」에 의거하여 고유목적사업(갤러리 건립, 전시 지원, 교육 등)에 투명하게 사용한다.',
      '협회는 기부금의 모금 및 활용 실적을 홈페이지를 통해 연 1회 이상 공개하거나, 이메일 등을 통해 후원회원에게 보고할 수 있다.',
      '협회는 관련 법령에 따라 후원회원에게 기부금영수증을 발행하며, 국세청 연말정산간소화 서비스 등록 등의 행정 의무를 성실히 이행한다.',
      '협회는 이용자의 개인정보를 철저히 보호하며, 개인정보처리방침에 따라 관리한다.',
      '협회는 후원회원이 특정 목적사업을 위해 지정하여 출연한 기부금품에 대해서는 해당 목적 외 용도로 사용하지 않는 것을 원칙으로 합니다. 단, 지정 목적의 사업이 취소되거나 완료 후 잔액이 발생할 경우, 협회는 후원자에게 이를 고지하고 후원자와의 협의를 통해 사용 목적을 협회의 유사 목적사업으로 변경하거나 관련 법령에 따라 처리할 수 있습니다.',
    ],
  },
  {
    id: 'article-7',
    title: '제7조(이용자의 권리와 의무)',
    items: [
      '후원회원은 협회의 사업 내용과 기부금 사용 내역에 대한 정보를 제공받을 권리가 있다.',
      '후원회원은 기부 시 자동이체(CMS), 신용카드, 계좌이체 등 협회가 제공하는 결제 수단을 이용할 수 있다.',
      '후원회원은 관련 법령에 따라 세제 혜택을 받을 수 있다. 개인은 연말정산 시 기부금 세액공제, 법인은 법인세 신고 시 손금 산입이 가능하다.',
      '이용자는 주소, 연락처 등 개인정보가 변경된 경우 이를 협회에 알리거나 시스템에서 수정해야 하며, 이를 태만히 하여 발생한 불이익에 대해 협회는 책임지지 않는다.',
    ],
  },
  {
    id: 'article-8',
    title: '제8조(회원 자격 상실 및 기부 중단)',
    content: '협회는 다음 각 호에 해당하는 경우 이용 자격을 제한하거나 정지할 수 있다.',
    items: [
      '사회적 공익을 저해할 목적으로 서비스를 이용하는 경우',
      '타인의 정보를 도용하거나 허위 사실을 기재한 경우',
      '협회의 명예를 훼손하거나 운영을 방해하는 경우',
    ],
    footnote:
      '후원회원은 언제든지 후원 중단을 요청할 수 있다. 단, 이미 납부된 기부금에 대한 증명서 발급 등을 위해 관련 법령이 정한 기간 동안 최소한의 개인정보는 보존된다.',
  },
  {
    id: 'article-9',
    title: '제9조(개인정보 처리)',
    content:
      "협회는 이용자의 개인정보 보호를 위해 '개인정보 보호법' 등 관련 법령을 준수하며, 자세한 내용은 홈페이지 내 '개인정보처리방침'을 통해 공지한다.",
  },
  {
    id: 'article-10',
    title: '제10조(기부 물품 및 콘텐츠의 지식재산권)',
    items: [
      '후원회원이 협회에 기부한 서예 작품 등 물품에 대한 소유권은 협회에 귀속되며, 해당 물품에 내재된 지식재산권(저작권 등)은 별도의 서면 합의가 없는 한 기부자에게 유보됩니다.',
      '협회는 고유 목적사업(전시, 홍보, 교육 등)을 위해 기부 물품을 이용할 수 있으며, 이 경우 기부자와 협의하여 적절한 방법으로 저작권 및 출처를 표시합니다.',
    ],
  },
  {
    id: 'article-11',
    title: '제11조(면책 조항)',
    items: [
      '협회는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제된다.',
      '협회는 이용자의 귀책사유로 인한 서비스 이용 장애나 정보 오류로 인한 손해에 대해서는 책임을 지지 않는다.',
    ],
  },
  {
    id: 'article-12',
    title: '제12조(기부금의 반환)',
    content: '기부금은 원칙적으로 반환되지 않는다. 단, 다음 각 호의 경우 반환을 요청할 수 있다.',
    items: [
      '협회의 행정 착오나 시스템 오류로 오납입된 경우',
      '법적으로 반환 의무가 발생한 특수한 경우',
    ],
    footnotes: [
      '반환 요청 시 이용자는 증빙 서류를 제출해야 하며, 협회는 내부 규정에 따라 처리한다.',
      '정기 후원(자동이체, 신용카드 정기 결제 등)의 경우, 후원회원은 다음 결제일로부터 최소 3영업일 전까지 협회에 연락하거나 시스템을 통해 후원의 중단 또는 금액 변경을 신청할 수 있습니다.',
    ],
  },
  {
    id: 'article-13',
    title: '제13조(분쟁의 해결)',
    content:
      '서비스 이용과 관련하여 발생한 분쟁은 합의에 의해 해결함을 원칙으로 하며, 소송이 제기될 경우 협회 소재지를 관할하는 법원을 전속 관할로 한다.',
  },
] as const

export default function TermsAndConditionsDonationsPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Terms &amp; Conditions
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>기부금품 관리 및 이용약관</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.
          </p>
          <div className='mt-6'>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-scholar-red text-white hover:bg-scholar-red/90 transition-colors'
            >
              <MessageSquare className='h-4 w-4' />
              문의처
            </Link>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <aside className='lg:w-64 shrink-0'>
            <div className='sticky top-24 space-y-6'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <ScrollText className='h-4 w-4 text-scholar-red' />
                    목차
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <nav className='space-y-1'>
                    {TERMS_ARTICLES.map(article => (
                      <Link
                        key={article.id}
                        href={`#${article.id}`}
                        className='block text-xs text-muted-foreground hover:text-foreground transition-colors py-1'
                      >
                        {article.title}
                      </Link>
                    ))}
                    <Link
                      href='#addendum'
                      className='block text-xs text-muted-foreground hover:text-foreground transition-colors py-1'
                    >
                      부칙
                    </Link>
                  </nav>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>바로 가기</CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                  <nav className='space-y-1'>
                    {SIDEBAR_LINKS.map(link => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1'
                      >
                        <ChevronRight className='h-3 w-3' />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className='flex-1 min-w-0'>
            <Card>
              <CardHeader>
                <div className='flex items-center gap-2 mb-2'>
                  <Scale className='h-5 w-5 text-scholar-red' />
                  <Badge variant='outline'>별지1</Badge>
                  <Badge variant='secondary'>개정 2026. 1. 1</Badge>
                </div>
                <CardTitle className='text-2xl'>기부금품 관리 및 이용약관</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Terms and Conditions for the Management and Use of Donations
                </p>
              </CardHeader>
              <CardContent className='prose prose-sm dark:prose-invert max-w-none'>
                {TERMS_ARTICLES.map(article => (
                  <section key={article.id} id={article.id} className='mb-8'>
                    <h3 className='text-lg font-bold mb-3'>{article.title}</h3>
                    {'content' in article && article.content && (
                      <p className='text-sm leading-relaxed mb-3'>{article.content}</p>
                    )}
                    {'items' in article && article.items && (
                      <ol className='list-decimal list-inside space-y-2 text-sm'>
                        {article.items.map((item: string, i: number) => (
                          <li key={i} className='leading-relaxed'>
                            {item}
                          </li>
                        ))}
                      </ol>
                    )}
                    {'footnote' in article && article.footnote && (
                      <p className='text-sm leading-relaxed mt-3 text-muted-foreground border-l-2 border-scholar-red/30 pl-3'>
                        {article.footnote}
                      </p>
                    )}
                    {'footnotes' in article &&
                      article.footnotes &&
                      article.footnotes.map((fn, i) => (
                        <p
                          key={i}
                          className='text-sm leading-relaxed mt-2 text-muted-foreground border-l-2 border-scholar-red/30 pl-3'
                        >
                          {fn}
                        </p>
                      ))}
                  </section>
                ))}

                <section id='addendum' className='mb-8'>
                  <h3 className='text-lg font-bold mb-3'>부칙</h3>
                  <p className='text-sm leading-relaxed'>이 약관은 2026년 1월 1일부터 시행한다.</p>
                </section>
              </CardContent>
            </Card>
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
