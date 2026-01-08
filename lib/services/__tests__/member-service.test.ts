/**
 * Member Service Unit Tests
 *
 * 순수 비즈니스 로직 테스트
 * - Next.js 의존성 없음
 * - 간단한 mocking
 * - 100% 테스트 가능
 *
 * @jest-environment node
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { MemberService } from '../member-service';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('MemberService', () => {
  let memberService: MemberService;
  let mockSupabase: any;

  beforeEach(() => {
    memberService = new MemberService();

    // Setup mock Supabase client with chainable methods
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      // Make it thenable (Promise-like) so it can be awaited
      then(resolve: Function, reject?: Function) {
        return Promise.resolve(this).then(resolve, reject);
      },
      catch(reject: Function) {
        return Promise.resolve(this).catch(reject);
      },
    } as unknown as SupabaseClient;
  });

  describe('getMembers', () => {
    test('should return error when userId is null (unauthorized)', async () => {
      // Arrange
      const searchParams = new URLSearchParams();

      // Act
      const result = await memberService.getMembers({
        supabase: mockSupabase,
        userId: null,
        searchParams,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('should return members list when authenticated', async () => {
      // Arrange
      const searchParams = new URLSearchParams();
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

      // Mock the Supabase query chain to return data
      Object.assign(mockSupabase, {
        data: mockMembers,
        error: null,
        count: 2,
      });

      // Act
      const result = await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.members).toBeInstanceOf(Array);
      expect(result.data?.members).toHaveLength(2);
      expect(result.data?.pagination).toBeDefined();
      expect(result.data?.pagination.page).toBe(1);
      expect(result.data?.pagination.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('members');
    });

    test('should apply search query parameter', async () => {
      // Arrange
      const searchParams = new URLSearchParams({ query: '철수' });
      Object.assign(mockSupabase, {
        data: [],
        error: null,
        count: 0,
      });

      // Act
      await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(mockSupabase.or).toHaveBeenCalled();
    });

    test('should apply status filter', async () => {
      // Arrange
      const searchParams = new URLSearchParams({ status: 'active' });
      Object.assign(mockSupabase, {
        data: [],
        error: null,
        count: 0,
      });

      // Act
      await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(mockSupabase.eq).toHaveBeenCalledWith('membership_status', 'active');
    });

    test('should apply pagination', async () => {
      // Arrange
      const searchParams = new URLSearchParams({ page: '2', limit: '20' });
      Object.assign(mockSupabase, {
        data: [],
        error: null,
        count: 100,
      });

      // Act
      const result = await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(mockSupabase.range).toHaveBeenCalledWith(20, 39);
      expect(result.data?.pagination.page).toBe(2);
      expect(result.data?.pagination.limit).toBe(20);
      expect(result.data?.pagination.total).toBe(100);
      expect(result.data?.pagination.totalPages).toBe(5);
    });

    test('should apply sorting', async () => {
      // Arrange
      const searchParams = new URLSearchParams({ sortBy: 'email', sortOrder: 'asc' });
      Object.assign(mockSupabase, {
        data: [],
        error: null,
        count: 0,
      });

      // Act
      await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(mockSupabase.order).toHaveBeenCalledWith('email', { ascending: true });
    });

    test('should return dummy data in dev mode when no members', async () => {
      // Arrange
      const searchParams = new URLSearchParams();
      Object.assign(mockSupabase, {
        data: [],
        error: null,
        count: 0,
      });

      // Act
      const result = await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'dev-user',
        searchParams,
        isDev: true,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.members).toBeInstanceOf(Array);
      expect(result.data?.members.length).toBeGreaterThan(0);
      expect(result.data?.members[0].id).toBe('dev-1');
    });

    test('should return error on database error', async () => {
      // Arrange
      const searchParams = new URLSearchParams();
      Object.assign(mockSupabase, {
        data: null,
        error: { message: 'Database error' },
        count: 0,
      });

      // Act
      const result = await memberService.getMembers({
        supabase: mockSupabase,
        userId: 'user-1',
        searchParams,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('회원 조회 실패');
    });
  });

  describe('createMember', () => {
    test('should return error when userId is null (unauthorized)', async () => {
      // Arrange
      const data = {
        email: 'newmember@example.com',
        first_name_ko: '신규',
        last_name_ko: '회원',
      };

      // Act
      const result = await memberService.createMember({
        supabase: mockSupabase,
        userId: null,
        data,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('should create member with valid data', async () => {
      // Arrange
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

      Object.assign(mockSupabase, {
        data: createdMember,
        error: null,
      });

      // Act
      const result = await memberService.createMember({
        supabase: mockSupabase,
        userId: 'user-1',
        data: newMemberData,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    test('should return error when email is missing', async () => {
      // Arrange
      const data = {
        first_name_ko: '신규',
        last_name_ko: '회원',
      } as any;

      // Act
      const result = await memberService.createMember({
        supabase: mockSupabase,
        userId: 'user-1',
        data,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('이메일은 필수입니다');
    });

    test('should apply default values', async () => {
      // Arrange
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

      Object.assign(mockSupabase, {
        data: { id: 'new-id', ...insertedData },
        error: null,
      });

      // Act
      await memberService.createMember({
        supabase: mockSupabase,
        userId: 'user-1',
        data: newMemberData,
      });

      // Assert
      expect(mockSupabase.insert).toHaveBeenCalled();
      const insertCall = (mockSupabase.insert as jest.Mock).mock.calls[0][0];
      expect(insertCall.timezone).toBe('Asia/Seoul');
      expect(insertCall.preferred_language).toBe('ko');
      expect(insertCall.membership_status).toBe('active');
    });

    test('should return error on database error', async () => {
      // Arrange
      const data = {
        email: 'test@example.com',
        first_name_ko: '테스트',
        last_name_ko: '회원',
      };

      Object.assign(mockSupabase, {
        data: null,
        error: { message: 'Database error' },
      });

      // Act
      const result = await memberService.createMember({
        supabase: mockSupabase,
        userId: 'user-1',
        data,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('회원 생성 실패');
    });
  });
});
