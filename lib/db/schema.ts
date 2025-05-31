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
