/**
 * @jest-environment node
 *
 * Members API Route Tests
 *
 * Tests for /api/members GET and POST endpoints
 * Route uses Drizzle ORM. GET/POST are admin-only (aal2); POST is not implemented (501).
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

jest.mock('@/lib/auth/middleware', () => ({
  requireAdminAuth: jest.fn(),
}))

import { describe, test, expect, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { db, withPerformanceLog } from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth/middleware'
import { GET, POST } from '../route'

const mockWithPerformanceLog = withPerformanceLog as jest.MockedFunction<typeof withPerformanceLog>
const mockRequireAdminAuth = requireAdminAuth as jest.MockedFunction<typeof requireAdminAuth>
const mockSelect = db.select as unknown as jest.Mock

const ADMIN = { id: 'admin-1', role: 'admin', assuranceLevel: 'aal2' as const }

/** db.select() 체인을 흉내 낸다. 마지막 단계(offset / where)에서 결과를 돌려준다. */
function mockSelectChain(rows: unknown[], total: number) {
  const listChain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockResolvedValue(rows),
  }
  const countChain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ count: total }]),
  }
  mockSelect.mockReturnValueOnce(listChain).mockReturnValueOnce(countChain)
  return { listChain, countChain }
}

describe('GET /api/members', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAuth.mockResolvedValue(ADMIN)
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

  test('returns 401 and reads nothing when the caller is not an admin', async () => {
    mockRequireAdminAuth.mockResolvedValueOnce(null)

    const response = await GET(new NextRequest('http://localhost:3000/api/members'))

    expect(response.status).toBe(401)
    expect(mockWithPerformanceLog).not.toHaveBeenCalled()
    expect(mockSelect).not.toHaveBeenCalled()
  })

  test('selects only list columns, never personal details', async () => {
    mockWithPerformanceLog.mockImplementationOnce(async (_name, fn) => fn())
    mockSelectChain([], 0)

    await GET(new NextRequest('http://localhost:3000/api/members'))

    const columns = Object.keys(mockSelect.mock.calls[0][0] as object)
    expect(columns).toEqual(expect.arrayContaining(['id', 'fullName', 'status']))
    for (const secret of [
      'dateOfBirth',
      'phoneNumber',
      'alternateEmail',
      'address',
      'addressKo',
      'emergencyContactName',
      'emergencyContactPhone',
      'userId',
    ]) {
      expect(columns).not.toContain(secret)
    }
  })

  test('list and count use the same combined filter', async () => {
    mockWithPerformanceLog.mockImplementationOnce(async (_name, fn) => fn())
    const { listChain, countChain } = mockSelectChain([{ id: 'member-1' }], 7)

    const response = await GET(
      new NextRequest('http://localhost:3000/api/members?query=김&status=active&level=tier-1')
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.meta.pagination.total).toBe(7)
    expect(listChain.where).toHaveBeenCalledTimes(1)
    const where = listChain.where.mock.calls[0][0]
    expect(where).toBeDefined()
    expect(countChain.where).toHaveBeenCalledWith(where)
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
    mockRequireAdminAuth.mockResolvedValue(ADMIN)
  })

  test('returns 401 when the caller is not an admin', async () => {
    mockRequireAdminAuth.mockResolvedValueOnce(null)

    const response = await POST(
      new NextRequest('http://localhost:3000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })
    )

    expect(response.status).toBe(401)
  })

  test('returns 501 instead of pretending to create a member', async () => {
    const response = await POST(
      new NextRequest('http://localhost:3000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(501)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('NOT_IMPLEMENTED')
    expect(mockWithPerformanceLog).not.toHaveBeenCalled()
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
})
