import { DataLoader } from '@/lib/optimization/dataloader';
import type { GraphQLContext } from './context';
import type { User } from '@/lib/db/schema';

/**
 * GraphQL Testing Utilities
 *
 * Provides mock context, DataLoaders, and helper functions for testing GraphQL resolvers
 */

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    avatar: null,
    bio: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as User;
}

/**
 * Create a mock admin user for testing
 */
export function createMockAdmin(overrides?: Partial<User>): User {
  return createMockUser({
    id: 'admin-user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    ...overrides,
  });
}

/**
 * Create mock DataLoaders that return predefined data
 */
export function createMockDataLoaders(mockData?: any) {
  const createLoader = <T>(getData: (id: string) => T | null) => ({
    load: jest.fn((id: string) => Promise.resolve(getData(id))),
    loadMany: jest.fn((ids: string[]) => Promise.resolve(ids.map(getData))),
    clear: jest.fn(),
    clearAll: jest.fn(),
    prime: jest.fn(),
  }) as unknown as DataLoader<string, T>;

  return {
    userLoader: createLoader<User>(mockData?.users || (() => null)),
    memberLoader: createLoader<any>(mockData?.members || (() => null)),
    memberByUserIdLoader: createLoader<any>(mockData?.membersByUserId || (() => null)),
    membershipTierLoader: createLoader<any>(mockData?.membershipTiers || (() => null)),
    artistLoader: createLoader<any>(mockData?.artists || (() => null)),
    artworkLoader: createLoader<any>(mockData?.artworks || (() => null)),
    artworksByArtistLoader: createLoader<any[]>(mockData?.artworksByArtist || (() => [])),
    exhibitionLoader: createLoader<any>(mockData?.exhibitions || (() => null)),
    exhibitionArtworkLoader: createLoader<any>(mockData?.exhibitionArtworks || (() => null)),
    exhibitionArtistLoader: createLoader<any>(mockData?.exhibitionArtists || (() => null)),
    eventLoader: createLoader<any>(mockData?.events || (() => null)),
    eventParticipantLoader: createLoader<any>(mockData?.eventParticipants || (() => null)),
    galleryLoader: createLoader<any>(mockData?.galleries || (() => null)),
    galleryArtworkLoader: createLoader<any>(mockData?.galleryArtworks || (() => null)),
    newsLoader: createLoader<any>(mockData?.news || (() => null)),
  };
}

/**
 * Create mock database for testing
 */
export function createMockDb() {
  return {
    query: {
      users: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      members: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      membershipTiers: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      artists: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      artworks: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      exhibitions: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      events: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      eventParticipants: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      galleries: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      news: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    })),
    update: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    })),
    delete: jest.fn(() => ({
      where: jest.fn().mockResolvedValue(undefined),
    })),
  } as any;
}

/**
 * Create a mock GraphQL context for testing
 */
export function createMockContext(options?: {
  user?: User | null;
  mockData?: any;
  db?: any;
}): GraphQLContext {
  const { user = null, mockData, db = createMockDb() } = options || {};

  return {
    db,
    user,
    userId: user?.id || null,
    loaders: createMockDataLoaders(mockData),
    request: {
      ip: '127.0.0.1',
      userAgent: 'test-agent',
    },
  };
}

/**
 * Create an authenticated mock context with a regular user
 */
export function createAuthContext(user?: Partial<User>): GraphQLContext {
  return createMockContext({
    user: createMockUser(user),
  });
}

/**
 * Create an authenticated mock context with an admin user
 */
export function createAdminContext(user?: Partial<User>): GraphQLContext {
  return createMockContext({
    user: createMockAdmin(user),
  });
}

/**
 * Create mock member data
 */
export function createMockMember(overrides?: any) {
  return {
    id: 'member-1',
    userId: 'user-1',
    membershipNumber: 'ASCA-2024-001',
    tierLevel: 1,
    status: 'active',
    joinDate: new Date('2024-01-01'),
    fullName: 'Test Member',
    fullNameKo: '테스트 회원',
    fullNameEn: 'Test Member',
    nationality: 'KR',
    country: 'South Korea',
    participationScore: 0,
    contributionScore: 0,
    profileCompleteness: 50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock artist data
 */
export function createMockArtist(overrides?: any) {
  return {
    id: 'artist-1',
    userId: 'user-1',
    name: 'Test Artist',
    nameKo: '테스트 작가',
    nameEn: 'Test Artist',
    bio: 'Test artist bio',
    nationality: 'KR',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock artwork data
 */
export function createMockArtwork(overrides?: any) {
  return {
    id: 'artwork-1',
    artistId: 'artist-1',
    title: 'Test Artwork',
    titleKo: '테스트 작품',
    titleEn: 'Test Artwork',
    category: 'calligraphy',
    isFeatured: false,
    isForSale: false,
    currency: 'USD',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock exhibition data
 */
export function createMockExhibition(overrides?: any) {
  return {
    id: 'exhibition-1',
    title: 'Test Exhibition',
    titleKo: '테스트 전시',
    titleEn: 'Test Exhibition',
    type: 'group',
    status: 'upcoming',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-07-01'),
    isFeatured: false,
    currency: 'USD',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock event data
 */
export function createMockEvent(overrides?: any) {
  return {
    id: 'event-1',
    title: 'Test Event',
    titleKo: '테스트 이벤트',
    titleEn: 'Test Event',
    type: 'workshop',
    status: 'upcoming',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-02'),
    currentParticipants: 0,
    isFeatured: false,
    currency: 'USD',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Helper to expect authentication error
 */
export function expectAuthError(fn: () => Promise<any>) {
  return expect(fn()).rejects.toThrow('Authentication required');
}

/**
 * Helper to expect authorization error
 */
export function expectAuthzError(fn: () => Promise<any>) {
  return expect(fn()).rejects.toThrow(/Not authorized|Requires .* role/);
}
