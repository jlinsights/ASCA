import gql from 'graphql-tag';

/**
 * GraphQL Schema Definition
 *
 * Complete GraphQL schema for ASCA (Asian Calligraphy Association)
 * Includes types for Members, Artists, Artworks, Exhibitions, Events, and more
 */

export const typeDefs = gql`
  # ===================================
  # Scalar Types
  # ===================================

  scalar DateTime
  scalar JSON

  # ===================================
  # Enums
  # ===================================

  enum UserRole {
    ADMIN
    ARTIST
    MEMBER
    VISITOR
  }

  enum MemberStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_APPROVAL
    EXPELLED
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
    PREFER_NOT_TO_SAY
  }

  enum ArtworkCategory {
    CALLIGRAPHY
    PAINTING
    SEAL
    MIXED
  }

  enum ExhibitionType {
    SOLO
    GROUP
    SPECIAL
    PERMANENT
  }

  enum ExhibitionStatus {
    UPCOMING
    ONGOING
    COMPLETED
    CANCELLED
  }

  enum EventType {
    WORKSHOP
    LECTURE
    COMPETITION
    CEREMONY
    MEETING
  }

  enum EventStatus {
    UPCOMING
    ONGOING
    COMPLETED
    CANCELLED
  }

  enum EventParticipantStatus {
    REGISTERED
    CONFIRMED
    ATTENDED
    CANCELLED
  }

  enum ApplicationStatus {
    PENDING
    UNDER_REVIEW
    APPROVED
    REJECTED
    WITHDRAWN
  }

  enum NewsCategory {
    NEWS
    ANNOUNCEMENT
    EVENT
    PRESS
  }

  enum NewsStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  # ===================================
  # Core Types
  # ===================================

  """
  User - Base user account
  """
  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    avatar: String
    bio: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  """
  Membership Tier - Member grade levels
  """
  type MembershipTier {
    id: ID!
    name: String!
    nameKo: String!
    nameEn: String!
    nameCn: String
    nameJp: String
    description: String
    level: Int!
    requirements: JSON
    benefits: JSON
    annualFee: Float!
    currency: String!
    color: String!
    icon: String
    isActive: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    members: [Member!]!
  }

  """
  Member - Association member profile
  """
  type Member {
    id: ID!
    userId: ID!
    membershipNumber: String!
    tierLevel: Int!
    status: MemberStatus!
    joinDate: DateTime!
    lastActivityDate: DateTime

    # Personal Information
    fullName: String!
    fullNameKo: String
    fullNameEn: String
    fullNameCn: String
    fullNameJp: String
    dateOfBirth: DateTime
    gender: Gender
    nationality: String!

    # Contact Information
    phoneNumber: String
    alternateEmail: String
    emergencyContactName: String
    emergencyContactPhone: String

    # Address Information
    address: String
    city: String
    state: String
    postalCode: String
    country: String!

    # Calligraphy Information
    calligraphyExperience: Int
    specializations: [String!]
    preferredStyles: [String!]
    teachingExperience: Int
    achievements: [String!]

    # Membership Information
    participationScore: Int!
    contributionScore: Int!
    profileCompleteness: Int!

    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    user: User!
    tier: MembershipTier
    applications: [MembershipApplication!]!
    activities: [MemberActivity!]!
    certifications: [MemberCertification!]!
  }

  """
  Membership Application - Member tier application/upgrade
  """
  type MembershipApplication {
    id: ID!
    memberId: ID!
    requestedTierLevel: Int!
    applicationType: String!
    applicationReason: String
    supportingDocuments: [String!]
    portfolioItems: JSON
    references: JSON
    status: ApplicationStatus!
    reviewComments: String
    reviewScore: Int
    submittedAt: DateTime!
    reviewedAt: DateTime
    decidedAt: DateTime

    # Relations
    member: Member!
    reviewer: User
  }

  """
  Member Activity - Activity log for members
  """
  type MemberActivity {
    id: ID!
    memberId: ID!
    activityType: String!
    description: String
    points: Int!
    relatedEntityId: ID
    relatedEntityType: String
    timestamp: DateTime!

    # Relations
    member: Member!
  }

  """
  Member Certification - Member certificates and qualifications
  """
  type MemberCertification {
    id: ID!
    memberId: ID!
    certificationType: String!
    title: String!
    titleKo: String
    titleEn: String
    description: String
    level: String
    issuingAuthority: String!
    certificateNumber: String
    certificateUrl: String
    score: Int
    grade: String
    issuedAt: DateTime!
    expiresAt: DateTime
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    member: Member!
  }

  """
  Artist - Artist profile
  """
  type Artist {
    id: ID!
    userId: ID
    name: String!
    nameKo: String
    nameEn: String
    nameCn: String
    nameJp: String
    bio: String
    birthYear: Int
    nationality: String
    specialties: [String!]
    awards: JSON
    exhibitions: JSON
    profileImage: String
    website: String
    socialMedia: JSON
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    user: User
    artworks: [Artwork!]!
    exhibitionParticipations: [ExhibitionArtist!]!
  }

  """
  Artwork - Artwork/Calligraphy piece
  """
  type Artwork {
    id: ID!
    artistId: ID!
    title: String!
    titleKo: String
    titleEn: String
    titleCn: String
    titleJp: String
    description: String
    category: ArtworkCategory!
    style: String
    medium: String
    dimensions: String
    year: Int
    imageUrl: String
    imageUrls: [String!]
    price: Float
    currency: String!
    isForSale: Boolean!
    isFeatured: Boolean!
    tags: [String!]
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    artist: Artist!
    exhibitionArtworks: [ExhibitionArtwork!]!
    galleryArtworks: [GalleryArtwork!]!
  }

  """
  Exhibition - Art exhibition
  """
  type Exhibition {
    id: ID!
    title: String!
    titleKo: String
    titleEn: String
    titleCn: String
    titleJp: String
    description: String
    type: ExhibitionType!
    status: ExhibitionStatus!
    venue: String
    venueAddress: String
    startDate: DateTime!
    endDate: DateTime!
    openingHours: String
    admissionFee: Float
    currency: String!
    posterImage: String
    galleryImages: [String!]
    curatorNotes: String
    isFeatured: Boolean!
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    artworks: [ExhibitionArtwork!]!
    artists: [ExhibitionArtist!]!
  }

  """
  Exhibition Artwork - Artworks in an exhibition
  """
  type ExhibitionArtwork {
    id: ID!
    exhibitionId: ID!
    artworkId: ID!
    displayOrder: Int
    isHighlight: Boolean!
    createdAt: DateTime!

    # Relations
    exhibition: Exhibition!
    artwork: Artwork!
  }

  """
  Exhibition Artist - Artists participating in an exhibition
  """
  type ExhibitionArtist {
    id: ID!
    exhibitionId: ID!
    artistId: ID!
    role: String!
    createdAt: DateTime!

    # Relations
    exhibition: Exhibition!
    artist: Artist!
  }

  """
  Event - Association events
  """
  type Event {
    id: ID!
    title: String!
    titleKo: String
    titleEn: String
    description: String
    type: EventType!
    status: EventStatus!
    venue: String
    venueAddress: String
    startDate: DateTime!
    endDate: DateTime!
    registrationDeadline: DateTime
    maxParticipants: Int
    currentParticipants: Int!
    fee: Float
    currency: String!
    posterImage: String
    images: [String!]
    requirements: String
    materials: [String!]
    isFeatured: Boolean!
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    organizer: User
    participants: [EventParticipant!]!
  }

  """
  Event Participant - Event participation
  """
  type EventParticipant {
    id: ID!
    eventId: ID!
    userId: ID!
    status: EventParticipantStatus!
    registeredAt: DateTime!
    notes: String

    # Relations
    event: Event!
    user: User!
  }

  """
  Gallery - Gallery collection
  """
  type Gallery {
    id: ID!
    name: String!
    nameKo: String
    nameEn: String
    description: String
    type: String!
    coverImage: String
    isActive: Boolean!
    sortOrder: Int!
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    artworks: [GalleryArtwork!]!
  }

  """
  Gallery Artwork - Artworks in a gallery
  """
  type GalleryArtwork {
    id: ID!
    galleryId: ID!
    artworkId: ID!
    displayOrder: Int
    isHighlight: Boolean!
    createdAt: DateTime!

    # Relations
    gallery: Gallery!
    artwork: Artwork!
  }

  """
  News - News and announcements
  """
  type News {
    id: ID!
    title: String!
    titleKo: String
    titleEn: String
    content: String!
    contentKo: String
    contentEn: String
    excerpt: String
    category: NewsCategory!
    status: NewsStatus!
    authorId: ID
    featuredImage: String
    images: [String!]
    tags: [String!]
    publishedAt: DateTime
    isPinned: Boolean!
    viewCount: Int!
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    author: User
  }

  # ===================================
  # Pagination Types
  # ===================================

  """
  Page Info for cursor-based pagination
  """
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  """
  Member Connection for cursor pagination
  """
  type MemberConnection {
    edges: [MemberEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MemberEdge {
    node: Member!
    cursor: String!
  }

  """
  Artist Connection for cursor pagination
  """
  type ArtistConnection {
    edges: [ArtistEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ArtistEdge {
    node: Artist!
    cursor: String!
  }

  """
  Artwork Connection for cursor pagination
  """
  type ArtworkConnection {
    edges: [ArtworkEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ArtworkEdge {
    node: Artwork!
    cursor: String!
  }

  """
  Exhibition Connection for cursor pagination
  """
  type ExhibitionConnection {
    edges: [ExhibitionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ExhibitionEdge {
    node: Exhibition!
    cursor: String!
  }

  """
  Event Connection for cursor pagination
  """
  type EventConnection {
    edges: [EventEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type EventEdge {
    node: Event!
    cursor: String!
  }

  # ===================================
  # Query Root
  # ===================================

  type Query {
    # ===== User Queries =====
    """Get user by ID"""
    user(id: ID!): User

    """Get current authenticated user"""
    me: User

    # ===== Member Queries =====
    """Get member by ID"""
    member(id: ID!): Member

    """Get member by user ID"""
    memberByUserId(userId: ID!): Member

    """List members with cursor pagination"""
    members(
      first: Int
      after: String
      last: Int
      before: String
      status: MemberStatus
      tierLevel: Int
    ): MemberConnection!

    """Search members by name or email"""
    searchMembers(query: String!, limit: Int): [Member!]!

    # ===== Membership Tier Queries =====
    """Get membership tier by ID"""
    membershipTier(id: ID!): MembershipTier

    """List all membership tiers"""
    membershipTiers(isActive: Boolean): [MembershipTier!]!

    # ===== Artist Queries =====
    """Get artist by ID"""
    artist(id: ID!): Artist

    """List artists with cursor pagination"""
    artists(
      first: Int
      after: String
      last: Int
      before: String
      isActive: Boolean
    ): ArtistConnection!

    """Search artists by name"""
    searchArtists(query: String!, limit: Int): [Artist!]!

    # ===== Artwork Queries =====
    """Get artwork by ID"""
    artwork(id: ID!): Artwork

    """List artworks with cursor pagination"""
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

    """Search artworks by title or description"""
    searchArtworks(query: String!, limit: Int): [Artwork!]!

    # ===== Exhibition Queries =====
    """Get exhibition by ID"""
    exhibition(id: ID!): Exhibition

    """List exhibitions with cursor pagination"""
    exhibitions(
      first: Int
      after: String
      last: Int
      before: String
      type: ExhibitionType
      status: ExhibitionStatus
      isFeatured: Boolean
    ): ExhibitionConnection!

    """Get current ongoing exhibitions"""
    currentExhibitions: [Exhibition!]!

    """Get upcoming exhibitions"""
    upcomingExhibitions(limit: Int): [Exhibition!]!

    # ===== Event Queries =====
    """Get event by ID"""
    event(id: ID!): Event

    """List events with cursor pagination"""
    events(
      first: Int
      after: String
      last: Int
      before: String
      type: EventType
      status: EventStatus
      isFeatured: Boolean
    ): EventConnection!

    """Get current ongoing events"""
    currentEvents: [Event!]!

    """Get upcoming events"""
    upcomingEvents(limit: Int): [Event!]!

    # ===== Gallery Queries =====
    """Get gallery by ID"""
    gallery(id: ID!): Gallery

    """List galleries"""
    galleries(type: String, isActive: Boolean): [Gallery!]!

    # ===== News Queries =====
    """Get news by ID"""
    news(id: ID!): News

    """List news items"""
    newsList(
      category: NewsCategory
      status: NewsStatus
      limit: Int
      offset: Int
    ): [News!]!

    """Get featured news"""
    featuredNews(limit: Int): [News!]!
  }

  # ===================================
  # Mutation Root
  # ===================================

  type Mutation {
    # ===== Member Mutations =====
    """Create new member"""
    createMember(input: CreateMemberInput!): Member!

    """Update member profile"""
    updateMember(id: ID!, input: UpdateMemberInput!): Member!

    """Approve member application"""
    approveMember(id: ID!): Member!

    """Reject member application"""
    rejectMember(id: ID!, reason: String): Member!

    # ===== Membership Application Mutations =====
    """Submit membership application"""
    submitMembershipApplication(input: MembershipApplicationInput!): MembershipApplication!

    """Review membership application"""
    reviewMembershipApplication(
      id: ID!
      status: ApplicationStatus!
      comments: String
      score: Int
    ): MembershipApplication!

    # ===== Artist Mutations =====
    """Create artist profile"""
    createArtist(input: CreateArtistInput!): Artist!

    """Update artist profile"""
    updateArtist(id: ID!, input: UpdateArtistInput!): Artist!

    # ===== Artwork Mutations =====
    """Create artwork"""
    createArtwork(input: CreateArtworkInput!): Artwork!

    """Update artwork"""
    updateArtwork(id: ID!, input: UpdateArtworkInput!): Artwork!

    """Delete artwork"""
    deleteArtwork(id: ID!): Boolean!

    # ===== Event Mutations =====
    """Register for event"""
    registerForEvent(eventId: ID!, notes: String): EventParticipant!

    """Cancel event registration"""
    cancelEventRegistration(participantId: ID!): Boolean!
  }

  # ===================================
  # Input Types
  # ===================================

  input CreateMemberInput {
    userId: ID!
    fullName: String!
    dateOfBirth: DateTime
    gender: Gender
    nationality: String
    phoneNumber: String
    address: String
    city: String
    country: String
    calligraphyExperience: Int
    specializations: [String!]
  }

  input UpdateMemberInput {
    fullName: String
    fullNameKo: String
    fullNameEn: String
    phoneNumber: String
    address: String
    city: String
    calligraphyExperience: Int
    specializations: [String!]
    preferredStyles: [String!]
  }

  input MembershipApplicationInput {
    memberId: ID!
    requestedTierLevel: Int!
    applicationType: String!
    applicationReason: String
    supportingDocuments: [String!]
  }

  input CreateArtistInput {
    userId: ID
    name: String!
    nameKo: String
    nameEn: String
    bio: String
    birthYear: Int
    nationality: String
    profileImage: String
    website: String
  }

  input UpdateArtistInput {
    name: String
    nameKo: String
    nameEn: String
    bio: String
    profileImage: String
    website: String
  }

  input CreateArtworkInput {
    artistId: ID!
    title: String!
    titleKo: String
    titleEn: String
    description: String
    category: ArtworkCategory!
    style: String
    medium: String
    dimensions: String
    year: Int
    imageUrl: String
    price: Float
    isForSale: Boolean
    isFeatured: Boolean
    tags: [String!]
  }

  input UpdateArtworkInput {
    title: String
    titleKo: String
    titleEn: String
    description: String
    category: ArtworkCategory
    style: String
    medium: String
    imageUrl: String
    price: Float
    isForSale: Boolean
    isFeatured: Boolean
    tags: [String!]
  }

  # ===================================
  # Subscription Root
  # ===================================

  type Subscription {
    """Subscribe to member updates"""
    memberUpdated(id: ID!): Member!

    """Subscribe to new member registrations"""
    memberCreated: Member!

    """Subscribe to artwork updates"""
    artworkUpdated(id: ID!): Artwork!

    """Subscribe to exhibition updates"""
    exhibitionUpdated(id: ID!): Exhibition!
  }
`;
