import gql from 'graphql-tag'

/**
 * Gallery and News types
 */
export const galleryTypeDefs = gql`
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
`
