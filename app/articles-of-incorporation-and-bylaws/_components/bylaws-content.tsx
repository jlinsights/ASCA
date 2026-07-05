import { BYLAWS_SECTIONS } from './bylaws-data'
import { BylawsSectionCard } from './bylaws-section-card'
import { ArticlesSection } from './bylaws-sections/section-articles'
import { MembershipSection } from './bylaws-sections/section-membership'
import { OperationReviewSection } from './bylaws-sections/section-operation'
import { ExhibitionSection } from './bylaws-sections/section-exhibition'
import { ArtistAppointmentSection } from './bylaws-sections/section-artist-appointment'
import { AppraisalSection } from './bylaws-sections/section-appraisal'
import { BranchesSection } from './bylaws-sections/section-branches'
import { ObjectionsSection } from './bylaws-sections/section-objections'
import { QualificationSection } from './bylaws-sections/section-qualification'

export function BylawsContent() {
  return (
    <main className='flex-1 min-w-0 space-y-12'>
      {/* 1. 정관 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[0]!}>
        <ArticlesSection />
      </BylawsSectionCard>

      {/* 2. 회원 및 회비 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[1]!}>
        <MembershipSection />
      </BylawsSectionCard>

      {/* 3. 운영 및 심사 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[2]!}>
        <OperationReviewSection />
      </BylawsSectionCard>

      {/* 4. 전시 관리 및 운영 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[3]!}>
        <ExhibitionSection />
      </BylawsSectionCard>

      {/* 5. 추천ㆍ초대작가 선임 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[4]!}>
        <ArtistAppointmentSection />
      </BylawsSectionCard>

      {/* 6. 작품 감정 및 보증서 발행 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[5]!}>
        <AppraisalSection />
      </BylawsSectionCard>

      {/* 7. 지부 및 지회 설치·운영 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[6]!}>
        <BranchesSection />
      </BylawsSectionCard>

      {/* 8. 이의제기 처리 규정 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[7]!}>
        <ObjectionsSection />
      </BylawsSectionCard>

      {/* 9. 자격 및 요건 */}
      <BylawsSectionCard section={BYLAWS_SECTIONS[8]!}>
        <QualificationSection />
      </BylawsSectionCard>
    </main>
  )
}
