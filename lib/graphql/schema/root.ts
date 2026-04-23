import gql from 'graphql-tag'

/**
 * Query / Mutation / Subscription root types
 */
export const rootTypeDefs = gql`
  type Query {
    # ===== User Queries =====
    """
    Get user by ID
    """
    user(id: ID!): User

    """
    Get current authenticated user
    """
    me: User

    # ===== Member Queries =====
    """
    Get member by ID
    """
    member(id: ID!): Member

    """
    Get member by user ID
    """
    memberByUserId(userId: ID!): Member

    """
    List members with cursor pagination
    """
    members(
      first: Int
      after: String
      last: Int
      before: String
      status: MemberStatus
      tierLevel: Int
    ): MemberConnection!

    """
    Search members by name or email
    """
    searchMembers(query: String!, limit: Int): [Member!]!

    # ===== Membership Tier Queries =====
    """
    Get membership tier by ID
    """
    membershipTier(id: ID!): MembershipTier

    """
    List all membership tiers
    """
    membershipTiers(isActive: Boolean): [MembershipTier!]!

    # ===== Artist Queries =====
    """
    Get artist by ID
    """
    artist(id: ID!): Artist

    """
    List artists with cursor pagination
    """
    artists(
      first: Int
      after: String
      last: Int
      before: String
      isActive: Boolean
    ): ArtistConnection!

    """
    Search artists by name
    """
    searchArtists(query: String!, limit: Int): [Artist!]!

    # ===== Artwork Queries =====
    """
    Get artwork by ID
    """
    artwork(id: ID!): Artwork

    """
    List artworks with cursor pagination
    """
    artworks(
      first: Int
      after: String
      last: Int
      before: String
      category: ArtworkCategory
      artistId: ID
      isFeatured: Boolean
      isForSale: Boolean
    ): ArtworkConnection!

    """
    Search artworks by title or description
    """
    searchArtworks(query: String!, limit: Int): [Artwork!]!

    # ===== Exhibition Queries =====
    """
    Get exhibition by ID
    """
    exhibition(id: ID!): Exhibition

    """
    List exhibitions with cursor pagination
    """
    exhibitions(
      first: Int
      after: String
      last: Int
      before: String
      type: ExhibitionType
      status: ExhibitionStatus
      isFeatured: Boolean
    ): ExhibitionConnection!

    """
    Get current ongoing exhibitions
    """
    currentExhibitions: [Exhibition!]!

    """
    Get upcoming exhibitions
    """
    upcomingExhibitions(limit: Int): [Exhibition!]!

    # ===== Event Queries =====
    """
    Get event by ID
    """
    event(id: ID!): Event

    """
    List events with cursor pagination
    """
    events(
      first: Int
      after: String
      last: Int
      before: String
      type: EventType
      status: EventStatus
      isFeatured: Boolean
    ): EventConnection!

    """
    Get current ongoing events
    """
    currentEvents: [Event!]!

    """
    Get upcoming events
    """
    upcomingEvents(limit: Int): [Event!]!

    # ===== Gallery Queries =====
    """
    Get gallery by ID
    """
    gallery(id: ID!): Gallery

    """
    List galleries
    """
    galleries(type: String, isActive: Boolean): [Gallery!]!

    # ===== News Queries =====
    """
    Get news by ID
    """
    news(id: ID!): News

    """
    List news items
    """
    newsList(category: NewsCategory, status: NewsStatus, limit: Int, offset: Int): [News!]!

    """
    Get featured news
    """
    featuredNews(limit: Int): [News!]!
  }

  type Mutation {
    # ===== Member Mutations =====
    """
    Create new member
    """
    createMember(input: CreateMemberInput!): Member!

    """
    Update member profile
    """
    updateMember(id: ID!, input: UpdateMemberInput!): Member!

    """
    Approve member application
    """
    approveMember(id: ID!): Member!

    """
    Reject member application
    """
    rejectMember(id: ID!, reason: String): Member!

    # ===== Membership Application Mutations =====
    """
    Submit membership application
    """
    submitMembershipApplication(input: MembershipApplicationInput!): MembershipApplication!

    """
    Review membership application
    """
    reviewMembershipApplication(
      id: ID!
      status: ApplicationStatus!
      comments: String
      score: Int
    ): MembershipApplication!

    # ===== Artist Mutations =====
    """
    Create artist profile
    """
    createArtist(input: CreateArtistInput!): Artist!

    """
    Update artist profile
    """
    updateArtist(id: ID!, input: UpdateArtistInput!): Artist!

    # ===== Artwork Mutations =====
    """
    Create artwork
    """
    createArtwork(input: CreateArtworkInput!): Artwork!

    """
    Update artwork
    """
    updateArtwork(id: ID!, input: UpdateArtworkInput!): Artwork!

    """
    Delete artwork
    """
    deleteArtwork(id: ID!): Boolean!

    # ===== Event Mutations =====
    """
    Register for event
    """
    registerForEvent(eventId: ID!, notes: String): EventParticipant!

    """
    Cancel event registration
    """
    cancelEventRegistration(participantId: ID!): Boolean!
  }

  type Subscription {
    """
    Subscribe to member updates
    """
    memberUpdated(id: ID!): Member!

    """
    Subscribe to new member registrations
    """
    memberCreated: Member!

    """
    Subscribe to artwork updates
    """
    artworkUpdated(id: ID!): Artwork!

    """
    Subscribe to exhibition updates
    """
    exhibitionUpdated(id: ID!): Exhibition!
  }
`
