import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { culturalExchangeParticipants, culturalExchangePrograms, members } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getAuthUser, requireAdminAuth } from '@/lib/auth/middleware'
import type {
  CulturalExchangeParticipantInfo,
  ParticipantApplicationData,
  ParticipantStatus,
  PaymentStatus,
} from '@/lib/types/membership'

/** 응답에 담는 회원 열. 신청 내역에는 이름과 회원번호만 필요하다. */
const APPLICANT_COLUMNS = {
  id: members.id,
  fullName: members.fullName,
  fullNameKo: members.fullNameKo,
  fullNameEn: members.fullNameEn,
  membershipNumber: members.membershipNumber,
}

/** Drizzle timestamp 는 이미 Date 다. 문자열(PostgREST 경로)도 받아 준다. */
function toDate(value: Date | string | null | undefined): Date | undefined {
  if (value == null) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** jsonb 열은 이미 객체로 온다. 예전 데이터가 문자열이면 그때만 파싱한다. */
function fromJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value !== 'string') return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/**
 * 관리자(aal2)는 전체를, 일반 회원은 자기 memberId 의 신청만 볼 수 있다.
 * 허용되면 null, 아니면 거절 응답을 돌려준다.
 */
async function authorizeApplicationsRead(memberId: string | null): Promise<NextResponse | null> {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 })
  }
  if (user.role === 'admin' && user.assuranceLevel === 'aal2') return null

  if (!memberId) {
    return NextResponse.json({ success: false, error: '관리자 인증이 필요합니다' }, { status: 403 })
  }
  const [own] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.userId, user.id)))
    .limit(1)
  if (!own) {
    return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
  }
  return null
}

// GET - 신청 내역 조회 (본인 또는 관리자)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const programId = searchParams.get('programId')
    const status = searchParams.get('status') as ParticipantStatus | null

    const denied = await authorizeApplicationsRead(memberId)
    if (denied) return denied

    // 조건 구성
    const conditions = []

    if (memberId) {
      conditions.push(eq(culturalExchangeParticipants.memberId, memberId))
    }

    if (programId) {
      conditions.push(eq(culturalExchangeParticipants.programId, programId))
    }

    if (status) {
      conditions.push(eq(culturalExchangeParticipants.status, status))
    }

    // 신청 내역 조회 (프로그램 정보와 조인)
    const applications = await db
      .select({
        participant: culturalExchangeParticipants,
        program: culturalExchangePrograms,
        member: APPLICANT_COLUMNS,
      })
      .from(culturalExchangeParticipants)
      .leftJoin(
        culturalExchangePrograms,
        eq(culturalExchangeParticipants.programId, culturalExchangePrograms.id)
      )
      .leftJoin(members, eq(culturalExchangeParticipants.memberId, members.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(culturalExchangeParticipants.appliedAt))

    const formattedApplications = applications.map(app => ({
      ...app.participant,
      appliedAt: toDate(app.participant.appliedAt),
      approvedAt: toDate(app.participant.approvedAt),
      completedAt: toDate(app.participant.completedAt),
      applicationData: fromJson(app.participant.applicationData, {}),
      emergencyContact: fromJson(app.participant.emergencyContact, {}),
      feedback: fromJson(app.participant.feedback, undefined),
      program: app.program
        ? {
            ...app.program,
            startDate: toDate(app.program.startDate),
            endDate: toDate(app.program.endDate),
            applicationDeadline: toDate(app.program.applicationDeadline),
          }
        : undefined,
      member: app.member
        ? {
            ...app.member,
            fullName: app.member.fullName || '',
            membershipNumber: app.member.membershipNumber || '',
          }
        : undefined,
    }))

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '신청 내역을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 프로그램 신청
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const user = await requireAdminAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()

    const { programId, memberId, applicationData, specialRequests, emergencyContact } = body

    // 프로그램 존재 및 모집 중 확인
    const program = await db
      .select()
      .from(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))
      .limit(1)

    const selectedProgram = program[0]

    if (!selectedProgram) {
      return NextResponse.json(
        { success: false, error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (selectedProgram.status !== 'open_for_applications') {
      return NextResponse.json(
        { success: false, error: '현재 모집 중이지 않은 프로그램입니다' },
        { status: 400 }
      )
    }

    // 마감일 확인
    if (
      selectedProgram.applicationDeadline &&
      Date.now() > Number(selectedProgram.applicationDeadline) * 1000
    ) {
      return NextResponse.json(
        { success: false, error: '신청 마감일이 지났습니다' },
        { status: 400 }
      )
    }

    // 정원 확인
    if (
      selectedProgram.maxParticipants &&
      (selectedProgram.currentParticipants || 0) >= selectedProgram.maxParticipants
    ) {
      return NextResponse.json(
        { success: false, error: '모집 정원이 마감되었습니다' },
        { status: 400 }
      )
    }

    // 중복 신청 확인
    const existingApplication = await db
      .select()
      .from(culturalExchangeParticipants)
      .where(
        and(
          eq(culturalExchangeParticipants.programId, programId),
          eq(culturalExchangeParticipants.memberId, memberId)
        )
      )
      .limit(1)

    if (existingApplication[0]) {
      return NextResponse.json(
        { success: false, error: '이미 신청한 프로그램입니다' },
        { status: 400 }
      )
    }

    // 회원 정보 확인
    const member = await db.select().from(members).where(eq(members.id, memberId)).limit(1)

    if (!member[0]) {
      return NextResponse.json(
        { success: false, error: '회원 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 자격 요건 확인 (안전한 처리 추가)
    let requirements: any[] = []
    try {
      requirements = (selectedProgram.requirements as any[]) || []
    } catch (error) {
      requirements = []
    }

    const memberTierLevel = member[0].tierLevel || 1

    for (const req of requirements) {
      if (req?.mandatory) {
        if (req.type === 'membership_level' && req.details?.minimumLevel) {
          if (memberTierLevel < req.details.minimumLevel) {
            return NextResponse.json(
              { success: false, error: `회원 등급이 부족합니다. ${req.description || ''}` },
              { status: 400 }
            )
          }
        }

        if (req.type === 'experience' && req.details?.minimumYears) {
          const memberExperience = member[0].calligraphyExperience || 0
          if (memberExperience < req.details.minimumYears) {
            return NextResponse.json(
              { success: false, error: `경력이 부족합니다. ${req.description || ''}` },
              { status: 400 }
            )
          }
        }
      }
    }

    // 신청 생성
    const newApplication = {
      id: crypto.randomUUID(),
      programId,
      memberId,
      applicationData: JSON.stringify(applicationData),
      specialRequests,
      emergencyContact: JSON.stringify(emergencyContact),
      status: 'applied' as ParticipantStatus,
      paymentStatus: 'pending' as PaymentStatus,
      appliedAt: new Date(),
      metadata: JSON.stringify({}),
    }

    const result = await db
      .insert(culturalExchangeParticipants)
      .values([newApplication])
      .returning()

    if (!result[0]) {
      throw new Error('신청 처리에 실패했습니다')
    }

    // 프로그램 참가자 수 업데이트
    await db
      .update(culturalExchangePrograms)
      .set({
        currentParticipants: (selectedProgram.currentParticipants || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(culturalExchangePrograms.id, programId))

    // TODO: 신청 완료 알림 이메일 발송

    return NextResponse.json({
      success: true,
      application: {
        ...result[0],
        appliedAt: new Date(result[0].appliedAt),
        applicationData: result[0].applicationData || {},
        emergencyContact: result[0].emergencyContact || {},
      },
      message: '프로그램 신청이 완료되었습니다',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
