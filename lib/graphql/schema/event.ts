import gql from 'graphql-tag'

/**
 * Event types
 */
export const eventTypeDefs = gql`
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
`
