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
      titleKo: program.titleKo || undefined,
      titleEn: program.titleEn || undefined,
      titleCn: program.titleCn || undefined,
      titleJp: program.titleJp || undefined,
      description: program.description || undefined,
      descriptionKo: program.descriptionKo || undefined,
      descriptionEn: program.descriptionEn || undefined,
      descriptionCn: program.descriptionCn || undefined,
      descriptionJp: program.descriptionJp || undefined,
      programType: program.programType,
      duration: program.duration || 0,
      maxParticipants: program.maxParticipants || 0,
      currentParticipants: program.currentParticipants || 0,
      fee: program.fee || 0,
      currency: program.currency || 'KRW',
      location: program.location || '', 
      venue: program.venue || undefined,
      accommodationProvided: program.accommodationProvided || false,
      mealsProvided: program.mealsProvided || false,
      transportationProvided: program.transportationProvided || false,
      organizerId: program.organizerId || '',
      isFeatured: program.isFeatured || false,
      metadata: (program.metadata as Record<string, any>) || undefined,
      startDate: new Date(program.startDate),
      endDate: new Date(program.endDate),
      applicationDeadline: program.applicationDeadline ? new Date(program.applicationDeadline) : undefined,
      createdAt: new Date(program.createdAt),
      updatedAt: new Date(program.updatedAt),
      // JSON 필드 처리 (이미 객체임)
      targetAudience: (program.targetAudience as unknown as number[]) || [],
      partnerOrganizations: (program.partnerOrganizations as any[]) || [],
      countries: (program.countries as string[]) || [],
      languages: (program.languages as string[]) || [],
      requirements: (program.requirements as any[]) || [],
      benefits: (program.benefits as any[]) || [],
      schedule: ((program.schedule as any[]) || []).map((item: any) => ({
        ...item,
        date: new Date(item.date)
      })),
      coordinators: (program.coordinators as any[]) || [],
      images: (program.images as string[]) || [],
      documents: ((program.documents as any[]) || []).map((doc: any) => ({
        ...doc,
        updatedAt: new Date(doc.updatedAt)
      }))
    }

    return NextResponse.json({
      success: true,
      program: formattedProgram,
      participantsCount: participants.length,
      participants: participants.map((p: any) => ({
        ...p,
        appliedAt: new Date(p.appliedAt),
        approvedAt: p.approvedAt ? new Date(p.approvedAt) : undefined,
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined
      }))
    })

  } catch (error) {

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
      updatedAt: new Date()
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

    // JSON 필드들 (DB에는 객체로 저장)
    const jsonFields = [
      'targetAudience', 'partnerOrganizations', 'countries', 'languages',
      'requirements', 'benefits', 'coordinators', 'images', 'documents'
    ]

    jsonFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // 날짜 필드들
    if (body.applicationDeadline !== undefined) {
      updateData.applicationDeadline = body.applicationDeadline ? 
        new Date(body.applicationDeadline) : null
    }
    if (body.startDate !== undefined) {
      updateData.startDate = new Date(body.startDate)
    }
    if (body.endDate !== undefined) {
      updateData.endDate = new Date(body.endDate)
    }

    // 스케줄 처리
    if (body.schedule !== undefined) {
      updateData.schedule = body.schedule.map((item: any) => ({
        ...item,
        date: item.date // Keep as string or convert if needed by schema (jsonb stores whatever)
      }))
    }

    // 문서 처리
    if (body.documents !== undefined) {
      updateData.documents = body.documents
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

    return NextResponse.json(
      { success: false, error: '프로그램 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}