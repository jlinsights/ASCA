import { NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { authErrorResponse } from '@/lib/auth/middleware'

/** An Auth account is not proof of paid membership. Legacy membership is not provisioned. */
export async function GET() {
  try {
    const account = await getAccount()
    if (!account)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(
      { success: false, error: 'MEMBERSHIP_NOT_PROVISIONED' },
      { status: 404 }
    )
  } catch (error) {
    return authErrorResponse(error)
  }
}
