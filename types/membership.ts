// 회원제 플랫폼 타입 정의

// ===============================
// 기본 공통 타입들
// ===============================

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  uploadedBy: string
}

export interface SocialMediaLinks {
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  behance?: string
  artstation?: string
}

export interface Person {
  name: string
  nameEn?: string
  title?: string
  email: string
  phone?: string
  bio?: string
  profileImage?: string
}

export interface MembershipRestriction {
  type: 'geographical' | 'age' | 'experience' | 'qualification'
  description: string
  value?: string | number
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export type MemberStatus = 
  | 'active'
  | 'inactive' 
  | 'suspended'
  | 'pending'
  | 'expired'

export interface ProjectRole {
  id: string
  name: string
  description: string
  responsibilities: string[]
  requirements?: string[]
  assignedTo?: string
}

export interface ContributedResource {
  resourceId: string
  type: ResourceType
  quantity: number
  value?: number
  providedAt: Date
}

export interface NeededResource {
  type: ResourceType
  description: string
  quantity: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  deadline?: Date
}

export interface VotingPower {
  organizationId: string
  weight: number
  reason: string
  grantedAt: Date
}

export interface Decision {
  id: string
  title: string
  description: string
  decidedAt: Date
  result: string
  votingResults?: any
}

export interface ProjectPhase {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  status: 'planned' | 'active' | 'completed' | 'delayed'
  deliverables: string[]
  dependencies?: string[]
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  criteria: string[]
}

export interface ProjectTask {
  id: string
  title: string
  description: string
  assignedTo?: string[]
  dueDate: Date
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tags?: string[]
}

export interface Discussion {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  replies: DiscussionReply[]
  tags?: string[]
  isPinned?: boolean
}

export interface DiscussionReply {
  id: string
  content: string
  author: string
  createdAt: Date
  parentId?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  priority: 'low' | 'normal' | 'high' | 'urgent'
  expiresAt?: Date
  targetAudience?: string[]
}

export interface AvailabilitySchedule {
  startDate: Date
  endDate: Date
  timeSlots?: TimeSlot[]
  blackoutDates?: Date[]
  recurring?: RecurringPattern
}

export interface TimeSlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface ResourceCost {
  amount: number
  currency: string
  unit: 'per-hour' | 'per-day' | 'per-week' | 'per-month' | 'one-time'
  includes?: string[]
}

export interface ResourceRating {
  ratedBy: string
  rating: number
  comment?: string
  ratedAt: Date
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: Date
  occurrences?: number
}

export interface PriceBreak {
  minQuantity: number
  unitPrice: number
  discountPercentage?: number
}

export type GroupPurchaseStatus = 
  | 'planning'
  | 'open'
  | 'closed'
  | 'confirmed' 
  | 'processing'
  | 'delivered'
  | 'cancelled'

export interface FeeStructure {
  platformFee: number
  processingFee: number
  currency: string
  feeType: 'percentage' | 'fixed'
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

export interface EventAttendee {
  id: string
  userId: string
  registeredAt: Date
  status: 'registered' | 'waitlisted' | 'confirmed' | 'attended' | 'no-show'
  ticketType?: string
  specialRequirements?: string
}

export interface EventAgenda {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  speaker?: string
  location?: string
  materials?: string[]
}

export interface EventSpeaker {
  id: string
  name: string
  bio: string
  title?: string
  organization?: string
  profileImage?: string
  topics: string[]
  contactEmail?: string
}

export type EventStatus = 
  | 'draft'
  | 'published'
  | 'registration-open'
  | 'registration-closed'
  | 'ongoing'
  | 'completed'
  | 'cancelled'

export interface Connection {
  id: string
  organizationA: string
  organizationB: string
  connectionType: 'partnership' | 'collaboration' | 'mentorship' | 'supplier' | 'client'
  status: 'pending' | 'active' | 'inactive' | 'ended'
  establishedAt: Date
  description?: string
}

export interface MatchingCriteria {
  interests: string[]
  skills: string[]
  location?: Location
  organizationType?: OrganizationType[]
  collaborationPreferences: string[]
}

export interface MatchingSuggestion {
  id: string
  targetOrganization: string
  matchScore: number
  commonInterests: string[]
  complementarySkills: string[]
  suggestedAt: Date
  status: 'suggested' | 'contacted' | 'connected' | 'declined'
}

export interface Introduction {
  id: string
  introducerUserId: string
  organizationA: string
  organizationB: string
  message: string
  createdAt: Date
  status: 'pending' | 'accepted' | 'declined'
}

export type BenefitCategory = 
  | 'discount'
  | 'access'
  | 'priority'
  | 'exclusive'
  | 'networking'
  | 'education'
  | 'marketing'

export interface BudgetItem {
  category: string
  description: string
  amount: number
  currency: string
  isFixed: boolean
}

export interface FundingSource {
  name: string
  type: 'grant' | 'sponsorship' | 'membership-fees' | 'ticket-sales' | 'donation'
  amount: number
  currency: string
  secured: boolean
  deadline?: Date
}

export interface VoteOption {
  id: string
  title: string
  description?: string
  voteCount: number
}

export type VoteStatus = 
  | 'draft'
  | 'active'
  | 'closed'
  | 'cancelled'

export interface VoteResults {
  totalVotes: number
  winningOption?: string
  results: Array<{
    optionId: string
    votes: number
    percentage: number
  }>
  finalizedAt: Date
}

export type MeetingType = 
  | 'general'
  | 'planning'
  | 'review'
  | 'decision'
  | 'social'
  | 'training'

// ===============================
// 기존 인터페이스들
// ===============================

export interface Organization {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  
  // 조직 정보
  info: {
    type: OrganizationType
    category: OrganizationCategory
    foundedYear?: number
    location: Location
    website?: string
    socialMedia?: SocialMediaLinks
    logo?: MediaFile
    coverImage?: MediaFile
  }
  
  // 연락처 정보
  contact: {
    email: string
    phone?: string
    address: Address
    representative: Person
  }
  
  // 회원 관리
  membership: {
    tier: MembershipTier
    status: MembershipStatus
    joinedAt: Date
    expiresAt: Date
    benefits: MembershipBenefit[]
    restrictions?: MembershipRestriction[]
  }
  
  // 조직 구성원
  members: OrganizationMember[]
  
  // 활동 이력
  activities: {
    exhibitions: string[]  // exhibition IDs
    contests: string[]     // contest IDs
    projects: string[]     // collaborative project IDs
    events: string[]       // event IDs
  }
  
  // 설정
  settings: {
    visibility: 'public' | 'private' | 'members-only'
    allowCollaboration: boolean
    allowMemberInvites: boolean
    autoApproveJoin: boolean
  }
  
  // 통계
  stats?: {
    totalMembers: number
    activeMembers: number
    totalExhibitions: number
    totalArtworks: number
    collaborationCount: number
  }
  
  // 메타데이터
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isVerified: boolean
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  
  // 역할 및 권한
  role: MemberRole
  permissions: Permission[]
  isAdmin: boolean
  canInvite: boolean
  canManageEvents: boolean
  canManageFinances: boolean
  
  // 멤버십 정보
  membershipInfo: {
    status: MemberStatus
    joinedAt: Date
    invitedBy?: string
    approvedBy?: string
    tier?: MembershipTier
  }
  
  // 기여도
  contributions: {
    exhibitionsParticipated: number
    artworksSubmitted: number
    eventsOrganized: number
    collaborationScore: number
  }
  
  // 개인 정보 (사용자 정보 스냅샷)
  profile: {
    name: string
    email: string
    specialties: string[]
    bio?: string
    profileImage?: string
  }
}

export interface CollaborativeProject {
  id: string
  title: string
  titleEn?: string
  description: string
  type: ProjectType
  
  // 프로젝트 정보
  info: {
    theme?: string
    category: string[]
    goals: string[]
    timeline: ProjectTimeline
    budget?: ProjectBudget
    venue?: string
    isVirtual: boolean
  }
  
  // 참여 조직
  participants: {
    lead: string  // organization ID
    partners: string[]  // organization IDs
    supporters?: string[]  // organization IDs
    maxParticipants?: number
    minParticipants?: number
  }
  
  // 역할 분담
  roles: ProjectRole[]
  
  // 리소스 관리
  resources: {
    shared: SharedResource[]
    contributed: ContributedResource[]
    needed: NeededResource[]
  }
  
  // 의사결정
  decisions: {
    votingPower: VotingPower[]
    activeVotes: Vote[]
    completedDecisions: Decision[]
  }
  
  // 진행 상태
  progress: {
    status: ProjectStatus
    currentPhase: ProjectPhase
    completedPhases: ProjectPhase[]
    milestones: ProjectMilestone[]
    tasks: ProjectTask[]
  }
  
  // 커뮤니케이션
  communication: {
    discussions: Discussion[]
    announcements: Announcement[]
    meetings: Meeting[]
  }
  
  // 결과물
  deliverables: {
    exhibitions?: string[]
    catalogs?: string[]
    events?: string[]
    reports?: MediaFile[]
  }
  
  // 메타데이터
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface SharedResource {
  id: string
  type: ResourceType
  name: string
  description: string
  
  // 리소스 정보
  details: {
    category: string
    condition?: string
    availability: AvailabilitySchedule
    location?: string
    capacity?: number
    cost?: ResourceCost
  }
  
  // 소유/제공자
  provider: {
    organizationId: string
    contactPerson: string
    terms: string[]
    cost?: ResourceCost
  }
  
  // 예약 관리
  bookings: ResourceBooking[]
  
  // 평가
  ratings?: ResourceRating[]
}

export interface ResourceBooking {
  id: string
  resourceId: string
  bookedBy: string  // organization ID
  
  schedule: {
    startDate: Date
    endDate: Date
    startTime?: string
    endTime?: string
    recurring?: RecurringPattern
  }
  
  purpose: string
  status: BookingStatus
  notes?: string
  
  approvedBy?: string
  approvedAt?: Date
  
  createdAt: Date
}

export interface GroupPurchase {
  id: string
  title: string
  description: string
  
  // 상품 정보
  item: {
    name: string
    description: string
    category: string
    supplier: string
    unitPrice: number
    currency: string
    specifications?: Record<string, any>
    images?: MediaFile[]
  }
  
  // 구매 조건
  terms: {
    minQuantity: number
    maxQuantity?: number
    priceBreaks: PriceBreak[]
    deadline: Date
    deliveryDate?: Date
    paymentTerms: string
  }
  
  // 참여자 관리
  participants: {
    organizer: string  // organization ID
    buyers: GroupBuyer[]
    totalQuantity: number
    totalAmount: number
  }
  
  // 상태 관리
  status: GroupPurchaseStatus
  
  // 결제 정보
  payment: {
    method: 'collective' | 'individual'
    dueDate: Date
    escrowAccount?: string
    feeStructure: FeeStructure
  }
  
  createdAt: Date
  updatedAt: Date
}

export interface GroupBuyer {
  organizationId: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentStatus: PaymentStatus
  paidAt?: Date
  notes?: string
}

export interface CommunityEvent {
  id: string
  title: string
  titleEn?: string
  description: string
  
  // 이벤트 정보
  info: {
    type: EventType
    category: string[]
    format: 'online' | 'offline' | 'hybrid'
    maxAttendees?: number
    isPublic: boolean
    requiresApproval: boolean
  }
  
  // 일정 및 장소
  schedule: {
    startDate: Date
    endDate: Date
    startTime: string
    endTime: string
    timezone: string
    recurring?: RecurringPattern
  }
  
  venue: {
    name?: string
    address?: Address
    onlineLink?: string
    accessInstructions?: string
  }
  
  // 주최자
  organizer: {
    organizationId: string
    contactPerson: string
    coOrganizers?: string[]
  }
  
  // 참가자 관리
  attendance: {
    registered: EventAttendee[]
    waitlist: EventAttendee[]
    attended: string[]  // attendee IDs
    capacity: number
    registrationDeadline?: Date
  }
  
  // 콘텐츠
  content: {
    agenda?: EventAgenda[]
    speakers?: EventSpeaker[]
    materials?: MediaFile[]
    recordings?: MediaFile[]
  }
  
  // 비용
  pricing: {
    isFree: boolean
    memberPrice?: number
    nonMemberPrice?: number
    earlyBirdDiscount?: number
    groupDiscount?: number
    currency: string
  }
  
  // 상태
  status: EventStatus
  
  createdAt: Date
  updatedAt: Date
}

export interface NetworkingHub {
  id: string
  name: string
  description: string
  
  // 네트워킹 설정
  settings: {
    category: string[]
    visibility: 'public' | 'private' | 'invitation-only'
    autoMatch: boolean
    allowDirectContact: boolean
    moderationRequired: boolean
  }
  
  // 참여자
  members: {
    organizations: string[]  // organization IDs
    moderators: string[]     // user IDs
    activeConnections: Connection[]
  }
  
  // 매칭 시스템
  matching: {
    criteria: MatchingCriteria
    suggestions: MatchingSuggestion[]
    successfulMatches: number
  }
  
  // 활동
  activities: {
    discussions: Discussion[]
    meetups: Meeting[]
    collaborations: string[]  // project IDs
    introductions: Introduction[]
  }
  
  createdAt: Date
  updatedAt: Date
}

// Supporting Interfaces
export interface Location {
  country: string
  state?: string
  city: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface MembershipBenefit {
  id: string
  name: string
  description: string
  category: BenefitCategory
  value?: number
  conditions?: string[]
}

export interface ProjectTimeline {
  startDate: Date
  endDate: Date
  phases: ProjectPhase[]
  milestones: ProjectMilestone[]
}

export interface ProjectBudget {
  totalAmount: number
  currency: string
  breakdown: BudgetItem[]
  funding: FundingSource[]
}

export interface Vote {
  id: string
  title: string
  description: string
  options: VoteOption[]
  deadline: Date
  requiredQuorum: number
  status: VoteStatus
  results?: VoteResults
}

export interface Meeting {
  id: string
  title: string
  type: MeetingType
  scheduledAt: Date
  duration: number
  attendees: string[]
  agenda?: string[]
  notes?: string
  recordings?: MediaFile[]
}

// Enums
export type OrganizationType = 
  | 'art-association'
  | 'gallery'
  | 'museum'
  | 'art-school'
  | 'artist-collective'
  | 'cultural-center'
  | 'non-profit'
  | 'commercial'

export type OrganizationCategory = 
  | 'calligraphy'
  | 'painting'
  | 'sculpture'
  | 'photography'
  | 'digital-art'
  | 'mixed-media'
  | 'performance'
  | 'installation'
  | 'general'

export type MembershipTier = 
  | 'basic'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'

export type MembershipStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'expired'
  | 'pending'

export type MemberRole = 
  | 'owner'
  | 'admin' 
  | 'moderator'
  | 'member'
  | 'contributor'
  | 'observer'

export type ProjectType = 
  | 'group-exhibition'
  | 'art-fair'
  | 'workshop'
  | 'symposium'
  | 'publication'
  | 'competition'
  | 'community-project'

export type ResourceType = 
  | 'venue'
  | 'equipment'
  | 'material'
  | 'service'
  | 'expertise'
  | 'funding'

export type EventType = 
  | 'workshop'
  | 'lecture'
  | 'panel'
  | 'networking'
  | 'exhibition-opening'
  | 'studio-visit'
  | 'critique'
  | 'social'

export type ProjectStatus = 
  | 'proposed'
  | 'planning'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'

export type BookingStatus = 
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'confirmed'
  | 'completed'
  | 'cancelled' 