import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  doublePrecision,
  uuid,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 사용자 테이블
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'artist', 'member', 'visitor'] })
    .default('visitor')
    .notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 작가 테이블
export const artists = pgTable('artists', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  nameKo: text('name_ko'),
  nameEn: text('name_en'),
  nameCn: text('name_cn'),
  nameJp: text('name_jp'),
  bio: text('bio'),
  bioKo: text('bio_ko'),
  bioEn: text('bio_en'),
  bioCn: text('bio_cn'),
  bioJp: text('bio_jp'),
  birthYear: integer('birth_year'),
  nationality: text('nationality'),
  specialties: jsonb('specialties').$type<string[]>(), // JSON 형태로 저장
  awards: jsonb('awards').$type<string[]>(), // JSON 형태로 저장
  exhibitions: jsonb('exhibitions').$type<string[]>(), // JSON 형태로 저장
  profileImage: text('profile_image'),
  website: text('website'),
  socialMedia: jsonb('social_media'), // JSON 형태로 저장
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 작품 테이블
export const artworks = pgTable('artworks', {
  id: text('id').primaryKey(),
  artistId: text('artist_id')
    .references(() => artists.id)
    .notNull(),
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),
  category: text('category', {
    enum: ['calligraphy', 'painting', 'seal', 'mixed'],
  }).notNull(),
  style: text('style'), // 해서, 행서, 초서, 예서, 전서 등
  medium: text('medium'), // 종이, 비단, 목재 등
  dimensions: text('dimensions'), // "가로 x 세로 cm"
  year: integer('year'),
  imageUrl: text('image_url'),
  imageUrls: jsonb('image_urls').$type<string[]>(), // JSON 배열
  price: real('price'),
  currency: text('currency').default('KRW'),
  isForSale: boolean('is_for_sale').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  tags: jsonb('tags').$type<string[]>(), // JSON 배열
  metadata: jsonb('metadata'), // JSON 형태로 추가 정보 저장
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 전시회 테이블
export const exhibitions = pgTable('exhibitions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),
  type: text('type', {
    enum: ['solo', 'group', 'special', 'permanent'],
  }).notNull(),
  status: text('status', {
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
  })
    .default('upcoming')
    .notNull(),
  venue: text('venue'),
  venueAddress: text('venue_address'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  openingHours: text('opening_hours'),
  admissionFee: real('admission_fee'),
  currency: text('currency').default('KRW'),
  posterImage: text('poster_image'),
  galleryImages: jsonb('gallery_images').$type<string[]>(), // JSON 배열
  curatorNotes: text('curator_notes'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  metadata: jsonb('metadata'), // JSON 형태
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 전시회-작품 관계 테이블
export const exhibitionArtworks = pgTable('exhibition_artworks', {
  id: text('id').primaryKey(),
  exhibitionId: text('exhibition_id')
    .references(() => exhibitions.id)
    .notNull(),
  artworkId: text('artwork_id')
    .references(() => artworks.id)
    .notNull(),
  displayOrder: integer('display_order'),
  isHighlight: boolean('is_highlight').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 전시회-작가 관계 테이블
export const exhibitionArtists = pgTable('exhibition_artists', {
  id: text('id').primaryKey(),
  exhibitionId: text('exhibition_id')
    .references(() => exhibitions.id)
    .notNull(),
  artistId: text('artist_id')
    .references(() => artists.id)
    .notNull(),
  role: text('role').default('participant'), // participant, curator, guest 등
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 뉴스/공지사항 테이블
export const news = pgTable('news', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  content: text('content').notNull(),
  contentKo: text('content_ko'),
  contentEn: text('content_en'),
  contentCn: text('content_cn'),
  contentJp: text('content_jp'),
  excerpt: text('excerpt'),
  category: text('category', {
    enum: ['news', 'announcement', 'event', 'press'],
  })
    .default('news')
    .notNull(),
  status: text('status', {
    enum: ['draft', 'published', 'archived'],
  })
    .default('draft')
    .notNull(),
  authorId: text('author_id').references(() => users.id),
  featuredImage: text('featured_image'),
  images: jsonb('images').$type<string[]>(), // JSON 배열
  tags: jsonb('tags').$type<string[]>(), // JSON 배열
  publishedAt: timestamp('published_at'),
  isPinned: boolean('is_pinned').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  metadata: jsonb('metadata'), // JSON 형태
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 이벤트 테이블
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),
  type: text('type', {
    enum: ['workshop', 'lecture', 'competition', 'ceremony', 'meeting'],
  }).notNull(),
  status: text('status', {
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
  })
    .default('upcoming')
    .notNull(),
  venue: text('venue'),
  venueAddress: text('venue_address'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  registrationDeadline: timestamp('registration_deadline'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0).notNull(),
  fee: real('fee'),
  currency: text('currency').default('KRW'),
  organizerId: text('organizer_id').references(() => users.id),
  posterImage: text('poster_image'),
  images: jsonb('images').$type<string[]>(), // JSON 배열
  requirements: text('requirements'),
  materials: jsonb('materials').$type<string[]>(), // JSON 배열
  isFeatured: boolean('is_featured').default(false).notNull(),
  metadata: jsonb('metadata'), // JSON 형태
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 이벤트 참가자 테이블
export const eventParticipants = pgTable('event_participants', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .references(() => events.id)
    .notNull(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  status: text('status', {
    enum: ['registered', 'confirmed', 'attended', 'cancelled'],
  })
    .default('registered')
    .notNull(),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  notes: text('notes'),
})

// 갤러리 테이블
export const galleries = pgTable('galleries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameKo: text('name_ko'),
  nameEn: text('name_en'),
  nameCn: text('name_cn'),
  nameJp: text('name_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),
  type: text('type', {
    enum: ['permanent', 'temporary', 'virtual', 'archive'],
  })
    .default('permanent')
    .notNull(),
  coverImage: text('cover_image'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata'), // JSON 형태
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 갤러리-작품 관계 테이블
export const galleryArtworks = pgTable('gallery_artworks', {
  id: text('id').primaryKey(),
  galleryId: text('gallery_id')
    .references(() => galleries.id)
    .notNull(),
  artworkId: text('artwork_id')
    .references(() => artworks.id)
    .notNull(),
  displayOrder: integer('display_order'),
  isHighlight: boolean('is_highlight').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 관리자 권한 테이블
export const adminPermissions = pgTable('admin_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  permissions: jsonb('permissions').notNull(), // JSON 형태
  grantedBy: text('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
})

// 회원 등급 테이블
export const membershipTiers = pgTable('membership_tiers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameKo: text('name_ko').notNull(),
  nameEn: text('name_en').notNull(),
  nameCn: text('name_cn'),
  nameJp: text('name_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),
  level: integer('level').notNull(),
  requirements: jsonb('requirements'), // JSON 형태로 요구사항 저장
  benefits: jsonb('benefits'), // JSON 형태로 혜택 저장
  annualFee: real('annual_fee').default(0).notNull(),
  currency: text('currency').default('KRW'),
  color: text('color').default('#000000'),
  icon: text('icon'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 회원 정보 테이블
export const members = pgTable('members', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
  membershipNumber: text('membership_number').notNull().unique(),
  tierLevel: integer('tier_level').default(1).notNull(),
  tierId: text('tier_id').references(() => membershipTiers.id),
  status: text('status', {
    enum: ['active', 'inactive', 'suspended', 'pending_approval', 'expelled'],
  })
    .default('pending_approval')
    .notNull(),
  joinDate: timestamp('join_date').defaultNow().notNull(),
  lastActivityDate: timestamp('last_activity_date'),

  // 개인 정보
  fullName: text('full_name').notNull(),
  fullNameKo: text('full_name_ko'),
  fullNameEn: text('full_name_en'),
  fullNameCn: text('full_name_cn'),
  fullNameJp: text('full_name_jp'),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender', { enum: ['male', 'female', 'other', 'prefer_not_to_say'] }),
  nationality: text('nationality').default('KR'),

  // 연락처 정보
  phoneNumber: text('phone_number'),
  alternateEmail: text('alternate_email'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),

  // 주소 정보
  address: text('address'),
  addressKo: text('address_ko'),
  addressEn: text('address_en'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country').default('KR'),

  // 서예 관련 정보
  calligraphyExperience: integer('calligraphy_experience'),
  specializations: jsonb('specializations').$type<string[]>(),
  preferredStyles: jsonb('preferred_styles').$type<string[]>(),
  teachingExperience: integer('teaching_experience'),
  certifications: jsonb('certifications').$type<string[]>(),
  achievements: jsonb('achievements').$type<string[]>(),

  // 교육 배경
  educationBackground: jsonb('education_background'),
  calligraphyEducation: jsonb('calligraphy_education'),

  // 관심 분야
  interests: jsonb('interests').$type<string[]>(),
  culturalBackground: text('cultural_background'),
  languages: jsonb('languages').$type<string[]>(),

  // 멤버십 정보
  membershipHistory: jsonb('membership_history'),
  paymentHistory: jsonb('payment_history'),
  participationScore: integer('participation_score').default(0),
  contributionScore: integer('contribution_score').default(0),

  // 프라이버시 설정
  privacySettings: jsonb('privacy_settings'),
  marketingConsent: boolean('marketing_consent').default(false),
  dataProcessingConsent: boolean('data_processing_consent').default(true),

  // 메타데이터
  profileCompleteness: integer('profile_completeness').default(0),
  lastProfileUpdate: timestamp('last_profile_update'),
  referredBy: text('referred_by'), // Self Reference는 나중에 처리하거나 Any로
  notes: text('notes'),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 회원 심사 테이블
export const membershipApplications = pgTable('membership_applications', {
  id: text('id').primaryKey(),
  memberId: text('member_id')
    .references(() => members.id)
    .notNull(),
  requestedTierLevel: integer('requested_tier_level').notNull(),
  requestedTierId: text('requested_tier_id').references(() => membershipTiers.id),
  applicationType: text('application_type', {
    enum: ['new_member', 'tier_upgrade', 'tier_downgrade', 'reactivation'],
  }).notNull(),

  applicationReason: text('application_reason'),
  supportingDocuments: jsonb('supporting_documents').$type<string[]>(),
  portfolioItems: jsonb('portfolio_items'),
  references: jsonb('references'),

  status: text('status', {
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
  })
    .default('pending')
    .notNull(),
  reviewerId: text('reviewer_id').references(() => users.id),
  reviewComments: text('review_comments'),
  reviewScore: integer('review_score'),
  reviewCriteria: jsonb('review_criteria'),

  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  decidedAt: timestamp('decided_at'),

  metadata: jsonb('metadata'),
})

// 회원 활동 로그 테이블
export const memberActivities = pgTable('member_activities', {
  id: text('id').primaryKey(),
  memberId: text('member_id')
    .references(() => members.id)
    .notNull(),
  activityType: text('activity_type', {
    enum: [
      'login',
      'profile_update',
      'event_participation',
      'artwork_submission',
      'forum_post',
      'payment',
      'certificate_earned',
      'course_completion',
    ],
  }).notNull(),
  description: text('description'),
  points: integer('points').default(0),
  relatedEntityId: text('related_entity_id'),
  relatedEntityType: text('related_entity_type'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

// 문화교류 프로그램 테이블
export const culturalExchangePrograms = pgTable('cultural_exchange_programs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  description: text('description'),
  descriptionKo: text('description_ko'),
  descriptionEn: text('description_en'),
  descriptionCn: text('description_cn'),
  descriptionJp: text('description_jp'),

  programType: text('program_type', {
    enum: [
      'cultural_immersion',
      'artist_residency',
      'workshop_series',
      'exhibition_exchange',
      'academic_collaboration',
      'youth_program',
      'master_class',
    ],
  }).notNull(),

  targetAudience: jsonb('target_audience').$type<string[]>(),
  partnerOrganizations: jsonb('partner_organizations'),
  countries: jsonb('countries').$type<string[]>(),
  languages: jsonb('languages').$type<string[]>(),

  duration: integer('duration'),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  fee: real('fee'),
  currency: text('currency').default('KRW'),

  location: text('location'),
  venue: text('venue'),
  accommodationProvided: boolean('accommodation_provided').default(false),
  mealsProvided: boolean('meals_provided').default(false),
  transportationProvided: boolean('transportation_provided').default(false),

  requirements: jsonb('requirements'),
  benefits: jsonb('benefits'),
  schedule: jsonb('schedule'),

  applicationDeadline: timestamp('application_deadline'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  status: text('status', {
    enum: [
      'planning',
      'open_for_applications',
      'applications_closed',
      'in_progress',
      'completed',
      'cancelled',
    ],
  })
    .default('planning')
    .notNull(),

  organizerId: text('organizer_id').references(() => users.id),
  coordinators: jsonb('coordinators'),

  images: jsonb('images').$type<string[]>(),
  documents: jsonb('documents'),

  isFeatured: boolean('is_featured').default(false),
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 문화교류 프로그램 참가자 테이블
export const culturalExchangeParticipants = pgTable('cultural_exchange_participants', {
  id: text('id').primaryKey(),
  programId: text('program_id')
    .references(() => culturalExchangePrograms.id)
    .notNull(),
  memberId: text('member_id')
    .references(() => members.id)
    .notNull(),

  applicationData: jsonb('application_data'),
  specialRequests: text('special_requests'),
  emergencyContact: jsonb('emergency_contact'),

  status: text('status', {
    enum: ['applied', 'approved', 'confirmed', 'attended', 'completed', 'cancelled', 'no_show'],
  })
    .default('applied')
    .notNull(),

  paymentStatus: text('payment_status', {
    enum: ['pending', 'partial', 'completed', 'refunded'],
  }).default('pending'),

  feedback: jsonb('feedback'),
  completionCertificate: text('completion_certificate'),

  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  completedAt: timestamp('completed_at'),

  metadata: jsonb('metadata'),
})

// 회원 인증서/자격증 테이블
export const memberCertifications = pgTable('member_certifications', {
  id: text('id').primaryKey(),
  memberId: text('member_id')
    .references(() => members.id)
    .notNull(),

  certificationType: text('certification_type', {
    enum: [
      'calligraphy_mastery',
      'teaching_qualification',
      'cultural_competency',
      'workshop_completion',
      'exhibition_participation',
      'judge_certification',
    ],
  }).notNull(),

  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),

  description: text('description'),
  level: text('level'),

  issuingAuthority: text('issuing_authority').notNull(),
  authorityLogo: text('authority_logo'),

  certificateNumber: text('certificate_number').unique(),
  certificateUrl: text('certificate_url'),

  skillsAssessed: jsonb('skills_assessed').$type<string[]>(),
  score: integer('score'),
  grade: text('grade'),

  issuedAt: timestamp('issued_at').notNull(),
  expiresAt: timestamp('expires_at'),

  verificationUrl: text('verification_url'),

  status: text('status', {
    enum: ['active', 'expired', 'revoked', 'pending_verification'],
  })
    .default('active')
    .notNull(),

  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 파일 스토리지 (기존 fileStorage 유지)
export const fileStorage = pgTable('file_storage', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),

  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),

  fileType: text('file_type', {
    enum: ['image', 'document', 'video', 'audio', 'archive'],
  }).notNull(),

  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),

  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),

  width: integer('width'),
  height: integer('height'),
  format: text('format'),
  colorSpace: text('color_space'),

  purpose: text('purpose', {
    enum: ['profile_image', 'artwork_image', 'analysis_image', 'document', 'certificate', 'other'],
  })
    .default('other')
    .notNull(),

  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),

  isPublic: boolean('is_public').default(false),
  accessLevel: text('access_level', {
    enum: ['public', 'members_only', 'admin_only', 'private'],
  })
    .default('private')
    .notNull(),

  processingStatus: text('processing_status', {
    enum: ['uploaded', 'processing', 'ready', 'failed'],
  })
    .default('uploaded')
    .notNull(),

  checksumMd5: text('checksum_md5'),
  checksumSha256: text('checksum_sha256'),

  expiresAt: timestamp('expires_at'),

  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 아카데미 강좌 테이블
export const academyCourses = pgTable('academy_courses', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().unique(),
  title: text('title').notNull(),
  instructor: text('instructor'),
  schedule: text('schedule'),
  period: text('period'),
  level: text('level'),
  description: text('description'),
  curriculum: jsonb('curriculum').$type<string[]>(),
  fee: text('fee'),
  status: text('status'),
  externalLink: text('external_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 아카데미 강사 테이블
export const academyInstructors = pgTable('academy_instructors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  introTitle: text('intro_title'),
  category: text('category'),
  imageUrl: text('image_url'),
  career: jsonb('career').$type<string[]>(),
  artworkUrl: text('artwork_url'),
  artworkDesc: text('artwork_desc'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 공모전 수상 결과 테이블
export const contestResults = pgTable('contest_results', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  edition: text('edition'),
  contestType: text('contest_type', {
    enum: ['oriental_calligraphy', 'korea_china_japan'],
  })
    .default('oriental_calligraphy')
    .notNull(),
  contestTitle: text('contest_title').notNull(),
  awardCategory: text('award_category', {
    enum: [
      'grand_prize',
      'top_excellence',
      'excellence',
      'five_script',
      'three_script',
      'special',
      'selected',
    ],
  }).notNull(),
  awardSubCategory: text('award_sub_category'),
  winnerName: text('winner_name').notNull(),
  artworkTitle: text('artwork_title'),
  script: text('script'),
  medium: text('medium'),
  dimensions: text('dimensions'),
  imageUrl: text('image_url'),
  artistId: text('artist_id').references(() => artists.id),
  displayOrder: integer('display_order').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 협력 기관/파트너 테이블
export const partners = pgTable('partners', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  nameCn: text('name_cn'),
  nameJp: text('name_jp'),
  category: text('category', {
    enum: ['government', 'museum', 'gallery', 'publication', 'education', 'partner', 'sponsor'],
  }).notNull(),
  description: text('description'),
  descriptionEn: text('description_en'),
  website: text('website'),
  logoUrl: text('logo_url'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  relationshipType: text('relationship_type'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 타입 정의
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert

export type Artist = typeof artists.$inferSelect
export type NewArtist = typeof artists.$inferInsert

export type Artwork = typeof artworks.$inferSelect
export type NewArtwork = typeof artworks.$inferInsert

export type Exhibition = typeof exhibitions.$inferSelect
export type NewExhibition = typeof exhibitions.$inferInsert

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Gallery = typeof galleries.$inferSelect
export type NewGallery = typeof galleries.$inferInsert

export type News = typeof news.$inferSelect
export type NewNews = typeof news.$inferInsert

export type MembershipTier = typeof membershipTiers.$inferSelect
export type MembershipApplication = typeof membershipApplications.$inferSelect
export type MemberActivity = typeof memberActivities.$inferSelect
export type MemberCertification = typeof memberCertifications.$inferSelect

export type CulturalExchangeProgram = typeof culturalExchangePrograms.$inferSelect
export type CulturalExchangeParticipant = typeof culturalExchangeParticipants.$inferSelect

export type AcademyCourse = typeof academyCourses.$inferSelect
export type AcademyInstructor = typeof academyInstructors.$inferSelect

export type ContestResult = typeof contestResults.$inferSelect
export type NewContestResult = typeof contestResults.$inferInsert

export type Partner = typeof partners.$inferSelect
export type NewPartner = typeof partners.$inferInsert
