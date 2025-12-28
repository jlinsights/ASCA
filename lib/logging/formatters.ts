/**
 * 로그 Formatters
 * 다양한 형식으로 로그 포맷팅
 */

import type { LogEntry } from './structured-logger';
import { LogLevel } from './structured-logger';

/**
 * Log Formatter 인터페이스
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}

/**
 * JSON Formatter
 * 로그를 JSON 형식으로 출력
 */
export class JSONFormatter implements LogFormatter {
  private pretty: boolean;
  private includeTimestamp: boolean;
  private includeLevel: boolean;
  private includeContext: boolean;
  private includeTags: boolean;
  private includeSource: boolean;

  constructor(options?: {
    pretty?: boolean;
    includeTimestamp?: boolean;
    includeLevel?: boolean;
    includeContext?: boolean;
    includeTags?: boolean;
    includeSource?: boolean;
  }) {
    this.pretty = options?.pretty ?? false;
    this.includeTimestamp = options?.includeTimestamp ?? true;
    this.includeLevel = options?.includeLevel ?? true;
    this.includeContext = options?.includeContext ?? true;
    this.includeTags = options?.includeTags ?? true;
    this.includeSource = options?.includeSource ?? false;
  }

  format(entry: LogEntry): string {
    const output: any = {
      message: entry.message,
    };

    if (this.includeTimestamp) {
      output.timestamp = new Date(entry.timestamp).toISOString();
    }

    if (this.includeLevel) {
      output.level = entry.levelName;
    }

    if (this.includeContext && entry.context && Object.keys(entry.context).length > 0) {
      output.context = entry.context;
    }

    if (this.includeTags && entry.tags && entry.tags.length > 0) {
      output.tags = entry.tags;
    }

    if (entry.error) {
      output.error = entry.error;
    }

    if (this.includeSource && entry.source) {
      output.source = entry.source;
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output.metadata = entry.metadata;
    }

    return JSON.stringify(output, null, this.pretty ? 2 : undefined);
  }
}

/**
 * Text Formatter
 * 로그를 읽기 쉬운 텍스트 형식으로 출력
 */
export class TextFormatter implements LogFormatter {
  private includeTimestamp: boolean;
  private includeLevel: boolean;
  private includeContext: boolean;
  private includeTags: boolean;
  private includeSource: boolean;
  private timestampFormat: 'iso' | 'locale' | 'time';

  constructor(options?: {
    includeTimestamp?: boolean;
    includeLevel?: boolean;
    includeContext?: boolean;
    includeTags?: boolean;
    includeSource?: boolean;
    timestampFormat?: 'iso' | 'locale' | 'time';
  }) {
    this.includeTimestamp = options?.includeTimestamp ?? true;
    this.includeLevel = options?.includeLevel ?? true;
    this.includeContext = options?.includeContext ?? true;
    this.includeTags = options?.includeTags ?? true;
    this.includeSource = options?.includeSource ?? false;
    this.timestampFormat = options?.timestampFormat ?? 'iso';
  }

  format(entry: LogEntry): string {
    const parts: string[] = [];

    // 타임스탬프
    if (this.includeTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    // 로그 레벨
    if (this.includeLevel) {
      parts.push(entry.levelName.padEnd(5));
    }

    // 소스 위치
    if (this.includeSource && entry.source) {
      const source = entry.source;
      if (source.file && source.line) {
        parts.push(`[${source.file}:${source.line}]`);
      } else if (source.function) {
        parts.push(`[${source.function}]`);
      }
    }

    // 메시지
    parts.push(entry.message);

    let output = parts.join(' ');

    // 컨텍스트
    if (this.includeContext && entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${this.formatContext(entry.context)}`;
    }

    // 태그
    if (this.includeTags && entry.tags && entry.tags.length > 0) {
      output += ` [${entry.tags.join(', ')}]`;
    }

    // 에러
    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        const stackLines = entry.error.stack.split('\n').slice(1, 6); // 처음 5줄만
        output += '\n' + stackLines.map(line => `    ${line.trim()}`).join('\n');
      }
    }

    return output;
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    switch (this.timestampFormat) {
      case 'iso':
        return date.toISOString();
      case 'locale':
        return date.toLocaleString();
      case 'time':
        return date.toTimeString().split(' ')[0];
      default:
        return date.toISOString();
    }
  }

  private formatContext(context: Record<string, any>): string {
    const entries = Object.entries(context);
    if (entries.length === 0) return '';

    if (entries.length <= 3) {
      return entries.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(' ');
    }

    return JSON.stringify(context);
  }
}

/**
 * Colored Text Formatter
 * ANSI 색상 코드를 사용한 컬러풀한 텍스트 출력
 */
export class ColoredTextFormatter implements LogFormatter {
  private textFormatter: TextFormatter;
  private useColors: boolean;

  constructor(options?: {
    includeTimestamp?: boolean;
    includeLevel?: boolean;
    includeContext?: boolean;
    includeTags?: boolean;
    includeSource?: boolean;
    timestampFormat?: 'iso' | 'locale' | 'time';
    useColors?: boolean;
  }) {
    this.textFormatter = new TextFormatter(options);
    this.useColors = options?.useColors ?? (typeof window === 'undefined');
  }

  format(entry: LogEntry): string {
    const text = this.textFormatter.format(entry);

    if (!this.useColors) {
      return text;
    }

    return this.colorize(text, entry.level);
  }

  private colorize(text: string, level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m\x1b[1m', // Bold Magenta
    };

    const reset = '\x1b[0m';
    return `${colors[level]}${text}${reset}`;
  }
}

/**
 * Logfmt Formatter
 * Logfmt 형식으로 출력 (key=value 쌍)
 */
export class LogfmtFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const pairs: string[] = [];

    pairs.push(`timestamp=${new Date(entry.timestamp).toISOString()}`);
    pairs.push(`level=${entry.levelName}`);
    pairs.push(`msg="${this.escape(entry.message)}"`);

    if (entry.context) {
      for (const [key, value] of Object.entries(entry.context)) {
        pairs.push(`${key}=${this.formatValue(value)}`);
      }
    }

    if (entry.tags && entry.tags.length > 0) {
      pairs.push(`tags="${entry.tags.join(',')}"`);
    }

    if (entry.error) {
      pairs.push(`error="${this.escape(entry.error.message)}"`);
    }

    return pairs.join(' ');
  }

  private escape(str: string): string {
    return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }

  private formatValue(value: any): string {
    if (typeof value === 'string') {
      return `"${this.escape(value)}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return `"${this.escape(JSON.stringify(value))}"`;
  }
}

/**
 * Template Formatter
 * 템플릿 기반 커스텀 포맷
 */
export class TemplateFormatter implements LogFormatter {
  private template: string;

  constructor(template: string) {
    this.template = template;
  }

  format(entry: LogEntry): string {
    let output = this.template;

    // 기본 필드 치환
    output = output.replace(/{timestamp}/g, new Date(entry.timestamp).toISOString());
    output = output.replace(/{level}/g, entry.levelName);
    output = output.replace(/{message}/g, entry.message);

    // 컨텍스트 필드 치환
    if (entry.context) {
      for (const [key, value] of Object.entries(entry.context)) {
        output = output.replace(
          new RegExp(`{context\\.${key}}`, 'g'),
          String(value)
        );
      }
    }

    // 태그 치환
    if (entry.tags) {
      output = output.replace(/{tags}/g, entry.tags.join(', '));
    }

    // 에러 치환
    if (entry.error) {
      output = output.replace(/{error}/g, entry.error.message);
    }

    // 소스 치환
    if (entry.source) {
      output = output.replace(/{source.file}/g, entry.source.file || '');
      output = output.replace(/{source.line}/g, String(entry.source.line || ''));
      output = output.replace(/{source.function}/g, entry.source.function || '');
    }

    return output;
  }
}

/**
 * Compact Formatter
 * 한 줄로 압축된 출력
 */
export class CompactFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const time = new Date(entry.timestamp).toISOString().split('T')[1]?.split('.')[0];
    const level = entry.levelName.charAt(0); // 첫 글자만
    const msg = entry.message.substring(0, 100); // 처음 100자만

    let output = `${time} ${level} ${msg}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextStr = JSON.stringify(entry.context);
      output += ` ${contextStr.substring(0, 50)}`; // 처음 50자만
    }

    return output;
  }
}

// Formatter 팩토리 함수들
export function createJSONFormatter(options?: {
  pretty?: boolean;
  includeTimestamp?: boolean;
  includeLevel?: boolean;
  includeContext?: boolean;
  includeTags?: boolean;
  includeSource?: boolean;
}): JSONFormatter {
  return new JSONFormatter(options);
}

export function createTextFormatter(options?: {
  includeTimestamp?: boolean;
  includeLevel?: boolean;
  includeContext?: boolean;
  includeTags?: boolean;
  includeSource?: boolean;
  timestampFormat?: 'iso' | 'locale' | 'time';
}): TextFormatter {
  return new TextFormatter(options);
}

export function createColoredTextFormatter(options?: {
  includeTimestamp?: boolean;
  includeLevel?: boolean;
  includeContext?: boolean;
  includeTags?: boolean;
  includeSource?: boolean;
  timestampFormat?: 'iso' | 'locale' | 'time';
  useColors?: boolean;
}): ColoredTextFormatter {
  return new ColoredTextFormatter(options);
}

export function createLogfmtFormatter(): LogfmtFormatter {
  return new LogfmtFormatter();
}

export function createTemplateFormatter(template: string): TemplateFormatter {
  return new TemplateFormatter(template);
}

export function createCompactFormatter(): CompactFormatter {
  return new CompactFormatter();
}
