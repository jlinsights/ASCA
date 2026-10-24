import {
  publicExhibitionArtistCondition,
  publicExhibitionArtworkCondition,
} from '@/lib/db/archive-access'
import { publicArtistCondition, publicArtworkCondition } from '@/lib/db/archive-access'
import { auth } from '@/lib/auth/server'
import { db } from '@/lib/db'
import { createIdLoader, DataLoader } from '@/lib/optimization/dataloader'
import { and, eq, inArray } from 'drizzle-orm'
import * as schema from '@/lib/db/schema'
import type { User } from '@/lib/db/schema'

/**
 * GraphQL Context
 *
 * Context is created for each GraphQL request and contains:
 * - Database connection
 * - DataLoaders for batching and caching
 * - Authenticated user information
 * - Request metadata
 */

type GraphQLUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt' | 'updatedAt'>

export interface GraphQLContext {
  // Database
  db: typeof db

  // User authentication
  user: GraphQLUser | null
  userId: string | null
  artistIds?: string[]

  // DataLoaders for N+1 query prevention
  loaders: {
    // User & Member loaders
    userLoader: DataLoader<string, User>
    memberLoader: DataLoader<string, any>
    memberByUserIdLoader: DataLoader<string, any>

    // Membership tier loader
    membershipTierLoader: DataLoader<string, any>

    // Artist & Artwork loaders
    artistLoader: DataLoader<string, any>
    artworkLoader: DataLoader<string, any>
    artworksByArtistLoader: DataLoader<string, any[]>

    // Exhibition loaders
    exhibitionLoader: DataLoader<string, any>
    exhibitionArtworkLoader: DataLoader<string, any>
    exhibitionArtistLoader: DataLoader<string, any>

    // Event loaders
    eventLoader: DataLoader<string, any>
    eventParticipantLoader: DataLoader<string, any>

    // Gallery loaders
    galleryLoader: DataLoader<string, any>
    galleryArtworkLoader: DataLoader<string, any>

    // News loader
    newsLoader: DataLoader<string, any>
  }

  // Request metadata
  request: {
    ip: string | null
    userAgent: string | null
  }
}

/**
 * Create GraphQL Context
 *
 * Called for each GraphQL request to create a fresh context
 * with new DataLoader instances (per-request caching)
 */
export async function createGraphQLContext(req: Request): Promise<GraphQLContext> {
  // Verify native Auth identity and protected account role
  const { user, userId, artistIds } = await authenticateUser()

  // Extract request metadata
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
  const userAgent = req.headers.get('user-agent') || null

  // Create DataLoaders
  const loaders = createDataLoaders()

  return {
    db,
    user,
    userId,
    artistIds,
    loaders,
    request: {
      ip,
      userAgent,
    },
  }
}

/** Account identity/role comes from native Auth and its protected profile, not legacy users. */
async function authenticateUser() {
  const { account } = await auth()
  if (!account) return { user: null, userId: null, artistIds: [] }
  const role: User['role'] =
    account.role === 'admin' && account.assuranceLevel === 'aal2'
      ? 'admin'
      : account.artistIds.length
        ? 'artist'
        : 'member'
  return {
    user: {
      id: account.id,
      email: account.email,
      name: account.displayName,
      role,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt),
    },
    userId: account.id,
    artistIds: account.artistIds,
  }
}

/**
 * Create all DataLoaders for batching and caching
 */
function createDataLoaders() {
  return {
    // ===== User & Member Loaders =====

    userLoader: createIdLoader(async (ids: readonly string[]) => {
      const users = await db.query.users.findMany({
        where: inArray(schema.users.id, [...ids]),
      })
      return users
    }),

    memberLoader: createIdLoader(async (ids: readonly string[]) => {
      const members = await db.query.members.findMany({
        where: inArray(schema.members.id, [...ids]),
      })
      return members
    }),

    memberByUserIdLoader: new DataLoader<string, any>({
      batchLoadFn: async (userIds: readonly string[]) => {
        const members = await db.query.members.findMany({
          where: inArray(schema.members.userId, [...userIds]),
        })

        const memberMap = new Map(members.map(m => [m.userId, m]))

        return userIds.map(
          userId => memberMap.get(userId) ?? new Error(`Member for user ${userId} not found`)
        )
      },
    }),

    // ===== Membership Tier Loader =====

    membershipTierLoader: createIdLoader(async (ids: readonly string[]) => {
      const tiers = await db.query.membershipTiers.findMany({
        where: inArray(schema.membershipTiers.id, [...ids]),
      })
      return tiers
    }),

    // ===== Artist & Artwork Loaders =====

    artistLoader: createIdLoader(async (ids: readonly string[]) => {
      const artists = await db.query.artists.findMany({
        where: and(publicArtistCondition(), inArray(schema.artists.id, [...ids])),
      })
      return artists
    }),

    artworkLoader: createIdLoader(async (ids: readonly string[]) => {
      const artworks = await db.query.artworks.findMany({
        where: and(publicArtworkCondition(), inArray(schema.artworks.id, [...ids])),
      })
      return artworks
    }),

    artworksByArtistLoader: new DataLoader<string, any[]>({
      batchLoadFn: async (artistIds: readonly string[]) => {
        const artworks = await db.query.artworks.findMany({
          where: and(publicArtworkCondition(), inArray(schema.artworks.artistId, [...artistIds])),
        })

        // Group artworks by artistId
        const artworksByArtist = new Map<string, any[]>()
        artworks.forEach(artwork => {
          if (!artworksByArtist.has(artwork.artistId)) {
            artworksByArtist.set(artwork.artistId, [])
          }
          artworksByArtist.get(artwork.artistId)!.push(artwork)
        })

        return artistIds.map(artistId => artworksByArtist.get(artistId) ?? [])
      },
    }),

    // ===== Exhibition Loaders =====

    exhibitionLoader: createIdLoader(async (ids: readonly string[]) => {
      const exhibitions = await db.query.exhibitions.findMany({
        where: inArray(schema.exhibitions.id, [...ids]),
      })
      return exhibitions
    }),

    exhibitionArtworkLoader: createIdLoader(async (ids: readonly string[]) => {
      const exhibitionArtworks = await db.query.exhibitionArtworks.findMany({
        where: and(
          publicExhibitionArtworkCondition(),
          inArray(schema.exhibitionArtworks.id, [...ids])
        ),
      })
      return exhibitionArtworks
    }),

    exhibitionArtistLoader: createIdLoader(async (ids: readonly string[]) => {
      const exhibitionArtists = await db.query.exhibitionArtists.findMany({
        where: and(
          publicExhibitionArtistCondition(),
          inArray(schema.exhibitionArtists.id, [...ids])
        ),
      })
      return exhibitionArtists
    }),

    // ===== Event Loaders =====

    eventLoader: createIdLoader(async (ids: readonly string[]) => {
      const events = await db.query.events.findMany({
        where: inArray(schema.events.id, [...ids]),
      })
      return events
    }),

    eventParticipantLoader: createIdLoader(async (ids: readonly string[]) => {
      const participants = await db.query.eventParticipants.findMany({
        where: inArray(schema.eventParticipants.id, [...ids]),
      })
      return participants
    }),

    // ===== Gallery Loaders =====

    galleryLoader: createIdLoader(async (ids: readonly string[]) => {
      const galleries = await db.query.galleries.findMany({
        where: inArray(schema.galleries.id, [...ids]),
      })
      return galleries
    }),

    galleryArtworkLoader: createIdLoader(async (ids: readonly string[]) => {
      const galleryArtworks = await db.query.galleryArtworks.findMany({
        where: inArray(schema.galleryArtworks.id, [...ids]),
      })
      return galleryArtworks
    }),

    // ===== News Loader =====

    newsLoader: createIdLoader(async (ids: readonly string[]) => {
      const newsItems = await db.query.news.findMany({
        where: inArray(schema.news.id, [...ids]),
      })
      return newsItems
    }),
  }
}

/**
 * Type guard to check if user is authenticated
 */
export function requireAuth(
  context: GraphQLContext
): asserts context is GraphQLContext & { user: GraphQLUser; userId: string } {
  if (!context.user || !context.userId) {
    throw new Error('Authentication required')
  }
}

/**
 * Type guard to check if user has specific role
 */
export function requireRole(context: GraphQLContext, role: User['role']) {
  requireAuth(context)

  if (context.user.role !== role && context.user.role !== 'admin') {
    throw new Error(`Requires ${role} role`)
  }
}

/**
 * Type guard to check if user is admin
 */
export function requireAdmin(context: GraphQLContext) {
  requireRole(context, 'admin')
}
