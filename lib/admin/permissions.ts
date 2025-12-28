/**
 * Permission System
 *
 * Defines all permissions and provides utilities for permission checking.
 *
 * Features:
 * - Hierarchical permission structure
 * - Resource-based permissions (CRUD)
 * - Wildcard permissions
 * - Permission validation
 * - Role-based access control (RBAC)
 *
 * @module lib/admin/permissions
 */

/**
 * Permission enum
 *
 * Format: `<resource>:<action>`
 * - resource: The entity being accessed (member, artwork, etc.)
 * - action: The operation being performed (read, create, update, delete, etc.)
 */
export enum Permission {
  // ========================================
  // Member Permissions
  // ========================================
  MEMBER_READ = 'member:read',
  MEMBER_CREATE = 'member:create',
  MEMBER_UPDATE = 'member:update',
  MEMBER_DELETE = 'member:delete',
  MEMBER_APPROVE = 'member:approve',
  MEMBER_REJECT = 'member:reject',
  MEMBER_EXPORT = 'member:export',
  MEMBER_IMPORT = 'member:import',

  // ========================================
  // Artist Permissions
  // ========================================
  ARTIST_READ = 'artist:read',
  ARTIST_CREATE = 'artist:create',
  ARTIST_UPDATE = 'artist:update',
  ARTIST_DELETE = 'artist:delete',
  ARTIST_APPROVE = 'artist:approve',
  ARTIST_REJECT = 'artist:reject',
  ARTIST_VERIFY = 'artist:verify',

  // ========================================
  // Artwork Permissions
  // ========================================
  ARTWORK_READ = 'artwork:read',
  ARTWORK_CREATE = 'artwork:create',
  ARTWORK_UPDATE = 'artwork:update',
  ARTWORK_DELETE = 'artwork:delete',
  ARTWORK_APPROVE = 'artwork:approve',
  ARTWORK_REJECT = 'artwork:reject',
  ARTWORK_FEATURE = 'artwork:feature',
  ARTWORK_EXPORT = 'artwork:export',

  // ========================================
  // Exhibition Permissions
  // ========================================
  EXHIBITION_READ = 'exhibition:read',
  EXHIBITION_CREATE = 'exhibition:create',
  EXHIBITION_UPDATE = 'exhibition:update',
  EXHIBITION_DELETE = 'exhibition:delete',
  EXHIBITION_PUBLISH = 'exhibition:publish',
  EXHIBITION_UNPUBLISH = 'exhibition:unpublish',
  EXHIBITION_FEATURE = 'exhibition:feature',

  // ========================================
  // Event Permissions
  // ========================================
  EVENT_READ = 'event:read',
  EVENT_CREATE = 'event:create',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_PUBLISH = 'event:publish',
  EVENT_UNPUBLISH = 'event:unpublish',
  EVENT_MANAGE_ATTENDEES = 'event:manage_attendees',

  // ========================================
  // Admin Permissions
  // ========================================
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_ANALYTICS = 'admin:analytics',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_USERS = 'admin:users',
  ADMIN_ROLES = 'admin:roles',
  ADMIN_PERMISSIONS = 'admin:permissions',
  ADMIN_AUDIT_LOGS = 'admin:audit_logs',
  ADMIN_SYSTEM_HEALTH = 'admin:system_health',

  // ========================================
  // System Permissions
  // ========================================
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_METRICS = 'system:metrics',
  SYSTEM_CACHE = 'system:cache',
  SYSTEM_DATABASE = 'system:database',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_RESTORE = 'system:restore',
  SYSTEM_MAINTENANCE = 'system:maintenance',

  // ========================================
  // Content Permissions
  // ========================================
  CONTENT_READ = 'content:read',
  CONTENT_CREATE = 'content:create',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',

  // ========================================
  // Wildcard Permissions
  // ========================================
  ALL = '*', // Full access to everything
  MEMBER_ALL = 'member:*', // All member permissions
  ARTIST_ALL = 'artist:*', // All artist permissions
  ARTWORK_ALL = 'artwork:*', // All artwork permissions
  EXHIBITION_ALL = 'exhibition:*', // All exhibition permissions
  EVENT_ALL = 'event:*', // All event permissions
  ADMIN_ALL = 'admin:*', // All admin permissions
  SYSTEM_ALL = 'system:*', // All system permissions
  CONTENT_ALL = 'content:*', // All content permissions
}

/**
 * Role enum
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  ARTIST = 'artist',
  VIEWER = 'viewer',
}

/**
 * Role permissions mapping
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Super Admin: Full access to everything
  [Role.SUPER_ADMIN]: [Permission.ALL],

  // Admin: All CRUD + approval permissions
  [Role.ADMIN]: [
    // Members
    Permission.MEMBER_ALL,

    // Artists
    Permission.ARTIST_ALL,

    // Artworks
    Permission.ARTWORK_ALL,

    // Exhibitions
    Permission.EXHIBITION_ALL,

    // Events
    Permission.EVENT_ALL,

    // Admin
    Permission.ADMIN_DASHBOARD,
    Permission.ADMIN_ANALYTICS,
    Permission.ADMIN_SETTINGS,
    Permission.ADMIN_USERS,
    Permission.ADMIN_AUDIT_LOGS,
    Permission.ADMIN_SYSTEM_HEALTH,

    // Content
    Permission.CONTENT_ALL,
  ],

  // Moderator: Limited admin capabilities
  [Role.MODERATOR]: [
    // Members (read + approve/reject)
    Permission.MEMBER_READ,
    Permission.MEMBER_APPROVE,
    Permission.MEMBER_REJECT,

    // Artists (read + approve/reject)
    Permission.ARTIST_READ,
    Permission.ARTIST_APPROVE,
    Permission.ARTIST_REJECT,

    // Artworks (all except delete)
    Permission.ARTWORK_READ,
    Permission.ARTWORK_CREATE,
    Permission.ARTWORK_UPDATE,
    Permission.ARTWORK_APPROVE,
    Permission.ARTWORK_REJECT,
    Permission.ARTWORK_FEATURE,

    // Exhibitions (all except delete)
    Permission.EXHIBITION_READ,
    Permission.EXHIBITION_CREATE,
    Permission.EXHIBITION_UPDATE,
    Permission.EXHIBITION_PUBLISH,
    Permission.EXHIBITION_UNPUBLISH,

    // Events (all except delete)
    Permission.EVENT_READ,
    Permission.EVENT_CREATE,
    Permission.EVENT_UPDATE,
    Permission.EVENT_PUBLISH,
    Permission.EVENT_UNPUBLISH,
    Permission.EVENT_MANAGE_ATTENDEES,

    // Content
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_PUBLISH,

    // Admin (limited)
    Permission.ADMIN_DASHBOARD,
    Permission.ADMIN_ANALYTICS,
  ],

  // Member: Basic read access
  [Role.MEMBER]: [
    Permission.MEMBER_READ,
    Permission.ARTIST_READ,
    Permission.ARTWORK_READ,
    Permission.EXHIBITION_READ,
    Permission.EVENT_READ,
    Permission.CONTENT_READ,
  ],

  // Artist: Member + artwork management
  [Role.ARTIST]: [
    Permission.MEMBER_READ,
    Permission.ARTIST_READ,
    Permission.ARTWORK_READ,
    Permission.ARTWORK_CREATE,
    Permission.ARTWORK_UPDATE,
    Permission.EXHIBITION_READ,
    Permission.EVENT_READ,
    Permission.CONTENT_READ,
  ],

  // Viewer: Read-only access
  [Role.VIEWER]: [
    Permission.ARTWORK_READ,
    Permission.EXHIBITION_READ,
    Permission.EVENT_READ,
    Permission.CONTENT_READ,
  ],
};

/**
 * Permission hierarchy
 *
 * Maps specific permissions to their parent wildcard permissions.
 */
const PERMISSION_HIERARCHY: Map<string, string[]> = new Map([
  // Member permissions
  ['member:read', ['member:*', '*']],
  ['member:create', ['member:*', '*']],
  ['member:update', ['member:*', '*']],
  ['member:delete', ['member:*', '*']],
  ['member:approve', ['member:*', '*']],
  ['member:reject', ['member:*', '*']],
  ['member:export', ['member:*', '*']],
  ['member:import', ['member:*', '*']],

  // Artist permissions
  ['artist:read', ['artist:*', '*']],
  ['artist:create', ['artist:*', '*']],
  ['artist:update', ['artist:*', '*']],
  ['artist:delete', ['artist:*', '*']],
  ['artist:approve', ['artist:*', '*']],
  ['artist:reject', ['artist:*', '*']],
  ['artist:verify', ['artist:*', '*']],

  // Artwork permissions
  ['artwork:read', ['artwork:*', '*']],
  ['artwork:create', ['artwork:*', '*']],
  ['artwork:update', ['artwork:*', '*']],
  ['artwork:delete', ['artwork:*', '*']],
  ['artwork:approve', ['artwork:*', '*']],
  ['artwork:reject', ['artwork:*', '*']],
  ['artwork:feature', ['artwork:*', '*']],
  ['artwork:export', ['artwork:*', '*']],

  // Exhibition permissions
  ['exhibition:read', ['exhibition:*', '*']],
  ['exhibition:create', ['exhibition:*', '*']],
  ['exhibition:update', ['exhibition:*', '*']],
  ['exhibition:delete', ['exhibition:*', '*']],
  ['exhibition:publish', ['exhibition:*', '*']],
  ['exhibition:unpublish', ['exhibition:*', '*']],
  ['exhibition:feature', ['exhibition:*', '*']],

  // Event permissions
  ['event:read', ['event:*', '*']],
  ['event:create', ['event:*', '*']],
  ['event:update', ['event:*', '*']],
  ['event:delete', ['event:*', '*']],
  ['event:publish', ['event:*', '*']],
  ['event:unpublish', ['event:*', '*']],
  ['event:manage_attendees', ['event:*', '*']],

  // Admin permissions
  ['admin:dashboard', ['admin:*', '*']],
  ['admin:analytics', ['admin:*', '*']],
  ['admin:settings', ['admin:*', '*']],
  ['admin:users', ['admin:*', '*']],
  ['admin:roles', ['admin:*', '*']],
  ['admin:permissions', ['admin:*', '*']],
  ['admin:audit_logs', ['admin:*', '*']],
  ['admin:system_health', ['admin:*', '*']],

  // System permissions
  ['system:logs', ['system:*', '*']],
  ['system:metrics', ['system:*', '*']],
  ['system:cache', ['system:*', '*']],
  ['system:database', ['system:*', '*']],
  ['system:backup', ['system:*', '*']],
  ['system:restore', ['system:*', '*']],
  ['system:maintenance', ['system:*', '*']],

  // Content permissions
  ['content:read', ['content:*', '*']],
  ['content:create', ['content:*', '*']],
  ['content:update', ['content:*', '*']],
  ['content:delete', ['content:*', '*']],
  ['content:publish', ['content:*', '*']],
]);

/**
 * Check if user has permission
 *
 * @param userPermissions - User's permissions
 * @param requiredPermission - Required permission
 * @returns True if user has permission
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions
  const hierarchy = PERMISSION_HIERARCHY.get(requiredPermission) || [];
  return hierarchy.some((wildcardPerm) =>
    userPermissions.includes(wildcardPerm as Permission)
  );
}

/**
 * Check if user has all required permissions
 *
 * @param userPermissions - User's permissions
 * @param requiredPermissions - Required permissions
 * @returns True if user has all permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm));
}

/**
 * Check if user has any of the required permissions
 *
 * @param userPermissions - User's permissions
 * @param requiredPermissions - Required permissions
 * @returns True if user has any permission
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}

/**
 * Get permissions for a role
 *
 * @param role - User role
 * @returns Array of permissions
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get effective permissions (expand wildcards)
 *
 * @param permissions - Permissions (may include wildcards)
 * @returns Expanded permissions
 */
export function getEffectivePermissions(permissions: Permission[]): Permission[] {
  const effective = new Set<Permission>();

  for (const perm of permissions) {
    if (perm === Permission.ALL) {
      // Add all permissions
      return Object.values(Permission);
    }

    // Add the permission itself
    effective.add(perm);

    // If it's a wildcard, expand it
    if (perm.endsWith(':*')) {
      const resource = perm.split(':')[0];
      Object.values(Permission).forEach((p) => {
        if (p.startsWith(`${resource}:`) && !p.endsWith(':*')) {
          effective.add(p);
        }
      });
    }
  }

  return Array.from(effective);
}

/**
 * Validate permission format
 *
 * @param permission - Permission string
 * @returns True if valid
 */
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission);
}

/**
 * Get resource from permission
 *
 * @param permission - Permission
 * @returns Resource name
 */
export function getPermissionResource(permission: Permission): string {
  return permission.split(':')[0];
}

/**
 * Get action from permission
 *
 * @param permission - Permission
 * @returns Action name
 */
export function getPermissionAction(permission: Permission): string {
  return permission.split(':')[1];
}

/**
 * Check if permission is a wildcard
 *
 * @param permission - Permission
 * @returns True if wildcard
 */
export function isWildcardPermission(permission: Permission): boolean {
  return permission.endsWith(':*') || permission === Permission.ALL;
}

/**
 * Permission error class
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public requiredPermission: Permission,
    public userPermissions: Permission[]
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Assert user has permission (throws if not)
 *
 * @param userPermissions - User's permissions
 * @param requiredPermission - Required permission
 * @throws PermissionError if user doesn't have permission
 */
export function assertPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): void {
  if (!hasPermission(userPermissions, requiredPermission)) {
    throw new PermissionError(
      `Missing required permission: ${requiredPermission}`,
      requiredPermission,
      userPermissions
    );
  }
}

/**
 * Assert user has all permissions (throws if not)
 *
 * @param userPermissions - User's permissions
 * @param requiredPermissions - Required permissions
 * @throws PermissionError if user doesn't have all permissions
 */
export function assertAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): void {
  const missing = requiredPermissions.filter(
    (perm) => !hasPermission(userPermissions, perm)
  );

  if (missing.length > 0) {
    throw new PermissionError(
      `Missing required permissions: ${missing.join(', ')}`,
      missing[0],
      userPermissions
    );
  }
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  missingPermissions?: Permission[];
}

/**
 * Check permission with detailed result
 *
 * @param userPermissions - User's permissions
 * @param requiredPermission - Required permission
 * @returns Permission check result
 */
export function checkPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): PermissionCheckResult {
  const allowed = hasPermission(userPermissions, requiredPermission);

  if (allowed) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Missing required permission: ${requiredPermission}`,
    missingPermissions: [requiredPermission],
  };
}

/**
 * Get permission description
 *
 * @param permission - Permission
 * @returns Human-readable description
 */
export function getPermissionDescription(permission: Permission): string {
  const descriptions: Partial<Record<Permission, string>> = {
    [Permission.MEMBER_READ]: 'View member information',
    [Permission.MEMBER_CREATE]: 'Create new members',
    [Permission.MEMBER_UPDATE]: 'Update member information',
    [Permission.MEMBER_DELETE]: 'Delete members',
    [Permission.MEMBER_APPROVE]: 'Approve member registrations',
    [Permission.MEMBER_REJECT]: 'Reject member registrations',

    [Permission.ARTWORK_READ]: 'View artworks',
    [Permission.ARTWORK_CREATE]: 'Upload new artworks',
    [Permission.ARTWORK_UPDATE]: 'Edit artwork information',
    [Permission.ARTWORK_DELETE]: 'Delete artworks',
    [Permission.ARTWORK_APPROVE]: 'Approve submitted artworks',
    [Permission.ARTWORK_REJECT]: 'Reject submitted artworks',

    [Permission.ADMIN_DASHBOARD]: 'Access admin dashboard',
    [Permission.ADMIN_ANALYTICS]: 'View analytics and reports',
    [Permission.ADMIN_SETTINGS]: 'Manage system settings',
    [Permission.ADMIN_USERS]: 'Manage user accounts',

    [Permission.SYSTEM_LOGS]: 'View system logs',
    [Permission.SYSTEM_METRICS]: 'View system metrics',
    [Permission.SYSTEM_CACHE]: 'Manage cache',

    [Permission.ALL]: 'Full system access',
  };

  return descriptions[permission] || permission;
}
