/**
 * @jest-environment node
 *
 * GET /api/cultural-exchange/applications
 * - 관리자(aal2)는 전체, 일반 회원은 자기 memberId 의 신청만 본다.
 * - 응답의 회원 정보는 이름·회원번호뿐이다.
 * - Drizzle 이 주는 Date·jsonb 값을 그대로 쓴다(×1000·JSON.parse 금지).
 */

jest.mock('@/lib/db', () => ({ db: { select: jest.fn() } }))
jest.mock('@/lib/auth/middleware', () => ({
  getAuthUser: jest.fn(),
  requireAdminAuth: jest.fn(),
}))

import { describe, test, expect, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth/middleware'
import { GET } from '../route'

const mockSelect = db.select as unknown as jest.Mock
const mockGetAuthUser = getAuthUser as jest.MockedFunction<typeof getAuthUser>

const ADMIN = { id: 'admin-1', role: 'admin', assuranceLevel: 'aal2' as const }
const MEMBER_USER = { id: 'user-1', role: 'member', assuranceLevel: 'aal1' as const }

/** 어떤 메서드를 불러도 자기 자신을 돌려주고, await 하면 rows 로 풀리는 쿼리 체인 */
function queryChain(rows: unknown[]) {
  const chain: Record<string, jest.Mock> & { then?: unknown } = {}
  for (const method of ['from', 'where', 'limit', 'leftJoin', 'orderBy']) {
    chain[method] = jest.fn(() => chain)
  }
  chain.then = (resolve: (value: unknown[]) => unknown) => resolve(rows)
  return chain
}

const appliedAt = new Date('2026-10-01T09:00:00.000Z')
const startDate = new Date('2027-03-01T00:00:00.000Z')

const applicationRow = {
  participant: {
    id: 'p-1',
    memberId: 'member-1',
    programId: 'prog-1',
    status: 'applied',
    appliedAt,
    approvedAt: null,
    completedAt: null,
    applicationData: { motivation: '서예 교류' },
    emergencyContact: { name: '보호자', phone: '010-0000-0000' },
    feedback: null,
  },
  program: {
    id: 'prog-1',
    startDate,
    endDate: startDate,
    applicationDeadline: null,
  },
  member: { id: 'member-1', fullName: '김서예', membershipNumber: 'M-001' },
}

function request(query = '') {
  return new NextRequest(`http://localhost:3000/api/cultural-exchange/applications${query}`)
}

describe('GET /api/cultural-exchange/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when nobody is logged in', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)

    const response = await GET(request('?memberId=member-1'))

    expect(response.status).toBe(401)
    expect(mockSelect).not.toHaveBeenCalled()
  })

  test('a non-admin cannot list everyone', async () => {
    mockGetAuthUser.mockResolvedValueOnce(MEMBER_USER)

    const response = await GET(request())

    expect(response.status).toBe(403)
    expect(mockSelect).not.toHaveBeenCalled()
  })

  test("a non-admin cannot read another member's applications", async () => {
    mockGetAuthUser.mockResolvedValueOnce(MEMBER_USER)
    mockSelect.mockReturnValueOnce(queryChain([])) // ownership check finds nothing

    const response = await GET(request('?memberId=someone-else'))

    expect(response.status).toBe(403)
    expect(mockSelect).toHaveBeenCalledTimes(1) // the applications query never runs
  })

  test('a member can read their own applications', async () => {
    mockGetAuthUser.mockResolvedValueOnce(MEMBER_USER)
    mockSelect
      .mockReturnValueOnce(queryChain([{ id: 'member-1' }]))
      .mockReturnValueOnce(queryChain([applicationRow]))

    const response = await GET(request('?memberId=member-1'))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.applications).toHaveLength(1)
  })

  test('an admin can list everything without memberId', async () => {
    mockGetAuthUser.mockResolvedValueOnce(ADMIN)
    mockSelect.mockReturnValueOnce(queryChain([applicationRow]))

    const response = await GET(request())

    expect(response.status).toBe(200)
    expect(mockSelect).toHaveBeenCalledTimes(1) // no ownership lookup for admins
  })

  test('joins only name and membership number from members', async () => {
    mockGetAuthUser.mockResolvedValueOnce(ADMIN)
    mockSelect.mockReturnValueOnce(queryChain([applicationRow]))

    await GET(request())

    const selection = mockSelect.mock.calls[0][0] as { member: Record<string, unknown> }
    const memberColumns = Object.keys(selection.member)
    expect(memberColumns).toEqual(expect.arrayContaining(['id', 'fullName', 'membershipNumber']))
    for (const secret of ['dateOfBirth', 'phoneNumber', 'address', 'emergencyContactPhone']) {
      expect(memberColumns).not.toContain(secret)
    }
  })

  test('keeps Date and jsonb values as they come from Drizzle', async () => {
    mockGetAuthUser.mockResolvedValueOnce(ADMIN)
    mockSelect.mockReturnValueOnce(queryChain([applicationRow]))

    const response = await GET(request())
    const [application] = (await response.json()).applications

    expect(application.appliedAt).toBe(appliedAt.toISOString())
    expect(application.program.startDate).toBe(startDate.toISOString())
    expect(application.approvedAt).toBeUndefined()
    expect(application.applicationData).toEqual({ motivation: '서예 교류' })
    expect(application.emergencyContact).toEqual({ name: '보호자', phone: '010-0000-0000' })
  })
})
