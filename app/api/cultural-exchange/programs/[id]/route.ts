import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { culturalExchangePrograms, culturalExchangeParticipants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { CulturalExchangeProgramInfo } from '@/lib/types/membership'

// GET - 특정 프로그램 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params

    // 프로그램 기본 정보 조회
    const programResult = await db
      .select()
      .from(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))
      .limit(1)

    if (!programResult[0]) {
      return NextResponse.json(
        { success: false, error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const program = programResult[0]

    // 참가자 정보 조회
    const participants = await db
      .select()
      .from(culturalExchangeParticipants)
      .where(eq(culturalExchangeParticipants.programId, programId))

    // 데이터 변환
    const formattedProgram: CulturalExchangeProgramInfo = {
      ...program,
      startDate: new Date(Number(program.startDate) * 1000),
      endDate: new Date(Number(program.endDate) * 1000),
      applicationDeadline: program.applicationDeadline ? new Date(Number(program.applicationDeadline) * 1000) : undefined,
      createdAt: new Date(Number(program.createdAt) * 1000),
      updatedAt: new Date(Number(program.updatedAt) * 1000),
      // JSON 필드 파싱
      partnerOrganizations: program.partnerOrganizations ? JSON.parse(program.partnerOrganizations) : [],
      countries: program.countries ? JSON.parse(program.countries) : [],
      languages: program.languages ? JSON.parse(program.languages) : [],
      requirements: program.requirements ? JSON.parse(program.requirements) : [],
      benefits: program.benefits ? JSON.parse(program.benefits) : [],
      schedule: program.schedule ? JSON.parse(program.schedule).map((item: any) => ({
        ...item,
        date: new Date(item.date)
      })) : [],
      coordinators: program.coordinators ? JSON.parse(program.coordinators) : [],
      images: program.images ? JSON.parse(program.images) : [],
      documents: program.documents ? JSON.parse(program.documents).map((doc: any) => ({
        ...doc,
        updatedAt: new Date(doc.updatedAt)
      })) : []
    }

    return NextResponse.json({
      success: true,
      program: formattedProgram,
      participantsCount: participants.length,
      participants: participants.map(p => ({
        ...p,
        appliedAt: new Date(Number(p.appliedAt) * 1000),
        approvedAt: p.approvedAt ? new Date(Number(p.approvedAt) * 1000) : undefined,
        completedAt: p.completedAt ? new Date(Number(p.completedAt) * 1000) : undefined
      }))
    })

  } catch (error) {
    console.error('Error fetching program details:', error)
    return NextResponse.json(
      { success: false, error: '프로그램 정보를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - 프로그램 정보 수정 (관리자 전용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params
    const body = await request.json()

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request)
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
    // }

    // 프로그램 존재 확인
    const existingProgram = await db
      .select()
      .from(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))
      .limit(1)

    if (!existingProgram[0]) {
      return NextResponse.json(
        { success: false, error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      updatedAt: Math.floor(Date.now() / 1000)
    }

    // 업데이트할 필드들
    const fields = [
      'title', 'titleKo', 'titleEn', 'titleCn', 'titleJp',
      'description', 'descriptionKo', 'descriptionEn', 'descriptionCn', 'descriptionJp',
      'programType', 'duration', 'maxParticipants', 'fee', 'currency',
      'location', 'venue', 'accommodationProvided', 'mealsProvided', 'transportationProvided',
      'organizerId', 'isFeatured', 'status'
    ]

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // JSON 필드들
    const jsonFields = [
      'targetAudience', 'partnerOrganizations', 'countries', 'languages',
      'requirements', 'benefits', 'coordinators', 'images', 'documents'
    ]

    jsonFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = JSON.stringify(body[field])
      }
    })

    // 날짜 필드들
    if (body.applicationDeadline !== undefined) {
      updateData.applicationDeadline = body.applicationDeadline ? 
        Math.floor(new Date(body.applicationDeadline).getTime() / 1000) : null
    }
    if (body.startDate !== undefined) {
      updateData.startDate = Math.floor(new Date(body.startDate).getTime() / 1000)
    }
    if (body.endDate !== undefined) {
      updateData.endDate = Math.floor(new Date(body.endDate).getTime() / 1000)
    }

    // 스케줄 처리
    if (body.schedule !== undefined) {
      updateData.schedule = JSON.stringify(body.schedule.map((item: any) => ({
        ...item,
        date: item.date instanceof Date ? item.date.toISOString() : item.date
      })))
    }

    // 문서 처리
    if (body.documents !== undefined) {
      updateData.documents = JSON.stringify(body.documents.map((doc: any) => ({
        ...doc,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt
      })))
    }

    // 업데이트 실행
    const result = await db
      .update(culturalExchangePrograms)
      .set(updateData)
      .where(eq(culturalExchangePrograms.id, programId))
      .returning()

    if (!result[0]) {
      throw new Error('프로그램 업데이트에 실패했습니다')
    }

    return NextResponse.json({
      success: true,
      program: result[0],
      message: '프로그램이 성공적으로 업데이트되었습니다'
    })

  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { success: false, error: '프로그램 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE - 프로그램 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request)
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
    // }

    // 프로그램 존재 확인
    const existingProgram = await db
      .select()
      .from(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))
      .limit(1)

    if (!existingProgram[0]) {
      return NextResponse.json(
        { success: false, error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 참가자가 있는지 확인
    const participants = await db
      .select()
      .from(culturalExchangeParticipants)
      .where(eq(culturalExchangeParticipants.programId, programId))

    if (participants.length > 0) {
      return NextResponse.json(
        { success: false, error: '참가자가 있는 프로그램은 삭제할 수 없습니다' },
        { status: 400 }
      )
    }

    // 프로그램 삭제
    await db
      .delete(culturalExchangePrograms)
      .where(eq(culturalExchangePrograms.id, programId))

    return NextResponse.json({
      success: true,
      message: '프로그램이 성공적으로 삭제되었습니다'
    })

  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { success: false, error: '프로그램 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}