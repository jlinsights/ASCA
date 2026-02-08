import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { culturalExchangePrograms, culturalExchangeParticipants } from '@/lib/db/schema'
import { eq, desc, asc, and, inArray, gte, lte, sql } from 'drizzle-orm'
import type { 
  CulturalExchangeProgramInfo,
  CulturalProgramType,
  CulturalProgramStatus
} from '@/lib/types/membership'

// GET - 프로그램 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as CulturalProgramType | null
    const status = searchParams.get('status') as CulturalProgramStatus | null
    const country = searchParams.get('country')
    const featured = searchParams.get('featured') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 기본 쿼리 조건
    const conditions = []
    
    if (type) {
      conditions.push(eq(culturalExchangePrograms.programType, type))
    }
    
    if (status) {
      conditions.push(eq(culturalExchangePrograms.status, status))
    }
    
    if (featured) {
      conditions.push(eq(culturalExchangePrograms.isFeatured, true))
    }

    // 국가 필터 (JSON 배열 내 검색)
    // 실제 구현에서는 PostgreSQL의 JSON 연산자나 SQLite의 JSON 함수 사용 필요

    // 프로그램 목록 조회
    const programsQuery = db
      .select()
      .from(culturalExchangePrograms)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(culturalExchangePrograms.createdAt))
      .limit(limit)
      .offset(offset)

    const programs = await programsQuery

    // 총 개수 조회
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(culturalExchangePrograms)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const totalResult = await totalQuery
    const total = totalResult[0]?.count || 0

    // 데이터 변환
    const formattedPrograms: CulturalExchangeProgramInfo[] = programs.map((program: any) => ({
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
    }))

    return NextResponse.json({
      success: true,
      programs: formattedPrograms,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit)
      }
    })

  } catch (error) {

    return NextResponse.json(
      { success: false, error: '프로그램 목록을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - 새 프로그램 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request)
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
    // }

    const {
      title,
      titleKo,
      titleEn,
      titleCn,
      titleJp,
      description,
      descriptionKo,
      descriptionEn,
      descriptionCn,
      descriptionJp,
      programType,
      targetAudience,
      partnerOrganizations,
      countries,
      languages,
      duration,
      maxParticipants,
      fee,
      currency,
      location,
      venue,
      accommodationProvided,
      mealsProvided,
      transportationProvided,
      requirements,
      benefits,
      schedule,
      applicationDeadline,
      startDate,
      endDate,
      organizerId,
      coordinators,
      images,
      documents,
      isFeatured
    } = body

    const newProgram = {
      id: crypto.randomUUID(),
      title,
      titleKo,
      titleEn,
      titleCn,
      titleJp,
      description,
      descriptionKo,
      descriptionEn,
      descriptionCn,
      descriptionJp,
      programType,
      targetAudience: targetAudience || [], // Pass object directly
      partnerOrganizations: partnerOrganizations || [],
      countries: countries || [],
      languages: languages || [],
      duration: duration || 0,
      maxParticipants: maxParticipants || 0,
      currentParticipants: 0,
      fee: fee || 0,
      currency: currency || 'KRW',
      location: location || '',
      venue,
      accommodationProvided: accommodationProvided || false,
      mealsProvided: mealsProvided || false,
      transportationProvided: transportationProvided || false,
      requirements: requirements || [],
      benefits: benefits || [],
      schedule: (schedule || []).map((item: any) => ({
        ...item,
        date: item.date // Keep as string or Date compliant format
      })),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'planning' as CulturalProgramStatus,
      organizerId: organizerId || '',
      coordinators: coordinators || [],
      images: images || [],
      documents: (documents || []).map((doc: any) => ({
        ...doc,
        updatedAt: doc.updatedAt // Keep format
      })),
      isFeatured: isFeatured || false,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.insert(culturalExchangePrograms).values([newProgram]).returning()
    
    if (!result[0]) {
      throw new Error('프로그램 생성에 실패했습니다')
    }

    return NextResponse.json({
      success: true,
      program: result[0],
      message: '프로그램이 성공적으로 생성되었습니다'
    })

  } catch (error) {

    return NextResponse.json(
      { success: false, error: '프로그램 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}