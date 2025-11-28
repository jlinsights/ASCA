/**
 * 성능 모니터링 시스템
 * Agent OS 패턴을 활용한 실시간 성능 추적
 */

import { eventBus, EVENTS } from '../events/event-bus';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface PerformanceAlert {
  level: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  message: string;
}

/**
 * 성능 모니터링 클래스
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, PerformanceMetric[]>();
  private alerts: PerformanceAlert[] = [];
  private maxMetricHistory = 1000;
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 모니터링 시작
   */
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupEventListeners();
    this.startSystemMetrics();
    
    console.log('Performance monitoring started');
  }

  /**
   * 모니터링 중지
   */
  stop(): void {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * 메트릭 기록
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    // 메트릭 저장
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricHistory = this.metrics.get(metric.name)!;
    metricHistory.push(fullMetric);

    // 히스토리 크기 제한
    if (metricHistory.length > this.maxMetricHistory) {
      metricHistory.shift();
    }

    // 임계값 확인
    this.checkThresholds(fullMetric);

    // 메트릭 이벤트 발행
    eventBus.emit('performance.metric.recorded', {
      metric: fullMetric
    });
  }

  /**
   * 성능 측정 데코레이터
   */
  measure<T extends any[], R>(
    name: string,
    fn: (...args: T) => Promise<R> | R,
    options: {
      tags?: Record<string, string>;
      threshold?: { warning: number; critical: number };
    } = {}
  ) {
    return async (...args: T): Promise<R> => {
      const startTime = performance.now();
      
      try {
        const result = await fn(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric({
          name: `${name}.duration`,
          value: duration,
          unit: 'ms',
          tags: options.tags,
          threshold: options.threshold
        });

        this.recordMetric({
          name: `${name}.success`,
          value: 1,
          unit: 'count',
          tags: options.tags
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.recordMetric({
          name: `${name}.duration`,
          value: duration,
          unit: 'ms',
          tags: { ...options.tags, error: 'true' }
        });

        this.recordMetric({
          name: `${name}.error`,
          value: 1,
          unit: 'count',
          tags: options.tags
        });

        throw error;
      }
    };
  }

  /**
   * 메트릭 조회
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }

    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 메트릭 통계
   */
  getMetricStats(name: string, timeRange?: number): {
    avg: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    // 시간 범위 필터링
    const filteredMetrics = timeRange
      ? metrics.filter(m => Date.now() - m.timestamp <= timeRange)
      : metrics;

    if (filteredMetrics.length === 0) return null;

    const values = filteredMetrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      avg: sum / values.length,
      min: values[0] as number,
      max: values[values.length - 1] as number,
      count: values.length,
      p95: (values[Math.floor(values.length * 0.95)] || values[values.length - 1]) as number,
      p99: (values[Math.floor(values.length * 0.99)] || values[values.length - 1]) as number
    };
  }

  /**
   * 알림 조회
   */
  getAlerts(level?: 'warning' | 'critical'): PerformanceAlert[] {
    return level 
      ? this.alerts.filter(alert => alert.level === level)
      : [...this.alerts];
  }

  /**
   * 알림 지우기
   */
  clearAlerts(): void {
    this.alerts.length = 0;
  }

  /**
   * 시스템 상태 요약
   */
  getSystemStatus(): {
    isMonitoring: boolean;
    totalMetrics: number;
    alertCount: number;
    criticalAlerts: number;
    uptime: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
      alertCount: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.level === 'critical').length,
      uptime: performance.now()
    };
  }

  private setupEventListeners(): void {
    // Command 실행 시간 모니터링
    eventBus.subscribe('command.executed', (event) => {
      this.recordMetric({
        name: 'command.execution_time',
        value: event.payload.executionTime,
        unit: 'ms',
        tags: {
          command: event.payload.command,
          success: event.payload.success.toString()
        },
        threshold: { warning: 1000, critical: 5000 }
      });
    });

    // Agent 작업 모니터링
    eventBus.subscribe('agent.task.completed', (event) => {
      this.recordMetric({
        name: 'agent.task_duration',
        value: event.payload.executionTime,
        unit: 'ms',
        tags: {
          agentId: event.payload.agentId,
          taskId: event.payload.taskId
        },
        threshold: { warning: 2000, critical: 10000 }
      });
    });

    // 시스템 에러 모니터링
    eventBus.subscribe(EVENTS.SYSTEM_ERROR, (event) => {
      this.recordMetric({
        name: 'system.error_count',
        value: 1,
        unit: 'count',
        tags: {
          error: event.payload.error
        }
      });
    });
  }

  private startSystemMetrics(): void {
    if (typeof window === 'undefined') return; // 서버 사이드에서는 실행하지 않음

    // 메모리 사용량 모니터링
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        
        this.recordMetric({
          name: 'system.memory.used',
          value: memory.usedJSHeapSize / 1024 / 1024,
          unit: 'MB',
          threshold: { warning: 50, critical: 100 }
        });

        this.recordMetric({
          name: 'system.memory.total',
          value: memory.totalJSHeapSize / 1024 / 1024,
          unit: 'MB'
        });
      }
    }, 5000);

    // FPS 모니터링
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        this.recordMetric({
          name: 'system.fps',
          value: frameCount,
          unit: 'fps',
          threshold: { warning: 30, critical: 15 }
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return;

    const { warning, critical } = metric.threshold;
    
    if (metric.value >= critical) {
      this.createAlert('critical', metric, critical);
    } else if (metric.value >= warning) {
      this.createAlert('warning', metric, warning);
    }
  }

  private createAlert(
    level: 'warning' | 'critical',
    metric: PerformanceMetric,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      level,
      metric: metric.name,
      value: metric.value,
      threshold,
      timestamp: Date.now(),
      message: `${level.toUpperCase()}: ${metric.name} is ${metric.value}${metric.unit}, exceeding ${level} threshold of ${threshold}${metric.unit}`
    };

    this.alerts.push(alert);

    // 최대 100개 알림만 유지
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // 알림 이벤트 발행
    eventBus.emit('performance.alert.created', { alert });

    console.warn(alert.message);
  }
}

// 전역 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance();

// 자동 시작 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  performanceMonitor.start();
}

// 헬퍼 함수들
export function measureAsync<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>,
  options?: { tags?: Record<string, string>; threshold?: { warning: number; critical: number } }
) {
  return performanceMonitor.measure(name, fn, options);
}

export function measureSync<T extends any[], R>(
  name: string,
  fn: (...args: T) => R,
  options?: { tags?: Record<string, string>; threshold?: { warning: number; critical: number } }
) {
  return performanceMonitor.measure(name, fn, options);
}

// 메트릭 데코레이터
export function Measure(
  name: string,
  options?: { tags?: Record<string, string>; threshold?: { warning: number; critical: number } }
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = performanceMonitor.measure(name || `${target.constructor.name}.${propertyKey}`, originalMethod, options);
    
    return descriptor;
  };
}