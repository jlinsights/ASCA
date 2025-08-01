import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { desc, and, eq, gte, lte, like } from 'drizzle-orm';
import { createPaginationQuery } from '@/lib/db/utils';

// GET - 감사 로그 조회
export async function GET(request: NextRequest) {
  try {
    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    
    // 필터링 파라미터
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const severity = searchParams.get('severity');
    const result = searchParams.get('result');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('search');
    
    // 페이지네이션 파라미터
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // 조건 구성
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    
    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }
    
    if (resource) {
      conditions.push(eq(auditLogs.resource, resource));
    }
    
    if (severity) {
      conditions.push(eq(auditLogs.severity, severity as any));
    }
    
    if (result) {
      conditions.push(eq(auditLogs.result, result as any));
    }
    
    if (startDate) {
      const timestamp = Math.floor(new Date(startDate).getTime() / 1000);
      conditions.push(gte(auditLogs.timestamp, timestamp));
    }
    
    if (endDate) {
      const timestamp = Math.floor(new Date(endDate).getTime() / 1000);
      conditions.push(lte(auditLogs.timestamp, timestamp));
    }
    
    if (searchTerm) {
      conditions.push(like(auditLogs.resourceId, `%${searchTerm}%`));
    }

    // 로그 조회
    const logsQuery = db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        severity: auditLogs.severity,
        result: auditLogs.result,
        errorMessage: auditLogs.errorMessage,
        metadata: auditLogs.metadata,
        timestamp: auditLogs.timestamp
      })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    const logs = await logsQuery;

    // 총 개수 조회
    const totalResult = await db
      .select({ count: 'count(*)' })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = totalResult[0]?.count || 0;

    // 데이터 변환
    const formattedLogs = logs.map(log => ({
      ...log,
      timestamp: new Date(Number(log.timestamp) * 1000),
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
        hasNext: offset + limit < Number(total),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: '감사 로그를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET - 감사 로그 통계
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statsType = 'summary', timeRange = '7d' } = body;

    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    const now = Math.floor(Date.now() / 1000);
    let startTimestamp = now;

    // 시간 범위 계산
    switch (timeRange) {
      case '1d':
        startTimestamp = now - (24 * 60 * 60);
        break;
      case '7d':
        startTimestamp = now - (7 * 24 * 60 * 60);
        break;
      case '30d':
        startTimestamp = now - (30 * 24 * 60 * 60);
        break;
      case '90d':
        startTimestamp = now - (90 * 24 * 60 * 60);
        break;
    }

    if (statsType === 'summary') {
      // 요약 통계
      const stats = await Promise.all([
        // 총 로그 수
        db.select({ count: 'count(*)' }).from(auditLogs)
          .where(gte(auditLogs.timestamp, startTimestamp)),
        
        // 액션별 통계
        db.select({ 
          action: auditLogs.action, 
          count: 'count(*)' 
        }).from(auditLogs)
          .where(gte(auditLogs.timestamp, startTimestamp))
          .groupBy(auditLogs.action),
        
        // 심각도별 통계
        db.select({ 
          severity: auditLogs.severity, 
          count: 'count(*)' 
        }).from(auditLogs)
          .where(gte(auditLogs.timestamp, startTimestamp))
          .groupBy(auditLogs.severity),
        
        // 결과별 통계
        db.select({ 
          result: auditLogs.result, 
          count: 'count(*)' 
        }).from(auditLogs)
          .where(gte(auditLogs.timestamp, startTimestamp))
          .groupBy(auditLogs.result),
        
        // 최근 활동
        db.select({
          userId: auditLogs.userId,
          action: auditLogs.action,
          resource: auditLogs.resource,
          timestamp: auditLogs.timestamp
        }).from(auditLogs)
          .where(gte(auditLogs.timestamp, startTimestamp))
          .orderBy(desc(auditLogs.timestamp))
          .limit(10)
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          timeRange,
          totalLogs: Number(stats[0][0]?.count || 0),
          actionStats: stats[1].map((item: any) => ({
            action: item.action,
            count: Number(item.count)
          })),
          severityStats: stats[2].map((item: any) => ({
            severity: item.severity,
            count: Number(item.count)
          })),
          resultStats: stats[3].map((item: any) => ({
            result: item.result,
            count: Number(item.count)
          })),
          recentActivity: stats[4].map((item: any) => ({
            ...item,
            timestamp: new Date(Number(item.timestamp) * 1000)
          }))
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: '지원하지 않는 통계 유형입니다'
    }, { status: 400 });

  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    return NextResponse.json(
      { success: false, error: '감사 로그 통계를 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}