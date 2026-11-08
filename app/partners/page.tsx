import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { PartnersView } from './_components/partners-view'

export const metadata: Metadata = {
  title: '유관단체 | 동양서예협회',
  description:
    '사단법인 동양서예협회와 직접 혹은 간접적으로 관련이 있거나 파트너십 관계를 맺고 있는 협회 및 단체들을 소개합니다.',
  openGraph: {
    title: '유관단체 | 동양서예협회',
    description: '동양서예협회의 협력기관, 미술관, 서예 전문지, 화랑, 파트너 단체를 소개합니다.',
  },
}

export default function PartnersPage() {
  return (
    <>
      <AboutPage>
        <PartnersView />
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}
