import gql from 'graphql-tag'

/**
 * Artist and Artwork types
 */
export const artistTypeDefs = gql`
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
`
