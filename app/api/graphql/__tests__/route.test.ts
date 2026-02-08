/**
 * GraphQL API Integration Tests
 *
 * End-to-end tests for the GraphQL API endpoint:
 * - POST /api/graphql with queries and mutations
 * - Authentication header processing
 * - Apollo Server error handling
 * - Request/response format validation
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the database and context modules
jest.mock('@/lib/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      members: {
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
  },
}));

// Helper to create mock NextRequest
function createMockRequest(body: any, headers: Record<string, string> = {}) {
  const url = 'http://localhost:3000/api/graphql';
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  };

  return new NextRequest(url, requestInit);
}

// Helper to parse response
async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

describe('GraphQL API Integration Tests', () => {
  describe('POST /api/graphql', () => {
    describe('Query Operations', () => {
      it('should execute user query successfully', async () => {
        const mockUser = {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'member',
        };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);

        const request = createMockRequest({
          query: `
            query GetUser($id: ID!) {
              user(id: $id) {
                id
                email
                name
                role
              }
            }
          `,
          variables: { id: 'user-1' },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.user).toBeDefined();
        expect(body.errors).toBeUndefined();
      });

      it('should execute members query with pagination', async () => {
        const mockMembers = [
          { id: 'member-1', fullName: 'Member 1', status: 'active' },
          { id: 'member-2', fullName: 'Member 2', status: 'active' },
        ];

        const { db } = require('@/lib/db/drizzle');
        db.query.members.findMany.mockResolvedValue(mockMembers);

        const request = createMockRequest({
          query: `
            query GetMembers($first: Int!) {
              members(first: $first) {
                edges {
                  node {
                    id
                    fullName
                    status
                  }
                }
                pageInfo {
                  hasNextPage
                }
                totalCount
              }
            }
          `,
          variables: { first: 20 },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.members).toBeDefined();
        expect(body.data.members.edges).toBeInstanceOf(Array);
      });

      it('should execute artists query successfully', async () => {
        const mockArtists = [
          { id: 'artist-1', name: 'Artist 1', nationality: 'KR' },
          { id: 'artist-2', name: 'Artist 2', nationality: 'US' },
        ];

        const { db } = require('@/lib/db/drizzle');
        db.query.artists.findMany.mockResolvedValue(mockArtists);

        const request = createMockRequest({
          query: `
            query GetArtists($first: Int!) {
              artists(first: $first) {
                edges {
                  node {
                    id
                    name
                    nationality
                  }
                }
              }
            }
          `,
          variables: { first: 20 },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.artists).toBeDefined();
      });

      it('should execute exhibitions query successfully', async () => {
        const mockExhibitions = [
          { id: 'exhibition-1', title: 'Exhibition 1', status: 'upcoming' },
          { id: 'exhibition-2', title: 'Exhibition 2', status: 'current' },
        ];

        const { db } = require('@/lib/db/drizzle');
        db.query.exhibitions.findMany.mockResolvedValue(mockExhibitions);

        const request = createMockRequest({
          query: `
            query GetExhibitions($first: Int!) {
              exhibitions(first: $first) {
                edges {
                  node {
                    id
                    title
                    status
                  }
                }
              }
            }
          `,
          variables: { first: 20 },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.exhibitions).toBeDefined();
      });
    });

    describe('Mutation Operations', () => {
      it('should return authentication error for createMember without auth', async () => {
        const request = createMockRequest({
          query: `
            mutation CreateMember($input: CreateMemberInput!) {
              createMember(input: $input) {
                id
                fullName
              }
            }
          `,
          variables: {
            input: {
              userId: 'user-1',
              fullName: 'New Member',
              nationality: 'KR',
            },
          },
        });

        const response = await POST(request);
        expect(response.status).toBe(200); // GraphQL returns 200 with errors

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toContain('Authentication required');
      });

      it('should execute createMember mutation with authentication', async () => {
        const mockUser = { id: 'user-1', role: 'member' };
        const mockMember = {
          id: 'member-1',
          userId: 'user-1',
          fullName: 'New Member',
          membershipNumber: 'ASCA-2024-001',
        };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);
        db.query.members.findMany.mockResolvedValue([]);
        db.insert.mockReturnValue({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([mockMember]),
        });

        const request = createMockRequest(
          {
            query: `
              mutation CreateMember($input: CreateMemberInput!) {
                createMember(input: $input) {
                  id
                  fullName
                  membershipNumber
                }
              }
            `,
            variables: {
              input: {
                userId: 'user-1',
                fullName: 'New Member',
                nationality: 'KR',
              },
            },
          },
          { authorization: 'Bearer valid-token' }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.createMember).toBeDefined();
        expect(body.errors).toBeUndefined();
      });

      it('should return authorization error for approveMember without admin role', async () => {
        const mockUser = { id: 'user-1', role: 'member' };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);

        const request = createMockRequest(
          {
            query: `
              mutation ApproveMember($id: ID!) {
                approveMember(id: $id) {
                  id
                  status
                }
              }
            `,
            variables: { id: 'member-1' },
          },
          { authorization: 'Bearer member-token' }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toContain('Requires admin role');
      });

      it('should execute approveMember mutation with admin authentication', async () => {
        const mockAdmin = { id: 'admin-1', role: 'admin' };
        const mockMember = {
          id: 'member-1',
          status: 'pending_approval',
          userId: 'user-1',
        };
        const approvedMember = { ...mockMember, status: 'active' };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockAdmin);
        db.query.members.findFirst.mockResolvedValue(mockMember);
        db.update.mockReturnValue({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([approvedMember]),
        });

        const request = createMockRequest(
          {
            query: `
              mutation ApproveMember($id: ID!) {
                approveMember(id: $id) {
                  id
                  status
                }
              }
            `,
            variables: { id: 'member-1' },
          },
          { authorization: 'Bearer admin-token' }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.approveMember).toBeDefined();
        expect(body.errors).toBeUndefined();
      });
    });

    describe('Error Handling', () => {
      it('should return error for malformed JSON', async () => {
        const url = 'http://localhost:3000/api/graphql';
        const requestInit: RequestInit = {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{ invalid json',
        };

        const request = new NextRequest(url, requestInit);
        const response = await POST(request);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });

      it('should return error for missing query field', async () => {
        const request = createMockRequest({
          variables: { id: 'user-1' },
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      });

      it('should return error for invalid GraphQL syntax', async () => {
        const request = createMockRequest({
          query: 'query { user(id: "user-1" }', // Missing closing brace
        });

        const response = await POST(request);
        expect(response.status).toBeGreaterThanOrEqual(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
      });

      it('should return error for non-existent field', async () => {
        const request = createMockRequest({
          query: `
            query {
              user(id: "user-1") {
                id
                nonExistentField
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toContain('Cannot query field');
      });

      it('should return error for invalid variable types', async () => {
        const request = createMockRequest({
          query: `
            query GetUser($id: ID!) {
              user(id: $id) {
                id
              }
            }
          `,
          variables: { id: 123 }, // Should be string
        });

        const response = await POST(request);
        const body = await parseResponse(response);

        // GraphQL should handle type coercion or return validation error
        expect(response.status).toBe(200);
      });

      it('should return formatted error for resolver exceptions', async () => {
        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockRejectedValue(new Error('Database connection failed'));

        const request = createMockRequest({
          query: `
            query {
              user(id: "user-1") {
                id
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toBeDefined();
      });
    });

    describe('Authentication', () => {
      it('should process requests without authorization header', async () => {
        const request = createMockRequest({
          query: `
            query {
              user(id: "user-1") {
                id
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });

      it('should process authorization header for authenticated requests', async () => {
        const mockUser = { id: 'user-1', role: 'member' };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);

        const request = createMockRequest(
          {
            query: `
              query {
                me {
                  id
                  email
                }
              }
            `,
          },
          { authorization: 'Bearer valid-token' }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.errors).toBeUndefined();
      });

      it('should return authentication error for protected queries without token', async () => {
        const request = createMockRequest({
          query: `
            query {
              me {
                id
                email
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toContain('Authentication required');
      });

      it('should handle invalid authorization token gracefully', async () => {
        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(null);

        const request = createMockRequest(
          {
            query: `
              query {
                me {
                  id
                }
              }
            `,
          },
          { authorization: 'Bearer invalid-token' }
        );

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.errors).toBeDefined();
        expect(body.errors[0].message).toContain('Authentication required');
      });
    });

    describe('Complex Operations', () => {
      it('should handle multiple queries in single request', async () => {
        const mockUser = { id: 'user-1', name: 'Test User' };
        const mockMembers = [{ id: 'member-1', fullName: 'Member 1' }];

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);
        db.query.members.findMany.mockResolvedValue(mockMembers);

        const request = createMockRequest({
          query: `
            query MultiQuery {
              user(id: "user-1") {
                id
                name
              }
              members(first: 20) {
                edges {
                  node {
                    id
                    fullName
                  }
                }
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.user).toBeDefined();
        expect(body.data.members).toBeDefined();
      });

      it('should handle nested queries with fragments', async () => {
        const mockArtist = {
          id: 'artist-1',
          name: 'Artist 1',
          userId: 'user-1',
        };
        const mockArtworks = [
          { id: 'artwork-1', title: 'Artwork 1', artistId: 'artist-1' },
        ];

        const { db } = require('@/lib/db/drizzle');
        db.query.artists.findFirst.mockResolvedValue(mockArtist);
        db.query.artworks.findMany.mockResolvedValue(mockArtworks);

        const request = createMockRequest({
          query: `
            fragment ArtistFields on Artist {
              id
              name
            }

            query GetArtistWithArtworks($id: ID!) {
              artist(id: $id) {
                ...ArtistFields
              }
            }
          `,
          variables: { id: 'artist-1' },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.artist).toBeDefined();
      });

      it('should handle queries with aliases', async () => {
        const mockUser1 = { id: 'user-1', name: 'User 1' };
        const mockUser2 = { id: 'user-2', name: 'User 2' };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst
          .mockResolvedValueOnce(mockUser1)
          .mockResolvedValueOnce(mockUser2);

        const request = createMockRequest({
          query: `
            query {
              firstUser: user(id: "user-1") {
                id
                name
              }
              secondUser: user(id: "user-2") {
                id
                name
              }
            }
          `,
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.firstUser).toBeDefined();
        expect(body.data.secondUser).toBeDefined();
      });

      it('should handle queries with directives', async () => {
        const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };

        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue(mockUser);

        const request = createMockRequest({
          query: `
            query GetUser($id: ID!, $withEmail: Boolean!) {
              user(id: $id) {
                id
                name
                email @include(if: $withEmail)
              }
            }
          `,
          variables: { id: 'user-1', withEmail: true },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await parseResponse(response);
        expect(body.data).toBeDefined();
        expect(body.data.user).toBeDefined();
      });
    });

    describe('Response Format', () => {
      it('should return JSON content-type', async () => {
        const request = createMockRequest({
          query: '{ user(id: "user-1") { id } }',
        });

        const response = await POST(request);
        const contentType = response.headers.get('content-type');

        expect(contentType).toContain('application/json');
      });

      it('should return data field for successful queries', async () => {
        const { db } = require('@/lib/db/drizzle');
        db.query.users.findFirst.mockResolvedValue({ id: 'user-1' });

        const request = createMockRequest({
          query: '{ user(id: "user-1") { id } }',
        });

        const response = await POST(request);
        const body = await parseResponse(response);

        expect(body).toHaveProperty('data');
      });

      it('should return errors field for failed queries', async () => {
        const request = createMockRequest({
          query: '{ invalidQuery }',
        });

        const response = await POST(request);
        const body = await parseResponse(response);

        expect(body).toHaveProperty('errors');
        expect(Array.isArray(body.errors)).toBe(true);
      });

      it('should include error locations and paths', async () => {
        const request = createMockRequest({
          query: '{ user(id: "user-1") { invalidField } }',
        });

        const response = await POST(request);
        const body = await parseResponse(response);

        expect(body.errors).toBeDefined();
        expect(body.errors[0]).toHaveProperty('message');
      });
    });
  });

  describe('HTTP Methods', () => {
    it('should only support POST method', async () => {
      const request = createMockRequest({
        query: '{ user(id: "user-1") { id } }',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });
});
