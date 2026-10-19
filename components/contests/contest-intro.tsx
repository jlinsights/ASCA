import { PageHero } from '@/components/layout/page-hero'
import { ContestFlipbook } from './contest-flipbook'

// 공모전 목록 조회가 끝나기 전에도 공모요강은 바로 볼 수 있어야 한다.
export function ContestIntro() {
  return (
    <>
      <PageHero
        title='공모전'
        subtitle='다양한 예술 공모전에 도전하고 여러분의 재능을 펼쳐보세요'
      />
      <ContestFlipbook />
    </>
  )
}
