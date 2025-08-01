import { sql, SQL, Placeholder } from 'drizzle-orm';
import { db } from './index';
import type { 
  CalligraphyAnalysis, 
  LearningProgress, 
  Member, 
  MemberActivity,
  SystemSetting,
  AuditLog,
  FileStorage,
  Notification,
  PerformanceMetric
} from './schema';

// 페이지네이션 유틸리티
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginationQuery(
  baseQuery: any,
  options: PaginationOptions
) {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;
  
  return baseQuery
    .limit(limit)
    .offset(offset);
}

// 검색 유틸리티
export interface SearchOptions {
  query: string;
  fields: string[];
  fuzzy?: boolean;
}

export function createSearchSQL(options: SearchOptions): SQL {
  const { query, fields, fuzzy = false } = options;
  
  if (!query || fields.length === 0) {
    return sql`1 = 1`;
  }
  
  const searchTerm = fuzzy ? `%${query}%` : query;
  const conditions = fields.map(field => 
    sql`${sql.identifier(field)} LIKE ${searchTerm}`
  );
  
  return sql`${conditions.reduce((acc, condition, index) => 
    index === 0 ? condition : sql`${acc} OR ${condition}`
  )}`;
}

// 날짜 범위 필터링
export interface DateRangeOptions {
  startDate?: Date;
  endDate?: Date;
  dateField: string;
}

export function createDateRangeSQL(options: DateRangeOptions): SQL {
  const { startDate, endDate, dateField } = options;
  const conditions: SQL[] = [];
  
  if (startDate) {
    const timestamp = Math.floor(startDate.getTime() / 1000);
    conditions.push(sql`${sql.identifier(dateField)} >= ${timestamp}`);
  }
  
  if (endDate) {
    const timestamp = Math.floor(endDate.getTime() / 1000);
    conditions.push(sql`${sql.identifier(dateField)} <= ${timestamp}`);
  }
  
  if (conditions.length === 0) {
    return sql`1 = 1`;
  }
  
  return conditions.reduce((acc, condition, index) => 
    index === 0 ? condition : sql`${acc} AND ${condition}`
  );
}

// AI 분석 관련 유틸리티
export async function calculateMemberAnalysisStats(memberId: string) {
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total_analyses,
      AVG(overall_score) as average_score,
      MAX(overall_score) as best_score,
      MIN(overall_score) as lowest_score,
      AVG(confidence) as average_confidence,
      calligraphy_style,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_analyses,
      COUNT(*) FILTER (WHERE overall_score >= 80) as high_score_analyses
    FROM calligraphy_analyses 
    WHERE member_id = ${memberId} AND status = 'completed'
    GROUP BY calligraphy_style
  `);
  
  return result.rows;
}

// 학습 진도 업데이트
export async function updateLearningProgress(
  memberId: string, 
  skillCategory: string, 
  newScore: number
) {
  // 현재 진도 조회
  const currentProgress = await db.execute(sql`
    SELECT * FROM learning_progress 
    WHERE member_id = ${memberId} AND skill_category = ${skillCategory}
  `);
  
  const now = Math.floor(Date.now() / 1000);
  
  if (currentProgress.rows.length === 0) {
    // 새로운 학습 진도 생성
    await db.execute(sql`
      INSERT INTO learning_progress (
        id, member_id, skill_category, current_level, experience_points,
        total_analyses, average_score, best_score, last_practice_date,
        created_at, updated_at
      ) VALUES (
        ${crypto.randomUUID()}, ${memberId}, ${skillCategory}, 1, ${newScore},
        1, ${newScore}, ${newScore}, ${now}, ${now}, ${now}
      )
    `);
  } else {
    // 기존 진도 업데이트
    const current = currentProgress.rows[0] as any;
    const newTotal = (current.total_analyses || 0) + 1;
    const newAverage = ((current.average_score || 0) * (current.total_analyses || 0) + newScore) / newTotal;
    const newBest = Math.max(current.best_score || 0, newScore);
    const newXP = (current.experience_points || 0) + Math.floor(newScore / 10);
    const newLevel = Math.min(Math.floor(newXP / 100) + 1, 10);
    
    await db.execute(sql`
      UPDATE learning_progress SET
        current_level = ${newLevel},
        experience_points = ${newXP},
        total_analyses = ${newTotal},
        average_score = ${newAverage},
        best_score = ${newBest},
        last_practice_date = ${now},
        updated_at = ${now}
      WHERE member_id = ${memberId} AND skill_category = ${skillCategory}
    `);
  }
}

// 회원 활동 로깅
export async function logMemberActivity(
  memberId: string,
  activityType: string,
  description: string,
  points: number = 0,
  relatedEntityId?: string,
  relatedEntityType?: string,
  metadata?: any
) {
  await db.execute(sql`
    INSERT INTO member_activities (
      id, member_id, activity_type, description, points,
      related_entity_id, related_entity_type, metadata, timestamp
    ) VALUES (
      ${crypto.randomUUID()}, ${memberId}, ${activityType}, ${description}, ${points},
      ${relatedEntityId || null}, ${relatedEntityType || null}, 
      ${metadata ? JSON.stringify(metadata) : null}, ${Math.floor(Date.now() / 1000)}
    )
  `);
  
  // 회원의 참여 점수 업데이트
  await db.execute(sql`
    UPDATE members SET 
      participation_score = participation_score + ${points},
      last_activity_date = ${Math.floor(Date.now() / 1000)},
      updated_at = ${Math.floor(Date.now() / 1000)}
    WHERE id = ${memberId}
  `);
}

// 시스템 설정 관리
export async function getSystemSetting(category: string, key: string): Promise<any> {
  const result = await db.execute(sql`
    SELECT value, data_type FROM system_settings 
    WHERE category = ${category} AND key = ${key}
  `);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const setting = result.rows[0] as any;
  const { value, data_type } = setting;
  
  switch (data_type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true';
    case 'json':
      return JSON.parse(value);
    default:
      return value;
  }
}

export async function setSystemSetting(
  category: string, 
  key: string, 
  value: any, 
  dataType?: string,
  userId?: string
) {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  const inferredType = dataType || (
    typeof value === 'number' ? 'number' :
    typeof value === 'boolean' ? 'boolean' :
    typeof value === 'object' ? 'json' : 'string'
  );
  
  const now = Math.floor(Date.now() / 1000);
  
  await db.execute(sql`
    INSERT OR REPLACE INTO system_settings (
      id, category, key, value, data_type, updated_by, updated_at, created_at
    ) VALUES (
      ${`${category}_${key}`}, ${category}, ${key}, ${stringValue}, ${inferredType},
      ${userId || null}, ${now}, ${now}
    )
  `);
}

// 감사 로그 생성
export async function createAuditLog(
  userId: string | null,
  action: string,
  resource: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  metadata?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
  await db.execute(sql`
    INSERT INTO audit_logs (
      id, user_id, action, resource, resource_id,
      old_values, new_values, severity, metadata, timestamp
    ) VALUES (
      ${crypto.randomUUID()}, ${userId}, ${action}, ${resource}, ${resourceId || null},
      ${oldValues ? JSON.stringify(oldValues) : null},
      ${newValues ? JSON.stringify(newValues) : null},
      ${severity}, ${metadata ? JSON.stringify(metadata) : null},
      ${Math.floor(Date.now() / 1000)}
    )
  `);
}

// 알림 생성 및 발송
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  options: {
    titleKo?: string;
    titleEn?: string;
    titleCn?: string;
    titleJp?: string;
    messageKo?: string;
    messageEn?: string;
    messageCn?: string;
    messageJp?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    relatedEntityType?: string;
    relatedEntityId?: string;
    actionUrl?: string;
    sendEmail?: boolean;
    sendPush?: boolean;
    expiresAt?: Date;
    metadata?: any;
  } = {}
) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = options.expiresAt ? Math.floor(options.expiresAt.getTime() / 1000) : null;
  
  await db.execute(sql`
    INSERT INTO notifications (
      id, user_id, type, title, message,
      title_ko, title_en, title_cn, title_jp,
      message_ko, message_en, message_cn, message_jp,
      priority, related_entity_type, related_entity_id, action_url,
      send_email, send_push, expires_at, metadata, created_at
    ) VALUES (
      ${crypto.randomUUID()}, ${userId}, ${type}, ${title}, ${message},
      ${options.titleKo || null}, ${options.titleEn || null}, 
      ${options.titleCn || null}, ${options.titleJp || null},
      ${options.messageKo || null}, ${options.messageEn || null},
      ${options.messageCn || null}, ${options.messageJp || null},
      ${options.priority || 'normal'}, ${options.relatedEntityType || null},
      ${options.relatedEntityId || null}, ${options.actionUrl || null},
      ${options.sendEmail || false}, ${options.sendPush || false},
      ${expiresAt}, ${options.metadata ? JSON.stringify(options.metadata) : null}, ${now}
    )
  `);
}

// 성능 메트릭 기록
export async function recordPerformanceMetric(
  metricType: string,
  value: number,
  unit: string,
  options: {
    endpoint?: string;
    method?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: any;
  } = {}
) {
  await db.execute(sql`
    INSERT INTO performance_metrics (
      id, metric_type, endpoint, method, value, unit,
      user_id, session_id, request_id, user_agent, ip_address,
      metadata, timestamp
    ) VALUES (
      ${crypto.randomUUID()}, ${metricType}, ${options.endpoint || null},
      ${options.method || null}, ${value}, ${unit}, ${options.userId || null},
      ${options.sessionId || null}, ${options.requestId || null},
      ${options.userAgent || null}, ${options.ipAddress || null},
      ${options.metadata ? JSON.stringify(options.metadata) : null},
      ${Math.floor(Date.now() / 1000)}
    )
  `);
}

// 데이터베이스 통계 조회
export async function getDatabaseStats() {
  const tables = [
    'users', 'artists', 'artworks', 'exhibitions', 'news', 'events',
    'members', 'member_activities', 'cultural_exchange_programs',
    'cultural_exchange_participants', 'calligraphy_analyses',
    'learning_progress', 'notifications', 'file_storage'
  ];
  
  const stats: Record<string, number> = {};
  
  for (const table of tables) {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(table)}`);
    stats[table] = (result.rows[0] as any).count;
  }
  
  return stats;
}

// 데이터 정리 및 최적화
export async function cleanupOldData() {
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
  
  // 오래된 감사 로그 삭제 (90일 이상)
  await db.execute(sql`
    DELETE FROM audit_logs 
    WHERE timestamp < ${ninetyDaysAgo} AND severity = 'low'
  `);
  
  // 읽은 알림 삭제 (30일 이상)
  await db.execute(sql`
    DELETE FROM notifications 
    WHERE is_read = 1 AND created_at < ${thirtyDaysAgo}
  `);
  
  // 만료된 알림 삭제
  await db.execute(sql`
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < ${Math.floor(Date.now() / 1000)}
  `);
  
  // 오래된 성능 메트릭 삭제 (30일 이상)
  await db.execute(sql`
    DELETE FROM performance_metrics 
    WHERE timestamp < ${thirtyDaysAgo}
  `);
  
  // 실패한 파일 처리 상태 정리
  await db.execute(sql`
    DELETE FROM file_storage 
    WHERE processing_status = 'failed' AND created_at < ${thirtyDaysAgo}
  `);
}

// 백업 및 복구 유틸리티
export async function createDataExport(userId?: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  const exportData: any = {
    exportDate: timestamp,
    version: '1.0'
  };
  
  if (userId) {
    // 특정 사용자 데이터만 내보내기
    const userData = await db.execute(sql`
      SELECT * FROM users WHERE id = ${userId}
    `);
    
    const memberData = await db.execute(sql`
      SELECT * FROM members WHERE user_id = ${userId}
    `);
    
    const analysisData = await db.execute(sql`
      SELECT * FROM calligraphy_analyses WHERE user_id = ${userId}
    `);
    
    exportData.user = userData.rows[0];
    exportData.member = memberData.rows[0];
    exportData.analyses = analysisData.rows;
  } else {
    // 전체 시스템 데이터 요약
    exportData.stats = await getDatabaseStats();
  }
  
  return exportData;
}

// JSON 필드 검색을 위한 유틸리티
export function createJSONSearchSQL(field: string, path: string, value: any): SQL {
  return sql`json_extract(${sql.identifier(field)}, ${path}) = ${value}`;
}

export function createJSONArrayContainsSQL(field: string, value: any): SQL {
  return sql`json_extract(${sql.identifier(field)}, '$') LIKE ${'%"' + value + '"%'}`;
}