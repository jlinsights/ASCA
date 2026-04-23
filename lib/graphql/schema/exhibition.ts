import gql from 'graphql-tag'

/**
 * Exhibition types
 */
export const exhibitionTypeDefs = gql`
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
`
