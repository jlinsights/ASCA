// 관리자 인증 관련 타입 정의

export interface AdminRole {
  id: string
  name: string
  description?: string
  permissions: AdminPermissions
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role_id?: string
  name: string
  email: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  role?: AdminRole
}

export interface AdminActivityLog {
  id: string
  admin_user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
  admin_user?: AdminUser
}

export interface AdminPermissions {
  cms?: {
    notices?: string[]
    exhibitions?: string[]
    events?: string[]
    comments?: string[]
  }
  artists?: {
    artists?: string[]
    artworks?: string[]
  }
  admin?: {
    users?: string[]
    roles?: string[]
    logs?: string[]
    backup?: string[]
  }
}

export interface AuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (resource: string, action: string) => boolean
  refreshUser: () => Promise<void>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface AdminUserFormData {
  name: string
  email: string
  role_id?: string
  is_active: boolean
}

export interface AdminRoleFormData {
  name: string
  description?: string
  permissions: AdminPermissions
}

// 권한 상수
export const PERMISSIONS = {
  CMS: {
    NOTICES: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete',
      PUBLISH: 'publish'
    },
    EXHIBITIONS: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete',
      PUBLISH: 'publish'
    },
    EVENTS: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete',
      PUBLISH: 'publish'
    },
    COMMENTS: {
      READ: 'read',
      APPROVE: 'approve',
      DELETE: 'delete'
    }
  },
  ARTISTS: {
    ARTISTS: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete'
    },
    ARTWORKS: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete'
    }
  },
  ADMIN: {
    USERS: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete'
    },
    ROLES: {
      CREATE: 'create',
      READ: 'read',
      UPDATE: 'update',
      DELETE: 'delete'
    },
    LOGS: {
      READ: 'read'
    },
    BACKUP: {
      CREATE: 'create',
      RESTORE: 'restore'
    }
  }
} as const

// 기본 역할 상수
export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const