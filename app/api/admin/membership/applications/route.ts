import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/auth/middleware'
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  seedTestApplication,
} from '@/lib/membership/admin-application-service'

/** GET: 대기 중인 멤버십 신청 목록 */
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const data = await getPendingApplications()
  return NextResponse.json({ success: true, data })
}

const approveSchema = z.object({
  op: z.literal('approve'),
  applicationId: z.string().uuid(),
})
const rejectSchema = z.object({
  op: z.literal('reject'),
  applicationId: z.string().uuid(),
  reason: z.string().min(1).max(1000).optional(),
})
const seedTestSchema = z.object({ op: z.literal('seed-test') })
const postBodySchema = z.discriminatedUnion('op', [approveSchema, rejectSchema, seedTestSchema])

/** POST: 승인 / 거절 / 테스트 시드 */
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const raw: unknown = await request.json().catch(() => null)
  const parsed = postBodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const body = parsed.data

  if (body.op === 'approve') {
    const res = await approveApplication(body.applicationId)
    return NextResponse.json(res)
  }

  if (body.op === 'reject') {
    const res = await rejectApplication(body.applicationId, body.reason ?? 'No reason provided')
    return NextResponse.json(res)
  }

  const res = await seedTestApplication()
  return NextResponse.json(res)
}
