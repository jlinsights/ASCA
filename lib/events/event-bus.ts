/**
 * Agent OS 패턴 - 이벤트 기반 아키텍처
 * 마이크로서비스 간 통신을 위한 중앙 이벤트 버스
 */

import { log } from '@/lib/utils/logger';

export interface EventPayload {
  [key: string]: any;
}

export interface Event<T extends EventPayload = EventPayload> {
  type: string;
  payload: T;
  timestamp: number;
  id: string;
  source: string;
  version: string;
}

export interface EventHandler<T extends EventPayload = EventPayload> {
  (event: Event<T>): Promise<void> | void;
}

interface EventSubscription {
  handler: EventHandler;
  options: {
    once?: boolean;
    priority?: number;
  };
}

/**
 * 중앙 이벤트 버스 - Agent OS 핵심 컴포넌트
 */
export class EventBus {
  private static instance: EventBus;
  private subscribers = new Map<string, EventSubscription[]>();
  private eventHistory: Event[] = [];
  private maxHistorySize = 1000;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 이벤트 발행
   */
  async emit<T extends EventPayload>(
    type: string, 
    payload: T, 
    source: string = 'unknown'
  ): Promise<void> {
    const event: Event<T> = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateEventId(),
      source,
      version: '1.0.0'
    };

    // 이벤트 히스토리 저장
    this.addToHistory(event);

    // 구독자들에게 이벤트 전달
    const subscriptions = this.subscribers.get(type) || [];
    const sortedSubscriptions = subscriptions.sort((a, b) => 
      (b.options.priority || 0) - (a.options.priority || 0)
    );

    const promises = sortedSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler(event);
        
        // once 옵션 처리
        if (subscription.options.once) {
          this.unsubscribe(type, subscription.handler);
        }
      } catch (error) {
        log.error(`Event handler error for ${type}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 이벤트 구독
   */
  subscribe<T extends EventPayload>(
    type: string, 
    handler: EventHandler<T>,
    options: { once?: boolean; priority?: number } = {}
  ): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }

    this.subscribers.get(type)!.push({ handler: handler as EventHandler, options });

    // 구독 해제 함수 반환
    return () => this.unsubscribe(type, handler as EventHandler);
  }

  /**
   * 이벤트 구독 해제
   */
  unsubscribe(type: string, handler: EventHandler): void {
    const subscriptions = this.subscribers.get(type);
    if (subscriptions) {
      const index = subscriptions.findIndex(s => s.handler === handler);
      if (index > -1) {
        subscriptions.splice(index, 1);
      }
    }
  }

  /**
   * 모든 구독 해제
   */
  unsubscribeAll(type?: string): void {
    if (type) {
      this.subscribers.delete(type);
    } else {
      this.subscribers.clear();
    }
  }

  /**
   * 구독자 수 조회
   */
  getSubscriberCount(type?: string): number {
    if (type) {
      return this.subscribers.get(type)?.length || 0;
    }
    
    let count = 0;
    for (const subs of this.subscribers.values()) {
      count += subs.length;
    }
    return count;
  }

  /**
   * 이벤트 히스토리 조회
   */
  getEventHistory(type?: string): Event[] {
    if (type) {
      return this.eventHistory.filter(event => event.type === type);
    }
    return [...this.eventHistory];
  }

  /**
   * 이벤트 재생 (시스템 복구용)
   */
  async replayEvents(fromTimestamp?: number): Promise<void> {
    const events = fromTimestamp 
      ? this.eventHistory.filter(e => e.timestamp >= fromTimestamp)
      : this.eventHistory;

    for (const event of events) {
      await this.emit(event.type, event.payload, event.source);
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(event: Event): void {
    this.eventHistory.push(event);
    
    // 히스토리 크기 제한
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// 전역 이벤트 버스 인스턴스
export const eventBus = EventBus.getInstance();

// 도메인별 이벤트 타입 정의
export const EVENTS = {
  // 아티스트 관련
  ARTIST_CREATED: 'artist.created',
  ARTIST_UPDATED: 'artist.updated',
  ARTIST_DELETED: 'artist.deleted',
  
  // 작품 관련
  ARTWORK_CREATED: 'artwork.created',
  ARTWORK_UPDATED: 'artwork.updated',
  ARTWORK_DELETED: 'artwork.deleted',
  ARTWORK_VIEWED: 'artwork.viewed',
  
  // 사용자 관련
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  
  // 시스템 관련
  SYSTEM_ERROR: 'system.error',
  SYSTEM_HEALTH_CHECK: 'system.health_check',
  SYSTEM_READY: 'system.ready',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  
  // 보안 관련
  SECURITY_VIOLATION: 'security.violation',
  AUTHENTICATION_FAILED: 'auth.failed',
  AUTHORIZATION_DENIED: 'auth.denied',
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
  
  // 감사 관련
  AUDIT_HIGH_RISK: 'audit.high_risk',
  COMPLIANCE_VIOLATION: 'audit.compliance_violation',
  
  // 성능 관련
  PERFORMANCE_THRESHOLD_EXCEEDED: 'performance.threshold_exceeded',
  SYSTEM_OVERLOAD: 'performance.overload',
  
  // 알림 관련
  NOTIFICATION_SENT: 'notification.sent',
  EMAIL_SENT: 'email.sent'
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];