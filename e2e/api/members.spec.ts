import { test, expect } from '@playwright/test'

/**
 * Members API E2E Tests
 *
 * GET /api/members is a public, sanitized directory endpoint.
 * POST /api/members is intentionally authenticated.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const SAME_ORIGIN_HEADERS = { Origin: BASE_URL }

test.describe('Members API - GET /api/members', () => {
  test('should return members list successfully', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta).toHaveProperty('pagination')

    const pagination = body.meta.pagination
    expect(pagination).toHaveProperty('page')
    expect(pagination).toHaveProperty('limit')
    expect(pagination).toHaveProperty('total')
    expect(pagination).toHaveProperty('totalPages')
  })

  test('should expose only sanitized public member fields', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    const member = body.data[0]

    if (member) {
      expect(member).toHaveProperty('id')
      expect(member).toHaveProperty('fullName')
      expect(member).toHaveProperty('status')
      expect(member).not.toHaveProperty('phoneNumber')
      expect(member).not.toHaveProperty('address')
      expect(member).not.toHaveProperty('dateOfBirth')
      expect(member).not.toHaveProperty('notes')
    }
  })

  test('should support pagination with page and limit parameters', async ({ request }) => {
    const page = 1
    const limit = 5

    const response = await request.get(`${BASE_URL}/api/members?page=${page}&limit=${limit}`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    expect(body.meta.pagination.page).toBe(page)
    expect(body.meta.pagination.limit).toBe(limit)
    expect(body.data.length).toBeLessThanOrEqual(limit)
  })

  test('should support search query parameter', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?query=test`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('should support status filter parameter', async ({ request }) => {
    const status = 'active'

    const response = await request.get(`${BASE_URL}/api/members?status=${status}`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    body.data.forEach((member: any) => {
      expect(member.status).toBe(status)
    })
  })

  test('should support level filter parameter', async ({ request }) => {
    const level = 'honorary_master'

    const response = await request.get(`${BASE_URL}/api/members?level=${level}`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    body.data.forEach((member: any) => {
      expect(member.tierId).toBe(level)
    })
  })

  test('should support sorting with sortBy and sortOrder parameters', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?sortBy=createdAt&sortOrder=desc`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()

    if (body.data.length > 1) {
      const firstDate = new Date(body.data[0].createdAt)
      const secondDate = new Date(body.data[1].createdAt)
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime())
    }
  })

  test('should support multiple filters combined', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/members?status=active&level=honorary_master&page=1&limit=10&sortBy=createdAt&sortOrder=desc`
    )

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.meta.pagination.page).toBe(1)
    expect(body.meta.pagination.limit).toBe(10)
  })
})

test.describe('Members API - POST /api/members', () => {
  test('should require authentication to create a member', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/members`, {
      headers: SAME_ORIGIN_HEADERS,
      data: {
        email: `test-${Date.now()}@example.com`,
        firstNameKo: '테스트',
        lastNameKo: '회원',
        membershipLevelId: 'beginner',
      },
    })

    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('should keep CSRF origin protection for mutating requests', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/members`, {
      data: {
        email: `csrf-${Date.now()}@example.com`,
        firstNameKo: '테스트',
        lastNameKo: '회원',
        membershipLevelId: 'beginner',
      },
    })

    expect(response.status()).toBe(403)

    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('CSRF_ORIGIN_MISMATCH')
  })
})

test.describe('Members API - Error Handling', () => {
  test('should handle invalid query parameters gracefully', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?page=invalid&limit=abc`)

    expect(response.status()).toBeLessThan(500)
  })

  test('should handle maximum page numbers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?page=1000&limit=20`)

    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })
})

test.describe('Members API - Performance', () => {
  test('should respond within acceptable time (< 2 seconds)', async ({ request }) => {
    const startTime = Date.now()

    const response = await request.get(`${BASE_URL}/api/members`)

    const responseTime = Date.now() - startTime

    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(2000)
  })

  test('should handle multiple concurrent requests', async ({ request }) => {
    const requests = Array(10)
      .fill(null)
      .map(() => request.get(`${BASE_URL}/api/members?page=1&limit=10`))

    const responses = await Promise.all(requests)

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy()
    })
  })
})
