/**
 * 로그 Transports
 * 다양한 출력 대상으로 로그 전송
 */

import type { LogEntry, LogTransport } from './structured-logger';
import { LogLevel, LOG_LEVEL_NAMES } from './structured-logger';

/**
 * Console Transport
 * 콘솔로 로그 출력
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';
  level: LogLevel;
  private useColors: boolean;
  private formatter: (entry: LogEntry) => string;

  constructor(options?: {
    level?: LogLevel;
    useColors?: boolean;
    formatter?: (entry: LogEntry) => string;
  }) {
    this.level = options?.level ?? LogLevel.DEBUG;
    this.useColors = options?.useColors ?? true;
    this.formatter = options?.formatter ?? this.defaultFormatter.bind(this);
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter(entry);
    const output = this.useColors ? this.colorize(formatted, entry.level) : formatted;

    // 로그 레벨에 따라 적절한 콘솔 메서드 사용
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output);
        break;
      case LogLevel.INFO:
        console.info(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }

  private defaultFormatter(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.levelName.padEnd(5);
    const message = entry.message;

    let output = `[${timestamp}] ${level} ${message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    if (entry.tags && entry.tags.length > 0) {
      output += ` [${entry.tags.join(', ')}]`;
    }

    return output;
  }

  private colorize(text: string, level: LogLevel): string {
    if (typeof window !== 'undefined') {
      // 브라우저 환경에서는 CSS 스타일 사용
      return text;
    }

    // Node.js 환경에서는 ANSI 색상 코드 사용
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    return `${colors[level]}${text}${reset}`;
  }
}

/**
 * File Transport
 * 파일로 로그 저장
 */
export class FileTransport implements LogTransport {
  name = 'file';
  level: LogLevel;
  private filepath: string;
  private maxFileSize: number;
  private maxFiles: number;
  private currentFileSize = 0;
  private writeQueue: string[] = [];
  private isWriting = false;

  constructor(options: {
    filepath: string;
    level?: LogLevel;
    maxFileSize?: number; // bytes
    maxFiles?: number;
  }) {
    this.filepath = options.filepath;
    this.level = options.level ?? LogLevel.INFO;
    this.maxFileSize = options.maxFileSize ?? 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles ?? 5;
  }

  async log(entry: LogEntry): Promise<void> {
    const line = JSON.stringify(entry) + '\n';
    this.writeQueue.push(line);

    if (!this.isWriting) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.writeQueue.length === 0 || this.isWriting) return;

    this.isWriting = true;

    try {
      const lines = [...this.writeQueue];
      this.writeQueue = [];

      // Node.js 환경에서만 파일 쓰기
      if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        const path = await import('path');

        // 디렉토리 생성
        const dir = path.dirname(this.filepath);
        await fs.mkdir(dir, { recursive: true });

        // 파일 크기 확인
        try {
          const stats = await fs.stat(this.filepath);
          this.currentFileSize = stats.size;
        } catch {
          this.currentFileSize = 0;
        }

        // 로테이션 확인
        if (this.currentFileSize >= this.maxFileSize) {
          await this.rotate();
        }

        // 파일에 쓰기
        await fs.appendFile(this.filepath, lines.join(''));
        this.currentFileSize += lines.join('').length;
      }
    } catch (error) {
      console.error('FileTransport write error:', error);
    } finally {
      this.isWriting = false;
    }
  }

  private async rotate(): Promise<void> {
    if (typeof window !== 'undefined') return;

    const fs = await import('fs/promises');
    const path = await import('path');

    const dir = path.dirname(this.filepath);
    const ext = path.extname(this.filepath);
    const base = path.basename(this.filepath, ext);

    // 오래된 파일 삭제
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(dir, `${base}.${i}${ext}`);
      const newFile = path.join(dir, `${base}.${i + 1}${ext}`);

      try {
        await fs.rename(oldFile, newFile);
      } catch {
        // 파일이 없으면 무시
      }
    }

    // 현재 파일을 .1로 이동
    try {
      await fs.rename(this.filepath, path.join(dir, `${base}.1${ext}`));
    } catch {
      // 파일이 없으면 무시
    }

    this.currentFileSize = 0;
  }
}

/**
 * HTTP Transport
 * HTTP 엔드포인트로 로그 전송
 */
export class HTTPTransport implements LogTransport {
  name = 'http';
  level: LogLevel;
  private endpoint: string;
  private headers: Record<string, string>;
  private batchSize: number;
  private flushInterval: number;
  private batch: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(options: {
    endpoint: string;
    level?: LogLevel;
    headers?: Record<string, string>;
    batchSize?: number;
    flushInterval?: number;
  }) {
    this.endpoint = options.endpoint;
    this.level = options.level ?? LogLevel.INFO;
    this.headers = options.headers ?? {};
    this.batchSize = options.batchSize ?? 10;
    this.flushInterval = options.flushInterval ?? 5000;

    this.startFlushTimer();
  }

  async log(entry: LogEntry): Promise<void> {
    this.batch.push(entry);

    if (this.batch.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const entries = [...this.batch];
    this.batch = [];

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({ logs: entries }),
      });

      if (!response.ok) {
        console.error('HTTPTransport send error:', response.statusText);
      }
    } catch (error) {
      console.error('HTTPTransport send error:', error);
      // 실패한 로그는 다시 큐에 추가
      this.batch.unshift(...entries);
    }
  }

  shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

/**
 * Memory Transport
 * 메모리에 로그 저장 (테스트 및 디버깅용)
 */
export class MemoryTransport implements LogTransport {
  name = 'memory';
  level: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number;

  constructor(options?: { level?: LogLevel; maxLogs?: number }) {
    this.level = options?.level ?? LogLevel.DEBUG;
    this.maxLogs = options?.maxLogs ?? 1000;
  }

  log(entry: LogEntry): void {
    this.logs.push(entry);

    // 최대 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(filter?: {
    level?: LogLevel;
    message?: string;
    tags?: string[];
    since?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level !== undefined) {
        filtered = filtered.filter(log => log.level >= filter.level!);
      }

      if (filter.message) {
        filtered = filtered.filter(log =>
          log.message.toLowerCase().includes(filter.message!.toLowerCase())
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter(
          log => log.tags && filter.tags!.some(tag => log.tags!.includes(tag))
        );
      }

      if (filter.since) {
        filtered = filtered.filter(log => log.timestamp >= filter.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  clear(): void {
    this.logs = [];
  }

  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byTag: Record<string, number>;
  } {
    const byLevel: Record<string, number> = {};
    const byTag: Record<string, number> = {};

    for (const log of this.logs) {
      byLevel[log.levelName] = (byLevel[log.levelName] || 0) + 1;

      if (log.tags) {
        for (const tag of log.tags) {
          byTag[tag] = (byTag[tag] || 0) + 1;
        }
      }
    }

    return {
      total: this.logs.length,
      byLevel,
      byTag,
    };
  }
}

/**
 * Custom Transport
 * 사용자 정의 로그 처리
 */
export class CustomTransport implements LogTransport {
  name: string;
  level: LogLevel;
  private handler: (entry: LogEntry) => void | Promise<void>;

  constructor(
    name: string,
    handler: (entry: LogEntry) => void | Promise<void>,
    level: LogLevel = LogLevel.INFO
  ) {
    this.name = name;
    this.handler = handler;
    this.level = level;
  }

  async log(entry: LogEntry): Promise<void> {
    const result = this.handler(entry);
    if (result instanceof Promise) {
      await result;
    }
  }
}

// Transport 팩토리 함수들
export function createConsoleTransport(options?: {
  level?: LogLevel;
  useColors?: boolean;
  formatter?: (entry: LogEntry) => string;
}): ConsoleTransport {
  return new ConsoleTransport(options);
}

export function createFileTransport(options: {
  filepath: string;
  level?: LogLevel;
  maxFileSize?: number;
  maxFiles?: number;
}): FileTransport {
  return new FileTransport(options);
}

export function createHTTPTransport(options: {
  endpoint: string;
  level?: LogLevel;
  headers?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number;
}): HTTPTransport {
  return new HTTPTransport(options);
}

export function createMemoryTransport(options?: {
  level?: LogLevel;
  maxLogs?: number;
}): MemoryTransport {
  return new MemoryTransport(options);
}

export function createCustomTransport(
  name: string,
  handler: (entry: LogEntry) => void | Promise<void>,
  level?: LogLevel
): CustomTransport {
  return new CustomTransport(name, handler, level);
}
