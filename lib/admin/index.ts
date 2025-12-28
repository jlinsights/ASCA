/**
 * Admin Module
 *
 * Exports all admin components for easy importing.
 *
 * @module lib/admin
 */

// Permissions
export {
  Permission,
  Role,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRole,
  getEffectivePermissions,
  isValidPermission,
  getPermissionResource,
  getPermissionAction,
  isWildcardPermission,
  PermissionError,
  assertPermission,
  assertAllPermissions,
  checkPermission,
  getPermissionDescription,
  type PermissionCheckResult,
} from './permissions';

// Role Manager
export {
  RoleManager,
  getRoleManager,
  createRoleManager,
  checkUserPermission,
  requirePermission,
  requireRole,
  requireAdmin,
  type UserRole,
  type RoleAssignment,
} from './role-manager';

// Audit Logger
export {
  AuditLogger,
  AuditAction,
  AuditSeverity,
  getAuditLogger,
  createAuditLogger,
  logAdminAction,
  type AuditLog,
  type AuditLogFilter,
} from './audit-logger';
