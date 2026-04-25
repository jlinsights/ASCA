/**
 * API Test Helpers
 *
 * Utilities for testing API routes and endpoints
 */

import { NextRequest } from 'next/server'

/**
 * Create mock NextRequest for testing
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  searchParams?: Record<string, string>
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
    searchParams = {},
  } = options

  // Build URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // Create request init
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  // Add body if present
  if (body) {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(urlObj.toString(), init as any)
}

/**
 * Create authenticated mock request
 */
export function createAuthenticatedRequest(options: {
  userId?: string
  email?: string
  role?: string
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  searchParams?: Record<string, string>
}): NextRequest {
  const {
    userId = 'test-user-id',
    email = 'test@example.com',
    role = 'user',
    ...requestOptions
  } = options

  // Create mock JWT token (for testing only)
  const mockToken = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role,
    })
  ).toString('base64')

  return createMockRequest({
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: `Bearer ${mockToken}`,
    },
  })
}

/**
 * Parse response JSON
 */
export async function parseResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Failed to parse response: ${text}`)
  }
}

/**
 * Assert response status
 */
export function assertResponseStatus(
  response: Response,
  expectedStatus: number,
  message?: string
): void {
  if (response.status !== expectedStatus) {
    throw new Error(message || `Expected status ${expectedStatus}, got ${response.status}`)
  }
}

/**
 * Assert success response
 */
export async function assertSuccessResponse<T = any>(response: Response): Promise<T> {
  assertResponseStatus(response, 200, 'Expected successful response')
  const data = await parseResponse<{ success: boolean; data: T }>(response)

  if (!data.success) {
    throw new Error('Response marked as unsuccessful')
  }

  return data.data
}

/**
 * Assert error response
 */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<void> {
  assertResponseStatus(response, expectedStatus)

  const data = await parseResponse<{ success: boolean; error: string }>(response)

  if (data.success) {
    throw new Error('Response marked as successful')
  }

  if (expectedMessage && !data.error.includes(expectedMessage)) {
    throw new Error(`Expected error message to include "${expectedMessage}", got "${data.error}"`)
  }
}

/**
 * Mock API route context
 */
export interface MockRouteContext {
  params: Record<string, string>
}

/**
 * Create mock route context
 */
export function createMockRouteContext(params: Record<string, string> = {}): MockRouteContext {
  return { params }
}

/**
 * Test API endpoint helper
 */
export async function testApiEndpoint(options: {
  handler: (req: NextRequest, context?: any) => Promise<Response>
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  searchParams?: Record<string, string>
  context?: MockRouteContext
  authenticated?: boolean
  userId?: string
  email?: string
  role?: string
}): Promise<Response> {
  const {
    handler,
    authenticated = false,
    context = createMockRouteContext(),
    ...requestOptions
  } = options

  const request = authenticated
    ? createAuthenticatedRequest(requestOptions)
    : createMockRequest(requestOptions)

  return handler(request, context)
}

/**
 * Mock fetch for external API calls
 */
export function mockFetch(responses: Map<string, any>): void {
  global.fetch = jest.fn((url: string | URL) => {
    const urlString = url.toString()
    const response = responses.get(urlString)

    if (!response) {
      return Promise.reject(new Error(`No mock response for ${urlString}`))
    }

    return Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
    } as Response)
  }) as jest.Mock
}

/**
 * Reset fetch mock
 */
export function resetFetchMock(): void {
  if (jest.isMockFunction(global.fetch)) {
    ;(global.fetch as jest.Mock).mockRestore()
  }
}

/**
 * Wait for async operations
 */
export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  options: {
    timeout?: number
    interval?: number
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await callback()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Timeout waiting for condition`)
}
