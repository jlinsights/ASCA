import { test, expect } from '@playwright/test'

/**
 * Members API E2E Tests
 *
 * Tests for /api/members endpoints
 * - GET /api/members - List members with pagination, search, filters
 * - POST /api/members - Create new member
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test.describe('Members API - GET /api/members', () => {
  test('should return members list successfully', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`)

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()

    // Check response structure
    expect(data).toHaveProperty('success')
    expect(data.success).toBe(true)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('members')
    expect(data.data).toHaveProperty('pagination')

    // Check members array
    expect(Array.isArray(data.data.members)).toBe(true)

    // Check pagination structure
    const pagination = data.data.pagination
    expect(pagination).toHaveProperty('page')
    expect(pagination).toHaveProperty('limit')
    expect(pagination).toHaveProperty('total')
    expect(pagination).toHaveProperty('totalPages')
  })

  test('should return dummy data in development when database is empty', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // In development, should have at least dummy members
    if (process.env.NODE_ENV === 'development') {
      expect(data.data.members.length).toBeGreaterThanOrEqual(2)

      // Check for dummy member structure
      const member = data.data.members[0]
      expect(member).toHaveProperty('id')
      expect(member).toHaveProperty('email')
      expect(member).toHaveProperty('first_name_ko')
      expect(member).toHaveProperty('last_name_ko')
      expect(member).toHaveProperty('membership_status')
      expect(member).toHaveProperty('membership_level_id')
    }
  })

  test('should support pagination with page and limit parameters', async ({ request }) => {
    const page = 1
    const limit = 5

    const response = await request.get(`${BASE_URL}/api/members?page=${page}&limit=${limit}`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    expect(data.data.pagination.page).toBe(page)
    expect(data.data.pagination.limit).toBe(limit)
    expect(data.data.members.length).toBeLessThanOrEqual(limit)
  })

  test('should support search query parameter', async ({ request }) => {
    const query = 'test'

    const response = await request.get(`${BASE_URL}/api/members?query=${query}`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // Should return results (might be empty if no matches)
    expect(Array.isArray(data.data.members)).toBe(true)
  })

  test('should support status filter parameter', async ({ request }) => {
    const status = 'active'

    const response = await request.get(`${BASE_URL}/api/members?status=${status}`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // All returned members should have the filtered status
    data.data.members.forEach((member: any) => {
      expect(member.membership_status).toBe(status)
    })
  })

  test('should support level filter parameter', async ({ request }) => {
    const level = 'honorary_master'

    const response = await request.get(`${BASE_URL}/api/members?level=${level}`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // All returned members should have the filtered level
    data.data.members.forEach((member: any) => {
      expect(member.membership_level_id).toBe(level)
    })
  })

  test('should support sorting with sortBy and sortOrder parameters', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?sortBy=created_at&sortOrder=desc`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // Check if results are sorted (if there are multiple members)
    if (data.data.members.length > 1) {
      const firstDate = new Date(data.data.members[0].created_at)
      const secondDate = new Date(data.data.members[1].created_at)

      // desc order: first should be >= second
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime())
    }
  })

  test('should support multiple filters combined', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/members?status=active&level=honorary_master&page=1&limit=10&sortBy=created_at&sortOrder=desc`
    )

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.pagination.page).toBe(1)
    expect(data.data.pagination.limit).toBe(10)
  })
})

test.describe('Members API - POST /api/members', () => {
  test('should create a new member with valid data', async ({ request }) => {
    const newMember = {
      email: `test-${Date.now()}@example.com`,
      first_name_ko: '테스트',
      last_name_ko: '회원',
      first_name_en: 'Test',
      last_name_en: 'Member',
      phone: '010-1234-5678',
      membership_level_id: 'beginner',
      timezone: 'Asia/Seoul',
      preferred_language: 'ko',
    }

    const response = await request.post(`${BASE_URL}/api/members`, {
      data: newMember,
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('id')
    expect(data.data.email).toBe(newMember.email)
    expect(data.data.first_name_ko).toBe(newMember.first_name_ko)
    expect(data.data.last_name_ko).toBe(newMember.last_name_ko)
  })

  test('should create a member with minimal required fields', async ({ request }) => {
    const newMember = {
      email: `minimal-${Date.now()}@example.com`,
      first_name_ko: '최소',
      last_name_ko: '회원',
    }

    const response = await request.post(`${BASE_URL}/api/members`, {
      data: newMember,
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data.email).toBe(newMember.email)

    // Check default values are set
    expect(data.data.timezone).toBeDefined()
    expect(data.data.preferred_language).toBeDefined()
    expect(data.data.membership_status).toBeDefined()
  })

  test('should return 400 when email is missing', async ({ request }) => {
    const invalidMember = {
      first_name_ko: '테스트',
      last_name_ko: '회원',
    }

    const response = await request.post(`${BASE_URL}/api/members`, {
      data: invalidMember,
    })

    expect(response.status()).toBe(400)

    const data = await response.json()

    expect(data.success).toBe(false)
    expect(data.error).toContain('이메일')
  })

  test('should handle duplicate email gracefully', async ({ request }) => {
    const email = `duplicate-${Date.now()}@example.com`

    const memberData = {
      email,
      first_name_ko: '중복',
      last_name_ko: '테스트',
    }

    // Create first member
    const firstResponse = await request.post(`${BASE_URL}/api/members`, {
      data: memberData,
    })

    expect(firstResponse.ok()).toBeTruthy()

    // Try to create second member with same email
    const secondResponse = await request.post(`${BASE_URL}/api/members`, {
      data: memberData,
    })

    // Should return an error (might be 400 or 409 depending on implementation)
    expect(secondResponse.ok()).toBeFalsy()

    const data = await secondResponse.json()
    expect(data.success).toBe(false)
  })

  test('should set default values for optional fields', async ({ request }) => {
    const newMember = {
      email: `defaults-${Date.now()}@example.com`,
      first_name_ko: '기본값',
      last_name_ko: '테스트',
    }

    const response = await request.post(`${BASE_URL}/api/members`, {
      data: newMember,
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // Check default values
    expect(data.data.timezone).toBe('Asia/Seoul')
    expect(data.data.preferred_language).toBe('ko')
    expect(data.data.membership_status).toBe('active')
    expect(data.data.is_verified).toBeDefined()
    expect(data.data.is_public).toBeDefined()
  })
})

test.describe('Members API - Error Handling', () => {
  test('should return proper error for malformed JSON', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/members`, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Should handle error gracefully
    expect(response.ok()).toBeFalsy()
  })

  test('should handle invalid query parameters gracefully', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?page=invalid&limit=abc`)

    // Should still return a response (might use default values)
    expect(response.status()).toBeLessThan(500)
  })

  test('should handle large page numbers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/members?page=9999&limit=20`)

    expect(response.ok()).toBeTruthy()

    const data = await response.json()

    // Should return empty results or last page
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data.members)).toBe(true)
  })
})

test.describe('Members API - Performance', () => {
  test('should respond within acceptable time (< 2 seconds)', async ({ request }) => {
    const startTime = Date.now()

    const response = await request.get(`${BASE_URL}/api/members`)

    const endTime = Date.now()
    const responseTime = endTime - startTime

    expect(response.ok()).toBeTruthy()
    expect(responseTime).toBeLessThan(2000) // 2 seconds
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
