import type {
  MemberProfile,
  MembershipTierInfo,
  CalligraphyStyle,
  Achievement,
  CalligraphyCertification,
  MemberActivityLog,
} from '@/lib/types/membership'

export const styleNames: Record<CalligraphyStyle, string> = {
  kaishu: '해서',
  xingshu: '행서',
  caoshu: '초서',
  lishu: '예서',
  zhuanshu: '전서',
  modern: '현대서예',
  experimental: '실험서예',
}
