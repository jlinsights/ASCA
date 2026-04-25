/**
 * Cursor-based Pagination Utilities
 *
 * Cursor pagination provides consistent performance regardless of page depth,
 * making it ideal for:
 * - Infinite scroll UIs
 * - Large datasets (millions of records)
 * - Real-time data streams
 * - Mobile applications
 *
 * Benefits over offset pagination:
 * - O(1) performance instead of O(n)
 * - Consistent results when data changes
 * - No skipped or duplicate records
 * - Works well with real-time updates
 */

export interface CursorInfo {
  /**
   * Base64-encoded cursor pointing to a specific record
   */
  cursor: string

  /**
   * Decoded cursor data
   */
  decoded: {
    id: string
    sortField?: string
    sortValue?: any
  }
}

export interface PageInfo {
  /**
   * Cursor pointing to the first item in this page
   */
  startCursor?: string | null

  /**
   * Cursor pointing to the last item in this page
   */
  endCursor?: string | null

  /**
   * Whether there are more items before the start cursor
   */
  hasPreviousPage: boolean

  /**
   * Whether there are more items after the end cursor
   */
  hasNextPage: boolean

  /**
   * Total number of items (optional, can be expensive to compute)
   */
  totalCount?: number
}

export interface Edge<T> {
  /**
   * Cursor for this item
   */
  cursor: string

  /**
   * The item data
   */
  node: T
}

export interface Connection<T> {
  /**
   * Array of edges (items with cursors)
   */
  edges: Edge<T>[]

  /**
   * Extracted items (convenience field)
   */
  nodes: T[]

  /**
   * Pagination metadata
   */
  pageInfo: PageInfo
}

export interface CursorPaginationParams {
  /**
   * Number of items to fetch
   */
  first?: number

  /**
   * Cursor to start after (for forward pagination)
   */
  after?: string

  /**
   * Number of items to fetch (backward)
   */
  last?: number

  /**
   * Cursor to start before (for backward pagination)
   */
  before?: string

  /**
   * Sort field (default: 'id')
   */
  sortField?: string

  /**
   * Sort direction (default: 'asc')
   */
  sortDirection?: 'asc' | 'desc'
}

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: { id: string; sortField?: string; sortValue?: any }): string {
  const json = JSON.stringify(data)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json).toString('base64')
  }
  return btoa(json)
}

/**
 * Decode cursor from base64 string
 */
export function decodeCursor(cursor: string): CursorInfo['decoded'] {
  try {
    let json: string
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(cursor, 'base64').toString('utf-8')
    } else {
      json = atob(cursor)
    }
    return JSON.parse(json)
  } catch (error) {
    throw new Error(`Invalid cursor: ${cursor}`)
  }
}

/**
 * Create cursor for an item
 */
export function createCursor<T extends Record<string, any>>(
  item: T,
  sortField: string = 'id'
): string {
  return encodeCursor({
    id: item.id,
    sortField,
    sortValue: item[sortField],
  })
}

/**
 * Create an edge from an item
 */
export function createEdge<T extends Record<string, any>>(
  item: T,
  sortField: string = 'id'
): Edge<T> {
  return {
    cursor: createCursor(item, sortField),
    node: item,
  }
}

/**
 * Create a connection from a list of items
 */
export function createConnection<T extends Record<string, any>>(
  items: T[],
  params: CursorPaginationParams,
  options?: {
    totalCount?: number
    sortField?: string
  }
): Connection<T> {
  const sortField = options?.sortField ?? params.sortField ?? 'id'

  // Create edges
  const edges = items.map(item => createEdge(item, sortField))

  // Determine page info
  const pageInfo: PageInfo = {
    startCursor: edges.length > 0 ? (edges[0]?.cursor ?? null) : null,
    endCursor: edges.length > 0 ? (edges[edges.length - 1]?.cursor ?? null) : null,
    hasPreviousPage: false, // Will be determined by caller
    hasNextPage: false, // Will be determined by caller
    totalCount: options?.totalCount,
  }

  return {
    edges,
    nodes: items,
    pageInfo,
  }
}

/**
 * Validate cursor pagination parameters
 */
export function validateCursorParams(params: CursorPaginationParams): void {
  // Can't use both forward and backward pagination
  if (
    (params.first !== undefined || params.after !== undefined) &&
    (params.last !== undefined || params.before !== undefined)
  ) {
    throw new Error('Cannot use both forward (first/after) and backward (last/before) pagination')
  }

  // Validate limits
  const limit = params.first ?? params.last ?? 20
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100')
  }

  // Validate cursors if provided
  if (params.after) {
    try {
      decodeCursor(params.after)
    } catch {
      throw new Error('Invalid after cursor')
    }
  }

  if (params.before) {
    try {
      decodeCursor(params.before)
    } catch {
      throw new Error('Invalid before cursor')
    }
  }
}

/**
 * Get SQL comparison operator based on sort direction and pagination direction
 */
export function getCursorComparison(params: {
  isForward: boolean
  sortDirection: 'asc' | 'desc'
}): '>' | '<' | '>=' | '<=' {
  const { isForward, sortDirection } = params

  if (isForward) {
    return sortDirection === 'asc' ? '>' : '<'
  } else {
    return sortDirection === 'asc' ? '<' : '>'
  }
}

/**
 * Cursor pagination helper for common use cases
 */
export class CursorPaginator<T extends Record<string, any>> {
  private sortField: string
  private defaultLimit: number

  constructor(
    options: {
      sortField?: string
      defaultLimit?: number
    } = {}
  ) {
    this.sortField = options.sortField ?? 'id'
    this.defaultLimit = options.defaultLimit ?? 20
  }

  /**
   * Create cursor for item
   */
  createCursor(item: T): string {
    return createCursor(item, this.sortField)
  }

  /**
   * Create edge for item
   */
  createEdge(item: T): Edge<T> {
    return createEdge(item, this.sortField)
  }

  /**
   * Create connection from items
   */
  createConnection(
    items: T[],
    params: CursorPaginationParams,
    hasMore: { hasPreviousPage: boolean; hasNextPage: boolean },
    totalCount?: number
  ): Connection<T> {
    const connection = createConnection(items, params, {
      totalCount,
      sortField: this.sortField,
    })

    connection.pageInfo.hasPreviousPage = hasMore.hasPreviousPage
    connection.pageInfo.hasNextPage = hasMore.hasNextPage

    return connection
  }

  /**
   * Get pagination parameters
   */
  getParams(params: CursorPaginationParams) {
    validateCursorParams(params)

    const isForward = params.first !== undefined || params.after !== undefined
    const limit = (params.first ?? params.last ?? this.defaultLimit) + 1 // +1 to check hasMore
    const cursor = params.after ?? params.before
    const sortDirection = params.sortDirection ?? 'asc'

    let cursorData: CursorInfo['decoded'] | null = null
    if (cursor) {
      cursorData = decodeCursor(cursor)
    }

    return {
      isForward,
      limit,
      cursor: cursorData,
      sortDirection,
      comparison: getCursorComparison({ isForward, sortDirection }),
    }
  }
}

/**
 * Convert offset-based pagination to cursor-based
 */
export function offsetToCursor(
  offset: number,
  limit: number
): {
  after?: string
  first: number
} {
  if (offset === 0) {
    return { first: limit }
  }

  // Create a synthetic cursor for the offset
  const cursor = encodeCursor({
    id: `offset:${offset}`,
    sortField: 'offset',
    sortValue: offset,
  })

  return {
    after: cursor,
    first: limit,
  }
}

/**
 * Example cursor formats for different use cases
 */
export const CursorExamples = {
  /**
   * Simple ID-based cursor
   */
  simple: {
    encode: (id: string) => encodeCursor({ id }),
    decode: (cursor: string) => decodeCursor(cursor).id,
  },

  /**
   * Timestamp-based cursor (for chronological feeds)
   */
  timestamp: {
    encode: (id: string, timestamp: Date) =>
      encodeCursor({
        id,
        sortField: 'created_at',
        sortValue: timestamp.toISOString(),
      }),
    decode: (cursor: string) => {
      const data = decodeCursor(cursor)
      return {
        id: data.id,
        timestamp: new Date(data.sortValue),
      }
    },
  },

  /**
   * Compound cursor (multiple sort fields)
   */
  compound: {
    encode: (id: string, score: number, timestamp: Date) =>
      encodeCursor({
        id,
        sortField: 'score,created_at',
        sortValue: JSON.stringify({ score, created_at: timestamp.toISOString() }),
      }),
    decode: (cursor: string) => {
      const data = decodeCursor(cursor)
      const values = JSON.parse(data.sortValue)
      return {
        id: data.id,
        score: values.score,
        timestamp: new Date(values.created_at),
      }
    },
  },
}
