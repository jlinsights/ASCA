import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { BylawsSidebar } from './_components/bylaws-sidebar'
import { BylawsContent } from './_components/bylaws-content'

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
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight mb-4'>정관 및 관련 규정</h1>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'>
            궁금하신 부분이 있거나 저희 협회에 남기실 말씀이 있다면 문의하여 주시기 바랍니다.
          </p>
          <div className='flex items-center justify-center gap-3'>
            <a
              href='https://orientalcalligraphy.channel.io'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md bg-scholar-red px-5 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors'
            >
              상담 문의
            </a>
            <a
              href='https://whattime.co.kr/orientalcalligraphy'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors'
            >
              상담 예약
            </a>
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <BylawsSidebar />
          <BylawsContent />
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}
