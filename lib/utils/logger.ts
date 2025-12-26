// 구조화된 로깅 시스템
/* eslint-disable no-console */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// LogEntry 타입 정의 보강
export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    return `[${entry.timestamp}] ${levelName}: ${entry.message}`
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private createEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createEntry(LogLevel.DEBUG, message, context)
    if (this.isDevelopment) {
      console.debug(this.formatMessage(entry), context || '')
    }
    this.writeToFile(entry)
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.createEntry(LogLevel.INFO, message, context)
    if (this.isDevelopment) {
      console.info(this.formatMessage(entry), context || '')
    }
    this.writeToFile(entry)
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.createEntry(LogLevel.WARN, message, context)
    console.warn(this.formatMessage(entry), context || '')
    this.writeToFile(entry)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const entry = this.createEntry(LogLevel.ERROR, message, context, error)
    console.error(this.formatMessage(entry), error?.stack || error, context || '')
    this.writeToFile(entry)
    
    // 프로덕션에서는 외부 로깅 서비스로 전송
    if (!this.isDevelopment) {
      this.sendToLoggingService(entry)
    }
  }

  private writeToFile(entry: LogEntry) {
    // 서버사이드에서만 파일 로깅
    if (typeof window === 'undefined') {
      try {
        // 파일 시스템 로깅은 프로덕션에서 구현
        const logData = JSON.stringify(entry) + '\n'
        // fs.appendFileSync('logs/app.log', logData)
      } catch (error) {
        // 파일 로깅 실패는 무시
      }
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    // 실제 구현에서는 Sentry, LogRocket 등 사용
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch (error) {
      // 로깅 실패는 무시 (무한 루프 방지)
    }
  }

  // 성능 측정
  time(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.timeEnd(label)
    }
  }

  // 그룹 로깅
  group(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label)
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger()

// 편의 함수들 - 간단한 개발용 로깅
export const log = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args)
    // TODO: Sentry 등 외부 연동
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL === 'debug') {
      console.log('[DEBUG]', ...args)
    }
  },
} 