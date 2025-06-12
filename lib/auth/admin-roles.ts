// 관리자 역할 및 권한 관리
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin', 
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export interface AdminPermissions {
  canCreateContent: boolean
  canEditContent: boolean
  canDeleteContent: boolean
  canManageUsers: boolean
  canAccessAnalytics: boolean
  canManageSystem: boolean
}

// 역할별 권한 정의
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  [AdminRole.SUPER_ADMIN]: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canManageUsers: true,
    canAccessAnalytics: true,
    canManageSystem: true,
  },
  [AdminRole.ADMIN]: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canManageUsers: false,
    canAccessAnalytics: true,
    canManageSystem: false,
  },
  [AdminRole.EDITOR]: {
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canManageUsers: false,
    canAccessAnalytics: false,
    canManageSystem: false,
  },
  [AdminRole.VIEWER]: {
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canManageUsers: false,
    canAccessAnalytics: true,
    canManageSystem: false,
  },
}

// 환경 변수에서 관리자 이메일 로드
const getAdminEmails = (): Record<AdminRole, string[]> => {
  return {
    [AdminRole.SUPER_ADMIN]: (process.env.SUPER_ADMIN_EMAILS || '').split(',').filter(Boolean),
    [AdminRole.ADMIN]: (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean),
    [AdminRole.EDITOR]: (process.env.EDITOR_EMAILS || '').split(',').filter(Boolean),
    [AdminRole.VIEWER]: (process.env.VIEWER_EMAILS || '').split(',').filter(Boolean),
  }
}

// 사용자 역할 확인
export const getUserRole = (email: string): AdminRole | null => {
  const adminEmails = getAdminEmails()
  
  if (adminEmails[AdminRole.SUPER_ADMIN].includes(email)) {
    return AdminRole.SUPER_ADMIN
  }
  if (adminEmails[AdminRole.ADMIN].includes(email)) {
    return AdminRole.ADMIN
  }
  if (adminEmails[AdminRole.EDITOR].includes(email)) {
    return AdminRole.EDITOR
  }
  if (adminEmails[AdminRole.VIEWER].includes(email)) {
    return AdminRole.VIEWER
  }
  
  return null
}

// 권한 확인
export const getUserPermissions = (email: string): AdminPermissions | null => {
  const role = getUserRole(email)
  return role ? ROLE_PERMISSIONS[role] : null
}

// 특정 권한 확인
export const hasPermission = (email: string, permission: keyof AdminPermissions): boolean => {
  const permissions = getUserPermissions(email)
  return permissions?.[permission] ?? false
}

// 관리자 여부 확인 (기존 호환성을 위해)
export const isAdmin = (email: string): boolean => {
  return getUserRole(email) !== null
}

// 특정 역할 이상 권한 확인
export const hasMinimumRole = (email: string, minimumRole: AdminRole): boolean => {
  const userRole = getUserRole(email)
  if (!userRole) return false
  
  const roleHierarchy = [AdminRole.VIEWER, AdminRole.EDITOR, AdminRole.ADMIN, AdminRole.SUPER_ADMIN]
  const userRoleIndex = roleHierarchy.indexOf(userRole)
  const minimumRoleIndex = roleHierarchy.indexOf(minimumRole)
  
  return userRoleIndex >= minimumRoleIndex
} 