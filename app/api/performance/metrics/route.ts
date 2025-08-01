import { NextRequest, NextResponse } from 'next/server';
import { recordPerformanceMetric } from '@/lib/db/utils';

interface PerformanceMetricPayload {
  metrics: Array<{
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    metadata?: Record<string, any>;
  }>;
  userAgent: string;
  url: string;
  timestamp: number;
}

// POST - 성능 메트릭 기록
export async function POST(request: NextRequest) {
  try {
    const body: PerformanceMetricPayload = await request.json();
    const { metrics, userAgent, url } = body;

    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 메트릭 데이터입니다' },
        { status: 400 }
      );
    }

    // 클라이언트 정보 추출
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const userId = request.headers.get('x-user-id') || null;
    const sessionId = request.headers.get('x-session-id') || null;

    // 각 메트릭을 데이터베이스에 저장
    const recordPromises = metrics.map(async (metric) => {
      // URL에서 endpoint 추출
      let endpoint = 'unknown';
      try {
        const urlObj = new URL(url);
        endpoint = urlObj.pathname;
      } catch {
        // URL 파싱 실패시 그냥 넘어감
      }

      // HTTP 메서드 추출 (메타데이터에서)
      const method = metric.metadata?.method || 'GET';

      await recordPerformanceMetric(
        metric.name,
        metric.value,
        metric.unit,
        {
          endpoint,
          method,
          userId,
          sessionId,
          userAgent,
          ipAddress,
          metadata: {
            url,
            ...metric.metadata
          }
        }
      );
    });

    await Promise.all(recordPromises);

    return NextResponse.json({
      success: true,
      recorded: metrics.length,
      message: '성능 메트릭이 성공적으로 기록되었습니다'
    });

  } catch (error) {
    console.error('Error recording performance metrics:', error);
    return NextResponse.json(
      { success: false, error: '성능 메트릭 기록 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET - 성능 메트릭 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // TODO: 관리자 권한 확인
    // const user = await getCurrentUser(request);
    // if (!user || !isAdmin(user)) {
    //   return NextResponse.json({ success: false, error: '권한이 없습니다' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const metricType = searchParams.get('type');
    const timeRange = searchParams.get('timeRange') || '24h';
    const limit = parseInt(searchParams.get('limit') || '100');

    const { db } = await import('@/lib/db');
    const { performanceMetrics } = await import('@/lib/db/schema');
    const { eq, gte, desc } = await import('drizzle-orm');

    // 시간 범위 계산
    const now = Math.floor(Date.now() / 1000);
    let startTime = now;
    
    switch (timeRange) {
      case '1h':
        startTime = now - (60 * 60);
        break;
      case '24h':
        startTime = now - (24 * 60 * 60);
        break;
      case '7d':
        startTime = now - (7 * 24 * 60 * 60);
        break;
      case '30d':
        startTime = now - (30 * 24 * 60 * 60);
        break;
    }

    // 조건 구성
    const conditions = [gte(performanceMetrics.timestamp, startTime)];
    
    if (metricType) {
      conditions.push(eq(performanceMetrics.metricType, metricType));
    }

    // 메트릭 조회
    const metricsQuery = db
      .select({
        id: performanceMetrics.id,
        metricType: performanceMetrics.metricType,
        endpoint: performanceMetrics.endpoint,
        method: performanceMetrics.method,
        value: performanceMetrics.value,
        unit: performanceMetrics.unit,
        userAgent: performanceMetrics.userAgent,
        ipAddress: performanceMetrics.ipAddress,
        metadata: performanceMetrics.metadata,
        timestamp: performanceMetrics.timestamp
      })
      .from(performanceMetrics)
      .where(conditions.length > 1 ? 
        require('drizzle-orm').and(...conditions) : conditions[0]
      )
      .orderBy(desc(performanceMetrics.timestamp))
      .limit(limit);

    const metrics = await metricsQuery;

    // 통계 계산
    const stats = metrics.reduce((acc, metric) => {
      const type = metric.metricType;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }
      
      acc[type].count++;
      acc[type].sum += metric.value;
      acc[type].min = Math.min(acc[type].min, metric.value);
      acc[type].max = Math.max(acc[type].max, metric.value);
      acc[type].avg = acc[type].sum / acc[type].count;
      
      return acc;
    }, {} as Record<string, any>);

    // 데이터 변환
    const formattedMetrics = metrics.map(metric => ({
      ...metric,
      timestamp: new Date(Number(metric.timestamp) * 1000),
      metadata: metric.metadata ? JSON.parse(metric.metadata) : null
    }));

    return NextResponse.json({
      success: true,
      metrics: formattedMetrics,
      stats,
      timeRange,
      count: metrics.length
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { success: false, error: '성능 메트릭을 가져오는 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}