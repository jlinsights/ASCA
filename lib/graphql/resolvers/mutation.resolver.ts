import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import type { GraphQLContext } from '../context';
import { requireAuth, requireAdmin } from '../context';
import * as schema from '@/lib/db/schema';

/**
 * Mutation Resolvers
 *
 * Resolvers for GraphQL mutations (create, update, delete operations)
 */

export const mutationResolvers = {
  // ===================================
  // Member Mutations
  // ===================================

  createMember: async (
    _: any,
    { input }: { input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Generate membership number
    const year = new Date().getFullYear();
    const count = await context.db.query.members.findMany();
    const membershipNumber = `ASCA-${year}-${String(count.length + 1).padStart(3, '0')}`;

    const [member] = await context.db
      .insert(schema.members)
      .values({
        ...input,
        membershipNumber,
        tierLevel: 1, // Start with basic tier
        status: 'pending_approval',
      })
      .returning();

    return member;
  },

  updateMember: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check if user owns this member record or is admin
    const member = await context.loaders.memberLoader.load(id);
    if (member.userId !== context.userId && context.user!.role !== 'admin') {
      throw new Error('Not authorized to update this member');
    }

    const [updatedMember] = await context.db
      .update(schema.members)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(schema.members.id, id))
      .returning();

    // Clear cache
    context.loaders.memberLoader.clear(id);

    return updatedMember;
  },

  approveMember: async (
    _: any,
    { id }: { id: string },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const [approvedMember] = await context.db
      .update(schema.members)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(schema.members.id, id))
      .returning();

    // Clear cache
    context.loaders.memberLoader.clear(id);

    return approvedMember;
  },

  rejectMember: async (
    _: any,
    { id, reason }: { id: string; reason?: string },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const [rejectedMember] = await context.db
      .update(schema.members)
      .set({
        status: 'inactive',
        notes: reason || 'Application rejected',
        updatedAt: new Date(),
      })
      .where(eq(schema.members.id, id))
      .returning();

    // Clear cache
    context.loaders.memberLoader.clear(id);

    return rejectedMember;
  },

  // ===================================
  // Membership Application Mutations
  // ===================================

  submitMembershipApplication: async (
    _: any,
    { input }: { input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    const [application] = await context.db
      .insert(schema.membershipApplications)
      .values({
        ...input,
        status: 'pending',
        submittedAt: new Date(),
      })
      .returning();

    return application;
  },

  reviewMembershipApplication: async (
    _: any,
    {
      id,
      status,
      comments,
      score,
    }: {
      id: string;
      status: string;
      comments?: string;
      score?: number;
    },
    context: GraphQLContext
  ) => {
    requireAdmin(context);

    const [reviewedApplication] = await context.db
      .update(schema.membershipApplications)
      .set({
        status: status as any,
        reviewComments: comments,
        reviewScore: score,
        reviewerId: context.userId!,
        reviewedAt: new Date(),
        decidedAt: new Date(),
      })
      .where(eq(schema.membershipApplications.id, id))
      .returning();

    // If approved, update member tier
    if (status === 'approved') {
      const application = await context.db.query.membershipApplications.findFirst({
        where: eq(schema.membershipApplications.id, id),
      });

      if (application) {
        await context.db
          .update(schema.members)
          .set({
            tierLevel: application.requestedTierLevel,
            tierId: application.requestedTierId || undefined,
            status: 'active',
            updatedAt: new Date(),
          })
          .where(eq(schema.members.id, application.memberId));

        // Clear member cache
        context.loaders.memberLoader.clear(application.memberId);
      }
    }

    return reviewedApplication;
  },

  // ===================================
  // Artist Mutations
  // ===================================

  createArtist: async (
    _: any,
    { input }: { input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    const [artist] = await context.db
      .insert(schema.artists)
      .values({
        ...input,
        isActive: true,
      })
      .returning();

    return artist;
  },

  updateArtist: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check if user owns this artist record or is admin
    const artist = await context.loaders.artistLoader.load(id);
    if (artist.userId && artist.userId !== context.userId && context.user!.role !== 'admin') {
      throw new Error('Not authorized to update this artist');
    }

    const [updatedArtist] = await context.db
      .update(schema.artists)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(schema.artists.id, id))
      .returning();

    // Clear cache
    context.loaders.artistLoader.clear(id);

    return updatedArtist;
  },

  // ===================================
  // Artwork Mutations
  // ===================================

  createArtwork: async (
    _: any,
    { input }: { input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    const [artwork] = await context.db
      .insert(schema.artworks)
      .values({
        ...input,
        isFeatured: false,
        isForSale: input.isForSale ?? false,
      })
      .returning();

    // Clear artist's artworks cache
    if (!artwork) {
      throw new Error('Failed to create artwork');
    }
    context.loaders.artworksByArtistLoader.clear(artwork.artistId);

    return artwork;
  },

  updateArtwork: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check authorization
    const artwork = await context.loaders.artworkLoader.load(id);
    const artist = await context.loaders.artistLoader.load(artwork.artistId);

    if (artist.userId && artist.userId !== context.userId && context.user!.role !== 'admin') {
      throw new Error('Not authorized to update this artwork');
    }

    const [updatedArtwork] = await context.db
      .update(schema.artworks)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(schema.artworks.id, id))
      .returning();

    // Clear caches
    context.loaders.artworkLoader.clear(id);
    context.loaders.artworksByArtistLoader.clear(artwork.artistId);

    return updatedArtwork;
  },

  deleteArtwork: async (
    _: any,
    { id }: { id: string },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check authorization
    const artwork = await context.loaders.artworkLoader.load(id);
    const artist = await context.loaders.artistLoader.load(artwork.artistId);

    if (artist.userId && artist.userId !== context.userId && context.user!.role !== 'admin') {
      throw new Error('Not authorized to delete this artwork');
    }

    await context.db
      .delete(schema.artworks)
      .where(eq(schema.artworks.id, id));

    // Clear caches
    context.loaders.artworkLoader.clear(id);
    context.loaders.artworksByArtistLoader.clear(artwork.artistId);

    return true;
  },

  // ===================================
  // Event Mutations
  // ===================================

  registerForEvent: async (
    _: any,
    { eventId, notes }: { eventId: string; notes?: string },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check if already registered
    const existing = await context.db.query.eventParticipants.findFirst({
      where: (participants, { and, eq }) =>
        and(
          eq(participants.eventId, eventId),
          eq(participants.userId, context.userId!)
        ),
    });

    if (existing) {
      throw new Error('Already registered for this event');
    }

    // Check event capacity
    const event = await context.loaders.eventLoader.load(eventId);
    if (
      event.maxParticipants &&
      event.currentParticipants >= event.maxParticipants
    ) {
      throw new Error('Event is full');
    }

    const [participant] = await context.db
      .insert(schema.eventParticipants)
      .values({
        id: randomUUID(),
        eventId,
        userId: context.userId!,
        status: 'registered',
        notes,
        registeredAt: new Date(),
      })
      .returning();

    // Update event participant count
    await context.db
      .update(schema.events)
      .set({
        currentParticipants: event.currentParticipants + 1,
      })
      .where(eq(schema.events.id, eventId));

    // Clear event cache
    context.loaders.eventLoader.clear(eventId);

    return participant;
  },

  cancelEventRegistration: async (
    _: any,
    { participantId }: { participantId: string },
    context: GraphQLContext
  ) => {
    requireAuth(context);

    // Check if user owns this participant record
    const participant = await context.loaders.eventParticipantLoader.load(participantId);
    if (participant.userId !== context.userId && context.user!.role !== 'admin') {
      throw new Error('Not authorized to cancel this registration');
    }

    await context.db
      .delete(schema.eventParticipants)
      .where(eq(schema.eventParticipants.id, participantId));

    // Update event participant count
    const event = await context.loaders.eventLoader.load(participant.eventId);
    await context.db
      .update(schema.events)
      .set({
        currentParticipants: Math.max(0, event.currentParticipants - 1),
      })
      .where(eq(schema.events.id, participant.eventId));

    // Clear caches
    context.loaders.eventParticipantLoader.clear(participantId);
    context.loaders.eventLoader.clear(participant.eventId);

    return true;
  },
};
