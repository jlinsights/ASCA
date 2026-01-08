/**
 * Members API Integration Tests
 *
 * Tests for /api/members endpoints
 *
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { Mock } from 'jest-mock';

// Mock logger module
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Import modules
import { supabaseServer } from '@/lib/supabase/server';
import { devAuth } from '@/lib/auth/dev-auth';

// Use jest.spyOn() to create spies on the methods
const mockCreateClient = jest.spyOn(supabaseServer, 'createClient' as any).mockResolvedValue({} as any);
const mockIsAuthenticated = jest.spyOn(devAuth, 'isAuthenticated' as any).mockResolvedValue(false);
const mockGetCurrentUser = jest.spyOn(devAuth, 'getCurrentUser' as any).mockResolvedValue(null);
jest.spyOn(devAuth, 'signIn' as any).mockResolvedValue(undefined as any);
jest.spyOn(devAuth, 'signOut' as any).mockResolvedValue(undefined);
jest.spyOn(devAuth, 'isAdmin' as any).mockResolvedValue(false);
jest.spyOn(devAuth, 'isMember' as any).mockResolvedValue(false);

// Import route AFTER mocks are set up
import { GET, POST } from '../route';

describe('GET /api/members', () => {
  let mockSupabase: any;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Set NODE_ENV to development for dev auth to work
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Setup mock Supabase client with Promise-like behavior
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      // Make it thenable (Promise-like) so it can be awaited
      then(resolve: Function, reject?: Function) {
        return Promise.resolve(this).then(resolve, reject);
      },
      catch(reject: Function) {
        return Promise.resolve(this).catch(reject);
      },
    };

    // Setup createClient mock to return mockSupabase
    mockCreateClient.mockImplementation(async () => mockSupabase);

    // Reset devAuth mocks to default (unauthenticated)
    mockIsAuthenticated.mockImplementation(async () => false);
    mockGetCurrentUser.mockImplementation(async () => null);
  });

  afterEach(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

test('should return 401 when not authenticated', async () => {
    // Arrange - devAuth already set to unauthenticated in beforeEach
    const request = new NextRequest('http://localhost:3000/api/members');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

test('should return members list when authenticated', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    const mockMembers = [
      {
        id: 'member-1',
        email: 'test1@example.com',
        first_name_ko: '철수',
        last_name_ko: '김',
        membership_status: 'active',
        membership_level_id: 'level-1',
      },
      {
        id: 'member-2',
        email: 'test2@example.com',
        first_name_ko: '영희',
        last_name_ko: '이',
        membership_status: 'active',
        membership_level_id: 'level-2',
      },
    ];

    // Mock the Supabase query chain to return data directly
    Object.assign(mockSupabase, {
      data: mockMembers,
      error: null,
      count: 2,
    });

    const request = new NextRequest('http://localhost:3000/api/members');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.members).toBeInstanceOf(Array);
    expect(mockSupabase.from).toHaveBeenCalledWith('members');
  });

  test('should apply search query parameter', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase, {
      data: [],
      error: null,
      count: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/members?query=철수');

    // Act
    const response = await GET(request);

    // Assert
    expect(mockSupabase.or).toHaveBeenCalled();
  });

  test('should apply status filter', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase, {
      data: [],
      error: null,
      count: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/members?status=active');

    // Act
    const response = await GET(request);

    // Assert
    expect(mockSupabase.eq).toHaveBeenCalledWith('membership_status', 'active');
  });

  test('should apply pagination', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase, {
      data: [],
      error: null,
      count: 100,
    });

    const request = new NextRequest('http://localhost:3000/api/members?page=2&limit=20');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(mockSupabase.range).toHaveBeenCalledWith(20, 39); // (page-1)*limit to page*limit-1
    expect(data.data.pagination.page).toBe(2);
    expect(data.data.pagination.limit).toBe(20);
  });

  test('should apply sorting', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase, {
      data: [],
      error: null,
      count: 0,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/members?sortBy=email&sortOrder=asc'
    );

    // Act
    const response = await GET(request);

    // Assert
    expect(mockSupabase.order).toHaveBeenCalledWith('email', { ascending: true });
  });

  test('should return dummy data in dev mode when no members', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'dev-user' }));

    Object.assign(mockSupabase, {
      data: [],
      error: null,
      count: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/members');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.members).toBeInstanceOf(Array);
    // In dev mode with no data, should return dummy data
    expect(data.data.members.length).toBeGreaterThan(0);
  });

  test('should return 500 on database error', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase, {
      data: null,
      error: { message: 'Database error' },
      count: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/members');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('회원 조회 실패');
  });
});

describe('POST /api/members', () => {
  let mockSupabase: any;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Set NODE_ENV to development for dev auth to work
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Setup mock Supabase client with Promise-like behavior
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      // Make it thenable (Promise-like) so it can be awaited
      then(resolve: Function, reject?: Function) {
        return Promise.resolve(this).then(resolve, reject);
      },
      catch(reject: Function) {
        return Promise.resolve(this).catch(reject);
      },
    };

    // Setup createClient mock to return mockSupabase
    mockCreateClient.mockImplementation(async () => mockSupabase);

    // Reset devAuth mocks to default (unauthenticated)
    mockIsAuthenticated.mockImplementation(async () => false);
    mockGetCurrentUser.mockImplementation(async () => null);
  });

  afterEach(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('should return 401 when not authenticated', async () => {
    // Arrange - devAuth already set to unauthenticated in beforeEach
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newmember@example.com',
        first_name_ko: '신규',
        last_name_ko: '회원',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  test('should create member with valid data', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    const newMemberData = {
      email: 'newmember@example.com',
      first_name_ko: '신규',
      last_name_ko: '회원',
      membership_level_id: 'level-1',
    };

    const createdMember = {
      id: 'new-member-id',
      ...newMemberData,
      membership_status: 'active',
      timezone: 'Asia/Seoul',
      preferred_language: 'ko',
      created_at: new Date().toISOString(),
    };

    Object.assign(mockSupabase.single(), {
      data: createdMember,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(newMemberData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(mockSupabase.from).toHaveBeenCalledWith('members');
    expect(mockSupabase.insert).toHaveBeenCalled();
  });

  test('should return 400 when email is missing', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify({
        first_name_ko: '신규',
        last_name_ko: '회원',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('이메일은 필수입니다');
  });

  test('should apply default values', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    const newMemberData = {
      email: 'newmember@example.com',
      first_name_ko: '신규',
      last_name_ko: '회원',
    };

    let insertedData: any;
    mockSupabase.insert = jest.fn((data) => {
      insertedData = data;
      return mockSupabase;
    });

    Object.assign(mockSupabase.single(), {
      data: { id: 'new-id', ...insertedData },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(newMemberData),
    });

    // Act
    await POST(request);

    // Assert
    expect(mockSupabase.insert).toHaveBeenCalled();
    const insertCall = (mockSupabase.insert as jest.Mock).mock.calls[0][0];
    expect(insertCall.timezone).toBe('Asia/Seoul'); // default
    expect(insertCall.preferred_language).toBe('ko'); // default
    expect(insertCall.membership_status).toBe('active'); // default
  });

  test('should return 500 on database error', async () => {
    // Arrange
    mockIsAuthenticated.mockImplementation(async () => true);
    mockGetCurrentUser.mockImplementation(async () => ({ id: 'user-1' }));

    Object.assign(mockSupabase.single(), {
      data: null,
      error: { message: 'Database error' },
    });

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        first_name_ko: '테스트',
        last_name_ko: '회원',
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('회원 생성 실패');
  });
});
