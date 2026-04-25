/**
 * 엔터프라이즈 아키텍처 초기화 스크립트
 * BMAD Method + Agent OS + SubAgent 패턴 통합 시스템 부팅
 */

import { eventBus, EVENTS } from './events/event-bus'
import { log } from './utils/logger'
import { commandBus } from './cqrs/command-bus'
import { queryBus } from './cqrs/query-bus'
import { agentPool, artistAgent } from './agents/artist-agent'
import { performanceMonitor } from './monitoring/performance-monitor'
import { auditTrail, logSystemEvent } from './audit/audit-trail'
import { runSystemHealthCheck } from './testing/enterprise-validator'

export interface ArchitectureConfig {
  enablePerformanceMonitoring: boolean
  enableAuditTrail: boolean
  enableSecurityMiddleware: boolean
  enableAgentPool: boolean
  autoStartValidation: boolean
  developmentMode: boolean
}

export interface SystemStatus {
  isInitialized: boolean
  components: {
    eventBus: boolean
    commandBus: boolean
    queryBus: boolean
    agentPool: boolean
    performanceMonitor: boolean
    auditTrail: boolean
  }
  startupTime: number
  version: string
  environment: 'development' | 'staging' | 'production'
}

/**
 * 엔터프라이즈 아키텍처 초기화 관리자
 */
export class EnterpriseArchitecture {
  private static instance: EnterpriseArchitecture
  private status: SystemStatus = {
    isInitialized: false,
    components: {
      eventBus: false,
      commandBus: false,
      queryBus: false,
      agentPool: false,
      performanceMonitor: false,
      auditTrail: false,
    },
    startupTime: 0,
    version: '1.0.0',
    environment:
      process.env.NODE_ENV === 'production'
        ? 'production'
        : (process.env.NODE_ENV as string) === 'staging'
          ? 'staging'
          : 'development',
  }

  private config: ArchitectureConfig = {
    enablePerformanceMonitoring: true,
    enableAuditTrail: true,
    enableSecurityMiddleware: true,
    enableAgentPool: true,
    autoStartValidation: process.env.NODE_ENV !== 'production',
    developmentMode: process.env.NODE_ENV !== 'production',
  }

  private constructor() {}

  static getInstance(): EnterpriseArchitecture {
    if (!EnterpriseArchitecture.instance) {
      EnterpriseArchitecture.instance = new EnterpriseArchitecture()
    }
    return EnterpriseArchitecture.instance
  }

  /**
   * 시스템 초기화
   */
  async initialize(customConfig?: Partial<ArchitectureConfig>): Promise<void> {
    const startTime = Date.now()

    try {
      log.info('🚀 Initializing Enterprise Architecture...')

      // 설정 적용
      if (customConfig) {
        this.config = { ...this.config, ...customConfig }
      }

      // 1. Event Bus 초기화
      await this.initializeEventBus()

      // 2. CQRS 시스템 초기화
      await this.initializeCQRS()

      // 3. Agent Pool 초기화
      if (this.config.enableAgentPool) {
        await this.initializeAgentPool()
      }

      // 4. Performance Monitor 초기화
      if (this.config.enablePerformanceMonitoring) {
        await this.initializePerformanceMonitor()
      }

      // 5. Audit Trail 초기화
      if (this.config.enableAuditTrail) {
        await this.initializeAuditTrail()
      }

      // 6. 시스템 이벤트 리스너 설정
      await this.setupSystemEventListeners()

      // 완료
      this.status.isInitialized = true
      this.status.startupTime = Date.now() - startTime

      // 시스템 준비 이벤트 발행
      await eventBus.emit(EVENTS.SYSTEM_READY, {
        version: this.status.version,
        environment: this.status.environment,
        startupTime: this.status.startupTime,
        enabledComponents: Object.entries(this.status.components)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name),
      })

      log.info(`✅ Enterprise Architecture initialized in ${this.status.startupTime}ms`)
      log.info(`🏗️  Environment: ${this.status.environment.toUpperCase()}`)
      log.info(
        '📊 Enabled Components:',
        Object.entries(this.status.components)
          .filter(([_, enabled]) => enabled)
          .map(([name]) => name)
          .join(', ')
      )

      // 개발 환경에서 자동 검증 실행
      if (this.config.autoStartValidation) {
        setTimeout(() => {
          this.runHealthCheck()
        }, 1000)
      }
    } catch (error) {
      log.error('❌ Failed to initialize Enterprise Architecture:', error)

      await eventBus.emit(EVENTS.SYSTEM_ERROR, {
        error: error instanceof Error ? error.message : 'Initialization failed',
        component: 'EnterpriseArchitecture',
        fatal: true,
      })

      throw error
    }
  }

  /**
   * Event Bus 초기화
   */
  private async initializeEventBus(): Promise<void> {
    try {
      // 이미 초기화된 싱글톤이므로 상태만 확인
      if (eventBus) {
        this.status.components.eventBus = true
        log.info('✅ EventBus initialized')
      }
    } catch (error) {
      log.error('❌ EventBus initialization failed:', error)
      throw error
    }
  }

  /**
   * CQRS 시스템 초기화
   */
  private async initializeCQRS(): Promise<void> {
    try {
      // Command Bus 확인
      if (commandBus) {
        this.status.components.commandBus = true
        log.info('✅ CommandBus initialized')
      }

      // Query Bus 확인
      if (queryBus) {
        this.status.components.queryBus = true
        log.info('✅ QueryBus initialized')
      }
    } catch (error) {
      log.error('❌ CQRS initialization failed:', error)
      throw error
    }
  }

  /**
   * Agent Pool 초기화
   */
  private async initializeAgentPool(): Promise<void> {
    try {
      // Artist Agent가 이미 등록되어 있는지 확인
      const poolStatus = agentPool.getStatus()

      if (poolStatus.totalAgents > 0) {
        this.status.components.agentPool = true
        log.info(`✅ AgentPool initialized with ${poolStatus.totalAgents} agents`)
      } else {
        log.info('⚠️  AgentPool initialized but no agents registered')
        this.status.components.agentPool = true
      }
    } catch (error) {
      log.error('❌ AgentPool initialization failed:', error)
      throw error
    }
  }

  /**
   * Performance Monitor 초기화
   */
  private async initializePerformanceMonitor(): Promise<void> {
    try {
      // Performance Monitor 시작
      performanceMonitor.start()

      this.status.components.performanceMonitor = true
      log.info('✅ PerformanceMonitor initialized')
    } catch (error) {
      log.error('❌ PerformanceMonitor initialization failed:', error)
      throw error
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
        config: this.config,
      })

      this.status.components.auditTrail = true
      log.info('✅ AuditTrail initialized')
    } catch (error) {
      log.error('❌ AuditTrail initialization failed:', error)
      throw error
    }
  }

  /**
   * 시스템 이벤트 리스너 설정
   */
  private async setupSystemEventListeners(): Promise<void> {
    // 시스템 오류 모니터링
    eventBus.subscribe(EVENTS.SYSTEM_ERROR, async event => {
      log.error('🚨 System Error:', event.payload)

      if (event.payload.fatal) {
        log.info('💀 Fatal error detected, initiating graceful shutdown...')
        await this.shutdown()
      }
    })

    // 성능 임계값 초과 모니터링
    eventBus.subscribe(EVENTS.PERFORMANCE_THRESHOLD_EXCEEDED, async event => {
      log.warn('⚡ Performance threshold exceeded:', event.payload)
    })

    // 보안 위반 모니터링
    eventBus.subscribe(EVENTS.SECURITY_VIOLATION, async event => {
      log.warn('🛡️  Security violation detected:', event.payload)
    })

    // 고위험 감사 이벤트 모니터링
    eventBus.subscribe(EVENTS.AUDIT_HIGH_RISK, async event => {
      log.warn('🔍 High-risk audit event:', event.payload)
    })

    log.info('✅ System event listeners configured')
  }

  /**
   * 시스템 상태 조회
   */
  getStatus(): SystemStatus {
    return { ...this.status }
  }

  /**
   * 설정 조회
   */
  getConfig(): ArchitectureConfig {
    return { ...this.config }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<ArchitectureConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 시스템 상태 검사 실행
   */
  async runHealthCheck(): Promise<void> {
    try {
      log.info('🔍 Running system health check...')
      await runSystemHealthCheck()
    } catch (error) {
      log.error('❌ Health check failed:', error)
    }
  }

  /**
   * 시스템 종료
   */
  async shutdown(): Promise<void> {
    try {
      log.info('🔄 Shutting down Enterprise Architecture...')

      // 종료 이벤트 발행
      await eventBus.emit(EVENTS.SYSTEM_SHUTDOWN, {
        timestamp: Date.now(),
        uptime: Date.now() - (Date.now() - this.status.startupTime),
      })

      // Agent Pool 정리
      if (this.status.components.agentPool) {
        await agentPool.cleanup()
        log.info('✅ AgentPool cleaned up')
      }

      // Performance Monitor 중지
      if (this.status.components.performanceMonitor) {
        performanceMonitor.stop()
        log.info('✅ PerformanceMonitor stopped')
      }

      // 감사 로그 기록
      if (this.status.components.auditTrail) {
        await logSystemEvent('system.shutdown', {
          uptime: Date.now() - (Date.now() - this.status.startupTime),
        })
        log.info('✅ AuditTrail recorded shutdown')
      }

      // 모든 이벤트 구독 해제
      eventBus.unsubscribeAll()

      this.status.isInitialized = false
      log.info('✅ Enterprise Architecture shutdown complete')
    } catch (error) {
      log.error('❌ Shutdown error:', error)
    }
  }

  /**
   * 개발 모드 유틸리티
   */
  async developmentUtilities(): Promise<void> {
    if (!this.config.developmentMode) {
      log.info('⚠️  Development utilities only available in development mode')
      return
    }

    log.info('\n🛠️  === DEVELOPMENT UTILITIES ===')
    log.info('1. System Status:', this.getStatus())
    log.info('2. Agent Pool Status:', agentPool.getStatus())
    log.info('3. Performance Metrics:', performanceMonitor.getSystemStatus())
    log.info('4. Recent Audit Entries:', auditTrail.query({ limit: 5 }))
    log.info('=== END UTILITIES ===\n')
  }
}

// 전역 아키텍처 인스턴스
export const enterpriseArchitecture = EnterpriseArchitecture.getInstance()

// 자동 초기화 (브라우저 환경이 아닌 경우)
if (typeof window === 'undefined') {
  // 서버 사이드에서 자동 초기화
  enterpriseArchitecture
    .initialize()
    .catch(error => log.error('Failed to initialize enterprise architecture:', error))
}

// 프로세스 종료 시 정리
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    log.info('\n🔄 Received SIGINT, shutting down gracefully...')
    enterpriseArchitecture.shutdown().then(() => {
      process.exit(0)
    })
  })

  process.on('SIGTERM', () => {
    log.info('\n🔄 Received SIGTERM, shutting down gracefully...')
    enterpriseArchitecture.shutdown().then(() => {
      process.exit(0)
    })
  })
}

// 헬퍼 함수들
export async function initializeSystem(config?: Partial<ArchitectureConfig>): Promise<void> {
  await enterpriseArchitecture.initialize(config)
}

export function getSystemStatus(): SystemStatus {
  return enterpriseArchitecture.getStatus()
}

export async function shutdownSystem(): Promise<void> {
  await enterpriseArchitecture.shutdown()
}

export default enterpriseArchitecture
