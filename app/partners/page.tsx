import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ArrowUpRight } from 'lucide-react'
import { AboutChapter, AboutHero, AboutMarquee, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'

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
  partners: Partner[]
}

const partnerCategories: PartnerCategory[] = [
  {
    id: 'organizations',
    title: '관련 기관 및 단체',
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
    partners: [
      { name: '월간 서예' },
      { name: '월간 서예문인화' },
      { name: '월간 미술', url: 'https://monthlyart.com/' },
    ],
  },
  {
    id: 'galleries',
    title: '화랑 및 갤러리',
    partners: [
      { name: 'Artsy', url: 'https://www.artsy.net/' },
      { name: 'Lehmann Maupin', url: 'https://www.lehmannmaupin.com/' },
    ],
  },
  {
    id: 'partners',
    title: '파트너',
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
    ],
  },
]

// 이름 띠에는 미술관·기관 이름을 한 번씩만 싣는다
const MARQUEE_NAMES = [
  ...new Set(partnerCategories.flatMap(category => category.partners.map(p => p.name))),
]

export default function PartnersPage() {
  const partnerCount = partnerCategories.reduce(
    (sum, category) => sum + category.partners.length,
    0
  )

  return (
    <>
      <AboutPage>
        <AboutHero
          tc='協力'
          title='유관단체'
          lede='사단법인 동양서예협회와 직접 혹은 간접적으로 관련이 있거나 파트너십 관계를 맺고 있는 협회 및 단체들을 소개합니다.'
          facts={[
            { label: '분류', value: `${partnerCategories.length}개` },
            { label: '등재 기관·단체', value: `${partnerCount}곳` },
          ]}
        />
        <AboutNav />
        <AboutMarquee names={MARQUEE_NAMES} label='유관단체 이름 띠' />
        <AboutChapter
          id='partners'
          tone='gold'
          tc='同行'
          eyebrow='Partners · Institutions · Media'
          title='함께하는 기관'
          note='이름을 누르면 해당 기관 누리집이 새 창으로 열립니다.'
        >
          {partnerCategories.map(category => (
            <section
              key={category.id}
              id={category.id}
              className='ab-links__group'
              aria-labelledby={`${category.id}-title`}
            >
              <h3 id={`${category.id}-title`} className='ab-links__title'>
                {category.title}
                <span>{category.partners.length}곳</span>
              </h3>
              <ul className='ab-links'>
                {category.partners.map(partner => (
                  <li key={`${category.id}-${partner.name}`} data-reveal>
                    {partner.url ? (
                      <a
                        href={partner.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ab-link'
                      >
                        {partner.name}
                        <ArrowUpRight aria-hidden='true' className='ab-link__arrow' />
                        <span className='sr-only'>(새 창)</span>
                      </a>
                    ) : (
                      <span className='ab-link'>{partner.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </AboutChapter>
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}
