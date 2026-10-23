import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { BylawsSidebar } from './_components/bylaws-sidebar'
import { BylawsContent } from './_components/bylaws-content'
import { BYLAWS_SECTIONS } from './_components/bylaws-data'

export const metadata: Metadata = {
  title: '정관 및 관련 규정 | Articles of Incorporation & Bylaws',
  description:
    '동양서예협회의 정관과 관련 규정 및 세부운영규칙을 안내하는 공간입니다. 협회의 설립 목적, 회원의 권리와 의무, 임원 선출과 운영, 이사회와 총회 운영, 재산 관리와 회계 등에 관한 기본 규정을 확인하실 수 있습니다.',
  openGraph: {
    title: '정관 및 관련 규정 | 동양서예협회',
    description: '동양서예협회의 정관과 관련 규정 및 세부운영규칙을 안내합니다.',
    images: [
      'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
    ],
  },
}

export default function ArticlesOfIncorporationPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.bylaws}
        title='정관 및 관련 규정'
        lede='궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.'
        actions={
          <>
            <Button asChild className='bg-scholar-red text-white hover:bg-scholar-red/90'>
              <a
                href='https://orientalcalligraphy.channel.io'
                target='_blank'
                rel='noopener noreferrer'
              >
                상담 문의
              </a>
            </Button>
            <Button asChild variant='outline'>
              <a
                href='https://whattime.co.kr/orientalcalligraphy'
                target='_blank'
                rel='noopener noreferrer'
              >
                상담 예약
              </a>
            </Button>
          </>
        }
      >
        <HeroFacts facts={[{ label: '규정 문서', value: `${BYLAWS_SECTIONS.length}건` }]} />
      </PageHero>

      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <BylawsSidebar />
          <BylawsContent />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
