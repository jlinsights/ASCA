import gql from 'graphql-tag'

/**
 * Pagination types — PageInfo, Connections, Edges
 */
export const paginationTypeDefs = gql`
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
`
