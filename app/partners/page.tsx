import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Landmark, BookOpen, Palette, Handshake, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '유관단체 | 동양서예협회',
  description:
    '사단법인 동양서예협회와 직접 혹은 간접적으로 관련이 있거나 파트너십 관계를 맺고 있는 협회 및 단체들을 소개합니다.',
  openGraph: {
    title: '유관단체 | 동양서예협회',
    description: '동양서예협회의 협력기관, 미술관, 서예 전문지, 화랑, 파트너 단체를 소개합니다.',
  },
}

type Partner = {
  name: string
  url?: string
}

type PartnerCategory = {
  id: string
  title: string
  icon: typeof Building2
  partners: Partner[]
}

const partnerCategories: PartnerCategory[] = [
  {
    id: 'organizations',
    title: '관련 기관 및 단체',
    icon: Building2,
    partners: [
      { name: '국회사무처', url: 'https://nas.na.go.kr/nas/index.do?extendedParam=site_id=nas' },
      { name: '문화체육관광부', url: 'https://www.mcst.go.kr/kor/main.jsp' },
      { name: '한국예술문화단체총연합회', url: 'http://www.yechong.or.kr/' },
      { name: '한국문화예술위원회', url: 'https://www.arko.or.kr/' },
      { name: '예술경영지원센터', url: 'https://www.gokams.or.kr/main/main.aspx' },
      { name: '한국서예협회', url: 'http://www.seohyeob.or.kr/web/index.php' },
      { name: '한국미술협회', url: 'http://www.kfaa.or.kr/' },
      { name: '한국화랑협회', url: 'http://koreagalleries.or.kr/' },
      { name: '한국미술시가감정협회', url: 'https://artprice.kr/' },
      { name: '한국예술문화협회', url: 'http://www.korea-art.co.kr/' },
      { name: '한국 문화예술 진흥원' },
      { name: '한중문화협회', url: 'http://www.k-cca.or.kr/' },
      { name: '한국문화원연합회', url: 'https://kccf.or.kr/dspv1User/UserMain.do' },
      { name: '고려대학교 교우회' },
      { name: '고려대학교 경영전문대학원 교우회' },
    ],
  },
  {
    id: 'museums',
    title: '미술관 및 박물관',
    icon: Landmark,
    partners: [
      { name: '예술의전당', url: 'https://www.sac.or.kr/site/main/home' },
      { name: '국립중앙박물관', url: 'https://www.museum.go.kr/site/main/home' },
      { name: '국립현대미술관' },
      { name: '서울시립미술관' },
      { name: '호암미술관', url: 'http://www.hoammuseum.org/html/main/index.asp' },
      { name: '금호미술관' },
      { name: '소전미술관' },
      {
        name: '운보문화재단',
        url: 'http://woonbo.kr/artnote/board.php?board=kkkmain&command=skin_insert&exe=insert_iboard1_home',
      },
      { name: '이응노미술관' },
      { name: '국립민속박물관' },
      { name: '경기도박물관' },
      { name: '국립광주박물관', url: 'https://gwangju.museum.go.kr/' },
      { name: '국립경주박물관', url: 'https://gyeongju.museum.go.kr/' },
      { name: '국립공주박물관', url: 'https://gongju.museum.go.kr/gongju/' },
    ],
  },
  {
    id: 'publications',
    title: '서예 및 미술 전문지',
    icon: BookOpen,
    partners: [
      { name: '월간 서예' },
      { name: '월간 서예문인화' },
      { name: '월간 미술', url: 'https://monthlyart.com/' },
    ],
  },
  {
    id: 'galleries',
    title: '화랑 및 갤러리',
    icon: Palette,
    partners: [
      { name: 'Artsy', url: 'https://www.artsy.net/' },
      { name: 'Lehmann Maupin', url: 'https://www.lehmannmaupin.com/' },
    ],
  },
  {
    id: 'partners',
    title: '파트너',
    icon: Handshake,
    partners: [
      {
        name: '사단법인 대한민국한자교육연구회 | 대한검정회',
        url: 'https://www.hanja.ne.kr/index_original.asp',
      },
      {
        name: '한국한문교사중앙연수원 | 문원한문서예학원',
        url: 'https://www.hanja.ne.kr/index_original.asp',
      },
      { name: '이아임디자인 | 이아임북', url: 'http://eimbook.com/' },
      { name: '글씨21', url: 'https://heart1213.cafe24.com/main/' },
      {
        name: '이화문화출판사 | 도서출판 서예문인화',
        url: 'http://www.makebook.net/',
      },
      { name: '도서출판 동양서예' },
      { name: '한국미술표구사' },
      { name: '현대족자표구사' },
      {
        name: '한국문화예술위원회 | 예술가의집',
        url: 'https://www.arko.or.kr/arthouse/',
      },
      {
        name: '삼성금융네트웍스 | 패밀리오피스',
        url: 'https://samsunglife.vip',
      },
    ],
  },
]

export default function PartnersPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Partners
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>유 관 단 체</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            사단법인 동양서예협회와 직접 혹은 간접적으로 관련이 있거나 파트너십 관계를 맺고 있는
            협회 및 단체들을 소개합니다.
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='max-w-5xl mx-auto space-y-12'>
          {partnerCategories.map(category => {
            const Icon = category.icon
            return (
              <div key={category.id} id={category.id}>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-lg bg-scholar-red/10 flex items-center justify-center'>
                    <Icon className='w-5 h-5 text-scholar-red' />
                  </div>
                  <h2 className='text-xl font-bold'>{category.title}</h2>
                  <Badge variant='secondary' className='text-xs'>
                    {category.partners.length}
                  </Badge>
                </div>

                <Card>
                  <CardContent className='p-0'>
                    <div className='divide-y'>
                      {category.partners.map((partner, idx) => (
                        <div
                          key={`${category.id}-${idx}`}
                          className='flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors'
                        >
                          <span className='text-sm'>{partner.name}</span>
                          {partner.url && (
                            <Link
                              href={partner.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-muted-foreground hover:text-scholar-red transition-colors'
                            >
                              <ExternalLink className='w-4 h-4' />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
