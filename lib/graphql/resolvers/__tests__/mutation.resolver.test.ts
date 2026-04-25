import { mutationResolvers } from '../mutation.resolver'
import {
  createMockContext,
  createAuthContext,
  createAdminContext,
  createMockMember,
  createMockArtist,
  createMockArtwork,
  createMockEvent,
  expectAuthError,
  expectAuthzError,
} from '../../test-utils'

/**
 * Mutation Resolver Unit Tests
 *
 * Tests for GraphQL mutation resolvers covering:
 * - Member mutations (create, update, approve, reject)
 * - Membership application mutations (submit, review)
 * - Artist mutations (create, update)
 * - Artwork mutations (create, update, delete)
 * - Event mutations (register, cancel)
 */

describe('Mutation Resolvers', () => {
  // ===================================
  // Member Mutations
  // ===================================

  describe('createMember', () => {
    it('should create a new member with generated membership number', async () => {
      const input = {
        userId: 'user-1',
        fullName: 'New Member',
        nationality: 'KR',
        country: 'South Korea',
      }

      const createdMember = createMockMember(input)
      const context = createAuthContext()

      // Mock database queries
      context.db.query.members.findMany = jest.fn().mockResolvedValue([])
      const insertMock = jest.fn().mockReturnThis()
      const valuesMock = jest.fn().mockReturnThis()
      const returningMock = jest.fn().mockResolvedValue([createdMember])

      context.db.insert = jest.fn(() => ({
        values: jest.fn(() => ({
          returning: returningMock,
        })),
      }))

      const result = await mutationResolvers.createMember({}, { input }, context)

      expect(result).toEqual(createdMember)
      expect(result.membershipNumber).toMatch(/^ASCA-\d{4}-\d{3}$/)
    })

    it('should throw error when not authenticated', async () => {
      const input = { userId: 'user-1', fullName: 'New Member' }
      const context = createMockContext()

      await expectAuthError(() => mutationResolvers.createMember({}, { input }, context))
    })

    it('should start with tierLevel 1 and pending_approval status', async () => {
      const input = {
        userId: 'user-1',
        fullName: 'New Member',
        nationality: 'KR',
        country: 'South Korea',
      }

      const context = createAuthContext()
      context.db.query.members.findMany = jest.fn().mockResolvedValue([])

      const capturedValues: any = {}
      context.db.insert = jest.fn(() => ({
        values: jest.fn(vals => {
          Object.assign(capturedValues, vals)
          return {
            returning: jest.fn().mockResolvedValue([createMockMember()]),
          }
        }),
      }))

      await mutationResolvers.createMember({}, { input }, context)

      expect(capturedValues.tierLevel).toBe(1)
      expect(capturedValues.status).toBe('pending_approval')
    })
  })

  describe('updateMember', () => {
    it('should update member when user owns the record', async () => {
      const member = createMockMember({ id: 'member-1', userId: 'user-1' })
      const input = { fullName: 'Updated Name' }
      const updatedMember = { ...member, ...input }

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member)
      ;(context.loaders.memberLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedMember]),
      }))

      const result = await mutationResolvers.updateMember({}, { id: 'member-1', input }, context)

      expect(result.fullName).toBe('Updated Name')
      expect(context.loaders.memberLoader.clear).toHaveBeenCalledWith('member-1')
    })

    it('should allow admin to update any member', async () => {
      const member = createMockMember({ id: 'member-1', userId: 'other-user' })
      const input = { fullName: 'Admin Updated' }

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member)

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...member, ...input }]),
      }))

      const result = await mutationResolvers.updateMember({}, { id: 'member-1', input }, context)

      expect(result.fullName).toBe('Admin Updated')
    })

    it('should throw error when user does not own the record', async () => {
      const member = createMockMember({ id: 'member-1', userId: 'other-user' })

      const context = createAuthContext({ id: 'user-1', role: 'member' })
      ;(context.loaders.memberLoader.load as jest.Mock).mockResolvedValue(member)

      await expectAuthzError(() =>
        mutationResolvers.updateMember({}, { id: 'member-1', input: {} }, context)
      )
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()

      await expectAuthError(() =>
        mutationResolvers.updateMember({}, { id: 'member-1', input: {} }, context)
      )
    })
  })

  describe('approveMember', () => {
    it('should approve member and set status to active (admin only)', async () => {
      const member = createMockMember({ id: 'member-1', status: 'pending_approval' })
      const approvedMember = { ...member, status: 'active' }

      const context = createAdminContext()
      ;(context.loaders.memberLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([approvedMember]),
      }))

      const result = await mutationResolvers.approveMember({}, { id: 'member-1' }, context)

      expect(result.status).toBe('active')
      expect(context.loaders.memberLoader.clear).toHaveBeenCalledWith('member-1')
    })

    it('should throw error when not admin', async () => {
      const context = createAuthContext({ role: 'member' })

      await expectAuthzError(() => mutationResolvers.approveMember({}, { id: 'member-1' }, context))
    })
  })

  describe('rejectMember', () => {
    it('should reject member and set status to inactive (admin only)', async () => {
      const member = createMockMember({ id: 'member-1', status: 'pending_approval' })
      const rejectedMember = { ...member, status: 'inactive', notes: 'Application rejected' }

      const context = createAdminContext()
      ;(context.loaders.memberLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([rejectedMember]),
      }))

      const result = await mutationResolvers.rejectMember(
        {},
        { id: 'member-1', reason: 'Application rejected' },
        context
      )

      expect(result.status).toBe('inactive')
      expect(result.notes).toBe('Application rejected')
    })

    it('should use default reason if not provided', async () => {
      const context = createAdminContext()

      const capturedSetValues: any = {}
      context.db.update = jest.fn(() => ({
        set: jest.fn(vals => {
          Object.assign(capturedSetValues, vals)
          return {
            where: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([createMockMember()]),
          }
        }),
      }))

      await mutationResolvers.rejectMember({}, { id: 'member-1' }, context)

      expect(capturedSetValues.notes).toBe('Application rejected')
    })

    it('should throw error when not admin', async () => {
      const context = createAuthContext({ role: 'member' })

      await expectAuthzError(() => mutationResolvers.rejectMember({}, { id: 'member-1' }, context))
    })
  })

  // ===================================
  // Membership Application Mutations
  // ===================================

  describe('submitMembershipApplication', () => {
    it('should submit membership application', async () => {
      const input = {
        memberId: 'member-1',
        requestedTierLevel: 2,
        applicationType: 'upgrade',
        applicationReason: 'I want to upgrade',
      }

      const application = {
        ...input,
        id: 'app-1',
        status: 'pending',
        submittedAt: new Date(),
      }

      const context = createAuthContext()

      context.db.insert = jest.fn(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([application]),
      }))

      const result = await mutationResolvers.submitMembershipApplication({}, { input }, context)

      expect(result.status).toBe('pending')
      expect(result.memberId).toBe('member-1')
      expect(result.requestedTierLevel).toBe(2)
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()
      const input = { memberId: 'member-1', requestedTierLevel: 2 }

      await expectAuthError(() =>
        mutationResolvers.submitMembershipApplication({}, { input }, context)
      )
    })
  })

  describe('reviewMembershipApplication', () => {
    it('should review and approve application (admin only)', async () => {
      const application = {
        id: 'app-1',
        memberId: 'member-1',
        requestedTierLevel: 2,
        status: 'approved',
      }

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.memberLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([application]),
      }))

      context.db.query.membershipApplications.findFirst = jest.fn().mockResolvedValue(application)

      const result = await mutationResolvers.reviewMembershipApplication(
        {},
        {
          id: 'app-1',
          status: 'approved',
          comments: 'Looks good',
          score: 85,
        },
        context
      )

      expect(result.status).toBe('approved')
    })

    it('should update member tier when application is approved', async () => {
      const application = {
        id: 'app-1',
        memberId: 'member-1',
        requestedTierLevel: 3,
      }

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.memberLoader.clear as jest.Mock) = jest.fn()

      const reviewedApp = { ...application, status: 'approved' }

      let memberUpdateCalled = false
      context.db.update = jest.fn((table: any) => {
        // Return different behavior based on which table is being updated
        if (memberUpdateCalled) {
          // Second call is for members table
          return {
            set: jest.fn(vals => {
              expect(vals.tierLevel).toBe(3)
              expect(vals.status).toBe('active')
              return {
                where: jest.fn().mockReturnThis(),
              }
            }),
          }
        }
        // First call is for applications table
        memberUpdateCalled = true
        return {
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([reviewedApp]),
        }
      })

      context.db.query.membershipApplications.findFirst = jest.fn().mockResolvedValue(application)

      await mutationResolvers.reviewMembershipApplication(
        {},
        {
          id: 'app-1',
          status: 'approved',
        },
        context
      )

      expect(context.loaders.memberLoader.clear).toHaveBeenCalledWith('member-1')
    })

    it('should throw error when not admin', async () => {
      const context = createAuthContext({ role: 'member' })

      await expectAuthzError(() =>
        mutationResolvers.reviewMembershipApplication(
          {},
          { id: 'app-1', status: 'approved' },
          context
        )
      )
    })
  })

  // ===================================
  // Artist Mutations
  // ===================================

  describe('createArtist', () => {
    it('should create artist profile', async () => {
      const input = {
        name: 'New Artist',
        nameKo: '신규 작가',
        bio: 'Artist bio',
      }

      const artist = createMockArtist(input)

      const context = createAuthContext()

      context.db.insert = jest.fn(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([artist]),
      }))

      const result = await mutationResolvers.createArtist({}, { input }, context)

      expect(result.name).toBe('New Artist')
      expect(result.isActive).toBe(true)
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()

      await expectAuthError(() => mutationResolvers.createArtist({}, { input: {} }, context))
    })
  })

  describe('updateArtist', () => {
    it('should update artist when user owns the record', async () => {
      const artist = createMockArtist({ id: 'artist-1', userId: 'user-1' })
      const input = { name: 'Updated Name' }

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)
      ;(context.loaders.artistLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...artist, ...input }]),
      }))

      const result = await mutationResolvers.updateArtist({}, { id: 'artist-1', input }, context)

      expect(result.name).toBe('Updated Name')
      expect(context.loaders.artistLoader.clear).toHaveBeenCalledWith('artist-1')
    })

    it('should allow admin to update any artist', async () => {
      const artist = createMockArtist({ id: 'artist-1', userId: 'other-user' })
      const input = { name: 'Admin Updated' }

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...artist, ...input }]),
      }))

      const result = await mutationResolvers.updateArtist({}, { id: 'artist-1', input }, context)

      expect(result.name).toBe('Admin Updated')
    })

    it('should throw error when user does not own the record', async () => {
      const artist = createMockArtist({ id: 'artist-1', userId: 'other-user' })

      const context = createAuthContext({ id: 'user-1', role: 'member' })
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)

      await expectAuthzError(() =>
        mutationResolvers.updateArtist({}, { id: 'artist-1', input: {} }, context)
      )
    })
  })

  // ===================================
  // Artwork Mutations
  // ===================================

  describe('createArtwork', () => {
    it('should create artwork', async () => {
      const input = {
        artistId: 'artist-1',
        title: 'New Artwork',
        category: 'calligraphy',
      }

      const artwork = createMockArtwork(input)

      const context = createAuthContext()
      ;(context.loaders.artworksByArtistLoader.clear as jest.Mock) = jest.fn()

      context.db.insert = jest.fn(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([artwork]),
      }))

      const result = await mutationResolvers.createArtwork({}, { input }, context)

      expect(result.title).toBe('New Artwork')
      expect(result.isFeatured).toBe(false)
      expect(context.loaders.artworksByArtistLoader.clear).toHaveBeenCalledWith('artist-1')
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()

      await expectAuthError(() => mutationResolvers.createArtwork({}, { input: {} }, context))
    })
  })

  describe('updateArtwork', () => {
    it('should update artwork when user owns the artist', async () => {
      const artwork = createMockArtwork({ id: 'artwork-1', artistId: 'artist-1' })
      const artist = createMockArtist({ id: 'artist-1', userId: 'user-1' })
      const input = { title: 'Updated Title' }

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork)
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)
      ;(context.loaders.artworkLoader.clear as jest.Mock) = jest.fn()
      ;(context.loaders.artworksByArtistLoader.clear as jest.Mock) = jest.fn()

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...artwork, ...input }]),
      }))

      const result = await mutationResolvers.updateArtwork({}, { id: 'artwork-1', input }, context)

      expect(result.title).toBe('Updated Title')
    })

    it('should allow admin to update any artwork', async () => {
      const artwork = createMockArtwork({ id: 'artwork-1', artistId: 'artist-1' })
      const artist = createMockArtist({ id: 'artist-1', userId: 'other-user' })

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork)
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([artwork]),
      }))

      await mutationResolvers.updateArtwork({}, { id: 'artwork-1', input: {} }, context)

      // Should not throw error
      expect(true).toBe(true)
    })

    it('should throw error when user does not own the artwork', async () => {
      const artwork = createMockArtwork({ id: 'artwork-1', artistId: 'artist-1' })
      const artist = createMockArtist({ id: 'artist-1', userId: 'other-user' })

      const context = createAuthContext({ id: 'user-1', role: 'member' })
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork)
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)

      await expectAuthzError(() =>
        mutationResolvers.updateArtwork({}, { id: 'artwork-1', input: {} }, context)
      )
    })
  })

  describe('deleteArtwork', () => {
    it('should delete artwork when user owns the artist', async () => {
      const artwork = createMockArtwork({ id: 'artwork-1', artistId: 'artist-1' })
      const artist = createMockArtist({ id: 'artist-1', userId: 'user-1' })

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork)
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)
      ;(context.loaders.artworkLoader.clear as jest.Mock) = jest.fn()
      ;(context.loaders.artworksByArtistLoader.clear as jest.Mock) = jest.fn()

      context.db.delete = jest.fn(() => ({
        where: jest.fn().mockResolvedValue(undefined),
      }))

      const result = await mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context)

      expect(result).toBe(true)
      expect(context.loaders.artworkLoader.clear).toHaveBeenCalledWith('artwork-1')
      expect(context.loaders.artworksByArtistLoader.clear).toHaveBeenCalledWith('artist-1')
    })

    it('should throw error when user does not own the artwork', async () => {
      const artwork = createMockArtwork({ id: 'artwork-1', artistId: 'artist-1' })
      const artist = createMockArtist({ id: 'artist-1', userId: 'other-user' })

      const context = createAuthContext({ id: 'user-1', role: 'member' })
      ;(context.loaders.artworkLoader.load as jest.Mock).mockResolvedValue(artwork)
      ;(context.loaders.artistLoader.load as jest.Mock).mockResolvedValue(artist)

      await expectAuthzError(() =>
        mutationResolvers.deleteArtwork({}, { id: 'artwork-1' }, context)
      )
    })
  })

  // ===================================
  // Event Mutations
  // ===================================

  describe('registerForEvent', () => {
    it('should register user for event', async () => {
      const event = createMockEvent({
        id: 'event-1',
        maxParticipants: 10,
        currentParticipants: 5,
      })

      const participant = {
        id: 'participant-1',
        eventId: 'event-1',
        userId: 'user-1',
        status: 'registered',
      }

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event)
      ;(context.loaders.eventLoader.clear as jest.Mock) = jest.fn()

      context.db.query.eventParticipants.findFirst = jest.fn().mockResolvedValue(null)

      context.db.insert = jest.fn(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([participant]),
      }))

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      }))

      const result = await mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context)

      expect(result.status).toBe('registered')
      expect(context.loaders.eventLoader.clear).toHaveBeenCalledWith('event-1')
    })

    it('should throw error when already registered', async () => {
      const existing = { id: 'participant-1', eventId: 'event-1', userId: 'user-1' }

      const context = createAuthContext({ id: 'user-1' })
      context.db.query.eventParticipants.findFirst = jest.fn().mockResolvedValue(existing)

      await expect(
        mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context)
      ).rejects.toThrow('Already registered for this event')
    })

    it('should throw error when event is full', async () => {
      const event = createMockEvent({
        id: 'event-1',
        maxParticipants: 10,
        currentParticipants: 10,
      })

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event)
      context.db.query.eventParticipants.findFirst = jest.fn().mockResolvedValue(null)

      await expect(
        mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context)
      ).rejects.toThrow('Event is full')
    })

    it('should throw error when not authenticated', async () => {
      const context = createMockContext()

      await expectAuthError(() =>
        mutationResolvers.registerForEvent({}, { eventId: 'event-1' }, context)
      )
    })
  })

  describe('cancelEventRegistration', () => {
    it('should cancel event registration', async () => {
      const participant = { id: 'participant-1', eventId: 'event-1', userId: 'user-1' }
      const event = createMockEvent({ id: 'event-1', currentParticipants: 5 })

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant)
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event)
      ;(context.loaders.eventParticipantLoader.clear as jest.Mock) = jest.fn()
      ;(context.loaders.eventLoader.clear as jest.Mock) = jest.fn()

      context.db.delete = jest.fn(() => ({
        where: jest.fn().mockResolvedValue(undefined),
      }))

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      }))

      const result = await mutationResolvers.cancelEventRegistration(
        {},
        { participantId: 'participant-1' },
        context
      )

      expect(result).toBe(true)
      expect(context.loaders.eventParticipantLoader.clear).toHaveBeenCalledWith('participant-1')
      expect(context.loaders.eventLoader.clear).toHaveBeenCalledWith('event-1')
    })

    it('should allow admin to cancel any registration', async () => {
      const participant = { id: 'participant-1', eventId: 'event-1', userId: 'other-user' }
      const event = createMockEvent({ id: 'event-1', currentParticipants: 5 })

      const context = createAdminContext({ id: 'admin-1' })
      ;(context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant)
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event)

      context.db.delete = jest.fn(() => ({
        where: jest.fn().mockResolvedValue(undefined),
      }))

      context.db.update = jest.fn(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      }))

      const result = await mutationResolvers.cancelEventRegistration(
        {},
        { participantId: 'participant-1' },
        context
      )

      expect(result).toBe(true)
    })

    it('should throw error when user does not own the registration', async () => {
      const participant = { id: 'participant-1', eventId: 'event-1', userId: 'other-user' }

      const context = createAuthContext({ id: 'user-1', role: 'member' })
      ;(context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant)

      await expectAuthzError(() =>
        mutationResolvers.cancelEventRegistration({}, { participantId: 'participant-1' }, context)
      )
    })

    it('should not allow currentParticipants to go below 0', async () => {
      const participant = { id: 'participant-1', eventId: 'event-1', userId: 'user-1' }
      const event = createMockEvent({ id: 'event-1', currentParticipants: 0 })

      const context = createAuthContext({ id: 'user-1' })
      ;(context.loaders.eventParticipantLoader.load as jest.Mock).mockResolvedValue(participant)
      ;(context.loaders.eventLoader.load as jest.Mock).mockResolvedValue(event)

      let capturedSetValue: any = {}
      context.db.delete = jest.fn(() => ({
        where: jest.fn().mockResolvedValue(undefined),
      }))

      context.db.update = jest.fn(() => ({
        set: jest.fn(vals => {
          capturedSetValue = vals
          return {
            where: jest.fn().mockResolvedValue(undefined),
          }
        }),
      }))

      await mutationResolvers.cancelEventRegistration(
        {},
        { participantId: 'participant-1' },
        context
      )

      expect(capturedSetValue.currentParticipants).toBe(0)
    })
  })
})
