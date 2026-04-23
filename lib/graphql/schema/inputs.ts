import gql from 'graphql-tag'

/**
 * Input types for mutations
 */
export const inputsTypeDefs = gql`
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
`
