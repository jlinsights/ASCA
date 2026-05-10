import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { CommunityHero } from '@/components/community/hero'
import { DaoArchitecture } from '@/components/community/dao-architecture'
import { ImseoCard } from '@/components/community/imseo-card'
import { CafeEntry } from '@/components/community/cafe-entry'
import { MembershipBranch } from '@/components/community/membership-branch'

/**
 * /community — 동도(同道)들의 자리
 *
 * design: docs/02-design/features/asca-community-page-rollout.design.md
 * Plan: docs/01-plan/features/asca-community-page-rollout.plan.md (parent: asca-homepage-brand-rollout OQ#4 후속)
 *
 * 5 영역: Hero · DaoArchitecture · ImseoCard · CafeEntry · MembershipBranch.
 * 본 커밋은 D1 골격 + D2 Hero. 나머지 4영역은 D3~D6 후속.
 */

export const metadata: Metadata = {
  title: '동도들의 자리 | 사단법인 동양서예협회',
  description:
    '한 획을 함께 긋는 동도(同道)들의 자리. 동양서예협회는 옛 법을 익혀 새로움을 열고, 글씨와 사람이 함께 깊어지는 서예 문화를 엽니다.',
  openGraph: {
    title: '동도들의 자리 | 사단법인 동양서예협회',
    description: '法古創新 · 人書俱老 — 한 획을 함께 긋는 사람들의 모임에 동참하세요.',
    images: ['/og/community.png'],
  },
}

export default function CommunityPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <main className='flex-1'>
        <CommunityHero />
        <DaoArchitecture />
        <ImseoCard />
        <CafeEntry />
        <MembershipBranch />
      </main>
      <LayoutFooter />
    </div>
  )
}
