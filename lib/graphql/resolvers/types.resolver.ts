import { eq } from 'drizzle-orm'
import type { GraphQLContext } from '../context'
import * as schema from '@/lib/db/schema-pg'

/**
 * Type Resolvers
 *
 * Resolvers for nested fields on GraphQL types
 * These handle relationships between entities using DataLoaders
 */

export const typeResolvers = {
  // ===================================
  // Member Type Resolvers
  // ===================================

  Member: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.userLoader.load(parent.userId)
    },

    tier: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.tierId) return null
      return context.loaders.membershipTierLoader.load(parent.tierId)
    },

    applications: async (parent: any, _: any, context: GraphQLContext) => {
      const applications = await context.db.query.membershipApplications.findMany({
        where: eq(schema.membershipApplications.memberId, parent.id),
        orderBy: [schema.membershipApplications.submittedAt],
      })
      return applications
    },

    activities: async (parent: any, _: any, context: GraphQLContext) => {
      const activities = await context.db.query.memberActivities.findMany({
        where: eq(schema.memberActivities.memberId, parent.id),
        orderBy: [schema.memberActivities.timestamp],
        limit: 50, // Limit to recent activities
      })
      return activities
    },

    certifications: async (parent: any, _: any, context: GraphQLContext) => {
      const certifications = await context.db.query.memberCertifications.findMany({
        where: eq(schema.memberCertifications.memberId, parent.id),
        orderBy: [schema.memberCertifications.issuedAt],
      })
      return certifications
    },

    // Parse JSON fields
    specializations: (parent: any) => {
      if (!parent.specializations) return []
      return typeof parent.specializations === 'string'
        ? JSON.parse(parent.specializations)
        : parent.specializations
    },

    preferredStyles: (parent: any) => {
      if (!parent.preferredStyles) return []
      return typeof parent.preferredStyles === 'string'
        ? JSON.parse(parent.preferredStyles)
        : parent.preferredStyles
    },

    achievements: (parent: any) => {
      if (!parent.achievements) return []
      return typeof parent.achievements === 'string'
        ? JSON.parse(parent.achievements)
        : parent.achievements
    },
  },

  // ===================================
  // Membership Tier Type Resolvers
  // ===================================

  MembershipTier: {
    members: async (parent: any, _: any, context: GraphQLContext) => {
      const members = await context.db.query.members.findMany({
        where: eq(schema.members.tierId, parent.id),
      })
      return members
    },

    // Parse JSON fields
    requirements: (parent: any) => {
      if (!parent.requirements) return null
      return typeof parent.requirements === 'string'
        ? JSON.parse(parent.requirements)
        : parent.requirements
    },

    benefits: (parent: any) => {
      if (!parent.benefits) return null
      return typeof parent.benefits === 'string' ? JSON.parse(parent.benefits) : parent.benefits
    },
  },

  // ===================================
  // Membership Application Type Resolvers
  // ===================================

  MembershipApplication: {
    member: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.memberLoader.load(parent.memberId)
    },

    reviewer: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.reviewerId) return null
      return context.loaders.userLoader.load(parent.reviewerId)
    },

    // Parse JSON fields
    supportingDocuments: (parent: any) => {
      if (!parent.supportingDocuments) return []
      return typeof parent.supportingDocuments === 'string'
        ? JSON.parse(parent.supportingDocuments)
        : parent.supportingDocuments
    },

    portfolioItems: (parent: any) => {
      if (!parent.portfolioItems) return null
      return typeof parent.portfolioItems === 'string'
        ? JSON.parse(parent.portfolioItems)
        : parent.portfolioItems
    },

    references: (parent: any) => {
      if (!parent.references) return null
      return typeof parent.references === 'string'
        ? JSON.parse(parent.references)
        : parent.references
    },
  },

  // ===================================
  // Member Activity Type Resolvers
  // ===================================

  MemberActivity: {
    member: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.memberLoader.load(parent.memberId)
    },
  },

  // ===================================
  // Member Certification Type Resolvers
  // ===================================

  MemberCertification: {
    member: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.memberLoader.load(parent.memberId)
    },
  },

  // ===================================
  // Artist Type Resolvers
  // ===================================

  Artist: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.userId) return null
      return context.loaders.userLoader.load(parent.userId)
    },

    artworks: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.artworksByArtistLoader.load(parent.id)
    },

    exhibitionParticipations: async (parent: any, _: any, context: GraphQLContext) => {
      const participations = await context.db.query.exhibitionArtists.findMany({
        where: eq(schema.exhibitionArtists.artistId, parent.id),
      })
      return participations
    },

    // Parse JSON fields
    specialties: (parent: any) => {
      if (!parent.specialties) return []
      return typeof parent.specialties === 'string'
        ? JSON.parse(parent.specialties)
        : parent.specialties
    },

    awards: (parent: any) => {
      if (!parent.awards) return null
      return typeof parent.awards === 'string' ? JSON.parse(parent.awards) : parent.awards
    },

    exhibitions: (parent: any) => {
      if (!parent.exhibitions) return null
      return typeof parent.exhibitions === 'string'
        ? JSON.parse(parent.exhibitions)
        : parent.exhibitions
    },

    socialMedia: (parent: any) => {
      if (!parent.socialMedia) return null
      return typeof parent.socialMedia === 'string'
        ? JSON.parse(parent.socialMedia)
        : parent.socialMedia
    },
  },

  // ===================================
  // Artwork Type Resolvers
  // ===================================

  Artwork: {
    artist: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.artistLoader.load(parent.artistId)
    },

    exhibitionArtworks: async (parent: any, _: any, context: GraphQLContext) => {
      const exhibitionArtworks = await context.db.query.exhibitionArtworks.findMany({
        where: eq(schema.exhibitionArtworks.artworkId, parent.id),
      })
      return exhibitionArtworks
    },

    galleryArtworks: async (parent: any, _: any, context: GraphQLContext) => {
      const galleryArtworks = await context.db.query.galleryArtworks.findMany({
        where: eq(schema.galleryArtworks.artworkId, parent.id),
      })
      return galleryArtworks
    },

    // Parse JSON fields
    imageUrls: (parent: any) => {
      if (!parent.imageUrls) return []
      return typeof parent.imageUrls === 'string' ? JSON.parse(parent.imageUrls) : parent.imageUrls
    },

    tags: (parent: any) => {
      if (!parent.tags) return []
      return typeof parent.tags === 'string' ? JSON.parse(parent.tags) : parent.tags
    },

    metadata: (parent: any) => {
      if (!parent.metadata) return null
      return typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata
    },
  },

  // ===================================
  // Exhibition Type Resolvers
  // ===================================

  Exhibition: {
    artworks: async (parent: any, _: any, context: GraphQLContext) => {
      const exhibitionArtworks = await context.db.query.exhibitionArtworks.findMany({
        where: eq(schema.exhibitionArtworks.exhibitionId, parent.id),
        orderBy: [schema.exhibitionArtworks.displayOrder],
      })
      return exhibitionArtworks
    },

    artists: async (parent: any, _: any, context: GraphQLContext) => {
      const exhibitionArtists = await context.db.query.exhibitionArtists.findMany({
        where: eq(schema.exhibitionArtists.exhibitionId, parent.id),
      })
      return exhibitionArtists
    },

    // Parse JSON fields
    galleryImages: (parent: any) => {
      if (!parent.galleryImages) return []
      return typeof parent.galleryImages === 'string'
        ? JSON.parse(parent.galleryImages)
        : parent.galleryImages
    },

    metadata: (parent: any) => {
      if (!parent.metadata) return null
      return typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata
    },
  },

  // ===================================
  // Exhibition Artwork Type Resolvers
  // ===================================

  ExhibitionArtwork: {
    exhibition: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.exhibitionLoader.load(parent.exhibitionId)
    },

    artwork: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.artworkLoader.load(parent.artworkId)
    },
  },

  // ===================================
  // Exhibition Artist Type Resolvers
  // ===================================

  ExhibitionArtist: {
    exhibition: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.exhibitionLoader.load(parent.exhibitionId)
    },

    artist: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.artistLoader.load(parent.artistId)
    },
  },

  // ===================================
  // Event Type Resolvers
  // ===================================

  Event: {
    organizer: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.organizerId) return null
      return context.loaders.userLoader.load(parent.organizerId)
    },

    participants: async (parent: any, _: any, context: GraphQLContext) => {
      const participants = await context.db.query.eventParticipants.findMany({
        where: eq(schema.eventParticipants.eventId, parent.id),
      })
      return participants
    },

    // Parse JSON fields
    images: (parent: any) => {
      if (!parent.images) return []
      return typeof parent.images === 'string' ? JSON.parse(parent.images) : parent.images
    },

    materials: (parent: any) => {
      if (!parent.materials) return []
      return typeof parent.materials === 'string' ? JSON.parse(parent.materials) : parent.materials
    },

    metadata: (parent: any) => {
      if (!parent.metadata) return null
      return typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata
    },
  },

  // ===================================
  // Event Participant Type Resolvers
  // ===================================

  EventParticipant: {
    event: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.eventLoader.load(parent.eventId)
    },

    user: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.userLoader.load(parent.userId)
    },
  },

  // ===================================
  // Gallery Type Resolvers
  // ===================================

  Gallery: {
    artworks: async (parent: any, _: any, context: GraphQLContext) => {
      const galleryArtworks = await context.db.query.galleryArtworks.findMany({
        where: eq(schema.galleryArtworks.galleryId, parent.id),
        orderBy: [schema.galleryArtworks.displayOrder],
      })
      return galleryArtworks
    },

    // Parse JSON fields
    metadata: (parent: any) => {
      if (!parent.metadata) return null
      return typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata
    },
  },

  // ===================================
  // Gallery Artwork Type Resolvers
  // ===================================

  GalleryArtwork: {
    gallery: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.galleryLoader.load(parent.galleryId)
    },

    artwork: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.artworkLoader.load(parent.artworkId)
    },
  },

  // ===================================
  // News Type Resolvers
  // ===================================

  News: {
    author: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.authorId) return null
      return context.loaders.userLoader.load(parent.authorId)
    },

    // Parse JSON fields
    images: (parent: any) => {
      if (!parent.images) return []
      return typeof parent.images === 'string' ? JSON.parse(parent.images) : parent.images
    },

    tags: (parent: any) => {
      if (!parent.tags) return []
      return typeof parent.tags === 'string' ? JSON.parse(parent.tags) : parent.tags
    },

    metadata: (parent: any) => {
      if (!parent.metadata) return null
      return typeof parent.metadata === 'string' ? JSON.parse(parent.metadata) : parent.metadata
    },
  },

  // ===================================
  // Custom Scalar Resolvers
  // ===================================

  DateTime: {
    // Serialize Date to ISO string
    serialize: (value: any) => {
      if (value instanceof Date) {
        return value.toISOString()
      }
      if (typeof value === 'number') {
        return new Date(value * 1000).toISOString() // Unix timestamp
      }
      return value
    },

    // Parse ISO string to Date
    parseValue: (value: any) => {
      if (typeof value === 'string') {
        return new Date(value)
      }
      return value
    },

    // Parse literal AST to Date
    parseLiteral: (ast: any) => {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value)
      }
      return null
    },
  },

  JSON: {
    // Serialize JSON to string
    serialize: (value: any) => value,

    // Parse string to JSON
    parseValue: (value: any) => value,

    // Parse literal AST to JSON
    parseLiteral: (ast: any) => {
      switch (ast.kind) {
        case 'StringValue':
        case 'BooleanValue':
          return ast.value
        case 'IntValue':
        case 'FloatValue':
          return parseFloat(ast.value)
        case 'ObjectValue':
          return ast.fields.reduce((acc: any, field: any) => {
            acc[field.name.value] = typeResolvers.JSON.parseLiteral(field.value)
            return acc
          }, {})
        case 'ListValue':
          return ast.values.map((v: any) => typeResolvers.JSON.parseLiteral(v))
        default:
          return null
      }
    },
  },
}
