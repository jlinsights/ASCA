import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ContactCards } from './_components/contact-cards'
import { ContactForm } from './_components/contact-form'
import { EventCalendar } from './_components/event-calendar'
import { ContactFaq } from './_components/contact-faq'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export const metadata: Metadata = {
  title: '문의 | Contact - 동양서예협회 | 東洋書藝協會',
  description:
    '동양서예협회에 궁금하신 점이 있으신가요? 전화, 카카오톡, 홈페이지를 통해 편리하게 상담받으세요. 회원가입, 전시회, 심사위원 모집 등 서예계의 모든 문의를 환영합니다.',
  openGraph: {
    title: '문의 | Contact - 동양서예협회 | 東洋書藝協會',
    description:
      '동양서예협회에 궁금하신 점이 있으신가요? 전화, 카카오톡, 홈페이지를 통해 편리하게 상담받으세요.',
    images: [
      'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
    ],
  },
}

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.contact}
        title='문의'
        lede='동양서예협회에 방문해 주셔서 감사 드립니다. 궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.'
      />

      {/* Contact Info + Form */}
      <section className='container mx-auto px-4 py-10 md:py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Left: Contact channels */}
          <div className='space-y-6'>
            <h2 className='text-xl font-bold'>연락처</h2>
            <ContactCards />
          </div>

          {/* Right: Calendar + Form */}
          <div className='space-y-8'>
            <EventCalendar />

            <div>
              <p className='text-sm text-muted-foreground mb-4'>
                브랜드 및 개인 프로젝트 외 다양한 분야의 창작자와 크고 작은 형태의 협업을 진행하고
                있습니다. 저희의 활동기준은 동양예술의 전통과 정신을 이어가며 현대예술 분야로
                확장하는 데에 있으며, 가능한 범주 안에서 삶과 예술을 바라보는 태도와 문화를 만들어
                가는 데 있습니다.
              </p>
              <h2 className='text-xl font-bold mb-4'>문의하기</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <ContactFaq />

      <LayoutFooter />
    </div>
  )
}
