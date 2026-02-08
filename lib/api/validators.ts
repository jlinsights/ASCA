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
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'lastActive', 'joinedDate']).default('createdAt'),
  sortOrder: sortOrderSchema,
});

export type MemberSearchParams = z.infer<typeof memberSearchSchema>;

// Create member schema
export const createMemberSchema = z.object({
  email: emailSchema,
  firstNameKo: z.string().min(1, 'Korean first name is required'),
  lastNameKo: z.string().min(1, 'Korean last name is required'),
  firstNameEn: z.string().min(1).optional(),
  lastNameEn: z.string().min(1).optional(),
  phone: phoneSchema,
  dateOfBirth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  nationality: z.string().optional(),
  residenceCountry: z.string().optional(),
  residenceCity: z.string().optional(),
  timezone: z.string().default('Asia/Seoul'),
  preferredLanguage: z.enum(['ko', 'en', 'ja', 'zh']).default('ko'),
  membershipLevelId: z.string().min(1),
  membershipStatus: memberStatusSchema.default('pending_approval'),
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
  nameKo: z.string().optional(),
  nameEn: z.string().optional(),
  nameJa: z.string().optional(),
  nameZh: z.string().optional(),
  bio: z.string().default(''),
  bioEn: z.string().optional(),
  bioJa: z.string().optional(),
  bioZh: z.string().optional(),
  birthYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  nationality: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  exhibitions: z.array(z.string()).default([]),
  profileImage: z.string().url().optional(),
  membershipType: z.string().default('준회원'),
  artistType: z.string().default('일반작가'),
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
  membershipType: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
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
  'n/a'
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
  artistId: uuidSchema,
  title: z.string().min(1, 'Title is required'),
  titleKo: z.string().optional(),
  titleEn: z.string().optional(),
  titleJa: z.string().optional(),
  titleZh: z.string().optional(),
  description: z.string().default(''),
  descriptionKo: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionZh: z.string().optional(),
  category: artworkCategorySchema.default('mixed-media'),
  style: artworkStyleSchema.default('traditional'),
  year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  materials: z.array(z.string()).default([]),
  dimensions: z.string().optional(), // JSON string
  price: z.string().optional(), // JSON string
  availability: artworkAvailabilitySchema.default('available'),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).default([]),
  imageUrl: z.string().url().optional(),
  condition: z.string().optional(),
  technique: z.string().optional(),
  authenticityCertificate: z.boolean().default(false),
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
  artistId: uuidSchema.optional(),
  category: artworkCategorySchema.optional(),
  style: artworkStyleSchema.optional(),
  availability: artworkAvailabilitySchema.optional(),
  featured: z.coerce.boolean().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'year']).default('createdAt'),
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
  titleKo: z.string().optional(),
  titleEn: z.string().optional(),
  description: z.string().default(''),
  startDate: z.string().date(),
  endDate: z.string().date(),
  location: z.string().optional(),
  venue: z.string().optional(),
  curator: z.string().optional(),
  featuredImageUrl: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).default([]),
  status: exhibitionStatusSchema.default('upcoming'),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  ticketPrice: z.number().int().min(0).optional(),
  currency: z.string().default('KRW'),
  isFree: z.boolean().default(false),
  subtitle: z.string().optional(),
  address: z.string().optional(),
  maxCapacity: z.number().int().min(1).optional(),
  admissionFee: z.number().int().min(0).optional(),
  openingHours: z.string().optional(),
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
  isFeatured: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'startDate', 'endDate']).default('startDate'),
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
