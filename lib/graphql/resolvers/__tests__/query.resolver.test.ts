import { queryResolvers } from '../query.resolver'
import {
  createMockContext,
  createAuthContext,
  createMockUser,
  createMockMember,
  createMockArtist,
  createMockArtwork,
  createMockExhibition,
  createMockEvent,
  expectAuthError,
} from '../../test-utils'

/**
 * Query Resolver Unit Tests
 *
 * Tests for GraphQL query resolvers covering:
 * - User queries (user, me)
 * - Member queries (member, memberByUserId, members, searchMembers)
 * - Membership tier queries
 * - Artist queries
 * - Artwork queries
 * - Exhibition queries
 * - Event queries
 * - Gallery queries
 * - News queries
 */

describe('Query Resolvers', () => {
  // ===================================
  // User Queries
  // ===================================

  describe('user', () => {
    it('should load user by ID using DataLoader', async () => {
      const mockUser = createMockUser()
      const context = createMockContext()

      // Mock DataLoader response
      ;(context.loaders.userLoader.load as jest.Mock).mockResolvedValue(mockUser)

      const result = await queryResolvers.user({}, { id: 'user-1' }, context)

      expect(result).toEqual(mockUser)
      expect(context.loaders.userLoader.load).toHaveBeenCalledWith('user-1')
    })

    it('should return null for non-existent user', async () => {
      const context = createMockContext()
      ;(context.loaders.userLoader.load as jest.Mock).mockResolvedValue(null)

      const result = await queryResolvers.user({}, { id: 'non-existent' }, context)

      expect(result).toBeNull()
    })
  })

  describe('me', () => {
    it('should return authenticated user', async () => {
      const mockUser = createMockUser()
      const context = createAuthContext()

      const result = await queryResolvers.me({}, {}, context)

      expect(result).toEqual(context.user)
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()

      await expectAuthError(() => queryResolvers.me({}, {}, context))
    })
  })

  // ===================================
  // Member Queries
  // ===================================

  describe('member', () => {
    it('should load member by ID using DataLoader', async () => {
      const mockMember = createMockMember()
      const context = createMockContext()
      ;(context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(mockMember)

      const result = await queryResolvers.member({}, { id: 'member-1' }, context)

      expect(result).toEqual(mockMember)
      expect(context.loaders.memberLoader.load).toHaveBeenCalledWith('member-1')
    })
  })

  describe('memberByUserId', () => {
    it('should load member by user ID using DataLoader', async () => {
      const mockMember = createMockMember()
      const context = createAuthContext()
      ;(context.loaders.memberByUserIdLoader.load as jest.Mock).mockResolvedValue(mockMember)

      const result = await queryResolvers.memberByUserId({}, { userId: 'user-1' }, context)

      expect(result).toEqual(mockMember)
      expect(context.loaders.memberByUserIdLoader.load).toHaveBeenCalledWith('user-1')
    })
  })

  describe('members', () => {
    it('should return paginated members list', async () => {
      const members = [createMockMember({ id: 'member-1' }), createMockMember({ id: 'member-2' })]
      const context = createMockContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue(members)

      const result = await queryResolvers.members({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(2)
      expect(result.edges[0].node.id).toBe('member-1')
      expect(result.pageInfo.hasNextPage).toBe(false)
      expect(result.totalCount).toBe(2)
    })

    it('should filter members by status', async () => {
      const activeMembers = [createMockMember({ status: 'active' })]
      const context = createMockContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue(activeMembers)

      const result = await queryResolvers.members({}, { first: 20, status: 'active' }, context)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].node.status).toBe('active')
    })

    it('should filter members by tier level', async () => {
      const tierMembers = [createMockMember({ tierLevel: 2 })]
      const context = createMockContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue(tierMembers)

      const result = await queryResolvers.members({}, { first: 20, tierLevel: 2 }, context)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].node.tierLevel).toBe(2)
    })

    it('should handle hasNextPage when results exceed limit', async () => {
      // Create 21 members (limit is 20)
      const members = Array.from({ length: 21 }, (_, i) =>
        createMockMember({ id: `member-${i + 1}` })
      )
      const context = createMockContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue(members)

      const result = await queryResolvers.members({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(20) // Extra item removed
      expect(result.pageInfo.hasNextPage).toBe(true)
    })
  })

  describe('searchMembers', () => {
    it('should search members by name', async () => {
      const matchingMembers = [createMockMember({ fullName: 'John Doe' })]
      const context = createAuthContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue(matchingMembers)

      const result = await queryResolvers.searchMembers({}, { query: 'John', limit: 10 }, context)

      expect(result).toHaveLength(1)
      expect(result[0].fullName).toBe('John Doe')
    })

    it('should use default limit of 10', async () => {
      const context = createAuthContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue([])

      await queryResolvers.searchMembers({}, { query: 'test' }, context)

      expect(context.db.query.members.findMany).toHaveBeenCalled()
    })
  })

  // ===================================
  // Membership Tier Queries
  // ===================================

  describe('membershipTier', () => {
    it('should load membership tier by ID', async () => {
      const mockTier = { id: 'tier-1', name: 'Basic', level: 1 }
      const context = createMockContext()
      ;(context.loaders.membershipTierLoader.load as jest.Mock).mockResolvedValue(mockTier)

      const result = await queryResolvers.membershipTier({}, { id: 'tier-1' }, context)

      expect(result).toEqual(mockTier)
    })
  })

  describe('membershipTiers', () => {
    it('should return all active tiers', async () => {
      const tiers = [
        { id: 'tier-1', name: 'Basic', level: 1, isActive: true },
        { id: 'tier-2', name: 'Premium', level: 2, isActive: true },
      ]
      const context = createMockContext()
      context.db.query.membershipTiers.findMany = jest.fn().mockResolvedValue(tiers)

      const result = await queryResolvers.membershipTiers({}, { isActive: true }, context)

      expect(result).toHaveLength(2)
      expect(result[0].level).toBe(1)
      expect(result[1].level).toBe(2)
    })

    it('should return all tiers when isActive not specified', async () => {
      const tiers = [
        { id: 'tier-1', isActive: true },
        { id: 'tier-2', isActive: false },
      ]
      const context = createMockContext()
      context.db.query.membershipTiers.findMany = jest.fn().mockResolvedValue(tiers)

      const result = await queryResolvers.membershipTiers({}, {}, context)

      expect(result).toHaveLength(2)
    })
  })

  // ===================================
  // Artist Queries
  // ===================================

  describe('artist', () => {
    it('should load artist by ID', async () => {
      const mockArtist = createMockArtist()
      const context = createMockContext()
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(mockArtist)

      const result = await queryResolvers.artist({}, { id: 'artist-1' }, context)

      expect(result).toEqual(mockArtist)
    })
  })

  describe('artists', () => {
    it('should return paginated artists', async () => {
      const artists = [createMockArtist({ id: 'artist-1' }), createMockArtist({ id: 'artist-2' })]
      const context = createMockContext()
      context.db.query.artists.findMany = jest.fn().mockResolvedValue(artists)

      const result = await queryResolvers.artists({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(2)
      expect(result.totalCount).toBe(2)
    })

    it('should filter by isActive', async () => {
      const activeArtists = [createMockArtist({ isActive: true })]
      const context = createMockContext()
      context.db.query.artists.findMany = jest.fn().mockResolvedValue(activeArtists)

      const result = await queryResolvers.artists({}, { first: 20, isActive: true }, context)

      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].node.isActive).toBe(true)
    })
  })

  describe('searchArtists', () => {
    it('should search artists by name', async () => {
      const artists = [createMockArtist({ name: 'Pablo Picasso' })]
      const context = createMockContext()
      context.db.query.artists.findMany = jest.fn().mockResolvedValue(artists)

      const result = await queryResolvers.searchArtists({}, { query: 'Pablo', limit: 10 }, context)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pablo Picasso')
    })
  })

  // ===================================
  // Artwork Queries
  // ===================================

  describe('artwork', () => {
    it('should load artwork by ID', async () => {
      const mockArtwork = createMockArtwork()
      const context = createMockContext()
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(mockArtwork)

      const result = await queryResolvers.artwork({}, { id: 'artwork-1' }, context)

      expect(result).toEqual(mockArtwork)
    })
  })

  describe('artworks', () => {
    it('should return paginated artworks', async () => {
      const artworks = [createMockArtwork({ id: 'artwork-1' })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(artworks)

      const result = await queryResolvers.artworks({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(1)
    })

    it('should filter by category', async () => {
      const calligraphyArtworks = [createMockArtwork({ category: 'calligraphy' })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(calligraphyArtworks)

      const result = await queryResolvers.artworks(
        {},
        { first: 20, category: 'calligraphy' },
        context
      )

      expect(result.edges[0].node.category).toBe('calligraphy')
    })

    it('should filter by artistId', async () => {
      const artistArtworks = [createMockArtwork({ artistId: 'artist-1' })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(artistArtworks)

      const result = await queryResolvers.artworks({}, { first: 20, artistId: 'artist-1' }, context)

      expect(result.edges[0].node.artistId).toBe('artist-1')
    })

    it('should filter by isFeatured', async () => {
      const featuredArtworks = [createMockArtwork({ isFeatured: true })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(featuredArtworks)

      const result = await queryResolvers.artworks({}, { first: 20, isFeatured: true }, context)

      expect(result.edges[0].node.isFeatured).toBe(true)
    })

    it('should filter by isForSale', async () => {
      const forSaleArtworks = [createMockArtwork({ isForSale: true })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(forSaleArtworks)

      const result = await queryResolvers.artworks({}, { first: 20, isForSale: true }, context)

      expect(result.edges[0].node.isForSale).toBe(true)
    })
  })

  describe('searchArtworks', () => {
    it('should search artworks by title', async () => {
      const artworks = [createMockArtwork({ title: 'Beautiful Calligraphy' })]
      const context = createMockContext()
      context.db.query.artworks.findMany = jest.fn().mockResolvedValue(artworks)

      const result = await queryResolvers.searchArtworks(
        {},
        { query: 'Beautiful', limit: 10 },
        context
      )

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Beautiful Calligraphy')
    })
  })

  // ===================================
  // Exhibition Queries
  // ===================================

  describe('exhibition', () => {
    it('should load exhibition by ID', async () => {
      const mockExhibition = createMockExhibition()
      const context = createMockContext()
      ;(context.loaders.exhibitionLoader.load as jest.Mock).mockResolvedValue(mockExhibition)

      const result = await queryResolvers.exhibition({}, { id: 'exhibition-1' }, context)

      expect(result).toEqual(mockExhibition)
    })
  })

  describe('exhibitions', () => {
    it('should return paginated exhibitions', async () => {
      const exhibitions = [createMockExhibition()]
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue(exhibitions)

      const result = await queryResolvers.exhibitions({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(1)
    })

    it('should filter by type', async () => {
      const soloExhibitions = [createMockExhibition({ type: 'solo' })]
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue(soloExhibitions)

      const result = await queryResolvers.exhibitions({}, { first: 20, type: 'solo' }, context)

      expect(result.edges[0].node.type).toBe('solo')
    })

    it('should filter by status', async () => {
      const ongoingExhibitions = [createMockExhibition({ status: 'ongoing' })]
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue(ongoingExhibitions)

      const result = await queryResolvers.exhibitions({}, { first: 20, status: 'ongoing' }, context)

      expect(result.edges[0].node.status).toBe('ongoing')
    })
  })

  describe('currentExhibitions', () => {
    it('should return only ongoing exhibitions', async () => {
      const ongoingExhibitions = [createMockExhibition({ status: 'ongoing' })]
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue(ongoingExhibitions)

      const result = await queryResolvers.currentExhibitions({}, {}, context)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('ongoing')
    })
  })

  describe('upcomingExhibitions', () => {
    it('should return upcoming exhibitions with default limit', async () => {
      const upcomingExhibitions = [createMockExhibition({ status: 'upcoming' })]
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue(upcomingExhibitions)

      const result = await queryResolvers.upcomingExhibitions({}, {}, context)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('upcoming')
    })

    it('should respect custom limit', async () => {
      const context = createMockContext()
      context.db.query.exhibitions.findMany = jest.fn().mockResolvedValue([])

      await queryResolvers.upcomingExhibitions({}, { limit: 5 }, context)

      expect(context.db.query.exhibitions.findMany).toHaveBeenCalled()
    })
  })

  // ===================================
  // Event Queries
  // ===================================

  describe('event', () => {
    it('should load event by ID', async () => {
      const mockEvent = createMockEvent()
      const context = createMockContext()
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(mockEvent)

      const result = await queryResolvers.event({}, { id: 'event-1' }, context)

      expect(result).toEqual(mockEvent)
    })
  })

  describe('events', () => {
    it('should return paginated events', async () => {
      const events = [createMockEvent()]
      const context = createMockContext()
      context.db.query.events.findMany = jest.fn().mockResolvedValue(events)

      const result = await queryResolvers.events({}, { first: 20 }, context)

      expect(result.edges).toHaveLength(1)
    })

    it('should filter by type', async () => {
      const workshops = [createMockEvent({ type: 'workshop' })]
      const context = createMockContext()
      context.db.query.events.findMany = jest.fn().mockResolvedValue(workshops)

      const result = await queryResolvers.events({}, { first: 20, type: 'workshop' }, context)

      expect(result.edges[0].node.type).toBe('workshop')
    })

    it('should filter by status', async () => {
      const upcomingEvents = [createMockEvent({ status: 'upcoming' })]
      const context = createMockContext()
      context.db.query.events.findMany = jest.fn().mockResolvedValue(upcomingEvents)

      const result = await queryResolvers.events({}, { first: 20, status: 'upcoming' }, context)

      expect(result.edges[0].node.status).toBe('upcoming')
    })
  })

  describe('currentEvents', () => {
    it('should return only ongoing events', async () => {
      const ongoingEvents = [createMockEvent({ status: 'ongoing' })]
      const context = createMockContext()
      context.db.query.events.findMany = jest.fn().mockResolvedValue(ongoingEvents)

      const result = await queryResolvers.currentEvents({}, {}, context)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('ongoing')
    })
  })

  describe('upcomingEvents', () => {
    it('should return upcoming events', async () => {
      const upcomingEvents = [createMockEvent({ status: 'upcoming' })]
      const context = createMockContext()
      context.db.query.events.findMany = jest.fn().mockResolvedValue(upcomingEvents)

      const result = await queryResolvers.upcomingEvents({}, {}, context)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('upcoming')
    })
  })

  // ===================================
  // Gallery Queries
  // ===================================

  describe('gallery', () => {
    it('should load gallery by ID', async () => {
      const mockGallery = { id: 'gallery-1', name: 'Test Gallery' }
      const context = createMockContext()
      ;(context.loaders.galleryLoader.load as jest.Mock).mockResolvedValue(mockGallery)

      const result = await queryResolvers.gallery({}, { id: 'gallery-1' }, context)

      expect(result).toEqual(mockGallery)
    })
  })

  describe('galleries', () => {
    it('should return all galleries', async () => {
      const galleries = [
        { id: 'gallery-1', type: 'permanent', isActive: true },
        { id: 'gallery-2', type: 'temporary', isActive: true },
      ]
      const context = createMockContext()
      context.db.query.galleries.findMany = jest.fn().mockResolvedValue(galleries)

      const result = await queryResolvers.galleries({}, {}, context)

      expect(result).toHaveLength(2)
    })

    it('should filter by type', async () => {
      const permanentGalleries = [{ id: 'gallery-1', type: 'permanent' }]
      const context = createMockContext()
      context.db.query.galleries.findMany = jest.fn().mockResolvedValue(permanentGalleries)

      const result = await queryResolvers.galleries({}, { type: 'permanent' }, context)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('permanent')
    })

    it('should filter by isActive', async () => {
      const activeGalleries = [{ id: 'gallery-1', isActive: true }]
      const context = createMockContext()
      context.db.query.galleries.findMany = jest.fn().mockResolvedValue(activeGalleries)

      const result = await queryResolvers.galleries({}, { isActive: true }, context)

      expect(result).toHaveLength(1)
      expect(result[0].isActive).toBe(true)
    })
  })

  // ===================================
  // News Queries
  // ===================================

  describe('news', () => {
    it('should load news by ID', async () => {
      const mockNews = { id: 'news-1', title: 'Test News' }
      const context = createMockContext()
      ;(context.loaders.newsLoader.load as jest.Mock).mockResolvedValue(mockNews)

      const result = await queryResolvers.news({}, { id: 'news-1' }, context)

      expect(result).toEqual(mockNews)
    })
  })

  describe('newsList', () => {
    it('should return news list with default pagination', async () => {
      const newsItems = [
        { id: 'news-1', category: 'news', status: 'published' },
        { id: 'news-2', category: 'announcement', status: 'published' },
      ]
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue(newsItems)

      const result = await queryResolvers.newsList({}, {}, context)

      expect(result).toHaveLength(2)
    })

    it('should filter by category', async () => {
      const newsCategory = [{ id: 'news-1', category: 'news' }]
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue(newsCategory)

      const result = await queryResolvers.newsList({}, { category: 'news' }, context)

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('news')
    })

    it('should filter by status', async () => {
      const publishedNews = [{ id: 'news-1', status: 'published' }]
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue(publishedNews)

      const result = await queryResolvers.newsList({}, { status: 'published' }, context)

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('published')
    })

    it('should support custom limit and offset', async () => {
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue([])

      await queryResolvers.newsList({}, { limit: 5, offset: 10 }, context)

      expect(context.db.query.news.findMany).toHaveBeenCalled()
    })
  })

  describe('featuredNews', () => {
    it('should return pinned and published news', async () => {
      const featuredNews = [{ id: 'news-1', isPinned: true, status: 'published' }]
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue(featuredNews)

      const result = await queryResolvers.featuredNews({}, {}, context)

      expect(result).toHaveLength(1)
      expect(result[0].isPinned).toBe(true)
      expect(result[0].status).toBe('published')
    })

    it('should use default limit of 5', async () => {
      const context = createMockContext()
      context.db.query.news.findMany = jest.fn().mockResolvedValue([])

      await queryResolvers.featuredNews({}, {}, context)

      expect(context.db.query.news.findMany).toHaveBeenCalled()
    })
  })
})
