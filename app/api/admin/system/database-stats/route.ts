import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStats, cleanupOldData } from '@/lib/db/utils';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET - 데이터베이스 통계 조회
export async function GET(request: NextRequest) {
  try {
    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    // 기본 테이블 통계
    const basicStats = await getDatabaseStats();

    let detailedStats = {};
    
    if (includeDetails) {
      // 상세 통계 조회
      const [
        memberStats,
        analysisStats,
        activityStats,
        programStats,
        fileStats,
        performanceStats
      ] = await Promise.all([
        // 회원 통계
        db.execute(sql`
          SELECT 
            status,
            tier_level,
            COUNT(*) as count
          FROM members 
          GROUP BY status, tier_level
          ORDER BY tier_level, status
        `),
        
        // AI 분석 통계
        db.execute(sql`
          SELECT 
            calligraphy_style,
            status,
            COUNT(*) as count,
            AVG(overall_score) as avg_score,
            AVG(confidence) as avg_confidence
          FROM calligraphy_analyses 
          GROUP BY calligraphy_style, status
          ORDER BY calligraphy_style, status
        `),
        
        // 활동 통계 (최근 30일)
        db.execute(sql`
          SELECT 
            activity_type,
            COUNT(*) as count,
            SUM(points) as total_points
          FROM member_activities 
          WHERE timestamp >= ${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)}
          GROUP BY activity_type
          ORDER BY count DESC
        `),
        
        // 문화교류 프로그램 통계
        db.execute(sql`
          SELECT 
            program_type,
            status,
            COUNT(*) as count,
            SUM(current_participants) as total_participants,
            AVG(current_participants * 100.0 / max_participants) as avg_fill_rate
          FROM cultural_exchange_programs 
          GROUP BY program_type, status
          ORDER BY program_type, status
        `),
        
        // 파일 저장소 통계
        db.execute(sql`
          SELECT 
            file_type,
            purpose,
            COUNT(*) as count,
            SUM(file_size) as total_size,
            AVG(file_size) as avg_size
          FROM file_storage 
          GROUP BY file_type, purpose
          ORDER BY file_type, count DESC
        `),
        
        // 성능 메트릭 통계 (최근 24시간)
        db.execute(sql`
          SELECT 
            metric_type,
            COUNT(*) as count,
            AVG(value) as avg_value,
            MIN(value) as min_value,
            MAX(value) as max_value
          FROM performance_metrics 
          WHERE timestamp >= ${Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)}
          GROUP BY metric_type
          ORDER BY metric_type
        `)
      ]);

      detailedStats = {
        members: {
          byStatus: memberStats.rows.reduce((acc: any, row: any) => {
            const key = `${row.status}_tier_${row.tier_level}`;
            acc[key] = Number(row.count);
            return acc;
          }, {}),
          totalByStatus: memberStats.rows.reduce((acc: any, row: any) => {
            acc[row.status] = (acc[row.status] || 0) + Number(row.count);
            return acc;
          }, {})
        },
        
        analyses: {
          byStyleAndStatus: analysisStats.rows.map((row: any) => ({
            style: row.calligraphy_style,
            status: row.status,
            count: Number(row.count),
            avgScore: row.avg_score ? Number(row.avg_score) : null,
            avgConfidence: row.avg_confidence ? Number(row.avg_confidence) : null
          })),
          totalByStyle: analysisStats.rows.reduce((acc: any, row: any) => {
            acc[row.calligraphy_style] = (acc[row.calligraphy_style] || 0) + Number(row.count);
            return acc;
          }, {})
        },
        
        activities: {
          recent30Days: activityStats.rows.map((row: any) => ({
            type: row.activity_type,
            count: Number(row.count),
            totalPoints: Number(row.total_points || 0)
          }))
        },
        
        programs: {
          byTypeAndStatus: programStats.rows.map((row: any) => ({
            type: row.program_type,
            status: row.status,
            count: Number(row.count),
            totalParticipants: Number(row.total_participants || 0),
            avgFillRate: row.avg_fill_rate ? Number(row.avg_fill_rate) : 0
          }))
        },
        
        files: {
          byTypeAndPurpose: fileStats.rows.map((row: any) => ({
            type: row.file_type,
            purpose: row.purpose,
            count: Number(row.count),
            totalSize: Number(row.total_size),
            avgSize: Number(row.avg_size)
          })),
          totalSizeByType: fileStats.rows.reduce((acc: any, row: any) => {
            acc[row.file_type] = (acc[row.file_type] || 0) + Number(row.total_size);
            return acc;
          }, {})
        },
        
        performance: {
          last24Hours: performanceStats.rows.map((row: any) => ({
            metricType: row.metric_type,
            count: Number(row.count),
            avgValue: Number(row.avg_value),
            minValue: Number(row.min_value),
            maxValue: Number(row.max_value)
          }))
        }
      };
    }

    // 데이터베이스 크기 정보 (SQLite 특화)
    const sizeInfo = await db.execute(sql`
      SELECT 
        name,
        COUNT(*) as row_count
      FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `);

    return NextResponse.json({
      success: true,
      stats: {
        basic: basicStats,
        detailed: detailedStats,
        tables: sizeInfo.rows.map((row: any) => ({
          name: row.name,
          rowCount: Number(row.row_count)
        })),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { success: false, error: '데이터베이스 통계를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST - 데이터베이스 관리 작업
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options = {} } = body;

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    switch (action) {
      case 'cleanup':
        await cleanupOldData();
        return NextResponse.json({
          success: true,
          message: '오래된 데이터 정리가 완료되었습니다'
        });

      case 'vacuum':
        // SQLite VACUUM 실행
        await db.execute(sql`VACUUM`);
        return NextResponse.json({
          success: true,
          message: '데이터베이스 최적화가 완료되었습니다'
        });

      case 'analyze':
        // SQLite ANALYZE 실행
        await db.execute(sql`ANALYZE`);
        return NextResponse.json({
          success: true,
          message: '데이터베이스 분석이 완료되었습니다'
        });

      case 'integrity_check':
        const integrityResult = await db.execute(sql`PRAGMA integrity_check`);
        return NextResponse.json({
          success: true,
          result: integrityResult.rows,
          message: '데이터베이스 무결성 검사가 완료되었습니다'
        });

      default:
        return NextResponse.json({
          success: false,
          error: '지원하지 않는 작업입니다'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error executing database management task:', error);
    return NextResponse.json(
      { success: false, error: '데이터베이스 관리 작업 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}