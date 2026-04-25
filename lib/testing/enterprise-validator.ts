/**
 * 엔터프라이즈 아키텍처 검증 시스템
 * CQRS + Agent + 보안 시스템 통합 테스트
 */

import { log } from '@/lib/utils/logger'
import { commandBus } from '../cqrs/command-bus'
import { queryBus } from '../cqrs/query-bus'
import { eventBus } from '../events/event-bus'
import { agentPool } from '../agents/sub-agent'
import { performanceMonitor } from '../monitoring/performance-monitor'
import { auditTrail } from '../audit/audit-trail'
import { SecurityMiddleware, createSecurityContext } from '../security/security-middleware'

export interface ValidationResult {
  component: string
  passed: boolean
  errors: string[]
  warnings: string[]
  metrics: {
    executionTime: number
    memoryUsage?: number
    operationCount?: number
  }
}

export interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'critical'
  components: ValidationResult[]
  systemMetrics: {
    totalExecutionTime: number
    errorCount: number
    warningCount: number
    performanceScore: number // 0-100
  }
  recommendations: string[]
}

/**
 * 엔터프라이즈 아키텍처 검증기
 */
export class EnterpriseValidator {
  private static instance: EnterpriseValidator

  private constructor() {}

  static getInstance(): EnterpriseValidator {
    if (!EnterpriseValidator.instance) {
      EnterpriseValidator.instance = new EnterpriseValidator()
    }
    return EnterpriseValidator.instance
  }

  /**
   * 전체 시스템 검증
   */
  async validateSystem(): Promise<SystemHealthReport> {
    const startTime = performance.now()
    const components: ValidationResult[] = []

    log.info('🔍 Starting Enterprise Architecture Validation...')

    // 1. Event Bus 검증
    components.push(await this.validateEventBus())

    // 2. Command Bus 검증
    components.push(await this.validateCommandBus())

    // 3. Query Bus 검증
    components.push(await this.validateQueryBus())

    // 4. Agent Pool 검증
    components.push(await this.validateAgentPool())

    // 5. Performance Monitor 검증
    components.push(await this.validatePerformanceMonitor())

    // 6. Security Middleware 검증
    components.push(await this.validateSecurityMiddleware())

    // 7. Audit Trail 검증
    components.push(await this.validateAuditTrail())

    // 8. 통합 워크플로우 검증
    components.push(await this.validateIntegratedWorkflow())

    const totalExecutionTime = performance.now() - startTime
    const errorCount = components.reduce((sum, c) => sum + c.errors.length, 0)
    const warningCount = components.reduce((sum, c) => sum + c.warnings.length, 0)
    const passedCount = components.filter(c => c.passed).length
    const performanceScore = Math.round((passedCount / components.length) * 100)

    const overall: 'healthy' | 'warning' | 'critical' =
      errorCount === 0 ? (warningCount === 0 ? 'healthy' : 'warning') : 'critical'

    const recommendations = this.generateRecommendations(components)

    log.info(`✅ Validation completed in ${totalExecutionTime.toFixed(2)}ms`)
    log.info(`📊 Performance Score: ${performanceScore}/100`)
    log.info(`🚨 Status: ${overall.toUpperCase()}`)

    return {
      overall,
      components,
      systemMetrics: {
        totalExecutionTime,
        errorCount,
        warningCount,
        performanceScore,
      },
      recommendations,
    }
  }

  /**
   * Event Bus 검증
   */
  private async validateEventBus(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 이벤트 발행/구독 테스트
      let eventReceived = false
      const testEvent = 'test.validation.event'

      const unsubscribe = eventBus.subscribe(testEvent, () => {
        eventReceived = true
      })

      await eventBus.emit(testEvent, { test: true })

      // 짧은 대기 후 확인
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!eventReceived) {
        errors.push('Event emission/subscription failed')
      }

      unsubscribe()

      // 이벤트 버스 상태 확인
      if (typeof eventBus.getSubscriberCount !== 'function') {
        warnings.push('Event bus monitoring capabilities limited')
      }
    } catch (error) {
      errors.push(`Event bus error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return {
      component: 'EventBus',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * Command Bus 검증
   */
  private async validateCommandBus(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Command 처리 테스트
      const testCommand = {
        type: 'test.command',
        payload: { test: true },
        metadata: { timestamp: Date.now() },
      }

      // 핸들러가 없는 경우 에러 처리 테스트
      try {
        await commandBus.execute(testCommand)
        errors.push('Command bus should reject unregistered commands')
      } catch (error) {
        // 예상된 에러 - 정상
      }

      // 등록된 핸들러 수 확인
      if (Object.keys(commandBus as any).length === 0) {
        warnings.push('No command handlers registered')
      }
    } catch (error) {
      errors.push(`Command bus error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return {
      component: 'CommandBus',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * Query Bus 검증
   */
  private async validateQueryBus(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Query 처리 테스트
      const testQuery = {
        type: 'test.query',
        params: { test: true },
        metadata: { cacheKey: 'test', cacheTTL: 1000 },
      }

      // 핸들러가 없는 경우 에러 처리 테스트
      try {
        await queryBus.execute(testQuery)
        errors.push('Query bus should reject unregistered queries')
      } catch (error) {
        // 예상된 에러 - 정상
      }

      // 캐시 기능 테스트
      queryBus.invalidateCache('test')
    } catch (error) {
      errors.push(`Query bus error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return {
      component: 'QueryBus',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * Agent Pool 검증
   */
  private async validateAgentPool(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const poolStatus = agentPool.getStatus()

      if (poolStatus.totalAgents === 0) {
        warnings.push('No agents registered in pool')
      }

      if (poolStatus.isProcessing && poolStatus.queueSize === 0) {
        warnings.push('Agent pool processing but queue empty')
      }

      if (poolStatus.queueSize > 100) {
        warnings.push('Large queue size detected')
      }
    } catch (error) {
      errors.push(`Agent pool error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return {
      component: 'AgentPool',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
        operationCount: agentPool.getStatus().completedTasks,
      },
    }
  }

  /**
   * Performance Monitor 검증
   */
  private async validatePerformanceMonitor(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 메트릭 기록 테스트
      performanceMonitor.recordMetric({
        name: 'test.validation.metric',
        value: 100,
        unit: 'test',
      })

      // 상태 확인
      const status = performanceMonitor.getSystemStatus()

      if (!status.isMonitoring) {
        warnings.push('Performance monitoring is not active')
      }

      if (status.criticalAlerts > 0) {
        warnings.push(`${status.criticalAlerts} critical alerts active`)
      }

      // 메트릭 조회 테스트
      const metrics = performanceMonitor.getMetrics('test.validation.metric')
      if (metrics.length === 0) {
        errors.push('Failed to record/retrieve metrics')
      }
    } catch (error) {
      errors.push(
        `Performance monitor error: ${error instanceof Error ? error.message : 'Unknown'}`
      )
    }

    return {
      component: 'PerformanceMonitor',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * Security Middleware 검증
   */
  private async validateSecurityMiddleware(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 보안 검증 테스트
      const testContext = createSecurityContext('test-user', 'user', ['read'])

      const validation = await SecurityMiddleware.validateOperation(
        'test.operation',
        { test: 'data' },
        testContext
      )

      if (validation.riskScore < 0 || validation.riskScore > 1) {
        errors.push('Invalid risk score range')
      }

      // 위험한 입력 테스트
      const dangerousValidation = await SecurityMiddleware.validateOperation(
        'test.operation',
        { script: '<script>alert("xss")</script>' },
        testContext
      )

      if (dangerousValidation.isValid) {
        errors.push('Security middleware failed to detect dangerous input')
      }
    } catch (error) {
      errors.push(
        `Security middleware error: ${error instanceof Error ? error.message : 'Unknown'}`
      )
    }

    return {
      component: 'SecurityMiddleware',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * Audit Trail 검증
   */
  private async validateAuditTrail(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 감사 로그 기록 테스트
      await auditTrail.log({
        userId: 'test-user',
        operation: 'test.validation',
        resource: 'test',
        resourceId: 'validation',
        metadata: {
          source: 'validator',
          version: '1.0.0',
        },
        result: 'success',
        riskScore: 0.1,
      })

      // 감사 로그 조회 테스트
      const report = auditTrail.query({ userId: 'test-user' })

      if (report.entries.length === 0) {
        errors.push('Failed to record/retrieve audit entries')
      }

      // 규정 준수 보고서 테스트
      const complianceReport = auditTrail.generateComplianceReport()

      if (!complianceReport.totalOperations && report.totalCount > 0) {
        warnings.push('Compliance report inconsistency')
      }
    } catch (error) {
      errors.push(`Audit trail error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }

    return {
      component: 'AuditTrail',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * 통합 워크플로우 검증
   */
  private async validateIntegratedWorkflow(): Promise<ValidationResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 통합 워크플로우 테스트 (이벤트 → 감사 → 성능 모니터링)
      let workflowCompleted = false

      // 이벤트 리스너 설정
      const unsubscribe = eventBus.subscribe('test.workflow.event', async () => {
        workflowCompleted = true
      })

      // 워크플로우 시작
      await eventBus.emit('test.workflow.event', {
        workflowId: 'validation-test',
        timestamp: Date.now(),
      })

      // 완료 대기
      await new Promise(resolve => setTimeout(resolve, 200))

      if (!workflowCompleted) {
        errors.push('Integrated workflow failed to complete')
      }

      unsubscribe()

      // 시스템 간 데이터 일관성 확인
      const auditEntries = auditTrail.query({ operation: 'test.workflow.event' })
      const performanceMetrics = performanceMonitor.getMetrics('test.workflow')

      if (auditEntries.totalCount === 0) {
        warnings.push('Workflow events not captured in audit trail')
      }
    } catch (error) {
      errors.push(
        `Integrated workflow error: ${error instanceof Error ? error.message : 'Unknown'}`
      )
    }

    return {
      component: 'IntegratedWorkflow',
      passed: errors.length === 0,
      errors,
      warnings,
      metrics: {
        executionTime: performance.now() - startTime,
      },
    }
  }

  /**
   * 개선 권장사항 생성
   */
  private generateRecommendations(components: ValidationResult[]): string[] {
    const recommendations: string[] = []

    const failedComponents = components.filter(c => !c.passed)
    const slowComponents = components.filter(c => c.metrics.executionTime > 1000)

    if (failedComponents.length > 0) {
      recommendations.push(
        `🔧 Fix critical issues in: ${failedComponents.map(c => c.component).join(', ')}`
      )
    }

    if (slowComponents.length > 0) {
      recommendations.push(
        `⚡ Optimize performance in: ${slowComponents.map(c => c.component).join(', ')}`
      )
    }

    const totalWarnings = components.reduce((sum, c) => sum + c.warnings.length, 0)
    if (totalWarnings > 5) {
      recommendations.push('📋 Review and address system warnings')
    }

    if (components.every(c => c.passed) && totalWarnings === 0) {
      recommendations.push('🎉 System is running optimally - consider advanced optimizations')
    }

    return recommendations
  }
}

// 전역 검증기 인스턴스
export const enterpriseValidator = EnterpriseValidator.getInstance()

// 헬퍼 함수
export async function runSystemHealthCheck(): Promise<void> {
  const report = await enterpriseValidator.validateSystem()

  log.info('\n📊 === ENTERPRISE ARCHITECTURE HEALTH REPORT ===')
  log.info(`Overall Status: ${report.overall.toUpperCase()}`)
  log.info(`Performance Score: ${report.systemMetrics.performanceScore}/100`)
  log.info(`Total Execution Time: ${report.systemMetrics.totalExecutionTime.toFixed(2)}ms`)
  log.info(
    `Errors: ${report.systemMetrics.errorCount}, Warnings: ${report.systemMetrics.warningCount}`
  )

  log.info('\n🔍 Component Status:')
  report.components.forEach(component => {
    const status = component.passed ? '✅' : '❌'
    log.info(`${status} ${component.component} (${component.metrics.executionTime.toFixed(2)}ms)`)

    if (component.errors.length > 0) {
      component.errors.forEach(error => log.info(`   ❌ ${error}`))
    }

    if (component.warnings.length > 0) {
      component.warnings.forEach(warning => log.info(`   ⚠️  ${warning}`))
    }
  })

  if (report.recommendations.length > 0) {
    log.info('\n💡 Recommendations:')
    report.recommendations.forEach(rec => log.info(`   ${rec}`))
  }

  log.info('\n=== END REPORT ===\n')
}
