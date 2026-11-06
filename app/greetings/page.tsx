import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import { GreetingsHero } from './_components/greetings-hero'
import { GreetingsTabs } from './_components/greetings-tabs'

export const metadata: Metadata = {
  title: '인사말씀 | 동양서예협회',
  description:
    '사단법인 동양서예협회 이사장 임재홍의 인사말씀입니다. 서울서예박물관 제1·2전시실 전관에서 열리는 제23회 대한민국 동양서예대전과 書境(서경) 초대작가전을 안내합니다.',
  openGraph: {
    title: '인사말씀 | 동양서예협회',
    description:
      '사단법인 동양서예협회 이사장 임재홍의 인사말씀. 청년작가와 외부 작가에게 문을 넓힌 제23회 대한민국 동양서예대전을 소개합니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function GreetingsPage() {
  return (
    <>
      <AboutPage>
        <GreetingsHero />
        <AboutNav />
        <GreetingsTabs />
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}
