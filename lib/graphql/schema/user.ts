import gql from 'graphql-tag'

/**
 * User, Membership types
 */
export const userTypeDefs = gql`
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
`
