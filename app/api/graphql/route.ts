import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/lib/graphql/schema'
import { resolvers } from '@/lib/graphql/resolvers'
import { createGraphQLContext, type GraphQLContext } from '@/lib/graphql/context'
import { info, warn, error as logError } from '@/lib/logging'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GraphQL API Endpoint
 *
 * Powered by Apollo Server with Next.js 16 App Router
 *
 * Endpoint: POST/GET /api/graphql
 *
 * Features:
 * - Query: Read operations
 * - Mutation: Write operations
 * - Subscription: Real-time updates (future)
 * - DataLoader: N+1 query prevention
 * - Authentication: JWT/Session based
 */

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production', // Enable GraphQL Playground in development
  formatError: error => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      logError('GraphQL Error', error instanceof Error ? error : undefined)
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      // Remove sensitive error details
      if (error.message.startsWith('Database')) {
        return {
          message: 'Internal server error',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        }
      }
    }

    return error
  },
  plugins: [
    // Add performance monitoring plugin
    {
      async requestDidStart() {
        const startTime = Date.now()

        return {
          async willSendResponse(requestContext) {
            const duration = Date.now() - startTime

            // Log slow queries in development
            if (process.env.NODE_ENV === 'development' && duration > 1000) {
              warn(`Slow GraphQL query: ${duration}ms`)
              info(`Operation: ${requestContext.request.operationName ?? 'unknown'}`)
            }

            // Add performance headers
            if (requestContext.response.http) {
              requestContext.response.http.headers.set('X-GraphQL-Duration', `${duration}ms`)
            }
          },
        }
      },
    },
  ],
})

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async req => {
    return createGraphQLContext(req)
  },
})

/**
 * POST /api/graphql
 * Main GraphQL endpoint
 */
export async function POST(request: NextRequest) {
  return handler(request)
}

/**
 * GET /api/graphql
 * GraphQL Playground (development only)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return handler(request)
  }

  // In production, return error
  return NextResponse.json(
    {
      error: 'GraphQL Playground is disabled in production',
      message: 'Use POST method to query GraphQL API',
    },
    { status: 403 }
  )
}

/**
 * Allowed CORS origins (env-driven). 빈 값/미설정 시 same-origin only.
 *
 * 설정 예시:
 *   ALLOWED_ORIGINS=https://asca.kr,https://www.asca.kr
 *   ALLOWED_ORIGINS=http://localhost:3000  # dev
 */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }
  return headers
}

/**
 * OPTIONS /api/graphql
 * CORS preflight (화이트리스트 origin만 허용)
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}

/**
 * Route segment config
 */
export const runtime = 'nodejs' // Use Node.js runtime for GraphQL
export const dynamic = 'force-dynamic' // Disable static optimization
export const fetchCache = 'force-no-store' // Disable fetch caching
