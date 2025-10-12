/**
 * 보안 미들웨어 시스템
 * Enterprise-grade 보안 강화
 */

import { eventBus, EVENTS } from '../events/event-bus';
import { performanceMonitor } from '../monitoring/performance-monitor';

export interface SecurityContext {
  userId?: string;
  role?: string;
  permissions?: string[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

export interface SecurityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskScore: number; // 0-1
}

/**
 * 입력 검증 및 살균화
 */
export class InputValidator {
  private static readonly MAX_STRING_LENGTH = 10000;
  private static readonly DANGEROUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ];

  static validateInput(input: any, fieldName: string): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    if (typeof input === 'string') {
      // 길이 검증
      if (input.length > this.MAX_STRING_LENGTH) {
        errors.push(`${fieldName} exceeds maximum length`);
        riskScore += 0.3;
      }

      // 위험한 패턴 검사
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(input)) {
          errors.push(`${fieldName} contains potentially dangerous content`);
          riskScore += 0.5;
          break;
        }
      }

      // SQL 인젝션 패턴 검사
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
        /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/gi,
        /(--|\#|\/\*|\*\/)/gi
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
          warnings.push(`${fieldName} contains SQL-like patterns`);
          riskScore += 0.2;
          break;
        }
      }
    }

    // 객체 깊이 검증
    if (typeof input === 'object' && input !== null) {
      const depth = this.getObjectDepth(input);
      if (depth > 10) {
        errors.push(`${fieldName} object nesting too deep`);
        riskScore += 0.3;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: Math.min(riskScore, 1)
    };
  }

  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // HTML 태그 제거
      .replace(/["']/g, '') // 따옴표 제거
      .replace(/javascript:/gi, '') // JavaScript URL 제거
      .trim();
  }

  private static getObjectDepth(obj: any, depth = 0): number {
    if (depth > 20) return depth; // 무한 재귀 방지
    
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    let maxDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newDepth = this.getObjectDepth(obj[key], depth + 1);
        maxDepth = Math.max(maxDepth, newDepth);
      }
    }

    return maxDepth;
  }
}

/**
 * 인증 및 권한 검증
 */
export class AuthorizationValidator {
  private static readonly ADMIN_PERMISSIONS = [
    'artist.create',
    'artist.update', 
    'artist.delete',
    'artwork.create',
    'artwork.update',
    'artwork.delete',
    'stats.view'
  ];

  static validatePermission(
    permission: string, 
    context: SecurityContext
  ): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // 기본 인증 확인
    if (!context.userId) {
      errors.push('User authentication required');
      riskScore = 1;
    }

    // 권한 확인
    if (context.permissions && !context.permissions.includes(permission)) {
      errors.push(`Insufficient permissions for ${permission}`);
      riskScore += 0.8;
    }

    // 관리자 권한 확인
    if (this.ADMIN_PERMISSIONS.includes(permission) && context.role !== 'admin') {
      errors.push('Admin role required');
      riskScore += 0.9;
    }

    // 세션 유효성 확인
    if (!context.sessionId) {
      warnings.push('No session ID provided');
      riskScore += 0.1;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: Math.min(riskScore, 1)
    };
  }
}

/**
 * 비율 제한 (Rate Limiting)
 */
export class RateLimiter {
  private static requests = new Map<string, number[]>();
  private static readonly WINDOW_SIZE = 60000; // 1분
  private static readonly MAX_REQUESTS = 100; // 분당 최대 요청 수

  static checkRateLimit(identifier: string): SecurityValidation {
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE;
    
    // 현재 윈도우 내 요청 가져오기
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // 현재 요청 추가
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    const requestCount = recentRequests.length;
    const riskScore = Math.min(requestCount / this.MAX_REQUESTS, 1);

    if (requestCount > this.MAX_REQUESTS) {
      return {
        isValid: false,
        errors: [`Rate limit exceeded: ${requestCount}/${this.MAX_REQUESTS} requests per minute`],
        warnings: [],
        riskScore: 1
      };
    }

    const warnings = requestCount > this.MAX_REQUESTS * 0.8 
      ? [`Approaching rate limit: ${requestCount}/${this.MAX_REQUESTS}`]
      : [];

    return {
      isValid: true,
      errors: [],
      warnings,
      riskScore
    };
  }

  // 정리 작업 (오래된 데이터 제거)
  static cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE;

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

/**
 * 데이터 무결성 검증
 */
export class DataIntegrityValidator {
  static validateArtistData(data: any): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // 필수 필드 확인
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Artist name is required and must be string');
      riskScore += 0.3;
    }

    if (!data.bio || typeof data.bio !== 'string') {
      errors.push('Artist bio is required and must be string');
      riskScore += 0.3;
    }

    // 데이터 타입 검증
    if (data.birth_year && (typeof data.birth_year !== 'number' || data.birth_year < 1800 || data.birth_year > new Date().getFullYear())) {
      errors.push('Invalid birth year');
      riskScore += 0.2;
    }

    if (data.nationality && typeof data.nationality !== 'string') {
      errors.push('Nationality must be string');
      riskScore += 0.1;
    }

    // 입력 검증
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const validation = InputValidator.validateInput(value, key);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          riskScore += validation.riskScore * 0.5;
        }
        warnings.push(...validation.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: Math.min(riskScore, 1)
    };
  }

  static validateArtworkData(data: any): SecurityValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // 필수 필드 확인
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Artwork title is required and must be string');
      riskScore += 0.3;
    }

    if (!data.artist_id || typeof data.artist_id !== 'string') {
      errors.push('Artist ID is required and must be string');
      riskScore += 0.4;
    }

    // 열거형 값 검증
    const validAvailability = ['available', 'sold', 'on_loan', 'reserved'];
    if (data.availability && !validAvailability.includes(data.availability)) {
      errors.push('Invalid availability status');
      riskScore += 0.2;
    }

    // 가격 검증
    if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
      errors.push('Price must be a positive number');
      riskScore += 0.2;
    }

    // 입력 검증
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const validation = InputValidator.validateInput(value, key);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          riskScore += validation.riskScore * 0.5;
        }
        warnings.push(...validation.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskScore: Math.min(riskScore, 1)
    };
  }
}

/**
 * 보안 미들웨어 통합
 */
export class SecurityMiddleware {
  static async validateOperation(
    operation: string,
    data: any,
    context: SecurityContext
  ): Promise<SecurityValidation> {
    const startTime = performance.now();
    
    try {
      const validations: SecurityValidation[] = [];

      // 1. 비율 제한 확인
      const rateLimitResult = RateLimiter.checkRateLimit(
        context.userId || context.ipAddress || 'anonymous'
      );
      validations.push(rateLimitResult);

      // 2. 권한 확인
      const authResult = AuthorizationValidator.validatePermission(operation, context);
      validations.push(authResult);

      // 3. 데이터 무결성 확인
      if (operation.includes('artist')) {
        const dataResult = DataIntegrityValidator.validateArtistData(data);
        validations.push(dataResult);
      } else if (operation.includes('artwork')) {
        const dataResult = DataIntegrityValidator.validateArtworkData(data);
        validations.push(dataResult);
      }

      // 결과 종합
      const allErrors = validations.flatMap(v => v.errors);
      const allWarnings = validations.flatMap(v => v.warnings);
      const maxRiskScore = Math.max(...validations.map(v => v.riskScore));

      const result: SecurityValidation = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        riskScore: maxRiskScore
      };

      // 보안 이벤트 발행
      if (!result.isValid || result.riskScore > 0.7) {
        await eventBus.emit(EVENTS.SECURITY_VIOLATION, {
          operation,
          context,
          validation: result,
          timestamp: Date.now()
        });
      }

      // 성능 모니터링
      performanceMonitor.recordMetric({
        name: 'security.validation_time',
        value: performance.now() - startTime,
        unit: 'ms',
        tags: {
          operation,
          risk_level: result.riskScore > 0.7 ? 'high' : result.riskScore > 0.3 ? 'medium' : 'low'
        },
        threshold: { warning: 100, critical: 500 }
      });

      return result;

    } catch (error) {
      // 보안 검증 실패는 치명적 오류
      await eventBus.emit(EVENTS.SYSTEM_ERROR, {
        error: error instanceof Error ? error.message : 'Security validation failed',
        operation,
        context
      });

      return {
        isValid: false,
        errors: ['Security validation system error'],
        warnings: [],
        riskScore: 1
      };
    }
  }
}

// 정리 스케줄러 설정
setInterval(() => {
  RateLimiter.cleanup();
}, 60000); // 1분마다 정리

// 보안 헬퍼 함수
export function createSecurityContext(
  userId?: string,
  role?: string,
  permissions?: string[]
): SecurityContext {
  return {
    userId,
    role,
    permissions,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return InputValidator.sanitizeString(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}