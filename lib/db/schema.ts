import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// 사용자 테이블
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'artist', 'member', 'visitor'] }).default('visitor').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 작가 테이블
export const artists = sqliteTable('artists', {
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
  specialties: text('specialties'), // JSON 형태로 저장
  awards: text('awards'), // JSON 형태로 저장
  exhibitions: text('exhibitions'), // JSON 형태로 저장
  profileImage: text('profile_image'),
  website: text('website'),
  socialMedia: text('social_media'), // JSON 형태로 저장
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 작품 테이블
export const artworks = sqliteTable('artworks', {
  id: text('id').primaryKey(),
  artistId: text('artist_id').references(() => artists.id).notNull(),
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
    enum: ['calligraphy', 'painting', 'seal', 'mixed'] 
  }).notNull(),
  style: text('style'), // 해서, 행서, 초서, 예서, 전서 등
  medium: text('medium'), // 종이, 비단, 목재 등
  dimensions: text('dimensions'), // "가로 x 세로 cm"
  year: integer('year'),
  imageUrl: text('image_url'),
  imageUrls: text('image_urls'), // JSON 배열
  price: real('price'),
  currency: text('currency').default('KRW'),
  isForSale: integer('is_for_sale', { mode: 'boolean' }).default(false).notNull(),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
  tags: text('tags'), // JSON 배열
  metadata: text('metadata'), // JSON 형태로 추가 정보 저장
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 전시회 테이블
export const exhibitions = sqliteTable('exhibitions', {
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
    enum: ['solo', 'group', 'special', 'permanent'] 
  }).notNull(),
  status: text('status', { 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'] 
  }).default('upcoming').notNull(),
  venue: text('venue'),
  venueAddress: text('venue_address'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  openingHours: text('opening_hours'),
  admissionFee: real('admission_fee'),
  currency: text('currency').default('KRW'),
  posterImage: text('poster_image'),
  galleryImages: text('gallery_images'), // JSON 배열
  curatorNotes: text('curator_notes'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
  metadata: text('metadata'), // JSON 형태
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 전시회-작품 관계 테이블
export const exhibitionArtworks = sqliteTable('exhibition_artworks', {
  id: text('id').primaryKey(),
  exhibitionId: text('exhibition_id').references(() => exhibitions.id).notNull(),
  artworkId: text('artwork_id').references(() => artworks.id).notNull(),
  displayOrder: integer('display_order'),
  isHighlight: integer('is_highlight', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 전시회-작가 관계 테이블
export const exhibitionArtists = sqliteTable('exhibition_artists', {
  id: text('id').primaryKey(),
  exhibitionId: text('exhibition_id').references(() => exhibitions.id).notNull(),
  artistId: text('artist_id').references(() => artists.id).notNull(),
  role: text('role').default('participant'), // participant, curator, guest 등
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 뉴스/공지사항 테이블
export const news = sqliteTable('news', {
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
    enum: ['news', 'announcement', 'event', 'press'] 
  }).default('news').notNull(),
  status: text('status', { 
    enum: ['draft', 'published', 'archived'] 
  }).default('draft').notNull(),
  authorId: text('author_id').references(() => users.id),
  featuredImage: text('featured_image'),
  images: text('images'), // JSON 배열
  tags: text('tags'), // JSON 배열
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  metadata: text('metadata'), // JSON 형태
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 이벤트 테이블
export const events = sqliteTable('events', {
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
    enum: ['workshop', 'lecture', 'competition', 'ceremony', 'meeting'] 
  }).notNull(),
  status: text('status', { 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'] 
  }).default('upcoming').notNull(),
  venue: text('venue'),
  venueAddress: text('venue_address'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  registrationDeadline: integer('registration_deadline', { mode: 'timestamp' }),
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0).notNull(),
  fee: real('fee'),
  currency: text('currency').default('KRW'),
  organizerId: text('organizer_id').references(() => users.id),
  posterImage: text('poster_image'),
  images: text('images'), // JSON 배열
  requirements: text('requirements'),
  materials: text('materials'), // JSON 배열
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false).notNull(),
  metadata: text('metadata'), // JSON 형태
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 이벤트 참가자 테이블
export const eventParticipants = sqliteTable('event_participants', {
  id: text('id').primaryKey(),
  eventId: text('event_id').references(() => events.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  status: text('status', { 
    enum: ['registered', 'confirmed', 'attended', 'cancelled'] 
  }).default('registered').notNull(),
  registeredAt: integer('registered_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  notes: text('notes'),
});

// 갤러리 테이블
export const galleries = sqliteTable('galleries', {
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
    enum: ['permanent', 'temporary', 'virtual', 'archive'] 
  }).default('permanent').notNull(),
  coverImage: text('cover_image'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: text('metadata'), // JSON 형태
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 갤러리-작품 관계 테이블
export const galleryArtworks = sqliteTable('gallery_artworks', {
  id: text('id').primaryKey(),
  galleryId: text('gallery_id').references(() => galleries.id).notNull(),
  artworkId: text('artwork_id').references(() => artworks.id).notNull(),
  displayOrder: integer('display_order'),
  isHighlight: integer('is_highlight', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 관리자 권한 테이블
export const adminPermissions = sqliteTable('admin_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  permissions: text('permissions').notNull(), // JSON 형태로 권한 저장
  grantedBy: text('granted_by').references(() => users.id),
  grantedAt: integer('granted_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

// 회원 등급 테이블
export const membershipTiers = sqliteTable('membership_tiers', {
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
  level: integer('level').notNull(), // 1: Student, 2: Advanced, 3: Certified Master, 4: Honorary Master, 5: Institutional, 6: International
  requirements: text('requirements'), // JSON 형태로 요구사항 저장
  benefits: text('benefits'), // JSON 형태로 혜택 저장
  annualFee: real('annual_fee').default(0).notNull(),
  currency: text('currency').default('KRW'),
  color: text('color').default('#000000'), // 회원등급 식별 색상
  icon: text('icon'), // 회원등급 아이콘
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: text('metadata'), // JSON 형태
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 회원 정보 테이블
export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  membershipNumber: text('membership_number').notNull().unique(), // ASCA-2025-001 형태
  tierLevel: integer('tier_level').default(1).notNull(), // 현재 회원 등급
  tierId: text('tier_id').references(() => membershipTiers.id),
  status: text('status', { 
    enum: ['active', 'inactive', 'suspended', 'pending_approval', 'expelled'] 
  }).default('pending_approval').notNull(),
  joinDate: integer('join_date', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastActivityDate: integer('last_activity_date', { mode: 'timestamp' }),
  
  // 개인 정보
  fullName: text('full_name').notNull(),
  fullNameKo: text('full_name_ko'),
  fullNameEn: text('full_name_en'),
  fullNameCn: text('full_name_cn'),
  fullNameJp: text('full_name_jp'),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
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
  calligraphyExperience: integer('calligraphy_experience'), // 연수 (년)
  specializations: text('specializations'), // JSON 배열: ["kaishu", "xingshu", "caoshu"]
  preferredStyles: text('preferred_styles'), // JSON 배열
  teachingExperience: integer('teaching_experience'), // 교육 경력 (년)
  certifications: text('certifications'), // JSON 배열: 보유 자격증
  achievements: text('achievements'), // JSON 배열: 수상 경력, 전시 참가 등
  
  // 교육 배경
  educationBackground: text('education_background'), // JSON 형태
  calligraphyEducation: text('calligraphy_education'), // JSON 형태: 서예 관련 교육 이력
  
  // 관심 분야
  interests: text('interests'), // JSON 배열
  culturalBackground: text('cultural_background'),
  languages: text('languages'), // JSON 배열: ["ko", "en", "zh", "ja"]
  
  // 멤버십 정보
  membershipHistory: text('membership_history'), // JSON 배열: 등급 변경 이력
  paymentHistory: text('payment_history'), // JSON 배열: 회비 납부 이력
  participationScore: integer('participation_score').default(0), // 활동 점수
  contributionScore: integer('contribution_score').default(0), // 기여도 점수
  
  // 프라이버시 설정
  privacySettings: text('privacy_settings'), // JSON 형태
  marketingConsent: integer('marketing_consent', { mode: 'boolean' }).default(false),
  dataProcessingConsent: integer('data_processing_consent', { mode: 'boolean' }).default(true),
  
  // 메타데이터
  profileCompleteness: integer('profile_completeness').default(0), // 프로필 완성도 (%)
  lastProfileUpdate: integer('last_profile_update', { mode: 'timestamp' }),
  referredBy: text('referred_by').references(() => members.id), // 추천인
  notes: text('notes'), // 관리자 메모
  metadata: text('metadata'), // JSON 형태
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 회원 심사 테이블
export const membershipApplications = sqliteTable('membership_applications', {
  id: text('id').primaryKey(),
  memberId: text('member_id').references(() => members.id).notNull(),
  requestedTierLevel: integer('requested_tier_level').notNull(),
  requestedTierId: text('requested_tier_id').references(() => membershipTiers.id),
  applicationType: text('application_type', { 
    enum: ['new_member', 'tier_upgrade', 'tier_downgrade', 'reactivation'] 
  }).notNull(),
  
  // 신청 정보
  applicationReason: text('application_reason'),
  supportingDocuments: text('supporting_documents'), // JSON 배열: 첨부 파일 URL
  portfolioItems: text('portfolio_items'), // JSON 배열: 작품 포트폴리오
  references: text('references'), // JSON 배열: 추천인 정보
  
  // 심사 정보
  status: text('status', { 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'] 
  }).default('pending').notNull(),
  reviewerId: text('reviewer_id').references(() => users.id),
  reviewComments: text('review_comments'),
  reviewScore: integer('review_score'), // 심사 점수 (1-100)
  reviewCriteria: text('review_criteria'), // JSON 형태: 세부 평가 항목
  
  // 날짜 정보
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  decidedAt: integer('decided_at', { mode: 'timestamp' }),
  
  metadata: text('metadata'), // JSON 형태
});

// 회원 활동 로그 테이블
export const memberActivities = sqliteTable('member_activities', {
  id: text('id').primaryKey(),
  memberId: text('member_id').references(() => members.id).notNull(),
  activityType: text('activity_type', { 
    enum: ['login', 'profile_update', 'event_participation', 'artwork_submission', 
           'forum_post', 'payment', 'certificate_earned', 'course_completion'] 
  }).notNull(),
  description: text('description'),
  points: integer('points').default(0), // 활동에 따른 점수
  relatedEntityId: text('related_entity_id'), // 관련 엔티티 ID (이벤트, 작품 등)
  relatedEntityType: text('related_entity_type'), // 관련 엔티티 타입
  metadata: text('metadata'), // JSON 형태
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 문화교류 프로그램 테이블
export const culturalExchangePrograms = sqliteTable('cultural_exchange_programs', {
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
    enum: ['cultural_immersion', 'artist_residency', 'workshop_series', 'exhibition_exchange', 
           'academic_collaboration', 'youth_program', 'master_class'] 
  }).notNull(),
  
  targetAudience: text('target_audience'), // JSON 배열: 대상 회원 등급
  partnerOrganizations: text('partner_organizations'), // JSON 배열
  countries: text('countries'), // JSON 배열: 참여 국가
  languages: text('languages'), // JSON 배열: 사용 언어
  
  duration: integer('duration'), // 일수
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),
  fee: real('fee'),
  currency: text('currency').default('KRW'),
  
  location: text('location'),
  venue: text('venue'),
  accommodationProvided: integer('accommodation_provided', { mode: 'boolean' }).default(false),
  mealsProvided: integer('meals_provided', { mode: 'boolean' }).default(false),
  transportationProvided: integer('transportation_provided', { mode: 'boolean' }).default(false),
  
  requirements: text('requirements'), // JSON 형태
  benefits: text('benefits'), // JSON 형태
  schedule: text('schedule'), // JSON 형태
  
  applicationDeadline: integer('application_deadline', { mode: 'timestamp' }),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  
  status: text('status', { 
    enum: ['planning', 'open_for_applications', 'applications_closed', 'in_progress', 'completed', 'cancelled'] 
  }).default('planning').notNull(),
  
  organizerId: text('organizer_id').references(() => users.id),
  coordinators: text('coordinators'), // JSON 배열: 담당자 정보
  
  images: text('images'), // JSON 배열
  documents: text('documents'), // JSON 배열: 관련 문서
  
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON 형태
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 문화교류 프로그램 참가자 테이블
export const culturalExchangeParticipants = sqliteTable('cultural_exchange_participants', {
  id: text('id').primaryKey(),
  programId: text('program_id').references(() => culturalExchangePrograms.id).notNull(),
  memberId: text('member_id').references(() => members.id).notNull(),
  
  applicationData: text('application_data'), // JSON 형태: 신청서 정보
  specialRequests: text('special_requests'),
  emergencyContact: text('emergency_contact'), // JSON 형태
  
  status: text('status', { 
    enum: ['applied', 'approved', 'confirmed', 'attended', 'completed', 'cancelled', 'no_show'] 
  }).default('applied').notNull(),
  
  paymentStatus: text('payment_status', { 
    enum: ['pending', 'partial', 'completed', 'refunded'] 
  }).default('pending'),
  
  feedback: text('feedback'), // JSON 형태: 프로그램 후 피드백
  completion_certificate: text('completion_certificate'), // 수료증 URL
  
  appliedAt: integer('applied_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  metadata: text('metadata'), // JSON 형태
});

// 회원 인증서/자격증 테이블
export const memberCertifications = sqliteTable('member_certifications', {
  id: text('id').primaryKey(),
  memberId: text('member_id').references(() => members.id).notNull(),
  
  certificationType: text('certification_type', { 
    enum: ['calligraphy_mastery', 'teaching_qualification', 'cultural_competency', 
           'workshop_completion', 'exhibition_participation', 'judge_certification'] 
  }).notNull(),
  
  title: text('title').notNull(),
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  
  description: text('description'),
  level: text('level'), // beginner, intermediate, advanced, master
  
  issuingAuthority: text('issuing_authority').notNull(),
  authorityLogo: text('authority_logo'),
  
  certificateNumber: text('certificate_number').unique(),
  certificateUrl: text('certificate_url'), // PDF 등 인증서 파일
  
  skillsAssessed: text('skills_assessed'), // JSON 배열
  score: integer('score'), // 점수 (해당되는 경우)
  grade: text('grade'), // A, B, C 등급 (해당되는 경우)
  
  issuedAt: integer('issued_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  verificationUrl: text('verification_url'), // 온라인 인증 확인 URL
  
  status: text('status', { 
    enum: ['active', 'expired', 'revoked', 'pending_verification'] 
  }).default('active').notNull(),
  
  metadata: text('metadata'), // JSON 형태
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 타입 정의 (TypeScript 타입 추론을 위해)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export type Artwork = typeof artworks.$inferSelect;
export type NewArtwork = typeof artworks.$inferInsert;

export type Exhibition = typeof exhibitions.$inferSelect;
export type NewExhibition = typeof exhibitions.$inferInsert;

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Gallery = typeof galleries.$inferSelect;
export type NewGallery = typeof galleries.$inferInsert;

// 회원 관리 관련 타입
export type MembershipTier = typeof membershipTiers.$inferSelect;
export type NewMembershipTier = typeof membershipTiers.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type MembershipApplication = typeof membershipApplications.$inferSelect;
export type NewMembershipApplication = typeof membershipApplications.$inferInsert;

export type MemberActivity = typeof memberActivities.$inferSelect;
export type NewMemberActivity = typeof memberActivities.$inferInsert;

export type CulturalExchangeProgram = typeof culturalExchangePrograms.$inferSelect;
export type NewCulturalExchangeProgram = typeof culturalExchangePrograms.$inferInsert;

export type CulturalExchangeParticipant = typeof culturalExchangeParticipants.$inferSelect;
export type NewCulturalExchangeParticipant = typeof culturalExchangeParticipants.$inferInsert;

export type MemberCertification = typeof memberCertifications.$inferSelect;
export type NewMemberCertification = typeof memberCertifications.$inferInsert;

// AI 비전 분석 결과 테이블
export const calligraphyAnalyses = sqliteTable('calligraphy_analyses', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  memberId: text('member_id').references(() => members.id),
  
  // 이미지 정보
  originalImageUrl: text('original_image_url').notNull(),
  processedImageUrl: text('processed_image_url'),
  imageMetadata: text('image_metadata'), // JSON: 이미지 크기, 형식 등
  
  // 분석 설정
  analysisConfig: text('analysis_config'), // JSON: 분석 옵션
  calligraphyStyle: text('calligraphy_style', { 
    enum: ['kaishu', 'xingshu', 'caoshu', 'lishu', 'zhuanshu', 'mixed'] 
  }).notNull(),
  
  // 분석 결과
  overallScore: integer('overall_score'), // 0-100 종합 점수
  confidence: real('confidence'), // 0.0-1.0 신뢰도
  
  // 세부 점수
  brushControlScore: integer('brush_control_score'),
  inkFlowScore: integer('ink_flow_score'),
  strokeQualityScore: integer('stroke_quality_score'),
  rhythmConsistencyScore: integer('rhythm_consistency_score'),
  compositionScore: integer('composition_score'),
  
  // 분석 데이터
  strokesDetected: integer('strokes_detected').default(0),
  charactersAnalyzed: integer('characters_analyzed').default(0),
  strokesData: text('strokes_data'), // JSON: 붓질 좌표 및 분석
  charactersData: text('characters_data'), // JSON: 문자별 분석
  
  // 구성 분석
  compositionData: text('composition_data'), // JSON: 균형, 간격, 비례 등
  
  // 피드백
  feedback: text('feedback'), // JSON: AI 피드백 메시지
  improvementSuggestions: text('improvement_suggestions'), // JSON: 개선 제안
  
  // 처리 정보
  processingTime: integer('processing_time'), // 밀리초
  analysisVersion: text('analysis_version').default('1.0'),
  
  // 학습 관련
  isTrainingData: integer('is_training_data', { mode: 'boolean' }).default(false),
  expertValidation: text('expert_validation'), // JSON: 전문가 검증 결과
  
  // 상태
  status: text('status', { 
    enum: ['processing', 'completed', 'failed', 'archived'] 
  }).default('processing').notNull(),
  
  errorMessage: text('error_message'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 학습 진도 추적 테이블
export const learningProgress = sqliteTable('learning_progress', {
  id: text('id').primaryKey(),
  memberId: text('member_id').references(() => members.id).notNull(),
  
  // 학습 분야
  skillCategory: text('skill_category', { 
    enum: ['brush_control', 'ink_flow', 'stroke_quality', 'composition', 'character_structure'] 
  }).notNull(),
  
  currentLevel: integer('current_level').default(1), // 1-10 레벨
  experiencePoints: integer('experience_points').default(0),
  
  // 진도 통계
  totalAnalyses: integer('total_analyses').default(0),
  averageScore: real('average_score').default(0),
  bestScore: integer('best_score').default(0),
  improvementRate: real('improvement_rate').default(0), // 개선율 %
  
  // 목표 설정
  targetLevel: integer('target_level').default(5),
  targetScore: integer('target_score').default(80),
  targetDate: integer('target_date', { mode: 'timestamp' }),
  
  // 학습 패턴
  practiceFrequency: text('practice_frequency', { 
    enum: ['daily', 'weekly', 'monthly', 'irregular'] 
  }).default('weekly'),
  preferredTimeSlots: text('preferred_time_slots'), // JSON: 선호 시간대
  
  // 성취 기록
  achievements: text('achievements'), // JSON: 달성한 성취
  milestones: text('milestones'), // JSON: 중요 이정표
  
  lastPracticeDate: integer('last_practice_date', { mode: 'timestamp' }),
  
  metadata: text('metadata'), // JSON
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 시스템 설정 테이블
export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // general, ai_vision, membership, cultural_exchange
  key: text('key').notNull(),
  value: text('value').notNull(),
  dataType: text('data_type', { 
    enum: ['string', 'number', 'boolean', 'json'] 
  }).default('string').notNull(),
  
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  isEditable: integer('is_editable', { mode: 'boolean' }).default(true),
  
  validationRules: text('validation_rules'), // JSON: 유효성 검사 규칙
  
  createdBy: text('created_by').references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 감사 로그 테이블 (보안 및 추적)
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT 등
  resource: text('resource').notNull(), // 테이블명 또는 리소스명
  resourceId: text('resource_id'), // 대상 레코드 ID
  
  oldValues: text('old_values'), // JSON: 변경 전 값
  newValues: text('new_values'), // JSON: 변경 후 값
  
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  severity: text('severity', { 
    enum: ['low', 'medium', 'high', 'critical'] 
  }).default('low').notNull(),
  
  result: text('result', { 
    enum: ['success', 'failure', 'error'] 
  }).default('success').notNull(),
  
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON
  
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 파일 관리 테이블
export const fileStorage = sqliteTable('file_storage', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  
  fileType: text('file_type', { 
    enum: ['image', 'document', 'video', 'audio', 'archive'] 
  }).notNull(),
  
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),
  
  // 이미지 메타데이터 (이미지 파일인 경우)
  width: integer('width'),
  height: integer('height'),
  format: text('format'),
  colorSpace: text('color_space'),
  
  // 용도 분류
  purpose: text('purpose', { 
    enum: ['profile_image', 'artwork_image', 'analysis_image', 'document', 'certificate', 'other'] 
  }).default('other').notNull(),
  
  // 관련 엔티티
  relatedEntityType: text('related_entity_type'), // artwork, member, analysis 등
  relatedEntityId: text('related_entity_id'),
  
  // 보안 및 접근
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  accessLevel: text('access_level', { 
    enum: ['public', 'members_only', 'admin_only', 'private'] 
  }).default('private').notNull(),
  
  // 처리 상태
  processingStatus: text('processing_status', { 
    enum: ['uploaded', 'processing', 'ready', 'failed'] 
  }).default('uploaded').notNull(),
  
  checksumMd5: text('checksum_md5'),
  checksumSha256: text('checksum_sha256'),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  metadata: text('metadata'), // JSON
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 알림 테이블
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  
  type: text('type', { 
    enum: ['info', 'success', 'warning', 'error', 'membership', 'event', 'system'] 
  }).notNull(),
  
  title: text('title').notNull(),
  message: text('message').notNull(),
  
  // 다국어 지원
  titleKo: text('title_ko'),
  titleEn: text('title_en'),
  titleCn: text('title_cn'),
  titleJp: text('title_jp'),
  messageKo: text('message_ko'),
  messageEn: text('message_en'),
  messageCn: text('message_cn'),
  messageJp: text('message_jp'),
  
  // 관련 리소스
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  actionUrl: text('action_url'),
  
  priority: text('priority', { 
    enum: ['low', 'normal', 'high', 'urgent'] 
  }).default('normal').notNull(),
  
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  readAt: integer('read_at', { mode: 'timestamp' }),
  
  // 발송 설정
  sendEmail: integer('send_email', { mode: 'boolean' }).default(false),
  emailSentAt: integer('email_sent_at', { mode: 'timestamp' }),
  
  sendPush: integer('send_push', { mode: 'boolean' }).default(false),
  pushSentAt: integer('push_sent_at', { mode: 'timestamp' }),
  
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  
  metadata: text('metadata'), // JSON
  
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 성능 메트릭 테이블
export const performanceMetrics = sqliteTable('performance_metrics', {
  id: text('id').primaryKey(),
  
  metricType: text('metric_type', { 
    enum: ['api_response_time', 'database_query_time', 'image_processing_time', 
           'ai_analysis_time', 'page_load_time', 'error_rate'] 
  }).notNull(),
  
  endpoint: text('endpoint'),
  method: text('method'),
  
  value: real('value').notNull(),
  unit: text('unit').notNull(), // ms, seconds, percentage 등
  
  // 컨텍스트 정보
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  requestId: text('request_id'),
  
  // 환경 정보
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // 추가 메타데이터
  metadata: text('metadata'), // JSON
  
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 새로운 타입 추가
export type CalligraphyAnalysis = typeof calligraphyAnalyses.$inferSelect;
export type NewCalligraphyAnalysis = typeof calligraphyAnalyses.$inferInsert;

export type LearningProgress = typeof learningProgress.$inferSelect;
export type NewLearningProgress = typeof learningProgress.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type FileStorage = typeof fileStorage.$inferSelect;
export type NewFileStorage = typeof fileStorage.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type NewPerformanceMetric = typeof performanceMetrics.$inferInsert;
