import { eq, and, or, like, desc, asc, inArray, sql } from 'drizzle-orm';
import type { GraphQLContext } from '../context';
import * as schema from '@/lib/db/schema-pg';
import { encodeCursor, decodeCursor } from '@/lib/pagination/cursor';

/**
 * Query Resolvers
 *
 * Root-level query resolvers for GraphQL API
 */

export const queryResolvers = {
  // ===================================
  // User Queries
  // ===================================

  user: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.userLoader.load(id);
  },

  me: async (_: any, __: any, context: GraphQLContext) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }
    return context.user;
  },

  // ===================================
  // Member Queries
  // ===================================

  member: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.memberLoader.load(id);
  },

  memberByUserId: async (_: any, { userId }: { userId: string }, context: GraphQLContext) => {
    return context.loaders.memberByUserIdLoader.load(userId);
  },

  members: async (
    _: any,
    args: {
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      status?: string;
      tierLevel?: number;
    },
    context: GraphQLContext
  ) => {
    const { first, after, last, before, status, tierLevel } = args;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(schema.members.status, status as any));
    }
    if (tierLevel !== undefined) {
      conditions.push(eq(schema.members.tierLevel, tierLevel));
    }

    // Parse cursor
    let cursorValue: string | null = null;
    if (after) {
      cursorValue = decodeCursor(after);
    } else if (before) {
      cursorValue = decodeCursor(before);
    }

    // Build query
    let query = context.db.query.members.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: (first || last || 20) + 1, // Fetch one extra to determine hasNextPage
      orderBy: [desc(schema.members.createdAt)],
    });

    const members = await query;

    // Determine hasNextPage/hasPreviousPage
    const hasMore = members.length > (first || last || 20);
    if (hasMore) {
      members.pop(); // Remove extra item
    }

    const edges = members.map(node => ({
      node,
      cursor: encodeCursor(node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: first ? hasMore : false,
        hasPreviousPage: last ? hasMore : false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: members.length,
    };
  },

  searchMembers: async (
    _: any,
    { query, limit = 10 }: { query: string; limit?: number },
    context: GraphQLContext
  ) => {
    const members = await context.db.query.members.findMany({
      where: or(
        like(schema.members.fullName, `%${query}%`),
        like(schema.members.fullNameKo, `%${query}%`),
        like(schema.members.fullNameEn, `%${query}%`)
      ),
      limit,
    });

    return members;
  },

  // ===================================
  // Membership Tier Queries
  // ===================================

  membershipTier: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.membershipTierLoader.load(id);
  },

  membershipTiers: async (
    _: any,
    { isActive }: { isActive?: boolean },
    context: GraphQLContext
  ) => {
    const tiers = await context.db.query.membershipTiers.findMany({
      where: isActive !== undefined ? eq(schema.membershipTiers.isActive, isActive) : undefined,
      orderBy: [asc(schema.membershipTiers.level)],
    });

    return tiers;
  },

  // ===================================
  // Artist Queries
  // ===================================

  artist: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.artistLoader.load(id);
  },

  artists: async (
    _: any,
    args: {
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      isActive?: boolean;
    },
    context: GraphQLContext
  ) => {
    const { first, after, isActive } = args;

    const conditions = [];
    if (isActive !== undefined) {
      conditions.push(eq(schema.artists.isActive, isActive));
    }

    const artists = await context.db.query.artists.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: (first || 20) + 1,
      orderBy: [desc(schema.artists.createdAt)],
    });

    const hasMore = artists.length > (first || 20);
    if (hasMore) {
      artists.pop();
    }

    const edges = artists.map(node => ({
      node,
      cursor: encodeCursor(node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: artists.length,
    };
  },

  searchArtists: async (
    _: any,
    { query, limit = 10 }: { query: string; limit?: number },
    context: GraphQLContext
  ) => {
    const artists = await context.db.query.artists.findMany({
      where: or(
        like(schema.artists.name, `%${query}%`),
        like(schema.artists.nameKo, `%${query}%`),
        like(schema.artists.nameEn, `%${query}%`)
      ),
      limit,
    });

    return artists;
  },

  // ===================================
  // Artwork Queries
  // ===================================

  artwork: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.artworkLoader.load(id);
  },

  artworks: async (
    _: any,
    args: {
      first?: number;
      after?: string;
      category?: string;
      artistId?: string;
      isFeatured?: boolean;
      isForSale?: boolean;
    },
    context: GraphQLContext
  ) => {
    const { first, category, artistId, isFeatured, isForSale } = args;

    const conditions = [];
    if (category) {
      conditions.push(eq(schema.artworks.category, category as any));
    }
    if (artistId) {
      conditions.push(eq(schema.artworks.artistId, artistId));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(schema.artworks.isFeatured, isFeatured));
    }
    if (isForSale !== undefined) {
      conditions.push(eq(schema.artworks.isForSale, isForSale));
    }

    const artworks = await context.db.query.artworks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: (first || 20) + 1,
      orderBy: [desc(schema.artworks.createdAt)],
    });

    const hasMore = artworks.length > (first || 20);
    if (hasMore) {
      artworks.pop();
    }

    const edges = artworks.map(node => ({
      node,
      cursor: encodeCursor(node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: artworks.length,
    };
  },

  searchArtworks: async (
    _: any,
    { query, limit = 10 }: { query: string; limit?: number },
    context: GraphQLContext
  ) => {
    const artworks = await context.db.query.artworks.findMany({
      where: or(
        like(schema.artworks.title, `%${query}%`),
        like(schema.artworks.titleKo, `%${query}%`),
        like(schema.artworks.titleEn, `%${query}%`),
        like(schema.artworks.description, `%${query}%`)
      ),
      limit,
    });

    return artworks;
  },

  // ===================================
  // Exhibition Queries
  // ===================================

  exhibition: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.exhibitionLoader.load(id);
  },

  exhibitions: async (
    _: any,
    args: {
      first?: number;
      after?: string;
      type?: string;
      status?: string;
      isFeatured?: boolean;
    },
    context: GraphQLContext
  ) => {
    const { first, type, status, isFeatured } = args;

    const conditions = [];
    if (type) {
      conditions.push(eq(schema.exhibitions.type, type as any));
    }
    if (status) {
      conditions.push(eq(schema.exhibitions.status, status as any));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(schema.exhibitions.isFeatured, isFeatured));
    }

    const exhibitions = await context.db.query.exhibitions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: (first || 20) + 1,
      orderBy: [desc(schema.exhibitions.startDate)],
    });

    const hasMore = exhibitions.length > (first || 20);
    if (hasMore) {
      exhibitions.pop();
    }

    const edges = exhibitions.map(node => ({
      node,
      cursor: encodeCursor(node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: exhibitions.length,
    };
  },

  currentExhibitions: async (_: any, __: any, context: GraphQLContext) => {
    const now = new Date();

    const exhibitions = await context.db.query.exhibitions.findMany({
      where: and(
        eq(schema.exhibitions.status, 'ongoing'),
        sql`${schema.exhibitions.startDate} <= ${now}`,
        sql`${schema.exhibitions.endDate} >= ${now}`
      ),
      orderBy: [desc(schema.exhibitions.startDate)],
    });

    return exhibitions;
  },

  upcomingExhibitions: async (
    _: any,
    { limit = 10 }: { limit?: number },
    context: GraphQLContext
  ) => {
    const now = new Date();

    const exhibitions = await context.db.query.exhibitions.findMany({
      where: and(
        eq(schema.exhibitions.status, 'upcoming'),
        sql`${schema.exhibitions.startDate} > ${now}`
      ),
      orderBy: [asc(schema.exhibitions.startDate)],
      limit,
    });

    return exhibitions;
  },

  // ===================================
  // Event Queries
  // ===================================

  event: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.eventLoader.load(id);
  },

  events: async (
    _: any,
    args: {
      first?: number;
      type?: string;
      status?: string;
      isFeatured?: boolean;
    },
    context: GraphQLContext
  ) => {
    const { first, type, status, isFeatured } = args;

    const conditions = [];
    if (type) {
      conditions.push(eq(schema.events.type, type as any));
    }
    if (status) {
      conditions.push(eq(schema.events.status, status as any));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(schema.events.isFeatured, isFeatured));
    }

    const events = await context.db.query.events.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: (first || 20) + 1,
      orderBy: [desc(schema.events.startDate)],
    });

    const hasMore = events.length > (first || 20);
    if (hasMore) {
      events.pop();
    }

    const edges = events.map(node => ({
      node,
      cursor: encodeCursor(node.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: events.length,
    };
  },

  currentEvents: async (_: any, __: any, context: GraphQLContext) => {
    const now = new Date();

    const events = await context.db.query.events.findMany({
      where: and(
        eq(schema.events.status, 'ongoing'),
        sql`${schema.events.startDate} <= ${now}`,
        sql`${schema.events.endDate} >= ${now}`
      ),
      orderBy: [desc(schema.events.startDate)],
    });

    return events;
  },

  upcomingEvents: async (
    _: any,
    { limit = 10 }: { limit?: number },
    context: GraphQLContext
  ) => {
    const now = new Date();

    const events = await context.db.query.events.findMany({
      where: and(
        eq(schema.events.status, 'upcoming'),
        sql`${schema.events.startDate} > ${now}`
      ),
      orderBy: [asc(schema.events.startDate)],
      limit,
    });

    return events;
  },

  // ===================================
  // Gallery Queries
  // ===================================

  gallery: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.galleryLoader.load(id);
  },

  galleries: async (
    _: any,
    { type, isActive }: { type?: string; isActive?: boolean },
    context: GraphQLContext
  ) => {
    const conditions = [];
    if (type) {
      conditions.push(eq(schema.galleries.type, type as any));
    }
    if (isActive !== undefined) {
      conditions.push(eq(schema.galleries.isActive, isActive));
    }

    const galleries = await context.db.query.galleries.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(schema.galleries.sortOrder)],
    });

    return galleries;
  },

  // ===================================
  // News Queries
  // ===================================

  news: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
    return context.loaders.newsLoader.load(id);
  },

  newsList: async (
    _: any,
    args: {
      category?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
    context: GraphQLContext
  ) => {
    const { category, status, limit = 20, offset = 0 } = args;

    const conditions = [];
    if (category) {
      conditions.push(eq(schema.news.category, category as any));
    }
    if (status) {
      conditions.push(eq(schema.news.status, status as any));
    }

    const newsItems = await context.db.query.news.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(schema.news.publishedAt)],
    });

    return newsItems;
  },

  featuredNews: async (
    _: any,
    { limit = 5 }: { limit?: number },
    context: GraphQLContext
  ) => {
    const newsItems = await context.db.query.news.findMany({
      where: and(
        eq(schema.news.isPinned, true),
        eq(schema.news.status, 'published')
      ),
      limit,
      orderBy: [desc(schema.news.publishedAt)],
    });

    return newsItems;
  },
};
