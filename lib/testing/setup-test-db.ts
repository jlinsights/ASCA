/**
 * Test Database Setup Utilities
 *
 * Provides utilities for setting up and tearing down test databases
 * Uses pg-mem for in-memory PostgreSQL testing
 */

import { DataType, IMemoryDb, newDb } from 'pg-mem'
import { Pool } from 'pg'

/**
 * Global test database instance
 */
let testDb: IMemoryDb | null = null
let testPool: Pool | null = null

/**
 * Initialize test database with schema
 */
export async function setupTestDatabase(): Promise<Pool> {
  // Create in-memory database
  testDb = newDb({
    autoCreateForeignKeyIndices: true,
  })

  // Register custom types if needed
  testDb.registerExtension('uuid-ossp', schema => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: () => crypto.randomUUID(),
      impure: true,
    })
  })

  // Create schema
  await testDb.public.none(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Membership Levels
    CREATE TABLE IF NOT EXISTS membership_levels (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name_ko VARCHAR(100) NOT NULL,
      name_en VARCHAR(100) NOT NULL,
      description_ko TEXT,
      description_en TEXT,
      annual_fee DECIMAL NOT NULL DEFAULT 0,
      benefits JSONB,
      max_artworks INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Members
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name_ko VARCHAR(100) NOT NULL,
      last_name_ko VARCHAR(100) NOT NULL,
      first_name_en VARCHAR(100),
      last_name_en VARCHAR(100),
      phone VARCHAR(20),
      birth_date DATE,
      membership_level_id UUID REFERENCES membership_levels(id),
      status VARCHAR(20) DEFAULT 'pending',
      joined_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Artists
    CREATE TABLE IF NOT EXISTS artists (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      member_id UUID REFERENCES members(id) ON DELETE CASCADE,
      artist_name_ko VARCHAR(200) NOT NULL,
      artist_name_en VARCHAR(200),
      bio_ko TEXT,
      bio_en TEXT,
      specialization VARCHAR(100),
      website VARCHAR(255),
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Artworks
    CREATE TABLE IF NOT EXISTS artworks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      title_ko VARCHAR(255) NOT NULL,
      title_en VARCHAR(255),
      description_ko TEXT,
      description_en TEXT,
      year INTEGER,
      medium VARCHAR(100),
      dimensions VARCHAR(100),
      price DECIMAL,
      status VARCHAR(20) DEFAULT 'draft',
      image_url VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Exhibitions
    CREATE TABLE IF NOT EXISTS exhibitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title_ko VARCHAR(255) NOT NULL,
      title_en VARCHAR(255),
      description_ko TEXT,
      description_en TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      venue VARCHAR(255),
      status VARCHAR(20) DEFAULT 'planned',
      featured_image VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_members_email ON members(email);
    CREATE INDEX idx_members_status ON members(status);
    CREATE INDEX idx_members_level ON members(membership_level_id);
    CREATE INDEX idx_artists_member ON artists(member_id);
    CREATE INDEX idx_artworks_artist ON artworks(artist_id);
    CREATE INDEX idx_artworks_status ON artworks(status);
  `)

  // Get pg-compatible pool — store actual instance, not the constructor
  const PgPool = testDb.adapters.createPg().Pool
  testPool = new (PgPool as any)() as Pool

  return testPool
}

/**
 * Clean up test database
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testPool) {
    await testPool.end()
    testPool = null
  }
  testDb = null
}

/**
 * Reset database (clear all data but keep schema)
 */
export async function resetTestDatabase(): Promise<void> {
  if (!testDb) {
    throw new Error('Test database not initialized')
  }

  await testDb.public.none(`
    TRUNCATE TABLE artworks CASCADE;
    TRUNCATE TABLE artists CASCADE;
    TRUNCATE TABLE exhibitions CASCADE;
    TRUNCATE TABLE members CASCADE;
    TRUNCATE TABLE membership_levels CASCADE;
  `)
}

/**
 * Seed database with test data
 */
export async function seedTestData(): Promise<void> {
  if (!testDb) {
    throw new Error('Test database not initialized')
  }

  // Seed membership levels
  await testDb.public.none(`
    INSERT INTO membership_levels (id, name_ko, name_en, annual_fee, max_artworks)
    VALUES
      ('00000000-0000-0000-0000-000000000001', '일반 회원', 'General', 100000, 5),
      ('00000000-0000-0000-0000-000000000002', 'VIP 회원', 'VIP', 500000, 20),
      ('00000000-0000-0000-0000-000000000003', 'VVIP 회원', 'VVIP', 1000000, 100);
  `)

  // Seed test members
  await testDb.public.none(`
    INSERT INTO members (id, email, first_name_ko, last_name_ko, membership_level_id, status)
    VALUES
      ('00000000-0000-0000-0000-000000000101', 'test1@example.com', '철수', '김', '00000000-0000-0000-0000-000000000001', 'active'),
      ('00000000-0000-0000-0000-000000000102', 'test2@example.com', '영희', '이', '00000000-0000-0000-0000-000000000002', 'active'),
      ('00000000-0000-0000-0000-000000000103', 'pending@example.com', '민수', '박', '00000000-0000-0000-0000-000000000001', 'pending');
  `)

  // Seed test artists
  await testDb.public.none(`
    INSERT INTO artists (id, member_id, artist_name_ko, verified)
    VALUES
      ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '김철수 작가', true),
      ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '이영희 작가', true);
  `)
}

/**
 * Get test pool instance
 */
export function getTestPool(): Pool {
  if (!testPool) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.')
  }
  return testPool
}

/**
 * Execute raw SQL query (for testing)
 */
export async function executeQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
  if (!testDb) {
    throw new Error('Test database not initialized')
  }
  return (testDb.public as any).many(sql, params)
}

/**
 * Setup and teardown helpers for Jest
 */
export const testDatabaseHelpers = {
  /**
   * beforeAll hook
   */
  async beforeAll(): Promise<void> {
    await setupTestDatabase()
    await seedTestData()
  },

  /**
   * afterEach hook
   */
  async afterEach(): Promise<void> {
    await resetTestDatabase()
    await seedTestData()
  },

  /**
   * afterAll hook
   */
  async afterAll(): Promise<void> {
    await teardownTestDatabase()
  },
}
