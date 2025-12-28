import { z } from 'zod';

/**
 * Common Validation Schemas
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Phone number validation (international format)
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
).optional();

// Date validation
export const dateSchema = z.string().datetime().or(z.string().date());

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort order schema
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Member Validation Schemas
 */

// Member status enum
export const memberStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending_approval',
  'expelled',
]);

// Member search parameters
export const memberSearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: memberStatusSchema.optional(),
  level: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'email', 'last_active', 'joined_date']).default('created_at'),
  sortOrder: sortOrderSchema,
});

export type MemberSearchParams = z.infer<typeof memberSearchSchema>;

// Create member schema
export const createMemberSchema = z.object({
  email: emailSchema,
  first_name_ko: z.string().min(1, 'Korean first name is required'),
  last_name_ko: z.string().min(1, 'Korean last name is required'),
  first_name_en: z.string().min(1).optional(),
  last_name_en: z.string().min(1).optional(),
  phone: phoneSchema,
  date_of_birth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  nationality: z.string().optional(),
  residence_country: z.string().optional(),
  residence_city: z.string().optional(),
  timezone: z.string().default('Asia/Seoul'),
  preferred_language: z.enum(['ko', 'en', 'ja', 'zh']).default('ko'),
  membership_level_id: z.string().min(1),
  membership_status: memberStatusSchema.default('pending_approval'),
});

export type CreateMemberDTO = z.infer<typeof createMemberSchema>;

// Update member schema
export const updateMemberSchema = createMemberSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateMemberDTO = z.infer<typeof updateMemberSchema>;

/**
 * Artist Validation Schemas
 */

// Create artist schema
export const createArtistSchema = z.object({
  name: z.string().min(1, 'Artist name is required'),
  name_en: z.string().optional(),
  name_ja: z.string().optional(),
  name_zh: z.string().optional(),
  bio: z.string().default(''),
  bio_en: z.string().optional(),
  bio_ja: z.string().optional(),
  bio_zh: z.string().optional(),
  birth_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  nationality: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  exhibitions: z.array(z.string()).default([]),
  profile_image: z.string().url().optional(),
  membership_type: z.string().default('준회원'),
  artist_type: z.string().default('일반작가'),
  title: z.string().optional(),
});

export type CreateArtistDTO = z.infer<typeof createArtistSchema>;

// Update artist schema
export const updateArtistSchema = createArtistSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateArtistDTO = z.infer<typeof updateArtistSchema>;

// Artist search parameters
export const artistSearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nationality: z.string().optional(),
  membership_type: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  sortOrder: sortOrderSchema,
});

export type ArtistSearchParams = z.infer<typeof artistSearchSchema>;

/**
 * Artwork Validation Schemas
 */

// Artwork availability enum
export const artworkAvailabilitySchema = z.enum([
  'available',
  'sold',
  'reserved',
  'not_for_sale',
  'on_loan',
]);

// Artwork category enum
export const artworkCategorySchema = z.enum([
  'calligraphy',
  'painting',
  'mixed-media',
  'sculpture',
  'installation',
  'digital',
  'other',
]);

// Artwork style enum
export const artworkStyleSchema = z.enum([
  'traditional',
  'contemporary',
  'modern',
  'abstract',
  'realistic',
  'experimental',
]);

// Create artwork schema
export const createArtworkSchema = z.object({
  artist_id: uuidSchema,
  title: z.string().min(1, 'Title is required'),
  title_en: z.string().optional(),
  title_ja: z.string().optional(),
  title_zh: z.string().optional(),
  description: z.string().default(''),
  description_en: z.string().optional(),
  category: artworkCategorySchema.default('mixed-media'),
  style: artworkStyleSchema.default('traditional'),
  year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  materials: z.array(z.string()).default([]),
  dimensions: z.string().optional(), // JSON string
  price: z.string().optional(), // JSON string
  availability: artworkAvailabilitySchema.default('available'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  thumbnail: z.string().url().optional(),
  condition: z.string().optional(),
  technique: z.string().optional(),
  authenticity_certificate: z.boolean().default(false),
});

export type CreateArtworkDTO = z.infer<typeof createArtworkSchema>;

// Update artwork schema
export const updateArtworkSchema = createArtworkSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateArtworkDTO = z.infer<typeof updateArtworkSchema>;

// Artwork search parameters
export const artworkSearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  artist_id: uuidSchema.optional(),
  category: artworkCategorySchema.optional(),
  style: artworkStyleSchema.optional(),
  availability: artworkAvailabilitySchema.optional(),
  featured: z.coerce.boolean().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'year']).default('created_at'),
  sortOrder: sortOrderSchema,
});

export type ArtworkSearchParams = z.infer<typeof artworkSearchSchema>;

/**
 * Exhibition Validation Schemas
 */

// Exhibition status enum
export const exhibitionStatusSchema = z.enum([
  'upcoming',
  'ongoing',
  'past',
  'cancelled',
]);

// Create exhibition schema
export const createExhibitionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  start_date: z.string().date(),
  end_date: z.string().date(),
  location: z.string().optional(),
  venue: z.string().optional(),
  curator: z.string().optional(),
  featured_image_url: z.string().url().optional(),
  gallery_images: z.array(z.string().url()).default([]),
  status: exhibitionStatusSchema.default('upcoming'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  ticket_price: z.number().int().min(0).optional(),
  currency: z.string().default('KRW'),
  is_free: z.boolean().default(false),
  subtitle: z.string().optional(),
  address: z.string().optional(),
  max_capacity: z.number().int().min(1).optional(),
  admission_fee: z.number().int().min(0).optional(),
  opening_hours: z.string().optional(),
  contact: z.string().optional(),
  website: z.string().url().optional(),
});

export type CreateExhibitionDTO = z.infer<typeof createExhibitionSchema>;

// Update exhibition schema
export const updateExhibitionSchema = createExhibitionSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateExhibitionDTO = z.infer<typeof updateExhibitionSchema>;

// Exhibition search parameters
export const exhibitionSearchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: exhibitionStatusSchema.optional(),
  is_featured: z.coerce.boolean().optional(),
  is_published: z.coerce.boolean().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'start_date', 'end_date']).default('start_date'),
  sortOrder: sortOrderSchema,
});

export type ExhibitionSearchParams = z.infer<typeof exhibitionSearchSchema>;

/**
 * Helper function to validate request params
 */
export function validateSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

/**
 * Helper function to validate request body
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}
