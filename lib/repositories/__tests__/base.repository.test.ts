/**
 * Base Repository Tests
 *
 * Tests for generic CRUD operations and pagination
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { BaseRepository } from '../base.repository';
import { testDatabaseHelpers, getTestPool } from '@/lib/testing/setup-test-db';
import { members } from '@/lib/db/schema-pg';
import { eq } from 'drizzle-orm';

// Create a test repository using members table
class TestRepository extends BaseRepository<typeof members> {
  constructor() {
    super(members);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;

  beforeAll(async () => {
    await testDatabaseHelpers.beforeAll();
    repository = new TestRepository();
  });

  afterEach(async () => {
    await testDatabaseHelpers.afterEach();
  });

  afterAll(async () => {
    await testDatabaseHelpers.afterAll();
  });

  describe('findById', () => {
    test('should find record by ID', async () => {
      // Arrange
      const testId = '00000000-0000-0000-0000-000000000101';

      // Act
      const result = await repository.findById(testId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(testId);
      expect(result?.email).toBe('test1@example.com');
    });

    test('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      // Act
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    test('should find all records', async () => {
      // Act
      const results = await repository.findAll();

      // Assert
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should apply where clause', async () => {
      // Arrange
      const whereClause = eq(members.membership_status, 'active');

      // Act
      const results = await repository.findAll({
        where: whereClause,
      });

      // Assert
      expect(results).toBeInstanceOf(Array);
      results.forEach((member) => {
        expect(member.membership_status).toBe('active');
      });
    });

    test('should apply limit', async () => {
      // Act
      const results = await repository.findAll({ limit: 1 });

      // Assert
      expect(results).toHaveLength(1);
    });

    test('should apply offset', async () => {
      // Arrange
      const allResults = await repository.findAll();
      const firstRecord = allResults[0];

      // Act
      const offsetResults = await repository.findAll({ offset: 1 });

      // Assert
      expect(offsetResults).toBeInstanceOf(Array);
      expect(offsetResults[0]?.id).not.toBe(firstRecord.id);
    });

    test('should apply order by', async () => {
      // Arrange
      const { desc } = await import('drizzle-orm');

      // Act
      const results = await repository.findAll({
        orderBy: desc(members.created_at),
      });

      // Assert
      expect(results).toBeInstanceOf(Array);
      // Most recent should be first
      for (let i = 0; i < results.length - 1; i++) {
        const current = new Date(results[i].created_at!).getTime();
        const next = new Date(results[i + 1].created_at!).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('findWithPagination', () => {
    test('should paginate results', async () => {
      // Act
      const result = await repository.findWithPagination({
        page: 1,
        limit: 2,
      });

      // Assert
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.hasMore).toBeDefined();
      expect(result.hasPrevious).toBe(false);
    });

    test('should calculate hasMore correctly', async () => {
      // Act
      const result = await repository.findWithPagination({
        page: 1,
        limit: 1,
      });

      // Assert
      if (result.total > 1) {
        expect(result.hasMore).toBe(true);
      } else {
        expect(result.hasMore).toBe(false);
      }
    });

    test('should calculate hasPrevious correctly', async () => {
      // Act
      const result = await repository.findWithPagination({
        page: 2,
        limit: 1,
      });

      // Assert
      expect(result.hasPrevious).toBe(true);
    });
  });

  describe('findOne', () => {
    test('should find one record matching criteria', async () => {
      // Arrange
      const whereClause = eq(members.email, 'test1@example.com');

      // Act
      const result = await repository.findOne({ where: whereClause });

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('test1@example.com');
    });

    test('should return null when no match', async () => {
      // Arrange
      const whereClause = eq(members.email, 'nonexistent@example.com');

      // Act
      const result = await repository.findOne({ where: whereClause });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('should create new record', async () => {
      // Arrange
      const newMember = {
        email: 'newmember@example.com',
        first_name_ko: '신규',
        last_name_ko: '회원',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval' as const,
      };

      // Act
      const result = await repository.create(newMember);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('newmember@example.com');
      expect(result.first_name_ko).toBe('신규');
    });
  });

  describe('createMany', () => {
    test('should create multiple records', async () => {
      // Arrange
      const newMembers = [
        {
          email: 'bulk1@example.com',
          first_name_ko: '대량1',
          last_name_ko: '회원',
          membership_level_id: '00000000-0000-0000-0000-000000000001',
          membership_status: 'pending_approval' as const,
        },
        {
          email: 'bulk2@example.com',
          first_name_ko: '대량2',
          last_name_ko: '회원',
          membership_level_id: '00000000-0000-0000-0000-000000000001',
          membership_status: 'pending_approval' as const,
        },
      ];

      // Act
      const results = await repository.createMany(newMembers);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].email).toBe('bulk1@example.com');
      expect(results[1].email).toBe('bulk2@example.com');
    });
  });

  describe('update', () => {
    test('should update record by ID', async () => {
      // Arrange
      const testId = '00000000-0000-0000-0000-000000000101';
      const updateData = {
        first_name_ko: '업데이트',
      };

      // Act
      const result = await repository.update(testId, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result?.first_name_ko).toBe('업데이트');
    });

    test('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      // Act
      const result = await repository.update(nonExistentId, {
        first_name_ko: '테스트',
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateMany', () => {
    test('should update multiple records', async () => {
      // Arrange
      const whereClause = eq(members.membership_status, 'pending_approval');
      const updateData = {
        membership_status: 'active' as const,
      };

      // Act
      const results = await repository.updateMany(whereClause, updateData);

      // Assert
      expect(results).toBeInstanceOf(Array);
      results.forEach((member) => {
        expect(member.membership_status).toBe('active');
      });
    });
  });

  describe('delete', () => {
    test('should delete record by ID', async () => {
      // Arrange
      const newMember = await repository.create({
        email: 'todelete@example.com',
        first_name_ko: '삭제',
        last_name_ko: '테스트',
        membership_level_id: '00000000-0000-0000-0000-000000000001',
        membership_status: 'pending_approval' as const,
      });

      // Act
      const deleted = await repository.delete(newMember.id);

      // Assert
      expect(deleted).toBe(true);

      // Verify deletion
      const found = await repository.findById(newMember.id);
      expect(found).toBeNull();
    });

    test('should return false for non-existent ID', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      // Act
      const result = await repository.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deleteMany', () => {
    test('should delete multiple records', async () => {
      // Arrange
      await repository.createMany([
        {
          email: 'delete1@example.com',
          first_name_ko: '삭제1',
          last_name_ko: '테스트',
          membership_level_id: '00000000-0000-0000-0000-000000000001',
          membership_status: 'pending_approval' as const,
        },
        {
          email: 'delete2@example.com',
          first_name_ko: '삭제2',
          last_name_ko: '테스트',
          membership_level_id: '00000000-0000-0000-0000-000000000001',
          membership_status: 'pending_approval' as const,
        },
      ]);

      const whereClause = eq(members.membership_status, 'pending_approval');

      // Act
      const deletedCount = await repository.deleteMany(whereClause);

      // Assert
      expect(deletedCount).toBeGreaterThan(0);
    });
  });

  describe('exists', () => {
    test('should return true for existing ID', async () => {
      // Arrange
      const testId = '00000000-0000-0000-0000-000000000101';

      // Act
      const result = await repository.exists(testId);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false for non-existent ID', async () => {
      // Arrange
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      // Act
      const result = await repository.exists(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('existsWhere', () => {
    test('should return true when record matches', async () => {
      // Arrange
      const whereClause = eq(members.email, 'test1@example.com');

      // Act
      const result = await repository.existsWhere(whereClause);

      // Assert
      expect(result).toBe(true);
    });

    test('should return false when no match', async () => {
      // Arrange
      const whereClause = eq(members.email, 'nonexistent@example.com');

      // Act
      const result = await repository.existsWhere(whereClause);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    test('should count all records', async () => {
      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBeGreaterThan(0);
    });

    test('should count with where clause', async () => {
      // Arrange
      const whereClause = eq(members.membership_status, 'active');

      // Act
      const count = await repository.count(whereClause);

      // Assert
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('first', () => {
    test('should get first record', async () => {
      // Act
      const result = await repository.first();

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('last', () => {
    test('should get last record', async () => {
      // Act
      const result = await repository.last();

      // Assert
      expect(result).toBeDefined();
    });
  });
});
