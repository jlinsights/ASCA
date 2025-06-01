import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 빌드 시에는 간단한 응답 반환
    if (process.env.NODE_ENV === 'production' && !process.env.AIRTABLE_API_KEY) {
      return NextResponse.json({
        success: true,
        foundTables: [],
        totalTables: 0,
        message: 'Migration service not configured in production'
      })
    }

    // Airtable 환경변수 확인
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable credentials not configured' },
        { status: 400 }
      )
    }

    // 개발 환경에서만 실제 Airtable 접근
    const Airtable = (await import('airtable')).default
    const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
    const base = airtable.base(process.env.AIRTABLE_BASE_ID);

    // 일반적인 테이블명들을 시도해보기
    const possibleTableNames = [
      // 영어
      'Artists', 'Artworks', 'Exhibitions', 'Events', 'Notices',
      'Artist', 'Artwork', 'Exhibition', 'Event', 'Notice',
      // 한국어
      '작가', '작품', '전시', '행사', '공지',
      '작가들', '작품들', '전시회', '행사들', '공지사항',
      // 기타 가능한 이름들
      'Members', 'Gallery', 'Paintings', 'Calligraphy',
      'tblArtists', 'tblArtworks', 'tblExhibitions',
      // 테이블 1, 2, 3... (기본 생성 시)
      'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'
    ];

    const foundTables = [];
    const errors = [];

    for (const tableName of possibleTableNames) {
      try {
        // 각 테이블에서 1개 레코드만 가져와서 존재 여부 확인
        const records = await base(tableName).select({
          maxRecords: 1
        }).firstPage();
        
        foundTables.push({
          name: tableName,
          recordCount: 0, // 전체 개수는 다음 단계에서
          sample: records[0] ? Object.keys(records[0].fields) : []
        });
      } catch (error: any) {
        if (error.statusCode !== 404) {
          errors.push({
            table: tableName,
            error: error.message
          });
        }
      }
    }

    // 찾은 테이블들의 전체 레코드 수 확인
    for (const table of foundTables) {
      try {
        const records = await base(table.name).select().all();
        table.recordCount = records.length;
      } catch (error) {
        table.recordCount = -1; // 오류 표시용
      }
    }

    return NextResponse.json({
      success: true,
      foundTables,
      totalTables: foundTables.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error detecting Airtable tables:', error);
    return NextResponse.json(
      { error: 'Failed to detect tables' },
      { status: 500 }
    )
  }
} 