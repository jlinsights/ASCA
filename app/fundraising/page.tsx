import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { FundraisingSidebar } from './_components/fundraising-sidebar'
import { PaymentCards } from './_components/payment-cards'
import { ConsultationSection } from './_components/consultation-section'
import { CmsFormSection } from './_components/cms-form-section'
import { FundraisingFaq } from './_components/fundraising-faq'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export const metadata: Metadata = {
  title: '모금 및 후원 안내 | 동양서예협회',
  description:
    '한국의 서예 문화를 지키고 발전시키는 동양서예협회의 모금에 동참해주세요. 서예 교육과 전통 문화 계승을 위한 프로젝트, 청소년 서예 육성 프로그램, 서예 문화 대중화 사업을 위한 여러분의 후원이 필요합니다.',
  openGraph: {
    title: '모금 및 후원 안내 | 동양서예협회',
    description:
      '서예의 가치를 다음 세대에 전하고, 우리 문화유산을 보존하는 일에 함께해주세요. 정기후원, 일시후원, 기업후원 등 다양한 방법으로 참여하실 수 있습니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function FundraisingPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.fundraising}
        title='모금 및 후원'
        lede='서예 문화의 계승과 발전을 위한 여러분의 소중한 후원에 감사드립니다. 온라인 결제, 무통장입금, CMS 자동이체 등 다양한 방법으로 참여하실 수 있습니다.'
      />

      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <FundraisingSidebar />
          <main className='flex-1 min-w-0 space-y-16'>
            <PaymentCards />
            <ConsultationSection />
            <CmsFormSection />
            <FundraisingFaq />
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
