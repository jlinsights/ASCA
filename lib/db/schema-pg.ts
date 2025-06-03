import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// 작가 테이블 - Supabase와 호환되는 구조
export const artists = pgTable('artists', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  name_en: text('name_en'),
  name_ja: text('name_ja'),
  name_zh: text('name_zh'),
  bio: text('bio').default(''),
  bio_en: text('bio_en'),
  bio_ja: text('bio_ja'),
  bio_zh: text('bio_zh'),
  birth_year: integer('birth_year'),
  nationality: text('nationality'),
  specialties: text('specialties').array().default(sql`'{}'::text[]`),
  awards: text('awards').array().default(sql`'{}'::text[]`),
  exhibitions: text('exhibitions').array().default(sql`'{}'::text[]`),
  profile_image: text('profile_image'),
  membership_type: text('membership_type').default('준회원'),
  artist_type: text('artist_type').default('일반작가'),
  title: text('title'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 작품 테이블
export const artworks = pgTable('artworks', {
  id: uuid('id').defaultRandom().primaryKey(),
  artist_id: uuid('artist_id').references(() => artists.id).notNull(),
  title: text('title').notNull(),
  title_en: text('title_en'),
  title_ja: text('title_ja'),
  title_zh: text('title_zh'),
  description: text('description').default(''),
  description_en: text('description_en'),
  category: text('category').default('mixed-media'),
  style: text('style').default('traditional'),
  year: integer('year'),
  materials: text('materials').array().default(sql`'{}'::text[]`),
  dimensions: text('dimensions'), // JSON으로 저장
  price: text('price'), // JSON으로 저장 (amount, currency)
  availability: text('availability').default('available'),
  featured: boolean('featured').default(false),
  tags: text('tags').array().default(sql`'{}'::text[]`),
  images: text('images').array().default(sql`'{}'::text[]`),
  thumbnail: text('thumbnail'),
  condition: text('condition'),
  technique: text('technique'),
  authenticity_certificate: boolean('authenticity_certificate').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 전시회 테이블
export const exhibitions = pgTable('exhibitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  location: text('location'),
  venue: text('venue'),
  curator: text('curator'),
  featured_image_url: text('featured_image_url'),
  gallery_images: text('gallery_images').array().default(sql`'{}'::text[]`),
  status: text('status').default('upcoming'),
  is_featured: boolean('is_featured').default(false),
  is_published: boolean('is_published').default(true),
  ticket_price: integer('ticket_price'),
  currency: text('currency').default('KRW'),
  is_free: boolean('is_free').default(false),
  subtitle: text('subtitle'),
  address: text('address'),
  max_capacity: integer('max_capacity'),
  admission_fee: integer('admission_fee'),
  opening_hours: text('opening_hours'),
  contact: text('contact'),
  website: text('website'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 타입 정의
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

export type Artwork = typeof artworks.$inferSelect;
export type NewArtwork = typeof artworks.$inferInsert;

export type Exhibition = typeof exhibitions.$inferSelect;
export type NewExhibition = typeof exhibitions.$inferInsert; 