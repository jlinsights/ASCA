import { log } from '@/lib/utils/logger';

export interface AgentMetric {
  agentId: string;
  taskType: string;
  status: 'success' | 'failure';
  executionTime: number;
  timestamp: number;
  error?: string;
}

class AgentMonitoringService {
  private static instance: AgentMonitoringService;
  private metrics: AgentMetric[] = [];
  
  private constructor() {}

  static getInstance(): AgentMonitoringService {
    if (!AgentMonitoringService.instance) {
      AgentMonitoringService.instance = new AgentMonitoringService();
    }
    return AgentMonitoringService.instance;
  }

  public trackExecution(metric: AgentMetric) {
    this.metrics.push(metric);
    
    // In a real production app, you might send this to Datadog, Sentry, or a database
    // For now, we log usage stats
    if (metric.status === 'failure') {
      log.error(`[AgentMonitor] Task Failed: ${metric.agentId} - ${metric.taskType}`, {
        error: metric.error,
        executionTime: metric.executionTime
      });
    } else {
      log.info(`[AgentMonitor] Task Success: ${metric.agentId} - ${metric.taskType}`, {
        executionTime: metric.executionTime
      });
    }
  }

  public getMetrics(agentId?: string): AgentMetric[] {
    if (agentId) {
      return this.metrics.filter(m => m.agentId === agentId);
    }
    return this.metrics;
  }
  
  public getSuccessRate(agentId: string): number {
    const agentMetrics = this.getMetrics(agentId);
    if (agentMetrics.length === 0) return 0;
    
    const successCount = agentMetrics.filter(m => m.status === 'success').length;
    return (successCount / agentMetrics.length) * 100;
  }
  
  public getAverageExecutionTime(agentId: string): number {
    const agentMetrics = this.getMetrics(agentId);
    if (agentMetrics.length === 0) return 0;
    
    const totalTime = agentMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    return totalTime / agentMetrics.length;
  }
}

export const agentMonitor = AgentMonitoringService.getInstance();
