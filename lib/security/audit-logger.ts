import { NextRequest } from 'next/server'
import { log } from '@/lib/utils/logger'
import type { AuthUser } from '@/lib/auth/middleware'

export interface SecurityEvent {
  timestamp: string
  type: 'auth_success' | 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'admin_action'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: {
    ip: string
    userAgent: string
    path: string
    method: string
  }
  user?: {
    id: string
    email: string
    role: string
  }
  details: Record<string, any>
}

/**
 * 보안 이벤트 로거
 */
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger
  private events: SecurityEvent[] = []
  private maxEvents = 10000 // 메모리 제한

  public static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger()
    }
    return SecurityAuditLogger.instance
  }

  /**
   * 보안 이벤트 기록
   */
  public logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    // 메모리에 저장
    this.events.push(fullEvent)
    
    // 메모리 제한 관리
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents / 2) // 절반만 유지
    }

    // 심각도에 따른 로깅
    switch (event.severity) {
      case 'critical':
        log.error('SECURITY CRITICAL', fullEvent)
        break
      case 'high':
        log.warn('SECURITY HIGH', fullEvent)
        break
      case 'medium':
        log.info('SECURITY MEDIUM', fullEvent)
        break
      case 'low':
        log.debug('SECURITY LOW', fullEvent)
        break
    }

    // 실시간 알림 (프로덕션에서는 외부 서비스로 전송)
    if (event.severity === 'critical') {
      this.sendCriticalAlert(fullEvent)
    }
  }

  /**
   * 인증 성공 로그
   */
  public logAuthSuccess(request: NextRequest, user: AuthUser): void {
    this.logEvent({
      type: 'auth_success',
      severity: 'low',
      source: this.extractSourceInfo(request),
      user: {
        id: user.id,
        email: user.email || 'unknown',
        role: user.role || 'unknown'
      },
      details: {
        permissions: user.permissions
      }
    })
  }

  /**
   * 인증 실패 로그
   */
  public logAuthFailure(request: NextRequest, reason: string): void {
    this.logEvent({
      type: 'auth_failure',
      severity: 'medium',
      source: this.extractSourceInfo(request),
      details: {
        reason,
        authHeader: request.headers.get('authorization') ? 'present' : 'missing'
      }
    })
  }

  /**
   * Rate Limit 위반 로그
   */
  public logRateLimit(request: NextRequest, count: number, limit: number): void {
    this.logEvent({
      type: 'rate_limit',
      severity: count > limit * 2 ? 'high' : 'medium',
      source: this.extractSourceInfo(request),
      details: {
        count,
        limit,
        excess: count - limit
      }
    })
  }

  /**
   * 의심스러운 활동 로그
   */
  public logSuspiciousActivity(request: NextRequest, activity: string, details: Record<string, any>): void {
    this.logEvent({
      type: 'suspicious_activity',
      severity: 'high',
      source: this.extractSourceInfo(request),
      details: {
        activity,
        ...details
      }
    })
  }

  /**
   * 관리자 액션 로그
   */
  public logAdminAction(request: NextRequest, user: AuthUser, action: string, target?: string): void {
    this.logEvent({
      type: 'admin_action',
      severity: 'medium',
      source: this.extractSourceInfo(request),
      user: {
        id: user.id,
        email: user.email || 'unknown',
        role: user.role || 'unknown'
      },
      details: {
        action,
        target
      }
    })
  }

  /**
   * 요청에서 소스 정보 추출
   */
  private extractSourceInfo(request: NextRequest) {
    return {
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      path: request.nextUrl.pathname,
      method: request.method
    }
  }

  /**
   * 클라이언트 IP 추출
   */
  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    return cfConnectingIP || 
           forwardedFor?.split(',')[0]?.trim() || 
           realIP || 
           'unknown'
  }

  /**
   * 치명적 알림 전송
   */
  private sendCriticalAlert(event: SecurityEvent): void {
    // 프로덕션에서는 Slack, 이메일, PagerDuty 등으로 전송
    log.error('CRITICAL SECURITY ALERT', new Error(`Security alert: ${event.type}`), {
      type: event.type,
      source: event.source,
      user: event.user,
      details: event.details
    })
  }

  /**
   * 최근 이벤트 조회
   */
  public getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit).reverse()
  }

  /**
   * 특정 타입의 이벤트 조회
   */
  public getEventsByType(type: SecurityEvent['type'], limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse()
  }

  /**
   * IP별 이벤트 조회
   */
  public getEventsByIP(ip: string, limit = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.source.ip === ip)
      .slice(-limit)
      .reverse()
  }

  /**
   * 통계 생성
   */
  public getStats() {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    const lastDay = now - (24 * 60 * 60 * 1000)

    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > lastHour
    )

    const dailyEvents = this.events.filter(event =>
      new Date(event.timestamp).getTime() > lastDay
    )

    return {
      total: this.events.length,
      lastHour: recentEvents.length,
      lastDay: dailyEvents.length,
      byType: this.groupEventsByType(recentEvents),
      bySeverity: this.groupEventsBySeverity(recentEvents),
      topIPs: this.getTopIPs(dailyEvents, 10)
    }
  }

  private groupEventsByType(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private groupEventsBySeverity(events: SecurityEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private getTopIPs(events: SecurityEvent[], limit: number) {
    const ipCounts = events.reduce((acc, event) => {
      const ip = event.source.ip
      acc[ip] = (acc[ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([ip, count]) => ({ ip, count }))
  }
}

// 싱글톤 인스턴스 내보내기
export const auditLogger = SecurityAuditLogger.getInstance()