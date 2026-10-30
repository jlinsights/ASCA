import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import { IntroductionsHero } from './_components/introductions-hero'
import { IntroductionsTabs } from './_components/introductions-tabs'

export const metadata: Metadata = {
  title: '소개 | 동양서예협회',
  description:
    '사단법인 동양서예협회(ASCA)는 한국·중국·일본을 잇는 동양 서예의 전통을 이어 오늘의 예술로 펼쳐 가는 전문 예술문화단체입니다. 1997년 한·중·일 교류전에서 시작해 대한민국 동양서예대전을 열고 있습니다.',
  openGraph: {
    title: '소개 | 동양서예협회',
    description:
      '法古創新 · 人書俱老 — 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 동양서예협회를 소개합니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function IntroductionsPage() {
  return (
    <>
      <AboutPage>
        <IntroductionsHero />
        <AboutNav />
        <IntroductionsTabs />
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}
