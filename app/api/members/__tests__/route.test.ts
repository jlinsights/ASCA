/**
 * @jest-environment node
 *
 * Members API Route Tests
 *
 * Tests for /api/members GET and POST endpoints
 * Route uses Drizzle ORM and Clerk authentication for POST
 */

// Mock database module BEFORE any imports to prevent PostgresError at module load
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
  withPerformanceLog: jest.fn(),
}))

// Mock rate limiting module BEFORE imports so module-level limiters use mocks
jest.mock('@/lib/security/rate-limit', () => ({
  rateLimit: jest.fn().mockReturnValue({
    check: jest.fn().mockResolvedValue(null),
  }),
  RateLimitPresets: {
    moderate: { limit: 50, window: 60 },
    strict: { limit: 10, window: 60 },
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}))

import { describe, test, expect, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { withPerformanceLog } from '@/lib/db'
import { GET, POST } from '../route'

const mockWithPerformanceLog = withPerformanceLog as jest.MockedFunction<typeof withPerformanceLog>
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>

describe('GET /api/members', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return paginated members list', async () => {
    // Arrange
    const mockMembers = [
      { id: 'member-1', fullName: '김철수', status: 'active' },
      { id: 'member-2', fullName: '이영희', status: 'active' },
    ]
    mockWithPerformanceLog.mockResolvedValueOnce({ data: mockMembers, total: 2 })

    const request = new NextRequest('http://localhost:3000/api/members')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockMembers)
    expect(data.meta.pagination).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasMore: false,
      hasPrevious: false,
    })
  })

  test('should use default pagination (page=1, limit=20)', async () => {
    // Arrange
    mockWithPerformanceLog.mockResolvedValueOnce({ data: [], total: 0 })

    const request = new NextRequest('http://localhost:3000/api/members')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.meta.pagination.page).toBe(1)
    expect(data.meta.pagination.limit).toBe(20)
  })

  test('should respect custom page and limit params', async () => {
    // Arrange
    const items = Array.from({ length: 5 }, (_, i) => ({ id: `member-${i + 1}` }))
    mockWithPerformanceLog.mockResolvedValueOnce({ data: items, total: 50 })

    const request = new NextRequest('http://localhost:3000/api/members?page=2&limit=5')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.meta.pagination.page).toBe(2)
    expect(data.meta.pagination.limit).toBe(5)
    expect(data.meta.pagination.total).toBe(50)
    expect(data.meta.pagination.totalPages).toBe(10)
    expect(data.meta.pagination.hasMore).toBe(true)
    expect(data.meta.pagination.hasPrevious).toBe(true)
  })

  test('should return empty list with correct pagination when no members', async () => {
    // Arrange
    mockWithPerformanceLog.mockResolvedValueOnce({ data: [], total: 0 })

    const request = new NextRequest('http://localhost:3000/api/members')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.data).toEqual([])
    expect(data.meta.pagination.total).toBe(0)
    expect(data.meta.pagination.hasMore).toBe(false)
  })

  test('should return 422 for invalid page parameter', async () => {
    // Arrange - z.coerce.number() on "invalid" → NaN → .int() fails → ZodError
    const request = new NextRequest('http://localhost:3000/api/members?page=invalid')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should return 422 for page out of range', async () => {
    // Arrange - page must be between 1 and 1000
    const request = new NextRequest('http://localhost:3000/api/members?page=0')

    // Act
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should call withPerformanceLog with correct operation name', async () => {
    // Arrange
    mockWithPerformanceLog.mockResolvedValueOnce({ data: [], total: 0 })

    const request = new NextRequest('http://localhost:3000/api/members')

    // Act
    await GET(request)

    // Assert
    expect(mockWithPerformanceLog).toHaveBeenCalledWith('members.list', expect.any(Function))
  })
})

describe('POST /api/members', () => {
  const validBody = {
    email: 'newmember@example.com',
    firstNameKo: '신규',
    lastNameKo: '회원',
    membershipLevelId: 'level-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockCurrentUser.mockResolvedValue({
      emailAddresses: [{ emailAddress: validBody.email }],
    } as any)
  })

  test('should create member and return 201 with valid data', async () => {
    // Arrange - no duplicate email/member, then actual created member
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce({
      id: 'member-1',
      userId: 'user-1',
      email: validBody.email,
      fullNameKo: '회원신규',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.id).toBe('member-1')
    expect(data.data.userId).toBe('user-1')
  })

  test('should return 409 when email already exists', async () => {
    // Arrange - checkEmail returns another user's email
    mockWithPerformanceLog.mockResolvedValueOnce([{ id: 'other-user' }])

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('CONFLICT')
    expect(data.error.message).toBe('Email already exists')
  })

  test('should return 422 when email is missing', async () => {
    // Arrange
    const { email: _email, ...bodyWithoutEmail } = validBody

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithoutEmail),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should return 422 when firstNameKo is missing', async () => {
    // Arrange
    const { firstNameKo: _firstName, ...bodyWithout } = validBody

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithout),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should return 422 when lastNameKo is missing', async () => {
    // Arrange
    const { lastNameKo: _lastName, ...bodyWithout } = validBody

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithout),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should return 422 when membershipLevelId is missing', async () => {
    // Arrange
    const { membershipLevelId: _levelId, ...bodyWithout } = validBody

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithout),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should return 422 when email is invalid format', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, email: 'not-an-email' }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(422)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('should call withPerformanceLog with checkEmail operation', async () => {
    // Arrange
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce({
      id: 'member-1',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    // Act
    await POST(request)

    // Assert
    expect(mockWithPerformanceLog).toHaveBeenCalledWith('members.checkEmail', expect.any(Function))
  })

  test('should include createdAt and updatedAt in created member', async () => {
    // Arrange
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce([])
    mockWithPerformanceLog.mockResolvedValueOnce({
      id: 'member-1',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.data.createdAt).toBeDefined()
    expect(data.data.updatedAt).toBeDefined()
    expect(data.data.id).toBeDefined()
  })
})
