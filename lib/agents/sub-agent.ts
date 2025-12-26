/**
 * SubAgent 패턴 - 분산 처리 아키텍처
 * 독립적이고 재사용 가능한 작업 단위
 */

import { log } from '@/lib/utils/logger';
import { eventBus, Event } from '../events/event-bus';

export interface AgentTask<TInput = any, TOutput = any> {
  id: string;
  type: string;
  input: TInput;
  priority: number;
  timeout?: number;
  retryCount?: number;
  maxRetries?: number;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface AgentResult<TOutput = any> {
  taskId: string;
  success: boolean;
  output?: TOutput;
  error?: string;
  executionTime: number;
  timestamp: number;
  retryCount: number;
  metadata?: Record<string, any>;
}

/**
 * SubAgent 기본 클래스
 */
export abstract class SubAgent<TInput = any, TOutput = any> {
  public readonly id: string;
  public readonly type: string;
  public isRunning = false;
  protected currentTask: AgentTask<TInput> | null = null;

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }

  /**
   * 작업 실행 - 구현 필수
   */
  abstract execute(task: AgentTask<TInput>): Promise<TOutput>;

  /**
   * 작업 처리 메인 로직
   */
  async process(task: AgentTask<TInput>): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();
    this.currentTask = task;
    this.isRunning = true;

    try {
      // 작업 시작 이벤트
      await eventBus.emit('agent.task.started', {
        agentId: this.id,
        agentType: this.type,
        taskId: task.id,
        taskType: task.type
      });

      // 타임아웃 설정
      const timeoutPromise = task.timeout 
        ? new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Task timeout')), task.timeout)
          )
        : null;

      // 작업 실행
      const executePromise = this.execute(task);
      const output = timeoutPromise 
        ? await Promise.race([executePromise, timeoutPromise])
        : await executePromise;

      const result: AgentResult<TOutput> = {
        taskId: task.id,
        success: true,
        output,
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
        retryCount: task.retryCount || 0
      };

      // 성공 이벤트
      await eventBus.emit('agent.task.completed', {
        agentId: this.id,
        taskId: task.id,
        success: true,
        executionTime: result.executionTime
      });

      return result;

    } catch (error) {
      const result: AgentResult<TOutput> = {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
        retryCount: task.retryCount || 0
      };

      // 실패 이벤트
      await eventBus.emit('agent.task.failed', {
        agentId: this.id,
        taskId: task.id,
        error: result.error,
        retryCount: result.retryCount,
        maxRetries: task.maxRetries || 0
      });

      return result;

    } finally {
      this.isRunning = false;
      this.currentTask = null;
    }
  }

  /**
   * Agent 상태 조회
   */
  getStatus() {
    return {
      id: this.id,
      type: this.type,
      isRunning: this.isRunning,
      currentTask: this.currentTask?.id || null
    };
  }

  /**
   * Agent 중지
   */
  async stop(): Promise<void> {
    if (this.isRunning && this.currentTask) {
      await eventBus.emit('agent.task.cancelled', {
        agentId: this.id,
        taskId: this.currentTask.id
      });
    }
    this.isRunning = false;
    this.currentTask = null;
  }
}

/**
 * Agent Pool - SubAgent 관리
 */
export class AgentPool {
  private agents = new Map<string, SubAgent>();
  private taskQueue: AgentTask[] = [];
  private results = new Map<string, AgentResult>();
  private isProcessing = false;

  /**
   * Agent 등록
   */
  registerAgent(agent: SubAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Agent 제거
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.stop();
      this.agents.delete(agentId);
    }
  }

  /**
   * 작업 추가
   */
  addTask<TInput>(task: AgentTask<TInput>): void {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * 작업 큐 처리
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      
      // 의존성 확인
      if (task.dependencies && !this.areDependenciesMet(task.dependencies)) {
        // 의존성이 만족되지 않으면 큐 뒤로 이동
        this.taskQueue.push(task);
        continue;
      }

      // 사용 가능한 Agent 찾기
      const agent = this.findAvailableAgent(task.type);
      if (!agent) {
        // 사용 가능한 Agent가 없으면 큐 뒤로 이동
        this.taskQueue.push(task);
        await new Promise(resolve => setTimeout(resolve, 100)); // 잠시 대기
        continue;
      }

      // 작업 실행
      try {
        const result = await agent.process(task);
        this.results.set(task.id, result);

        // 재시도 로직
        if (!result.success && (task.retryCount || 0) < (task.maxRetries || 0)) {
          const retryTask = {
            ...task,
            retryCount: (task.retryCount || 0) + 1
          };
          this.taskQueue.unshift(retryTask); // 우선순위 높게 재추가
        }

      } catch (error) {
        log.error(`Agent pool error for task ${task.id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 결과 조회
   */
  getResult(taskId: string): AgentResult | undefined {
    return this.results.get(taskId);
  }

  /**
   * 모든 결과 조회
   */
  getAllResults(): Map<string, AgentResult> {
    return new Map(this.results);
  }

  /**
   * 사용 가능한 Agent 찾기
   */
  private findAvailableAgent(taskType: string): SubAgent | null {
    for (const agent of this.agents.values()) {
      if (agent.type === taskType && !agent.isRunning) {
        return agent;
      }
    }
    return null;
  }

  /**
   * 의존성 확인
   */
  private areDependenciesMet(dependencies: string[]): boolean {
    return dependencies.every(dep => {
      const result = this.results.get(dep);
      return result && result.success;
    });
  }

  /**
   * Pool 상태 조회
   */
  getStatus() {
    return {
      totalAgents: this.agents.size,
      runningAgents: Array.from(this.agents.values()).filter(a => a.isRunning).length,
      queueSize: this.taskQueue.length,
      completedTasks: this.results.size,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Pool 정리
   */
  async cleanup(): Promise<void> {
    // 모든 Agent 중지
    await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.stop())
    );
    
    this.agents.clear();
    this.taskQueue.length = 0;
    this.results.clear();
    this.isProcessing = false;
  }
}

// 전역 Agent Pool
export const agentPool = new AgentPool();

// 작업 유틸리티 함수
export function createTask<TInput>(
  type: string,
  input: TInput,
  options: Partial<AgentTask<TInput>> = {}
): AgentTask<TInput> {
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    input,
    priority: 0,
    retryCount: 0,
    maxRetries: 3,
    ...options
  };
}