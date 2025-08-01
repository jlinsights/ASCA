import type { AuthUser } from '@/lib/auth/middleware'

/**
 * 시스템 권한 정의
 */
export enum Permission {
  // 기본 권한
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  
  // 콘텐츠 관리
  MANAGE_ARTISTS = 'manage_artists',
  MANAGE_ARTWORKS = 'manage_artworks',
  MANAGE_EXHIBITIONS = 'manage_exhibitions',
  MANAGE_NEWS = 'manage_news',
  MANAGE_EVENTS = 'manage_events',
  
  // 회원 관리
  VIEW_MEMBERS = 'view_members',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_MEMBERSHIP_TIERS = 'manage_membership_tiers',
  REVIEW_APPLICATIONS = 'review_applications',
  MANAGE_CULTURAL_PROGRAMS = 'manage_cultural_programs',
  ISSUE_CERTIFICATES = 'issue_certificates',
  
  // 시스템 관리
  ADMIN = 'admin',
  SYSTEM = 'system',
  MIGRATION = 'migration',
  SYNC_CONTROL = 'sync_control',
  
  // 보안 관련
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  VIEW_STATS = 'view_stats',
  MANAGE_USERS = 'manage_users',
  
  // 슈퍼 권한
  SUPER_ADMIN = '*'
}

/**
 * 역할별 기본 권한 정의
 */
export const RolePermissions = {
  viewer: [
    Permission.READ
  ],
  
  editor: [
    Permission.READ,
    Permission.WRITE,
    Permission.MANAGE_ARTISTS,
    Permission.MANAGE_ARTWORKS,
    Permission.MANAGE_NEWS
  ],
  
  admin: [
    Permission.READ,
    Permission.WRITE,
    Permission.DELETE,
    Permission.MANAGE_ARTISTS,
    Permission.MANAGE_ARTWORKS,
    Permission.MANAGE_EXHIBITIONS,
    Permission.MANAGE_NEWS,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_MEMBERS,
    Permission.MANAGE_MEMBERSHIP_TIERS,
    Permission.REVIEW_APPLICATIONS,
    Permission.MANAGE_CULTURAL_PROGRAMS,
    Permission.ISSUE_CERTIFICATES,
    Permission.VIEW_STATS,
    Permission.ADMIN
  ],
  
  system: [
    Permission.SUPER_ADMIN // 모든 권한
  ]
}

/**
 * 권한 검사 유틸리티 클래스
 */
export class PermissionChecker {
  private user: AuthUser

  constructor(user: AuthUser) {
    this.user = user
  }

  /**
   * 단일 권한 검사
   */
  hasPermission(permission: Permission): boolean {
    // 슈퍼 관리자는 모든 권한 보유
    if (this.user.permissions.includes(Permission.SUPER_ADMIN)) {
      return true
    }

    // 구체적 권한 검사
    return this.user.permissions.includes(permission)
  }

  /**
   * 다중 권한 검사 (모든 권한 필요)
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * 다중 권한 검사 (하나의 권한만 필요)
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  /**
   * 역할 기반 권한 검사
   */
  hasRole(role: keyof typeof RolePermissions): boolean {
    return this.user.role === role || this.user.role === 'system'
  }

  /**
   * 최소 역할 요구사항 검사
   */
  hasMinimumRole(minimumRole: keyof typeof RolePermissions): boolean {
    const roleHierarchy = ['viewer', 'editor', 'admin', 'system']
    const userRoleIndex = roleHierarchy.indexOf(this.user.role)
    const minimumRoleIndex = roleHierarchy.indexOf(minimumRole)
    
    return userRoleIndex >= minimumRoleIndex
  }

  /**
   * 리소스별 권한 검사
   */
  canAccessResource(resource: string, action: 'read' | 'write' | 'delete'): boolean {
    // 슈퍼 관리자는 모든 리소스 접근 가능
    if (this.hasPermission(Permission.SUPER_ADMIN)) {
      return true
    }

    // 리소스별 세부 권한 검사
    switch (resource) {
      case 'artists':
        return action === 'read' ? 
          this.hasPermission(Permission.READ) : 
          this.hasPermission(Permission.MANAGE_ARTISTS)
          
      case 'artworks':
        return action === 'read' ? 
          this.hasPermission(Permission.READ) : 
          this.hasPermission(Permission.MANAGE_ARTWORKS)
          
      case 'exhibitions':
        return action === 'read' ? 
          this.hasPermission(Permission.READ) : 
          this.hasPermission(Permission.MANAGE_EXHIBITIONS)
          
      case 'admin_stats':
        return this.hasPermission(Permission.VIEW_STATS)
        
      case 'audit_logs':
        return this.hasPermission(Permission.VIEW_AUDIT_LOGS)
        
      case 'migration':
        return this.hasPermission(Permission.MIGRATION) || 
               this.hasPermission(Permission.SYSTEM)
               
      case 'sync_control':
        return this.hasPermission(Permission.SYNC_CONTROL) || 
               this.hasPermission(Permission.ADMIN)
        
      default:
        return false
    }
  }

  /**
   * 시간 기반 권한 검사 (예: 업무 시간 제한)
   */
  canAccessAtTime(restrictedOperations: string[] = []): {
    allowed: boolean
    reason?: string
  } {
    // 슈퍼 관리자는 시간 제한 없음
    if (this.hasPermission(Permission.SUPER_ADMIN)) {
      return { allowed: true }
    }

    const now = new Date()
    const hour = now.getHours()
    
    // 마이그레이션과 같은 위험한 작업은 업무 시간 외 제한
    const isDangerousOperation = restrictedOperations.some(op => 
      ['migration', 'sync_control', 'system'].includes(op)
    )
    
    if (isDangerousOperation && (hour < 9 || hour > 18)) {
      return {
        allowed: false,
        reason: 'Dangerous operations are restricted outside business hours (9 AM - 6 PM)'
      }
    }

    return { allowed: true }
  }

  /**
   * IP 기반 접근 제어
   */
  canAccessFromIP(clientIP: string, restrictedOperations: string[] = []): {
    allowed: boolean
    reason?: string
  } {
    // 슈퍼 관리자는 IP 제한 없음
    if (this.hasPermission(Permission.SUPER_ADMIN)) {
      return { allowed: true }
    }

    // 환경변수에서 허용된 IP 목록 가져오기
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || []
    
    // 시스템 작업은 특정 IP에서만 허용
    const isSystemOperation = restrictedOperations.some(op => 
      ['migration', 'system'].includes(op)
    )
    
    if (isSystemOperation && allowedIPs.length > 0) {
      if (!allowedIPs.includes(clientIP)) {
        return {
          allowed: false,
          reason: `System operations not allowed from IP: ${clientIP}`
        }
      }
    }

    return { allowed: true }
  }

  /**
   * 종합 보안 검사
   */
  comprehensiveCheck(options: {
    permissions?: Permission[]
    resource?: string
    action?: 'read' | 'write' | 'delete'
    operations?: string[]
    clientIP?: string
  }): {
    allowed: boolean
    reasons: string[]
  } {
    const reasons: string[] = []

    // 권한 검사
    if (options.permissions) {
      if (!this.hasAllPermissions(options.permissions)) {
        reasons.push(`Missing required permissions: ${options.permissions.join(', ')}`)
      }
    }

    // 리소스 접근 검사
    if (options.resource && options.action) {
      if (!this.canAccessResource(options.resource, options.action)) {
        reasons.push(`No ${options.action} access to resource: ${options.resource}`)
      }
    }

    // 시간 기반 검사
    if (options.operations) {
      const timeCheck = this.canAccessAtTime(options.operations)
      if (!timeCheck.allowed) {
        reasons.push(timeCheck.reason!)
      }
    }

    // IP 기반 검사
    if (options.clientIP && options.operations) {
      const ipCheck = this.canAccessFromIP(options.clientIP, options.operations)
      if (!ipCheck.allowed) {
        reasons.push(ipCheck.reason!)
      }
    }

    return {
      allowed: reasons.length === 0,
      reasons
    }
  }
}

/**
 * 편의 함수들
 */
export function checkPermission(user: AuthUser, permission: Permission): boolean {
  return new PermissionChecker(user).hasPermission(permission)
}

export function checkResource(user: AuthUser, resource: string, action: 'read' | 'write' | 'delete'): boolean {
  return new PermissionChecker(user).canAccessResource(resource, action)
}

export function createPermissionChecker(user: AuthUser): PermissionChecker {
  return new PermissionChecker(user)
}