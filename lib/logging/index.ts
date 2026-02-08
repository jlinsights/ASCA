/**
 * Logging Module
 *
 * 구조화된 로깅 시스템
 *
 * @module lib/logging
 */

// Structured Logger
export {
  StructuredLogger,
  LogContext,
  LogLevel,
  LOG_LEVEL_NAMES,
  logger,
  debug,
  info,
  warn,
  error,
  fatal,
  setLogLevel,
  createLogger,
  withLogContext,
  withLogContextAsync,
  measureTime,
  measureTimeAsync,
  type LogEntry,
  type LoggerConfig,
  type LogTransport,
} from './structured-logger';

// Transports
export {
  ConsoleTransport,
  FileTransport,
  HTTPTransport,
  MemoryTransport,
  CustomTransport,
  createConsoleTransport,
  createFileTransport,
  createHTTPTransport,
  createMemoryTransport,
  createCustomTransport,
} from './transports';

// Formatters
export {
  JSONFormatter,
  TextFormatter,
  ColoredTextFormatter,
  LogfmtFormatter,
  TemplateFormatter,
  CompactFormatter,
  createJSONFormatter,
  createTextFormatter,
  createColoredTextFormatter,
  createLogfmtFormatter,
  createTemplateFormatter,
  createCompactFormatter,
  type LogFormatter,
} from './formatters';

import { LogLevel, logger } from './structured-logger';
import { createConsoleTransport, createFileTransport, createHTTPTransport } from './transports';

/**
 * 로깅 시스템 초기화
 */
export function initializeLogging(config?: {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  enableHTTP?: boolean;
  filepath?: string;
  httpEndpoint?: string;
  useColors?: boolean;
}): void {
  const {
    level = LogLevel.INFO,
    enableConsole = true,
    enableFile = false,
    enableHTTP = false,
    filepath = './logs/app.log',
    httpEndpoint,
    useColors = true,
  } = config || {};

  // 로그 레벨 설정
  logger.setLevel(level);

  // Console Transport 추가
  if (enableConsole) {
    logger.addTransport(createConsoleTransport({ level, useColors }));
  }

  // File Transport 추가
  if (enableFile) {
    logger.addTransport(
      createFileTransport({
        filepath,
        level,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      })
    );
  }

  // HTTP Transport 추가
  if (enableHTTP && httpEndpoint) {
    logger.addTransport(
      createHTTPTransport({
        endpoint: httpEndpoint,
        level,
        batchSize: 10,
        flushInterval: 5000,
      })
    );
  }
}
