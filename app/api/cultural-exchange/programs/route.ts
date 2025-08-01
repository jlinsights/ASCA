import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { culturalExchangePrograms, culturalExchangeParticipants } from '@/lib/db/schema'
import { eq, desc, asc, and, inArray, gte, lte } from 'drizzle-orm'
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
      .select({ count: 'count(*)' })
      .from(culturalExchangePrograms)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const totalResult = await totalQuery
    const total = totalResult[0]?.count || 0

    // 데이터 변환
    const formattedPrograms: CulturalExchangeProgramInfo[] = programs.map(program => ({
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
    console.error('Error fetching cultural exchange programs:', error)
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
      targetAudience: JSON.stringify(targetAudience),
      partnerOrganizations: JSON.stringify(partnerOrganizations || []),
      countries: JSON.stringify(countries || []),
      languages: JSON.stringify(languages || []),
      duration,
      maxParticipants,
      currentParticipants: 0,
      fee,
      currency: currency || 'KRW',
      location,
      venue,
      accommodationProvided: accommodationProvided || false,
      mealsProvided: mealsProvided || false,
      transportationProvided: transportationProvided || false,
      requirements: JSON.stringify(requirements || []),
      benefits: JSON.stringify(benefits || []),
      schedule: JSON.stringify(schedule?.map((item: any) => ({
        ...item,
        date: item.date instanceof Date ? item.date.toISOString() : item.date
      })) || []),
      applicationDeadline: applicationDeadline ? Math.floor(new Date(applicationDeadline).getTime() / 1000) : null,
      startDate: Math.floor(new Date(startDate).getTime() / 1000),
      endDate: Math.floor(new Date(endDate).getTime() / 1000),
      status: 'planning' as CulturalProgramStatus,
      organizerId,
      coordinators: JSON.stringify(coordinators || []),
      images: JSON.stringify(images || []),
      documents: JSON.stringify(documents?.map((doc: any) => ({
        ...doc,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt
      })) || []),
      isFeatured: isFeatured || false,
      metadata: JSON.stringify({}),
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }

    const result = await db.insert(culturalExchangePrograms).values(newProgram).returning()
    
    if (!result[0]) {
      throw new Error('프로그램 생성에 실패했습니다')
    }

    return NextResponse.json({
      success: true,
      program: result[0],
      message: '프로그램이 성공적으로 생성되었습니다'
    })

  } catch (error) {
    console.error('Error creating cultural exchange program:', error)
    return NextResponse.json(
      { success: false, error: '프로그램 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}