/**
 * 엔터프라이즈 아키텍처 초기화 스크립트
 * BMAD Method + Agent OS + SubAgent 패턴 통합 시스템 부팅
 */

import { eventBus, EVENTS } from './events/event-bus';
import { commandBus } from './cqrs/command-bus';
import { queryBus } from './cqrs/query-bus';
import { agentPool, artistAgent } from './agents/artist-agent';
import { performanceMonitor } from './monitoring/performance-monitor';
import { auditTrail, logSystemEvent } from './audit/audit-trail';
import { runSystemHealthCheck } from './testing/enterprise-validator';

export interface ArchitectureConfig {
  enablePerformanceMonitoring: boolean;
  enableAuditTrail: boolean;
  enableSecurityMiddleware: boolean;
  enableAgentPool: boolean;
  autoStartValidation: boolean;
  developmentMode: boolean;
}

export interface SystemStatus {
  isInitialized: boolean;
  components: {
    eventBus: boolean;
    commandBus: boolean;
    queryBus: boolean;
    agentPool: boolean;
    performanceMonitor: boolean;
    auditTrail: boolean;
  };
  startupTime: number;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

/**
 * 엔터프라이즈 아키텍처 초기화 관리자
 */
export class EnterpriseArchitecture {
  private static instance: EnterpriseArchitecture;
  private status: SystemStatus = {
    isInitialized: false,
    components: {
      eventBus: false,
      commandBus: false,
      queryBus: false,
      agentPool: false,
      performanceMonitor: false,
      auditTrail: false
    },
    startupTime: 0,
    version: '1.0.0',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 
                  process.env.NODE_ENV === 'staging' ? 'staging' : 'development'
  };

  private config: ArchitectureConfig = {
    enablePerformanceMonitoring: true,
    enableAuditTrail: true,
    enableSecurityMiddleware: true,
    enableAgentPool: true,
    autoStartValidation: process.env.NODE_ENV !== 'production',
    developmentMode: process.env.NODE_ENV !== 'production'
  };

  private constructor() {}

  static getInstance(): EnterpriseArchitecture {
    if (!EnterpriseArchitecture.instance) {
      EnterpriseArchitecture.instance = new EnterpriseArchitecture();
    }
    return EnterpriseArchitecture.instance;
  }

  /**
   * 시스템 초기화
   */
  async initialize(customConfig?: Partial<ArchitectureConfig>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Initializing Enterprise Architecture...');
      
      // 설정 적용
      if (customConfig) {
        this.config = { ...this.config, ...customConfig };
      }

      // 1. Event Bus 초기화
      await this.initializeEventBus();
      
      // 2. CQRS 시스템 초기화
      await this.initializeCQRS();
      
      // 3. Agent Pool 초기화
      if (this.config.enableAgentPool) {
        await this.initializeAgentPool();
      }
      
      // 4. Performance Monitor 초기화
      if (this.config.enablePerformanceMonitoring) {
        await this.initializePerformanceMonitor();
      }
      
      // 5. Audit Trail 초기화
      if (this.config.enableAuditTrail) {
        await this.initializeAuditTrail();
      }

      // 6. 시스템 이벤트 리스너 설정
      await this.setupSystemEventListeners();

      // 완료
      this.status.isInitialized = true;
      this.status.startupTime = Date.now() - startTime;

      // 시스템 준비 이벤트 발행
      await eventBus.emit(EVENTS.SYSTEM_READY, {
        version: this.status.version,
        environment: this.status.environment,
        startupTime: this.status.startupTime,
        enabledComponents: Object.entries(this.status.components)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name)
      });

      console.log(`✅ Enterprise Architecture initialized in ${this.status.startupTime}ms`);
      console.log(`🏗️  Environment: ${this.status.environment.toUpperCase()}`);
      console.log('📊 Enabled Components:', Object.entries(this.status.components)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
        .join(', '));

      // 개발 환경에서 자동 검증 실행
      if (this.config.autoStartValidation) {
        setTimeout(() => {
          this.runHealthCheck();
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Failed to initialize Enterprise Architecture:', error);
      
      await eventBus.emit(EVENTS.SYSTEM_ERROR, {
        error: error instanceof Error ? error.message : 'Initialization failed',
        component: 'EnterpriseArchitecture',
        fatal: true
      });
      
      throw error;
    }
  }

  /**
   * Event Bus 초기화
   */
  private async initializeEventBus(): Promise<void> {
    try {
      // 이미 초기화된 싱글톤이므로 상태만 확인
      if (eventBus) {
        this.status.components.eventBus = true;
        console.log('✅ EventBus initialized');
      }
    } catch (error) {
      console.error('❌ EventBus initialization failed:', error);
      throw error;
    }
  }

  /**
   * CQRS 시스템 초기화
   */
  private async initializeCQRS(): Promise<void> {
    try {
      // Command Bus 확인
      if (commandBus) {
        this.status.components.commandBus = true;
        console.log('✅ CommandBus initialized');
      }

      // Query Bus 확인
      if (queryBus) {
        this.status.components.queryBus = true;
        console.log('✅ QueryBus initialized');
      }
    } catch (error) {
      console.error('❌ CQRS initialization failed:', error);
      throw error;
    }
  }

  /**
   * Agent Pool 초기화
   */
  private async initializeAgentPool(): Promise<void> {
    try {
      // Artist Agent가 이미 등록되어 있는지 확인
      const poolStatus = agentPool.getStatus();
      
      if (poolStatus.totalAgents > 0) {
        this.status.components.agentPool = true;
        console.log(`✅ AgentPool initialized with ${poolStatus.totalAgents} agents`);
      } else {
        console.log('⚠️  AgentPool initialized but no agents registered');
        this.status.components.agentPool = true;
      }
    } catch (error) {
      console.error('❌ AgentPool initialization failed:', error);
      throw error;
    }
  }

  /**
   * Performance Monitor 초기화
   */
  private async initializePerformanceMonitor(): Promise<void> {
    try {
      // Performance Monitor 시작
      performanceMonitor.start();
      
      this.status.components.performanceMonitor = true;
      console.log('✅ PerformanceMonitor initialized');
    } catch (error) {
      console.error('❌ PerformanceMonitor initialization failed:', error);
      throw error;
    }
  }

  /**
   * Audit Trail 초기화
   */
  private async initializeAuditTrail(): Promise<void> {
    try {
      // 초기화 로그 기록
      await logSystemEvent('system.initialized', {
        version: this.status.version,
        environment: this.status.environment,
        config: this.config
      });

      this.status.components.auditTrail = true;
      console.log('✅ AuditTrail initialized');
    } catch (error) {
      console.error('❌ AuditTrail initialization failed:', error);
      throw error;
    }
  }

  /**
   * 시스템 이벤트 리스너 설정
   */
  private async setupSystemEventListeners(): Promise<void> {
    // 시스템 오류 모니터링
    eventBus.subscribe(EVENTS.SYSTEM_ERROR, async (event) => {
      console.error('🚨 System Error:', event.payload);
      
      if (event.payload.fatal) {
        console.log('💀 Fatal error detected, initiating graceful shutdown...');
        await this.shutdown();
      }
    });

    // 성능 임계값 초과 모니터링
    eventBus.subscribe(EVENTS.PERFORMANCE_THRESHOLD_EXCEEDED, async (event) => {
      console.warn('⚡ Performance threshold exceeded:', event.payload);
    });

    // 보안 위반 모니터링
    eventBus.subscribe(EVENTS.SECURITY_VIOLATION, async (event) => {
      console.warn('🛡️  Security violation detected:', event.payload);
    });

    // 고위험 감사 이벤트 모니터링
    eventBus.subscribe(EVENTS.AUDIT_HIGH_RISK, async (event) => {
      console.warn('🔍 High-risk audit event:', event.payload);
    });

    console.log('✅ System event listeners configured');
  }

  /**
   * 시스템 상태 조회
   */
  getStatus(): SystemStatus {
    return { ...this.status };
  }

  /**
   * 설정 조회
   */
  getConfig(): ArchitectureConfig {
    return { ...this.config };
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<ArchitectureConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 시스템 상태 검사 실행
   */
  async runHealthCheck(): Promise<void> {
    try {
      console.log('🔍 Running system health check...');
      await runSystemHealthCheck();
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * 시스템 종료
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Enterprise Architecture...');

      // 종료 이벤트 발행
      await eventBus.emit(EVENTS.SYSTEM_SHUTDOWN, {
        timestamp: Date.now(),
        uptime: Date.now() - (Date.now() - this.status.startupTime)
      });

      // Agent Pool 정리
      if (this.status.components.agentPool) {
        await agentPool.cleanup();
        console.log('✅ AgentPool cleaned up');
      }

      // Performance Monitor 중지
      if (this.status.components.performanceMonitor) {
        performanceMonitor.stop();
        console.log('✅ PerformanceMonitor stopped');
      }

      // 감사 로그 기록
      if (this.status.components.auditTrail) {
        await logSystemEvent('system.shutdown', {
          uptime: Date.now() - (Date.now() - this.status.startupTime)
        });
        console.log('✅ AuditTrail recorded shutdown');
      }

      // 모든 이벤트 구독 해제
      eventBus.unsubscribeAll();

      this.status.isInitialized = false;
      console.log('✅ Enterprise Architecture shutdown complete');

    } catch (error) {
      console.error('❌ Shutdown error:', error);
    }
  }

  /**
   * 개발 모드 유틸리티
   */
  async developmentUtilities(): Promise<void> {
    if (!this.config.developmentMode) {
      console.log('⚠️  Development utilities only available in development mode');
      return;
    }

    console.log('\n🛠️  === DEVELOPMENT UTILITIES ===');
    console.log('1. System Status:', this.getStatus());
    console.log('2. Agent Pool Status:', agentPool.getStatus());
    console.log('3. Performance Metrics:', performanceMonitor.getSystemStatus());
    console.log('4. Recent Audit Entries:', auditTrail.query({ limit: 5 }));
    console.log('=== END UTILITIES ===\n');
  }
}

// 전역 아키텍처 인스턴스
export const enterpriseArchitecture = EnterpriseArchitecture.getInstance();

// 자동 초기화 (브라우저 환경이 아닌 경우)
if (typeof window === 'undefined') {
  // 서버 사이드에서 자동 초기화
  enterpriseArchitecture.initialize().catch(console.error);
}

// 프로세스 종료 시 정리
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    enterpriseArchitecture.shutdown().then(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    enterpriseArchitecture.shutdown().then(() => {
      process.exit(0);
    });
  });
}

// 헬퍼 함수들
export async function initializeSystem(config?: Partial<ArchitectureConfig>): Promise<void> {
  await enterpriseArchitecture.initialize(config);
}

export function getSystemStatus(): SystemStatus {
  return enterpriseArchitecture.getStatus();
}

export async function shutdownSystem(): Promise<void> {
  await enterpriseArchitecture.shutdown();
}

export default enterpriseArchitecture;