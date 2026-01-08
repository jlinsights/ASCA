/**
 * Input Validators Tests
 *
 * Tests for Zod validation schemas
 */

import { describe, test, expect } from '@jest/globals';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  paginationSchema,
  sortOrderSchema,
  memberStatusSchema,
  memberSearchSchema,
  createMemberSchema,
  updateMemberSchema,
  createArtistSchema,
  updateArtistSchema,
  artistSearchSchema,
  artworkAvailabilitySchema,
  artworkCategorySchema,
  artworkStyleSchema,
  createArtworkSchema,
  updateArtworkSchema,
  artworkSearchSchema,
  exhibitionStatusSchema,
  createExhibitionSchema,
  updateExhibitionSchema,
  exhibitionSearchSchema,
  validateSearchParams,
  validateRequestBody,
} from '../validators';

describe('Validators', () => {
  describe('Basic Validators', () => {
    describe('uuidSchema', () => {
      test('should accept valid UUID', () => {
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';
        const result = uuidSchema.safeParse(validUuid);
        expect(result.success).toBe(true);
      });

      test('should reject invalid UUID', () => {
        const invalidUuid = 'not-a-uuid';
        const result = uuidSchema.safeParse(invalidUuid);
        expect(result.success).toBe(false);
      });

      test('should reject empty string', () => {
        const result = uuidSchema.safeParse('');
        expect(result.success).toBe(false);
      });
    });

    describe('emailSchema', () => {
      test('should accept valid email', () => {
        const result = emailSchema.safeParse('test@example.com');
        expect(result.success).toBe(true);
      });

      test('should reject invalid email', () => {
        const result = emailSchema.safeParse('not-an-email');
        expect(result.success).toBe(false);
      });

      test('should reject email without domain', () => {
        const result = emailSchema.safeParse('test@');
        expect(result.success).toBe(false);
      });
    });

    describe('phoneSchema', () => {
      test('should accept valid international phone number', () => {
        const result = phoneSchema.safeParse('+821012345678');
        expect(result.success).toBe(true);
      });

      test('should accept phone number without plus', () => {
        const result = phoneSchema.safeParse('821012345678');
        expect(result.success).toBe(true);
      });

      test('should reject invalid phone number', () => {
        const result = phoneSchema.safeParse('invalid-phone');
        expect(result.success).toBe(false);
      });

      test('should accept undefined (optional)', () => {
        const result = phoneSchema.safeParse(undefined);
        expect(result.success).toBe(true);
      });
    });

    describe('paginationSchema', () => {
      test('should use default values when not provided', () => {
        const result = paginationSchema.parse({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      test('should accept valid pagination', () => {
        const result = paginationSchema.parse({ page: '5', limit: '50' });
        expect(result.page).toBe(5);
        expect(result.limit).toBe(50);
      });

      test('should reject page less than 1', () => {
        const result = paginationSchema.safeParse({ page: 0 });
        expect(result.success).toBe(false);
      });

      test('should reject limit greater than 100', () => {
        const result = paginationSchema.safeParse({ limit: 101 });
        expect(result.success).toBe(false);
      });

      test('should coerce string numbers to integers', () => {
        const result = paginationSchema.parse({ page: '3', limit: '25' });
        expect(result.page).toBe(3);
        expect(result.limit).toBe(25);
      });
    });

    describe('sortOrderSchema', () => {
      test('should accept "asc"', () => {
        const result = sortOrderSchema.safeParse('asc');
        expect(result.success).toBe(true);
      });

      test('should accept "desc"', () => {
        const result = sortOrderSchema.safeParse('desc');
        expect(result.success).toBe(true);
      });

      test('should use "desc" as default', () => {
        const result = sortOrderSchema.parse(undefined);
        expect(result).toBe('desc');
      });

      test('should reject invalid order', () => {
        const result = sortOrderSchema.safeParse('invalid');
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Member Validators', () => {
    describe('memberStatusSchema', () => {
      test('should accept valid status', () => {
        const statuses = ['active', 'inactive', 'suspended', 'pending_approval', 'expelled'];
        statuses.forEach((status) => {
          const result = memberStatusSchema.safeParse(status);
          expect(result.success).toBe(true);
        });
      });

      test('should reject invalid status', () => {
        const result = memberStatusSchema.safeParse('invalid_status');
        expect(result.success).toBe(false);
      });
    });

    describe('memberSearchSchema', () => {
      test('should parse valid search parameters', () => {
        const params = {
          query: 'test',
          page: '2',
          limit: '50',
          status: 'active',
          sortBy: 'email',
          sortOrder: 'asc',
        };

        const result = memberSearchSchema.parse(params);
        expect(result.query).toBe('test');
        expect(result.page).toBe(2);
        expect(result.limit).toBe(50);
        expect(result.status).toBe('active');
        expect(result.sortBy).toBe('email');
        expect(result.sortOrder).toBe('asc');
      });

      test('should use defaults when not provided', () => {
        const result = memberSearchSchema.parse({});
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.sortBy).toBe('created_at');
        expect(result.sortOrder).toBe('desc');
      });
    });

    describe('createMemberSchema', () => {
      test('should accept valid member data', () => {
        const memberData = {
          email: 'test@example.com',
          first_name_ko: '철수',
          last_name_ko: '김',
          membership_level_id: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createMemberSchema.safeParse(memberData);
        expect(result.success).toBe(true);
      });

      test('should use default values', () => {
        const memberData = {
          email: 'test@example.com',
          first_name_ko: '철수',
          last_name_ko: '김',
          membership_level_id: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createMemberSchema.parse(memberData);
        expect(result.timezone).toBe('Asia/Seoul');
        expect(result.preferred_language).toBe('ko');
        expect(result.membership_status).toBe('pending_approval');
      });

      test('should reject missing required fields', () => {
        const memberData = {
          email: 'test@example.com',
          // Missing first_name_ko, last_name_ko, membership_level_id
        };

        const result = createMemberSchema.safeParse(memberData);
        expect(result.success).toBe(false);
      });

      test('should reject invalid email', () => {
        const memberData = {
          email: 'invalid-email',
          first_name_ko: '철수',
          last_name_ko: '김',
          membership_level_id: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createMemberSchema.safeParse(memberData);
        expect(result.success).toBe(false);
      });
    });

    describe('updateMemberSchema', () => {
      test('should accept partial updates', () => {
        const updateData = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'newemail@example.com',
        };

        const result = updateMemberSchema.safeParse(updateData);
        expect(result.success).toBe(true);
      });

      test('should require id', () => {
        const updateData = {
          email: 'newemail@example.com',
        };

        const result = updateMemberSchema.safeParse(updateData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Artist Validators', () => {
    describe('createArtistSchema', () => {
      test('should accept valid artist data', () => {
        const artistData = {
          name: '김철수 작가',
          bio: '한국을 대표하는 작가',
        };

        const result = createArtistSchema.safeParse(artistData);
        expect(result.success).toBe(true);
      });

      test('should use default values', () => {
        const artistData = {
          name: '김철수 작가',
        };

        const result = createArtistSchema.parse(artistData);
        expect(result.bio).toBe('');
        expect(result.specialties).toEqual([]);
        expect(result.awards).toEqual([]);
        expect(result.membership_type).toBe('준회원');
      });

      test('should reject missing name', () => {
        const artistData = {
          bio: '작가 소개',
        };

        const result = createArtistSchema.safeParse(artistData);
        expect(result.success).toBe(false);
      });
    });

    describe('artistSearchSchema', () => {
      test('should parse valid search parameters', () => {
        const params = {
          query: 'artist name',
          nationality: 'KR',
          membership_type: '정회원',
        };

        const result = artistSearchSchema.safeParse(params);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Artwork Validators', () => {
    describe('artworkAvailabilitySchema', () => {
      test('should accept valid availability', () => {
        const statuses = ['available', 'sold', 'reserved', 'not_for_sale', 'on_loan'];
        statuses.forEach((status) => {
          const result = artworkAvailabilitySchema.safeParse(status);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('createArtworkSchema', () => {
      test('should accept valid artwork data', () => {
        const artworkData = {
          artist_id: '550e8400-e29b-41d4-a716-446655440000',
          title: '무제',
          description: '현대 미술 작품',
        };

        const result = createArtworkSchema.safeParse(artworkData);
        expect(result.success).toBe(true);
      });

      test('should use default values', () => {
        const artworkData = {
          artist_id: '550e8400-e29b-41d4-a716-446655440000',
          title: '무제',
        };

        const result = createArtworkSchema.parse(artworkData);
        expect(result.description).toBe('');
        expect(result.category).toBe('mixed-media');
        expect(result.style).toBe('traditional');
        expect(result.availability).toBe('available');
        expect(result.featured).toBe(false);
      });

      test('should reject invalid artist_id', () => {
        const artworkData = {
          artist_id: 'invalid-uuid',
          title: '무제',
        };

        const result = createArtworkSchema.safeParse(artworkData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Exhibition Validators', () => {
    describe('exhibitionStatusSchema', () => {
      test('should accept valid status', () => {
        const statuses = ['upcoming', 'ongoing', 'past', 'cancelled'];
        statuses.forEach((status) => {
          const result = exhibitionStatusSchema.safeParse(status);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('createExhibitionSchema', () => {
      test('should accept valid exhibition data', () => {
        const exhibitionData = {
          title: '현대미술전',
          description: '전시 설명',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        };

        const result = createExhibitionSchema.safeParse(exhibitionData);
        expect(result.success).toBe(true);
      });

      test('should use default values', () => {
        const exhibitionData = {
          title: '현대미술전',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        };

        const result = createExhibitionSchema.parse(exhibitionData);
        expect(result.description).toBe('');
        expect(result.status).toBe('upcoming');
        expect(result.is_featured).toBe(false);
        expect(result.is_published).toBe(true);
        expect(result.is_free).toBe(false);
        expect(result.currency).toBe('KRW');
      });

      test('should reject missing required fields', () => {
        const exhibitionData = {
          title: '현대미술전',
          // Missing start_date and end_date
        };

        const result = createExhibitionSchema.safeParse(exhibitionData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('validateSearchParams', () => {
      test('should validate URLSearchParams', () => {
        const searchParams = new URLSearchParams({
          page: '2',
          limit: '50',
        });

        const result = validateSearchParams(searchParams, paginationSchema);
        expect(result.page).toBe(2);
        expect(result.limit).toBe(50);
      });

      test('should throw on invalid params', () => {
        const searchParams = new URLSearchParams({
          page: '0', // Invalid: less than 1
        });

        expect(() => {
          validateSearchParams(searchParams, paginationSchema);
        }).toThrow();
      });
    });

    describe('validateRequestBody', () => {
      test('should validate request body', async () => {
        const mockRequest = {
          json: async () => ({
            email: 'test@example.com',
            first_name_ko: '철수',
            last_name_ko: '김',
            membership_level_id: '550e8400-e29b-41d4-a716-446655440000',
          }),
        } as Request;

        const result = await validateRequestBody(mockRequest, createMemberSchema);
        expect(result.email).toBe('test@example.com');
      });

      test('should throw on invalid body', async () => {
        const mockRequest = {
          json: async () => ({
            email: 'invalid-email',
          }),
        } as Request;

        await expect(async () => {
          await validateRequestBody(mockRequest, createMemberSchema);
        }).rejects.toThrow();
      });
    });
  });
});
