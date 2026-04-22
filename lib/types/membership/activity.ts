// 회원 활동 및 참여 관련

/**
 * 회원 활동 로그
 */
export interface MemberActivityLog {
  id: string
  memberId: string
  activityType: MemberActivityType
  description: string
  points: number
  relatedEntityId?: string
  relatedEntityType?: string
  metadata?: Record<string, any>
  timestamp: Date
}

export type MemberActivityType =
  | 'login'
  | 'profile_update'
  | 'event_participation'
  | 'artwork_submission'
  | 'forum_post'
  | 'payment'
  | 'certificate_earned'
  | 'course_completion'
  | 'workshop_attendance'
  | 'exhibition_visit'
  | 'volunteer_work'
  | 'mentoring'
  | 'cultural_exchange'
