/**
 * 감사 추적 시스템
 * Enterprise-grade 데이터 변경 추적 및 규정 준수
 */

import { eventBus, EVENTS } from '../events/event-bus';
import { performanceMonitor } from '../monitoring/performance-monitor';

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  operation: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    source: string;
    version: string;
  };
  result: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  riskScore: number;
}

export interface AuditQuery {
  userId?: string;
  operation?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  riskThreshold?: number;
  limit?: number;
  offset?: number;
}

export interface AuditReport {
  entries: AuditEntry[];
  totalCount: number;
  highRiskCount: number;
  failureCount: number;
  summary: {
    operationCounts: Record<string, number>;
    userCounts: Record<string, number>;
    resourceCounts: Record<string, number>;
  };
}

/**
 * 감사 추적 클래스
 */
export class AuditTrail {
  private static instance: AuditTrail;
  private entries: AuditEntry[] = [];
  private maxEntries = 10000;
  private isEnabled = true;

  private constructor() {
    this.setupEventListeners();
    this.setupCleanupScheduler();
  }

  static getInstance(): AuditTrail {
    if (!AuditTrail.instance) {
      AuditTrail.instance = new AuditTrail();
    }
    return AuditTrail.instance;
  }

  /**
   * 감사 항목 기록
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isEnabled) return;

    const auditEntry: AuditEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...entry
    };

    // 메모리 저장
    this.entries.push(auditEntry);
    
    // 크기 제한
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // 고위험 작업 알림
    if (auditEntry.riskScore > 0.7 || auditEntry.result === 'failure') {
      await eventBus.emit(EVENTS.AUDIT_HIGH_RISK, {
        auditEntry,
        timestamp: Date.now()
      });
    }

    // 성능 모니터링
    performanceMonitor.recordMetric({
      name: 'audit.entry_logged',
      value: 1,
      unit: 'count',
      tags: {
        operation: auditEntry.operation,
        resource: auditEntry.resource,
        result: auditEntry.result,
        risk_level: this.getRiskLevel(auditEntry.riskScore)
      }
    });
  }

  /**
   * 감사 로그 조회
   */
  query(params: AuditQuery = {}): AuditReport {
    let filteredEntries = [...this.entries];

    // 필터링
    if (params.userId) {
      filteredEntries = filteredEntries.filter(e => e.userId === params.userId);
    }
    
    if (params.operation) {
      filteredEntries = filteredEntries.filter(e => e.operation === params.operation);
    }
    
    if (params.resource) {
      filteredEntries = filteredEntries.filter(e => e.resource === params.resource);
    }
    
    if (params.resourceId) {
      filteredEntries = filteredEntries.filter(e => e.resourceId === params.resourceId);
    }
    
    if (params.startDate) {
      filteredEntries = filteredEntries.filter(e => e.timestamp >= params.startDate!.getTime());
    }
    
    if (params.endDate) {
      filteredEntries = filteredEntries.filter(e => e.timestamp <= params.endDate!.getTime());
    }
    
    if (params.riskThreshold !== undefined) {
      filteredEntries = filteredEntries.filter(e => e.riskScore >= params.riskThreshold!);
    }

    // 정렬 (최신순)
    filteredEntries.sort((a, b) => b.timestamp - a.timestamp);

    // 페이징
    const offset = params.offset || 0;
    const limit = params.limit || 100;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);

    // 통계 생성
    const summary = this.generateSummary(filteredEntries);

    return {
      entries: paginatedEntries,
      totalCount: filteredEntries.length,
      highRiskCount: filteredEntries.filter(e => e.riskScore > 0.7).length,
      failureCount: filteredEntries.filter(e => e.result === 'failure').length,
      summary
    };
  }

  /**
   * 규정 준수 보고서 생성
   */
  generateComplianceReport(timeRange: number = 30 * 24 * 60 * 60 * 1000): {
    totalOperations: number;
    successRate: number;
    averageRiskScore: number;
    criticalViolations: AuditEntry[];
    userActivity: Record<string, number>;
    dailyActivity: Record<string, number>;
  } {
    const cutoffTime = Date.now() - timeRange;
    const relevantEntries = this.entries.filter(e => e.timestamp > cutoffTime);

    const successfulOperations = relevantEntries.filter(e => e.result === 'success').length;
    const successRate = relevantEntries.length > 0 ? successfulOperations / relevantEntries.length : 0;
    
    const totalRiskScore = relevantEntries.reduce((sum, e) => sum + e.riskScore, 0);
    const averageRiskScore = relevantEntries.length > 0 ? totalRiskScore / relevantEntries.length : 0;

    const criticalViolations = relevantEntries.filter(e => 
      e.riskScore > 0.8 || e.result === 'failure'
    );

    const userActivity: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};

    relevantEntries.forEach(entry => {
      // 사용자별 활동
      userActivity[entry.userId] = (userActivity[entry.userId] || 0) + 1;

      // 일별 활동
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return {
      totalOperations: relevantEntries.length,
      successRate,
      averageRiskScore,
      criticalViolations,
      userActivity,
      dailyActivity
    };
  }

  /**
   * 데이터 변경 추적
   */
  async trackDataChange(
    userId: string,
    operation: string,
    resource: string,
    resourceId: string,
    oldValue: any,
    newValue: any,
    metadata: Partial<AuditEntry['metadata']> = {}
  ): Promise<void> {
    const riskScore = this.calculateDataChangeRisk(operation, oldValue, newValue);

    await this.log({
      userId,
      operation,
      resource,
      resourceId,
      oldValue,
      newValue,
      metadata: {
        source: 'data_change_tracker',
        version: '1.0.0',
        ...metadata
      },
      result: 'success',
      riskScore
    });
  }

  /**
   * 접근 시도 추적
   */
  async trackAccess(
    userId: string,
    resource: string,
    resourceId: string,
    granted: boolean,
    metadata: Partial<AuditEntry['metadata']> = {}
  ): Promise<void> {
    const riskScore = granted ? 0.1 : 0.8;

    await this.log({
      userId,
      operation: 'access',
      resource,
      resourceId,
      metadata: {
        source: 'access_tracker',
        version: '1.0.0',
        ...metadata
      },
      result: granted ? 'success' : 'failure',
      errorMessage: granted ? undefined : 'Access denied',
      riskScore
    });
  }

  /**
   * 감사 시스템 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * 감사 로그 지우기
   */
  clear(): void {
    this.entries.length = 0;
  }

  /**
   * 감사 로그 내보내기 (JSON 형태)
   */
  export(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      entryCount: this.entries.length,
      entries: this.entries
    }, null, 2);
  }

  private setupEventListeners(): void {
    // Command 실행 추적
    eventBus.subscribe('command.executed', async (event) => {
      await this.log({
        userId: event.payload.userId || 'system',
        operation: event.payload.command,
        resource: 'command',
        resourceId: event.payload.commandId || 'unknown',
        metadata: {
          source: 'command_bus',
          version: '1.0.0'
        },
        result: event.payload.success ? 'success' : 'failure',
        errorMessage: event.payload.error,
        riskScore: event.payload.success ? 0.1 : 0.5
      });
    });

    // Agent 작업 추적
    eventBus.subscribe('agent.task.completed', async (event) => {
      await this.log({
        userId: 'system',
        operation: 'agent_task',
        resource: 'agent',
        resourceId: event.payload.agentId,
        metadata: {
          source: 'agent_pool',
          version: '1.0.0',
          taskId: event.payload.taskId
        },
        result: event.payload.success ? 'success' : 'failure',
        riskScore: event.payload.success ? 0.1 : 0.3
      });
    });

    // 보안 위반 추적
    eventBus.subscribe(EVENTS.SECURITY_VIOLATION, async (event) => {
      await this.log({
        userId: event.payload.context.userId || 'unknown',
        operation: event.payload.operation,
        resource: 'security',
        resourceId: 'violation',
        metadata: {
          source: 'security_middleware',
          version: '1.0.0',
          violation: event.payload.validation
        },
        result: 'failure',
        errorMessage: event.payload.validation.errors.join(', '),
        riskScore: event.payload.validation.riskScore
      });
    });
  }

  private setupCleanupScheduler(): void {
    // 30일이 지난 항목 정리 (매일 실행)
    setInterval(() => {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      this.entries = this.entries.filter(entry => entry.timestamp > thirtyDaysAgo);
    }, 24 * 60 * 60 * 1000);
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDataChangeRisk(operation: string, oldValue: any, newValue: any): number {
    let riskScore = 0;

    // 삭제 작업은 높은 위험도
    if (operation.includes('delete')) {
      riskScore += 0.7;
    }

    // 중요 필드 변경
    if (oldValue && newValue) {
      const criticalFields = ['id', 'user_id', 'role', 'permissions'];
      for (const field of criticalFields) {
        if (oldValue[field] !== newValue[field]) {
          riskScore += 0.3;
        }
      }
    }

    // 대량 변경
    if (Array.isArray(newValue) && newValue.length > 100) {
      riskScore += 0.2;
    }

    return Math.min(riskScore, 1);
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore > 0.7) return 'high';
    if (riskScore > 0.3) return 'medium';
    return 'low';
  }

  private generateSummary(entries: AuditEntry[]) {
    const operationCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};

    entries.forEach(entry => {
      operationCounts[entry.operation] = (operationCounts[entry.operation] || 0) + 1;
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
      resourceCounts[entry.resource] = (resourceCounts[entry.resource] || 0) + 1;
    });

    return {
      operationCounts,
      userCounts,
      resourceCounts
    };
  }
}

// 전역 감사 추적 인스턴스
export const auditTrail = AuditTrail.getInstance();

// 헬퍼 함수들
export async function logUserAction(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await auditTrail.log({
    userId,
    operation: action,
    resource,
    resourceId,
    metadata: {
      source: 'user_action',
      version: '1.0.0'
    },
    result: success ? 'success' : 'failure',
    errorMessage: error,
    riskScore: success ? 0.1 : 0.5
  });
}

export async function logSystemEvent(
  event: string,
  details: any,
  riskScore: number = 0.1
): Promise<void> {
  await auditTrail.log({
    userId: 'system',
    operation: event,
    resource: 'system',
    resourceId: 'event',
    newValue: details,
    metadata: {
      source: 'system',
      version: '1.0.0'
    },
    result: 'success',
    riskScore
  });
}