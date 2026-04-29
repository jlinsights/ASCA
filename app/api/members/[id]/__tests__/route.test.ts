/**
 * Member Detail API Integration Tests
 *
 * Tests for /api/members/[id] endpoints
 *
 * @jest-environment node
 */

// Mock modules BEFORE imports — inline jest.fn() to avoid TDZ with hoisted jest.mock()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))

jest.mock('@/lib/middleware/admin-middleware', () => ({
  getAuthContext: jest.fn(),
}))

// NOTE: do NOT import `jest` from '@jest/globals' — that disables babel-jest's
// hoisting of jest.mock(...) calls and the real modules get loaded before mocks.
import { describe, test, expect, beforeEach } from '@jest/globals'
import { GET, PUT, DELETE } from '../route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/middleware/admin-middleware'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockGetAuthContext = getAuthContext as jest.MockedFunction<typeof getAuthContext>

describe('GET /api/members/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  test('should return 401 when not authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1')
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await GET(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  test('should fetch member with relations when authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const mockMember = {
      id: 'member-1',
      user_id: 'user-1',
      email: 'test@example.com',
      first_name_ko: '철수',
      last_name_ko: '김',
      membership_status: 'active',
      membership_level: {
        id: 'level-1',
        level_name: 'Basic',
      },
      artistic_profile: {
        id: 'profile-1',
        bio: 'Artist bio',
      },
      achievements: [],
      certifications: [],
      cultural_background: null,
    }

    Object.assign(mockSupabase.single(), {
      data: mockMember,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1')
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await GET(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.id).toBe('member-1')
    expect(mockSupabase.from).toHaveBeenCalledWith('members')
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'member-1')
  })

  test('should return 404 when member not found', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    Object.assign(mockSupabase.single(), {
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })

    const request = new NextRequest('http://localhost:3000/api/members/non-existent')
    const params = Promise.resolve({ id: 'non-existent' })

    // Act
    const response = await GET(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Member not found')
  })

  test('should return 500 on database error', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    Object.assign(mockSupabase.single(), {
      data: null,
      error: { code: 'DATABASE_ERROR', message: 'Database connection failed' },
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1')
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await GET(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to fetch member')
  })

  test('should fetch member with all relations included', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const mockMember = {
      id: 'member-1',
      user_id: 'user-1',
      email: 'test@example.com',
      first_name_ko: '철수',
      last_name_ko: '김',
      membership_status: 'active',
      membership_level: { id: 'level-1', level_name: 'Premium' },
      artistic_profile: { id: 'profile-1', bio: 'Artist bio' },
      achievements: [
        { id: 'ach-1', title: 'Achievement 1' },
        { id: 'ach-2', title: 'Achievement 2' },
      ],
      certifications: [{ id: 'cert-1', name: 'Certification 1' }],
      cultural_background: { id: 'bg-1', description: 'Background' },
    }

    Object.assign(mockSupabase.single(), {
      data: mockMember,
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1')
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await GET(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.membership_level).toBeDefined()
    expect(data.data.artistic_profile).toBeDefined()
    expect(data.data.achievements).toHaveLength(2)
    expect(data.data.certifications).toHaveLength(1)
    expect(data.data.cultural_background).toBeDefined()
  })
})

describe('PUT /api/members/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  test('should return 401 when not authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
        last_name_ko: '이',
      }),
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await PUT(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  test('should return 404 when member not found', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    // First select call to check member existence
    Object.assign(mockSupabase.single(), {
      data: null,
      error: { code: 'PGRST116' },
    })

    const request = new NextRequest('http://localhost:3000/api/members/non-existent', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
        last_name_ko: '이',
      }),
    })
    const params = Promise.resolve({ id: 'non-existent' })

    // Act
    const response = await PUT(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Member not found')
  })

  test('should return 403 when user is not the owner', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-2' } }, // Different user
      error: null,
    })

    // Mock existing member owned by user-1
    const existingMember = {
      user_id: 'user-1',
      membership_level_id: 'level-1',
    }

    Object.assign(mockSupabase.single(), {
      data: existingMember,
      error: null,
    })

    // admin-middleware returns non-admin
    mockGetAuthContext.mockResolvedValue({ isAdmin: false } as any)

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
        last_name_ko: '이',
      }),
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await PUT(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('권한이 없습니다')
  })

  test('should update member when user is the owner', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
      membership_level_id: 'level-1',
    }

    const updatedMember = {
      id: 'member-1',
      user_id: 'user-1',
      email: 'test@example.com',
      first_name_ko: '영희',
      last_name_ko: '이',
      membership_status: 'active',
      membership_level: { id: 'level-1', level_name: 'Basic' },
      updated_at: new Date().toISOString(),
    }

    // Mock two separate calls
    let callCount = 0
    mockSupabase.single = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        // First call - check existence
        return {
          data: existingMember,
          error: null,
        }
      } else {
        // Second call - return updated member
        return {
          data: updatedMember,
          error: null,
        }
      }
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
        last_name_ko: '이',
      }),
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await PUT(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.first_name_ko).toBe('영희')
    expect(data.data.last_name_ko).toBe('이')
    expect(data.message).toBe('회원 정보가 성공적으로 업데이트되었습니다.')
    expect(mockSupabase.update).toHaveBeenCalled()
  })

  test('should update only provided fields', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
      membership_level_id: 'level-1',
    }

    let updateData: any
    mockSupabase.update = jest.fn(data => {
      updateData = data
      return mockSupabase
    })

    let callCount = 0
    mockSupabase.single = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return { data: existingMember, error: null }
      } else {
        return { data: { id: 'member-1', ...updateData }, error: null }
      }
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
      }),
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    await PUT(request, { params })

    // Assert
    expect(mockSupabase.update).toHaveBeenCalled()
    expect(updateData.first_name_ko).toBe('영희')
    expect(updateData.updated_at).toBeDefined()
  })

  test('should return 500 on database error', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
      membership_level_id: 'level-1',
    }

    let callCount = 0
    mockSupabase.single = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        return { data: existingMember, error: null }
      } else {
        return { data: null, error: { message: 'Database error' } }
      }
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'PUT',
      body: JSON.stringify({
        first_name_ko: '영희',
      }),
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await PUT(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to update member')
  })
})

describe('DELETE /api/members/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    }

    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  test('should return 401 when not authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await DELETE(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Unauthorized')
  })

  test('should return 404 when member not found', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    Object.assign(mockSupabase.single(), {
      data: null,
      error: { code: 'PGRST116' },
    })

    const request = new NextRequest('http://localhost:3000/api/members/non-existent', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'non-existent' })

    // Act
    const response = await DELETE(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Member not found')
  })

  test('should return 403 when user is not the owner', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-2' } }, // Different user
      error: null,
    })

    const existingMember = {
      user_id: 'user-1', // Owned by different user
    }

    Object.assign(mockSupabase.single(), {
      data: existingMember,
      error: null,
    })

    // admin-middleware returns non-admin
    mockGetAuthContext.mockResolvedValue({ isAdmin: false } as any)

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await DELETE(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('권한이 없습니다')
  })

  test('should soft delete member when user is the owner', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
    }

    Object.assign(mockSupabase.single(), {
      data: existingMember,
      error: null,
    })

    mockSupabase.update = jest.fn().mockReturnThis()
    Object.assign(mockSupabase, {
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await DELETE(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('회원이 성공적으로 비활성화되었습니다.')
    expect(mockSupabase.update).toHaveBeenCalled()

    // Verify soft delete (status set to inactive)
    const updateCall = (mockSupabase.update as jest.Mock).mock.calls[0][0]
    expect(updateCall.membership_status).toBe('inactive')
    expect(updateCall.updated_at).toBeDefined()
  })

  test('should return 500 on database error', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
    }

    Object.assign(mockSupabase.single(), {
      data: existingMember,
      error: null,
    })

    mockSupabase.update = jest.fn().mockReturnThis()
    Object.assign(mockSupabase, {
      error: { message: 'Database error' },
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    const response = await DELETE(request, { params })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to deactivate member')
  })

  test('should verify member is soft deleted, not hard deleted', async () => {
    // Arrange
    mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const existingMember = {
      user_id: 'user-1',
    }

    Object.assign(mockSupabase.single(), {
      data: existingMember,
      error: null,
    })

    let updateData: any
    mockSupabase.update = jest.fn(data => {
      updateData = data
      return mockSupabase
    })

    Object.assign(mockSupabase, {
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/members/member-1', {
      method: 'DELETE',
    })
    const params = Promise.resolve({ id: 'member-1' })

    // Act
    await DELETE(request, { params })

    // Assert - verify it's an update (soft delete), not a delete
    expect(mockSupabase.update).toHaveBeenCalled()
    expect(updateData.membership_status).toBe('inactive')
    // Verify there's no actual delete operation
    expect(mockSupabase.delete).toBeUndefined()
  })
})
