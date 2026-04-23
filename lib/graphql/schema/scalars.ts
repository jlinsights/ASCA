import gql from 'graphql-tag'

/**
 * Scalars and shared enums
 */
export const scalarsTypeDefs = gql`
  scalar DateTime
  scalar JSON

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
`
