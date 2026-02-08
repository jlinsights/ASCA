/**
 * Authentication and Authorization Tests
 *
 * Comprehensive tests for GraphQL authentication and authorization logic:
 * - requireAuth helper
 * - requireAdmin helper
 * - requireRole helper
 * - Context creation with authentication
 * - Authorization patterns across resolvers
 */

import { requireAuth, requireAdmin, requireRole } from '../context';
import {
  createMockContext,
  createAuthContext,
  createAdminContext,
  createMockUser,
  expectAuthError,
  expectAuthzError,
} from '../test-utils';
import { queryResolvers } from '../resolvers/query.resolver';
import { mutationResolvers } from '../resolvers/mutation.resolver';
import type { GraphQLContext } from '../context';

describe('Authentication and Authorization', () => {
  describe('requireAuth', () => {
    it('should pass when user is authenticated', () => {
      const context = createAuthContext();

      expect(() => requireAuth(context)).not.toThrow();
      expect(context.user).toBeDefined();
      expect(context.userId).toBeDefined();
    });

    it('should throw error when user is null', () => {
      const context = createMockContext({ user: null });

      expect(() => requireAuth(context)).toThrow('Authentication required');
    });

    it('should throw error when userId is null', () => {
      const context = createMockContext();

      expect(() => requireAuth(context)).toThrow('Authentication required');
    });

    it('should throw error for anonymous context', () => {
      const context = createMockContext();

      expect(() => requireAuth(context)).toThrow('Authentication required');
    });

    it('should assert user and userId are defined after check', () => {
      const context = createAuthContext();

      requireAuth(context);

      // TypeScript should know user and userId are defined after requireAuth
      const userId: string = context.userId;
      const userName: string = context.user.name!;

      expect(userId).toBeTruthy();
      expect(userName).toBeTruthy();
    });
  });

  describe('requireAdmin', () => {
    it('should pass when user is admin', () => {
      const context = createAdminContext();

      expect(() => requireAdmin(context)).not.toThrow();
      expect(context.user!.role).toBe('admin');
    });

    it('should throw error when user is not admin', () => {
      const context = createAuthContext({ role: 'member' });

      expect(() => requireAdmin(context)).toThrow('Requires admin role');
    });

    it('should throw error when user is artist', () => {
      const context = createAuthContext({ role: 'artist' });

      expect(() => requireAdmin(context)).toThrow('Requires admin role');
    });

    it('should throw error when user is visitor', () => {
      const context = createAuthContext({ role: 'visitor' });

      expect(() => requireAdmin(context)).toThrow('Requires admin role');
    });

    it('should throw error when user is not authenticated', () => {
      const context = createMockContext({ user: null });

      expect(() => requireAdmin(context)).toThrow('Authentication required');
    });
  });

  describe('requireRole', () => {
    it('should pass when user has exact role', () => {
      const context = createAuthContext({ role: 'artist' });

      expect(() => requireRole(context, 'artist')).not.toThrow();
    });

    it('should pass when user has admin role (admin bypass)', () => {
      const context = createAdminContext();

      expect(() => requireRole(context, 'artist')).not.toThrow();
      expect(() => requireRole(context, 'member')).not.toThrow();
      expect(() => requireRole(context, 'visitor')).not.toThrow();
    });

    it('should throw error when user lacks required role', () => {
      const context = createAuthContext({ role: 'visitor' });

      expect(() => requireRole(context, 'member')).toThrow('Requires member role');
    });

    it('should throw error when user is not authenticated', () => {
      const context = createMockContext({ user: null });

      expect(() => requireRole(context, 'member')).toThrow('Authentication required');
    });

    it('should handle multiple role checks', () => {
      const memberContext = createAuthContext({ role: 'member' });
      const artistContext = createAuthContext({ role: 'artist' });
      const adminContext = createAdminContext();

      expect(() => requireRole(memberContext, 'member')).not.toThrow();
      expect(() => requireRole(memberContext, 'artist')).toThrow();

      expect(() => requireRole(artistContext, 'artist')).not.toThrow();
      expect(() => requireRole(artistContext, 'member')).toThrow();

      expect(() => requireRole(adminContext, 'admin')).not.toThrow();
      expect(() => requireRole(adminContext, 'artist')).not.toThrow();
      expect(() => requireRole(adminContext, 'member')).not.toThrow();
    });
  });

  describe('Query Resolver Authorization', () => {
    describe('me query', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() => queryResolvers.me({}, {}, context));
      });

      it('should return authenticated user', async () => {
        const mockUser = createMockUser();
        const context = createAuthContext(mockUser);

        const result = await queryResolvers.me({}, {}, context);

        expect(result).toEqual(context.user);
        expect(result!.id).toBe(mockUser.id);
      });
    });

    describe('memberByUserId query', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() => queryResolvers.memberByUserId({}, { userId: 'user-1' }, context));
      });

      it('should allow authenticated users to query', async () => {
        const context = createAuthContext();
        (context.loaders.memberByUserIdLoader.load as jest.Mock).mockResolvedValue(null);

        const result = await queryResolvers.memberByUserId({}, { userId: 'user-1' }, context);

        expect(result).toBeNull();
        expect(context.loaders.memberByUserIdLoader.load).toHaveBeenCalledWith('user-1');
      });
    });

    describe('searchMembers query', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() => queryResolvers.searchMembers({}, { query: 'test' }, context));
      });

      it('should allow authenticated users to search', async () => {
        const context = createAuthContext();
        context.db.query.members.findMany = jest.fn().mockResolvedValue([]);

        const result = await queryResolvers.searchMembers({}, { query: 'test', first: 20 }, context);

        expect(result.edges).toHaveLength(0);
        expect(context.db.query.members.findMany).toHaveBeenCalled();
      });
    });
  });

  describe('Mutation Resolver Authorization', () => {
    describe('createMember mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();
        const input = { userId: 'user-1', fullName: 'Test User' };

        await expectAuthError(() => mutationResolvers.createMember({}, { input }, context));
      });

      it('should allow authenticated users to create members', async () => {
        const context = createAuthContext();
        const input = { userId: 'user-1', fullName: 'Test User', nationality: 'KR' };

        context.db.query.members.findMany = jest.fn().mockResolvedValue([]);
        context.db.insert = jest.fn(() => ({
          values: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([{
              id: 'member-1',
              ...input,
              membershipNumber: 'ASCA-2024-001',
              status: 'pending_approval',
            }]),
          })),
        }));

        const result = await mutationResolvers.createMember({}, { input }, context);

        expect(result).toBeDefined();
        expect(result.fullName).toBe('Test User');
      });
    });

    describe('updateMember mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() =>
          mutationResolvers.updateMember({}, { id: 'member-1', input: {} }, context)
        );
      });

      it('should allow user to update their own member record', async () => {
        const context = createAuthContext({ id: 'user-1' });
        const member = { id: 'member-1', userId: 'user-1', fullName: 'Original Name' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...member, fullName: 'Updated Name' }]),
        }));

        const result = await mutationResolvers.updateMember(
          {},
          { id: 'member-1', input: { fullName: 'Updated Name' } },
          context
        );

        expect(result.fullName).toBe('Updated Name');
      });

      it('should prevent user from updating another users member record', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'member' });
        const member = { id: 'member-2', userId: 'user-2', fullName: 'Other User' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        await expectAuthzError(() =>
          mutationResolvers.updateMember({}, { id: 'member-2', input: {} }, context)
        );
      });

      it('should allow admin to update any member record', async () => {
        const context = createAdminContext({ id: 'admin-1' });
        const member = { id: 'member-1', userId: 'other-user', fullName: 'Original Name' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...member, fullName: 'Updated by Admin' }]),
        }));

        const result = await mutationResolvers.updateMember(
          {},
          { id: 'member-1', input: { fullName: 'Updated by Admin' } },
          context
        );

        expect(result.fullName).toBe('Updated by Admin');
      });
    });

    describe('approveMember mutation', () => {
      it('should require admin role', async () => {
        const context = createAuthContext({ role: 'member' });

        await expectAuthzError(() =>
          mutationResolvers.approveMember({}, { id: 'member-1' }, context)
        );
      });

      it('should allow admin to approve members', async () => {
        const context = createAdminContext();
        const member = { id: 'member-1', status: 'pending_approval' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...member, status: 'active' }]),
        }));

        const result = await mutationResolvers.approveMember({}, { id: 'member-1' }, context);

        expect(result.status).toBe('active');
      });

      it('should prevent artist role from approving members', async () => {
        const context = createAuthContext({ role: 'artist' });

        await expectAuthzError(() =>
          mutationResolvers.approveMember({}, { id: 'member-1' }, context)
        );
      });

      it('should prevent visitor role from approving members', async () => {
        const context = createAuthContext({ role: 'visitor' });

        await expectAuthzError(() =>
          mutationResolvers.approveMember({}, { id: 'member-1' }, context)
        );
      });
    });

    describe('rejectMember mutation', () => {
      it('should require admin role', async () => {
        const context = createAuthContext({ role: 'member' });

        await expectAuthzError(() =>
          mutationResolvers.rejectMember({}, { id: 'member-1', reason: 'Invalid application' }, context)
        );
      });

      it('should allow admin to reject members', async () => {
        const context = createAdminContext();
        const member = { id: 'member-1', status: 'pending_approval' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...member, status: 'inactive' }]),
        }));

        const result = await mutationResolvers.rejectMember(
          {},
          { id: 'member-1', reason: 'Incomplete application' },
          context
        );

        expect(result.status).toBe('inactive');
      });
    });

    describe('createArtist mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() =>
          mutationResolvers.createArtist({}, { input: { name: 'Test Artist' } }, context)
        );
      });

      it('should allow authenticated users to create artists', async () => {
        const context = createAuthContext({ id: 'user-1' });
        const artist = { id: 'artist-1', userId: 'user-1', name: 'Test Artist' };

        context.db.insert = jest.fn(() => ({
          values: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([artist]),
          })),
        }));

        const result = await mutationResolvers.createArtist(
          {},
          { input: { name: 'Test Artist', nationality: 'KR' } },
          context
        );

        expect(result.name).toBe('Test Artist');
      });
    });

    describe('updateArtist mutation', () => {
      it('should allow artist to update their own profile', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'artist' });
        const artist = { id: 'artist-1', userId: 'user-1', name: 'Original Name' };
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...artist, name: 'Updated Name' }]),
        }));

        const result = await mutationResolvers.updateArtist(
          {},
          { id: 'artist-1', input: { name: 'Updated Name' } },
          context
        );

        expect(result.name).toBe('Updated Name');
      });

      it('should prevent artist from updating another artists profile', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'artist' });
        const artist = { id: 'artist-2', userId: 'user-2', name: 'Other Artist' };
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        await expectAuthzError(() =>
          mutationResolvers.updateArtist({}, { id: 'artist-2', input: {} }, context)
        );
      });

      it('should allow admin to update any artist profile', async () => {
        const context = createAdminContext();
        const artist = { id: 'artist-1', userId: 'other-user', name: 'Original Name' };
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ ...artist, name: 'Updated by Admin' }]),
        }));

        const result = await mutationResolvers.updateArtist(
          {},
          { id: 'artist-1', input: { name: 'Updated by Admin' } },
          context
        );

        expect(result.name).toBe('Updated by Admin');
      });
    });

    describe('deleteArtwork mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() =>
          mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context)
        );
      });

      it('should allow artist to delete their own artwork', async () => {
        const context = createAuthContext({ id: 'user-1' });
        const artist = { id: 'artist-1', userId: 'user-1' };
        const artwork = { id: 'artwork-1', artistId: 'artist-1' };

        (context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork);
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        context.db.delete = jest.fn(() => ({
          where: jest.fn().mockResolvedValue(undefined),
        }));

        const result = await mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context);

        expect(result).toBe(true);
        expect(context.loaders.artworkLoader.clear).toHaveBeenCalledWith('artwork-1');
      });

      it('should prevent artist from deleting another artists artwork', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'artist' });
        const artist = { id: 'artist-2', userId: 'user-2' };
        const artwork = { id: 'artwork-1', artistId: 'artist-2' };

        (context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork);
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        await expectAuthzError(() =>
          mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context)
        );
      });

      it('should allow admin to delete any artwork', async () => {
        const context = createAdminContext();
        const artist = { id: 'artist-1', userId: 'other-user' };
        const artwork = { id: 'artwork-1', artistId: 'artist-1' };

        (context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork);
        (context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist);

        context.db.delete = jest.fn(() => ({
          where: jest.fn().mockResolvedValue(undefined),
        }));

        const result = await mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context);

        expect(result).toBe(true);
      });
    });

    describe('registerForEvent mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() =>
          mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context)
        );
      });

      it('should allow authenticated users to register', async () => {
        const context = createAuthContext({ id: 'user-1' });
        const event = { id: 'event-1', maxParticipants: 100, currentParticipants: 50 };

        (context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event);
        context.db.query.eventParticipants.findFirst = jest.fn().mockResolvedValue(null);

        const participant = { id: 'participant-1', eventId: 'event-1', userId: 'user-1' };
        context.db.insert = jest.fn(() => ({
          values: jest.fn(() => ({
            returning: jest.fn().mockResolvedValue([participant]),
          })),
        }));

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue(undefined),
        }));

        const result = await mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context);

        expect(result).toEqual(participant);
      });
    });

    describe('cancelEventRegistration mutation', () => {
      it('should require authentication', async () => {
        const context = createMockContext();

        await expectAuthError(() =>
          mutationResolvers.cancelEventRegistration({}, { participantId: 'participant-1' }, context)
        );
      });

      it('should allow user to cancel their own registration', async () => {
        const context = createAuthContext({ id: 'user-1' });
        const participant = { id: 'participant-1', eventId: 'event-1', userId: 'user-1' };
        const event = { id: 'event-1', currentParticipants: 10 };

        (context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant);
        (context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event);

        context.db.delete = jest.fn(() => ({
          where: jest.fn().mockResolvedValue(undefined),
        }));

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue(undefined),
        }));

        const result = await mutationResolvers.cancelEventRegistration(
          {},
          { participantId: 'participant-1' },
          context
        );

        expect(result).toBe(true);
      });

      it('should prevent user from canceling another users registration', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'member' });
        const participant = { id: 'participant-1', eventId: 'event-1', userId: 'user-2' };

        (context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant);

        await expectAuthzError(() =>
          mutationResolvers.cancelEventRegistration({}, { participantId: 'participant-1' }, context)
        );
      });

      it('should allow admin to cancel any registration', async () => {
        const context = createAdminContext();
        const participant = { id: 'participant-1', eventId: 'event-1', userId: 'other-user' };
        const event = { id: 'event-1', currentParticipants: 10 };

        (context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant);
        (context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event);

        context.db.delete = jest.fn(() => ({
          where: jest.fn().mockResolvedValue(undefined),
        }));

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockResolvedValue(undefined),
        }));

        const result = await mutationResolvers.cancelEventRegistration(
          {},
          { participantId: 'participant-1' },
          context
        );

        expect(result).toBe(true);
      });
    });
  });

  describe('Role-Based Access Control Patterns', () => {
    describe('Admin bypass', () => {
      it('should allow admin to access all protected resources', async () => {
        const adminContext = createAdminContext();

        expect(() => requireAuth(adminContext)).not.toThrow();
        expect(() => requireAdmin(adminContext)).not.toThrow();
        expect(() => requireRole(adminContext, 'member')).not.toThrow();
        expect(() => requireRole(adminContext, 'artist')).not.toThrow();
        expect(() => requireRole(adminContext, 'visitor')).not.toThrow();
      });
    });

    describe('Resource ownership', () => {
      it('should allow users to modify their own resources', async () => {
        const context = createAuthContext({ id: 'user-1' });

        // User can update their own member record
        const member = { id: 'member-1', userId: 'user-1' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        context.db.update = jest.fn(() => ({
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([member]),
        }));

        await expect(
          mutationResolvers.updateMember({}, { id: 'member-1', input: {} }, context)
        ).resolves.toBeDefined();
      });

      it('should prevent users from modifying others resources', async () => {
        const context = createAuthContext({ id: 'user-1', role: 'member' });

        // User cannot update another user's member record
        const member = { id: 'member-2', userId: 'user-2' };
        (context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member);

        await expectAuthzError(() =>
          mutationResolvers.updateMember({}, { id: 'member-2', input: {} }, context)
        );
      });
    });

    describe('Hierarchical permissions', () => {
      it('should enforce permission hierarchy: admin > artist > member > visitor', async () => {
        const visitorContext = createAuthContext({ role: 'visitor' });
        const memberContext = createAuthContext({ role: 'member' });
        const artistContext = createAuthContext({ role: 'artist' });
        const adminContext = createAdminContext();

        // Visitor - lowest privileges
        expect(() => requireRole(visitorContext, 'visitor')).not.toThrow();
        expect(() => requireRole(visitorContext, 'member')).toThrow();

        // Member - can access member resources
        expect(() => requireRole(memberContext, 'visitor')).toThrow();
        expect(() => requireRole(memberContext, 'member')).not.toThrow();
        expect(() => requireRole(memberContext, 'artist')).toThrow();

        // Artist - can access artist resources
        expect(() => requireRole(artistContext, 'member')).toThrow();
        expect(() => requireRole(artistContext, 'artist')).not.toThrow();
        expect(() => requireRole(artistContext, 'admin')).toThrow();

        // Admin - can access all resources
        expect(() => requireRole(adminContext, 'visitor')).not.toThrow();
        expect(() => requireRole(adminContext, 'member')).not.toThrow();
        expect(() => requireRole(adminContext, 'artist')).not.toThrow();
        expect(() => requireRole(adminContext, 'admin')).not.toThrow();
      });
    });
  });

  describe('Context Security', () => {
    it('should create anonymous context by default', () => {
      const context = createMockContext();

      expect(context.user).toBeNull();
      expect(context.userId).toBeNull();
    });

    it('should create authenticated context with user', () => {
      const mockUser = createMockUser({ id: 'user-123', email: 'test@example.com' });
      const context = createMockContext({ user: mockUser });

      expect(context.user).toEqual(mockUser);
      expect(context.userId).toBe('user-123');
    });

    it('should include request metadata', () => {
      const context = createMockContext();

      expect(context.request.ip).toBe('127.0.0.1');
      expect(context.request.userAgent).toBe('test-agent');
    });

    it('should provide database access', () => {
      const context = createMockContext();

      expect(context.db).toBeDefined();
      expect(context.db.query).toBeDefined();
      expect(context.db.insert).toBeDefined();
      expect(context.db.update).toBeDefined();
      expect(context.db.delete).toBeDefined();
    });

    it('should provide DataLoaders', () => {
      const context = createMockContext();

      expect(context.loaders.userLoader).toBeDefined();
      expect(context.loaders.memberLoader).toBeDefined();
      expect(context.loaders.artistLoader).toBeDefined();
      expect(context.loaders.artworkLoader).toBeDefined();
      expect(context.loaders.eventLoader).toBeDefined();
    });
  });
});
