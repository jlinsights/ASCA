import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';
import { createGraphQLContext, type GraphQLContext } from '@/lib/graphql/context';
import { NextRequest, NextResponse } from 'next/server';

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
  formatError: (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GraphQL Error:', error);
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
        };
      }
    }

    return error;
  },
  plugins: [
    // Add performance monitoring plugin
    {
      async requestDidStart() {
        const startTime = Date.now();

        return {
          async willSendResponse(requestContext) {
            const duration = Date.now() - startTime;

            // Log slow queries in development
            if (process.env.NODE_ENV === 'development' && duration > 1000) {
              console.warn(`Slow GraphQL query: ${duration}ms`);
              console.log('Operation:', requestContext.request.operationName);
            }

            // Add performance headers
            if (requestContext.response.http) {
              requestContext.response.http.headers.set(
                'X-GraphQL-Duration',
                `${duration}ms`
              );
            }
          },
        };
      },
    },
  ],
});

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (req) => {
      return createGraphQLContext(req);
    },
  }
);

/**
 * POST /api/graphql
 * Main GraphQL endpoint
 */
export async function POST(request: NextRequest) {
  return handler(request);
}

/**
 * GET /api/graphql
 * GraphQL Playground (development only)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return handler(request);
  }

  // In production, return error
  return NextResponse.json(
    {
      error: 'GraphQL Playground is disabled in production',
      message: 'Use POST method to query GraphQL API',
    },
    { status: 403 }
  );
}

/**
 * OPTIONS /api/graphql
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Route segment config
 */
export const runtime = 'nodejs'; // Use Node.js runtime for GraphQL
export const dynamic = 'force-dynamic'; // Disable static optimization
export const fetchCache = 'force-no-store'; // Disable fetch caching
