import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await getPendingApplications()
  return NextResponse.json({ success: true, data })
}

type PostBody =
  | { op: 'approve'; applicationId: string }
  | { op: 'reject'; applicationId: string; reason: string }
  | { op: 'seed-test' }

/** POST: 승인 / 거절 / 테스트 시드 */
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.op) {
    return NextResponse.json({ error: 'Missing op' }, { status: 400 })
  }

  if (body.op === 'approve') {
    if (!body.applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })
    }
    const res = await approveApplication(body.applicationId)
    return NextResponse.json(res)
  }

  if (body.op === 'reject') {
    if (!body.applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 })
    }
    const res = await rejectApplication(body.applicationId, body.reason || 'No reason provided')
    return NextResponse.json(res)
  }

  if (body.op === 'seed-test') {
    const res = await seedTestApplication()
    return NextResponse.json(res)
  }

  return NextResponse.json({ error: 'Unknown op' }, { status: 400 })
}
