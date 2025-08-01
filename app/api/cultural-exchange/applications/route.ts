import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { culturalExchangeParticipants, culturalExchangePrograms, members } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { 
  CulturalExchangeParticipantInfo,
  ParticipantApplicationData,
  ParticipantStatus,
  PaymentStatus
} from '@/lib/types/membership'

// GET - 신청 내역 조회 (본인 또는 관리자)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const programId = searchParams.get('programId')
    const status = searchParams.get('status') as ParticipantStatus | null

    // TODO: 사용자 인증 및 권한 확인
    // const user = await getCurrentUser(request)
    // if (!user) {
    //   return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 })
    // }

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
        member: members
      })
      .from(culturalExchangeParticipants)
      .leftJoin(culturalExchangePrograms, eq(culturalExchangeParticipants.programId, culturalExchangePrograms.id))
      .leftJoin(members, eq(culturalExchangeParticipants.memberId, members.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(culturalExchangeParticipants.appliedAt))

    // 데이터 변환
    const formattedApplications = applications.map(app => ({
      ...app.participant,
      appliedAt: new Date(Number(app.participant.appliedAt) * 1000),
      approvedAt: app.participant.approvedAt ? new Date(Number(app.participant.approvedAt) * 1000) : undefined,
      completedAt: app.participant.completedAt ? new Date(Number(app.participant.completedAt) * 1000) : undefined,
      applicationData: app.participant.applicationData ? JSON.parse(app.participant.applicationData) : {},
      emergencyContact: app.participant.emergencyContact ? JSON.parse(app.participant.emergencyContact) : {},
      feedback: app.participant.feedback ? JSON.parse(app.participant.feedback) : undefined,
      program: app.program ? {
        ...app.program,
        startDate: new Date(Number(app.program.startDate) * 1000),
        endDate: new Date(Number(app.program.endDate) * 1000),
        applicationDeadline: app.program.applicationDeadline ? new Date(Number(app.program.applicationDeadline) * 1000) : undefined
      } : undefined,
      member: app.member ? {
        ...app.member,
        fullName: app.member.fullName,
        membershipNumber: app.member.membershipNumber
      } : undefined
    }))

    return NextResponse.json({
      success: true,
      applications: formattedApplications
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: '신청 내역을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 프로그램 신청
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: 사용자 인증
    // const user = await getCurrentUser(request)
    // if (!user) {
    //   return NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 })
    // }

    const {
      programId,
      memberId,
      applicationData,
      specialRequests,
      emergencyContact
    } = body

    // 프로그램 존재 및 모집 중 확인
    const program = await db
      .select()
      .from(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))
      .limit(1)

    if (!program[0]) {
      return NextResponse.json(
        { success: false, error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (program[0].status !== 'open_for_applications') {
      return NextResponse.json(
        { success: false, error: '현재 모집 중이지 않은 프로그램입니다' },
        { status: 400 }
      )
    }

    // 마감일 확인
    if (program[0].applicationDeadline && 
        Date.now() > Number(program[0].applicationDeadline) * 1000) {
      return NextResponse.json(
        { success: false, error: '신청 마감일이 지났습니다' },
        { status: 400 }
      )
    }

    // 정원 확인
    if (program[0].currentParticipants >= program[0].maxParticipants) {
      return NextResponse.json(
        { success: false, error: '모집 정원이 마감되었습니다' },
        { status: 400 }
      )
    }

    // 중복 신청 확인
    const existingApplication = await db
      .select()
      .from(culturalExchangeParticipants)
      .where(and(
        eq(culturalExchangeParticipants.programId, programId),
        eq(culturalExchangeParticipants.memberId, memberId)
      ))
      .limit(1)

    if (existingApplication[0]) {
      return NextResponse.json(
        { success: false, error: '이미 신청한 프로그램입니다' },
        { status: 400 }
      )
    }

    // 회원 정보 확인
    const member = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)

    if (!member[0]) {
      return NextResponse.json(
        { success: false, error: '회원 정보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 자격 요건 확인
    const requirements = program[0].requirements ? JSON.parse(program[0].requirements) : []
    const memberTierLevel = member[0].tierLevel
    
    for (const req of requirements) {
      if (req.mandatory) {
        if (req.type === 'membership_level' && req.details?.minimumLevel) {
          if (memberTierLevel < req.details.minimumLevel) {
            return NextResponse.json(
              { success: false, error: `회원 등급이 부족합니다. ${req.description}` },
              { status: 400 }
            )
          }
        }
        
        if (req.type === 'experience' && req.details?.minimumYears) {
          const memberExperience = member[0].calligraphyExperience || 0
          if (memberExperience < req.details.minimumYears) {
            return NextResponse.json(
              { success: false, error: `경력이 부족합니다. ${req.description}` },
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
      appliedAt: Math.floor(Date.now() / 1000),
      metadata: JSON.stringify({})
    }

    const result = await db
      .insert(culturalExchangeParticipants)
      .values(newApplication)
      .returning()

    if (!result[0]) {
      throw new Error('신청 처리에 실패했습니다')
    }

    // 프로그램 참가자 수 업데이트
    await db
      .update(culturalExchangePrograms)
      .set({ 
        currentParticipants: program[0].currentParticipants + 1,
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(culturalExchangePrograms.id, programId))

    // TODO: 신청 완료 알림 이메일 발송

    return NextResponse.json({
      success: true,
      application: {
        ...result[0],
        appliedAt: new Date(Number(result[0].appliedAt) * 1000),
        applicationData: JSON.parse(result[0].applicationData),
        emergencyContact: JSON.parse(result[0].emergencyContact)
      },
      message: '프로그램 신청이 완료되었습니다'
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: '신청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}