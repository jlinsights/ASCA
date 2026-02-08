/**
 * 구조화된 로깅 시스템
 * JSON 기반 로그 출력 및 컨텍스트 관리
 */

/**
 * 로그 레벨
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 * 로그 레벨 문자열 매핑
 */
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

/**
 * 로그 엔트리
 */
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
  tags?: string[];
  source?: {
    file?: string;
    line?: number;
    function?: string;
  };
}

/**
 * 로거 설정
 */
export interface LoggerConfig {
  level: LogLevel;
  enableStackTrace: boolean;
  enableSourceLocation: boolean;
  defaultContext?: Record<string, any>;
  defaultTags?: string[];
  transports?: LogTransport[];
}

/**
 * 로그 Transport 인터페이스
 */
export interface LogTransport {
  name: string;
  level: LogLevel;
  log(entry: LogEntry): void | Promise<void>;
}

/**
 * 로그 컨텍스트
 */
export class LogContext {
  private static contexts = new Map<string, Record<string, any>>();

  static set(key: string, value: any): void {
    const contextId = this.getCurrentContextId();
    if (!this.contexts.has(contextId)) {
      this.contexts.set(contextId, {});
    }
    this.contexts.get(contextId)![key] = value;
  }

  static get(key: string): any {
    const contextId = this.getCurrentContextId();
    return this.contexts.get(contextId)?.[key];
  }

  static getAll(): Record<string, any> {
    const contextId = this.getCurrentContextId();
    return this.contexts.get(contextId) || {};
  }

  static clear(): void {
    const contextId = this.getCurrentContextId();
    this.contexts.delete(contextId);
  }

  static with<T>(context: Record<string, any>, fn: () => T): T {
    const contextId = this.getCurrentContextId();
    const previousContext = this.contexts.get(contextId);

    this.contexts.set(contextId, { ...previousContext, ...context });

    try {
      return fn();
    } finally {
      if (previousContext) {
        this.contexts.set(contextId, previousContext);
      } else {
        this.contexts.delete(contextId);
      }
    }
  }

  static async withAsync<T>(
    context: Record<string, any>,
    fn: () => Promise<T>
  ): Promise<T> {
    const contextId = this.getCurrentContextId();
    const previousContext = this.contexts.get(contextId);

    this.contexts.set(contextId, { ...previousContext, ...context });

    try {
      return await fn();
    } finally {
      if (previousContext) {
        this.contexts.set(contextId, previousContext);
      } else {
        this.contexts.delete(contextId);
      }
    }
  }

  private static getCurrentContextId(): string {
    // Node.js 환경에서는 AsyncLocalStorage 사용 가능
    // 브라우저에서는 간단하게 'default' 사용
    if (typeof window !== 'undefined') {
      return 'browser';
    }
    return 'default';
  }
}

/**
 * 구조화된 로거 클래스
 */
export class StructuredLogger {
  private static instance: StructuredLogger;
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private logQueue: LogEntry[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableStackTrace: true,
      enableSourceLocation: false,
      defaultContext: {},
      defaultTags: [],
      transports: [],
      ...config,
    };

    if (this.config.transports) {
      this.transports = this.config.transports;
    }

    // 비동기 로그 처리 시작
    this.startProcessing();
  }

  static getInstance(config?: Partial<LoggerConfig>): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger(config);
    }
    return StructuredLogger.instance;
  }

  /**
   * Transport 추가
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Transport 제거
   */
  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  /**
   * 로그 레벨 설정
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 로그 레벨 가져오기
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * DEBUG 로그
   */
  debug(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log(LogLevel.DEBUG, message, context, tags);
  }

  /**
   * INFO 로그
   */
  info(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log(LogLevel.INFO, message, context, tags);
  }

  /**
   * WARN 로그
   */
  warn(message: string, context?: Record<string, any>, tags?: string[]): void {
    this.log(LogLevel.WARN, message, context, tags);
  }

  /**
   * ERROR 로그
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    tags?: string[]
  ): void {
    this.log(LogLevel.ERROR, message, context, tags, error);
  }

  /**
   * FATAL 로그
   */
  fatal(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    tags?: string[]
  ): void {
    this.log(LogLevel.FATAL, message, context, tags, error);
  }

  /**
   * 조건부 로그
   */
  logIf(
    condition: boolean,
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): void {
    if (condition) {
      this.log(level, message, context);
    }
  }

  /**
   * 성능 측정 로그
   */
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.info(`${label} completed`, { duration, unit: 'ms' }, ['performance']);
    };
  }

  /**
   * 비동기 성능 측정
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${label} completed`, { duration, unit: 'ms' }, ['performance']);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(
        `${label} failed`,
        error instanceof Error ? error : new Error(String(error)),
        { duration, unit: 'ms' },
        ['performance', 'error']
      );
      throw error;
    }
  }

  /**
   * 자식 로거 생성
   */
  child(context: Record<string, any>, tags?: string[]): StructuredLogger {
    const childLogger = new StructuredLogger({
      ...this.config,
      defaultContext: { ...this.config.defaultContext, ...context },
      defaultTags: [...(this.config.defaultTags || []), ...(tags || [])],
    });

    // Transport 복사
    childLogger.transports = [...this.transports];

    return childLogger;
  }

  /**
   * 로그 큐 크기
   */
  getQueueSize(): number {
    return this.logQueue.length;
  }

  /**
   * 로그 플러시
   */
  async flush(): Promise<void> {
    await this.processQueue();
  }

  /**
   * 로거 종료
   */
  shutdown(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.processQueue();
  }

  // Private 메서드들

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    tags?: string[],
    error?: Error
  ): void {
    // 로그 레벨 필터링
    if (level < this.config.level) return;

    // 로그 엔트리 생성
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      context: {
        ...this.config.defaultContext,
        ...LogContext.getAll(),
        ...context,
      },
      tags: [...(this.config.defaultTags || []), ...(tags || [])],
    };

    // 에러 정보 추가
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.config.enableStackTrace ? error.stack : undefined,
      };
    }

    // 소스 위치 추가
    if (this.config.enableSourceLocation) {
      entry.source = this.getSourceLocation();
    }

    // 로그 큐에 추가
    this.logQueue.push(entry);
  }

  private getSourceLocation(): { file?: string; line?: number; function?: string } {
    const stack = new Error().stack;
    if (!stack) return {};

    const lines = stack.split('\n');
    // 첫 3개 라인은 이 함수와 log 함수이므로 건너뜀
    for (let i = 3; i < lines.length && i < 10; i++) {
      const line = lines[i];
      if (line && !line.includes('structured-logger')) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/);
        if (match) {
          return {
            function: match[1],
            file: match[2],
            line: parseInt(match[3] || '0', 10),
          };
        }
      }
    }

    return {};
  }

  private startProcessing(): void {
    // 100ms마다 로그 큐 처리
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 100);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // 큐에서 모든 로그 가져오기
      const entries = [...this.logQueue];
      this.logQueue = [];

      // 각 Transport로 전송
      for (const transport of this.transports) {
        for (const entry of entries) {
          // Transport 레벨 필터링
          if (entry.level >= transport.level) {
            try {
              const result = transport.log(entry);
              if (result instanceof Promise) {
                await result;
              }
            } catch (error) {
              console.error(`Transport ${transport.name} error:`, error);
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// 전역 인스턴스
export const logger = StructuredLogger.getInstance();

// 헬퍼 함수들
export function debug(message: string, context?: Record<string, any>, tags?: string[]): void {
  logger.debug(message, context, tags);
}

export function info(message: string, context?: Record<string, any>, tags?: string[]): void {
  logger.info(message, context, tags);
}

export function warn(message: string, context?: Record<string, any>, tags?: string[]): void {
  logger.warn(message, context, tags);
}

export function error(
  message: string,
  err?: Error,
  context?: Record<string, any>,
  tags?: string[]
): void {
  logger.error(message, err, context, tags);
}

export function fatal(
  message: string,
  err?: Error,
  context?: Record<string, any>,
  tags?: string[]
): void {
  logger.fatal(message, err, context, tags);
}

export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}

export function createLogger(
  context: Record<string, any>,
  tags?: string[]
): StructuredLogger {
  return logger.child(context, tags);
}

export function withLogContext<T>(context: Record<string, any>, fn: () => T): T {
  return LogContext.with(context, fn);
}

export async function withLogContextAsync<T>(
  context: Record<string, any>,
  fn: () => Promise<T>
): Promise<T> {
  return LogContext.withAsync(context, fn);
}

export function measureTime(label: string): () => void {
  return logger.time(label);
}

export async function measureTimeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  return logger.timeAsync(label, fn);
}
