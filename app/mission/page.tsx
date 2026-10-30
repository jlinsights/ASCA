import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { MissionTabs } from './_components/mission-tabs'

export const metadata: Metadata = {
  title: '사명 | 동양서예협회',
  description:
    '동양서예협회의 사명, 핵심 가치, 주요 목표를 소개합니다. 法古創新 · 人書俱老 — 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 서예 문화를 만들어 갑니다.',
  openGraph: {
    title: '사명 | 동양서예협회',
    description:
      '法古創新 · 人書俱老 — 한·중·일을 잇는 교류의 전통 위에서 동양 문자예술을 이 시대의 예술로 이어 가는 동양서예협회의 사명입니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function MissionPage() {
  return (
    <>
      <AboutPage>
        <MissionTabs />
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}
